import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import multer from "multer";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'obsidian_core_secret_primary';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// --- SECURITY & UTILS ---
const Security = {
  oldVerify: (password: string, stored: string) => {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    return crypto.createHash('sha512').update(password + salt).digest('hex') === hash;
  },
  hash: async (password: string) => {
    return await bcrypt.hash(password, 12);
  },
  verify: async (password: string, stored: string) => {
    if (!stored.includes(':')) {
      return await bcrypt.compare(password, stored);
    }
    return Security.oldVerify(password, stored);
  }
};

const Schemas = {
  register: z.object({
    fullName: z.string().min(2, "Name too short"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
  login: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password required"),
  }),
  product: z.object({
    name: z.string().min(1),
    category: z.string().min(1),
    price: z.number().min(0),
    stock: z.number().int().min(0),
    description: z.string().optional(),
    modelCompatibility: z.string().optional(),
    imageUrl: z.string().optional(),
    colors: z.array(z.any()).optional(),
    specifications: z.array(z.any()).optional(),
    isBestSeller: z.boolean().optional(),
  }),
  category: z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
  }),
  cmsPage: z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    slug: z.string().min(1),
  }),
  menuItem: z.object({
    label: z.string().min(1),
    url: z.string().optional().nullable(),
    parent_id: z.number().int().nullable().optional(),
    position: z.number().int().optional(),
    location: z.enum(['header', 'footer']).optional(),
    layout_style: z.string().optional(),
    is_active: z.boolean().optional(),
  }),
  socialLink: z.object({
    platform: z.string().min(1),
    url: z.string().url(),
    icon: z.string().optional(),
    position: z.number().int().optional(),
    is_active: z.boolean().optional(),
  })
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- STORAGE ---
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir) && !process.env.VERCEL) {
  try { fs.mkdirSync(uploadDir, { recursive: true }); } catch (e) {}
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// --- MIDDLEWARE ---
app.use(cors({ origin: [FRONTEND_URL, 'http://localhost:5173', 'https://feuda.vercel.app', 'https://feuda-frontend.vercel.app'], credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// --- DATABASE ---
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'jeestore',
  port: parseInt(process.env.DB_PORT || '3306'),
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
};

const pool = mysql.createPool(dbConfig);

let dbInitialized = false;
let dbError: string | null = null;

async function initializeDatabase() {
  if (dbInitialized) return;
  try {
    const tempConn = await mysql.createConnection({ ...dbConfig, database: undefined });
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await tempConn.end();

    const schemaFile = `
      CREATE TABLE IF NOT EXISTS products (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, category VARCHAR(100) NOT NULL, price DECIMAL(10, 2) NOT NULL, stock INT DEFAULT 0, description TEXT, model_compatibility VARCHAR(255), image_url VARCHAR(255), is_best_seller BOOLEAN DEFAULT FALSE, colors TEXT, specifications TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, full_name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, role ENUM('admin', 'user') DEFAULT 'user', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS orders (id VARCHAR(50) PRIMARY KEY, user_id INT NULL, full_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, phone VARCHAR(20) NOT NULL, address TEXT NOT NULL, city VARCHAR(100) NOT NULL, area VARCHAR(100) NOT NULL, postal_code VARCHAR(20) NOT NULL, payment_method VARCHAR(50) NOT NULL, subtotal DECIMAL(10, 2) NOT NULL, shipping_fee DECIMAL(10, 2) NOT NULL, tax DECIMAL(10, 2) NOT NULL, total DECIMAL(10, 2) NOT NULL, status ENUM('Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Processing', source ENUM('Online', 'POS') DEFAULT 'Online', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS order_items (id INT AUTO_INCREMENT PRIMARY KEY, order_id VARCHAR(50) NOT NULL, product_id INT NOT NULL, product_name VARCHAR(255) NOT NULL, quantity INT NOT NULL, price DECIMAL(10, 2) NOT NULL, selected_color VARCHAR(50), FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE);
      CREATE TABLE IF NOT EXISTS inventory_logs (id INT AUTO_INCREMENT PRIMARY KEY, product_id INT NOT NULL, type ENUM('IN', 'OUT') NOT NULL, quantity INT NOT NULL, reason VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE);
      CREATE TABLE IF NOT EXISTS order_tracking (id INT AUTO_INCREMENT PRIMARY KEY, order_id VARCHAR(50) NOT NULL, status VARCHAR(100) NOT NULL, location VARCHAR(255), notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE);
      CREATE TABLE IF NOT EXISTS categories (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) UNIQUE NOT NULL, slug VARCHAR(100) UNIQUE NOT NULL, description TEXT, image_url VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS cms_pages (id INT AUTO_INCREMENT PRIMARY KEY, slug VARCHAR(100) UNIQUE NOT NULL, title VARCHAR(255) NOT NULL, content LONGTEXT NOT NULL, last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS menu_items (id INT AUTO_INCREMENT PRIMARY KEY, label VARCHAR(255) NOT NULL, url VARCHAR(255) DEFAULT NULL, parent_id INT NULL, position INT DEFAULT 0, is_active BOOLEAN DEFAULT TRUE, location VARCHAR(50) DEFAULT 'header', layout_style VARCHAR(100) DEFAULT 'Default', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE CASCADE);
      CREATE TABLE IF NOT EXISTS payments (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, type VARCHAR(50) NOT NULL, account_number VARCHAR(100), is_active BOOLEAN DEFAULT TRUE, instructions TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS social_links (id INT AUTO_INCREMENT PRIMARY KEY, platform VARCHAR(50) NOT NULL, url VARCHAR(255) NOT NULL, icon VARCHAR(255), position INT DEFAULT 0, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS devices (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS announcements (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255) NOT NULL, url VARCHAR(255), is_active BOOLEAN DEFAULT TRUE, position INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS reviews (id INT AUTO_INCREMENT PRIMARY KEY, product_id INT NOT NULL, user_id INT NULL, user_name VARCHAR(255) NOT NULL, rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5), comment TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE);
    `;
    await pool.query(schemaFile);
    dbInitialized = true;
  } catch (err: any) { dbError = err.message; console.error(err); }
}

app.use(async (req, res, next) => {
  if (!dbInitialized) await initializeDatabase();
  if (dbError) return res.status(500).json({ error: "Database Link Error", details: dbError });
  next();
});

const Gatekeeper = {
  authenticate: (req: any, res: any, next: any) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      req.user = user;
      next();
    });
  },
  adminOnly: (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    next();
  }
};

// --- AUTH ---
app.get('/api/me', Gatekeeper.authenticate, async (req: any, res) => {
  const [users]: any = await pool.query('SELECT id, email, full_name as fullName, role FROM users WHERE id = ?', [req.user.id]);
  res.json(users[0]);
});

app.post('/api/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = Schemas.login.parse(req.body);
    const [users]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ error: 'Auth Failed' });
    const user = users[0];
    const isValid = user.password_hash.includes(':') ? Security.oldVerify(password, user.password_hash) : await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Auth Failed' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, fullName: user.full_name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role } });
  } catch (err: any) { res.status(500).json({ error: 'Server Error' }); }
});

app.post('/api/register', authLimiter, async (req, res) => {
  try {
    const { fullName, email, password } = Schemas.register.parse(req.body);
    const [existing]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ error: 'Email registered' });
    const [total]: any = await pool.query('SELECT COUNT(*) as count FROM users');
    const role = total[0].count === 0 ? 'admin' : 'user';
    const hashedPassword = await Security.hash(password);
    const [r]: any = await pool.query('INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)', [fullName, email, hashedPassword, role]);
    const token = jwt.sign({ id: r.insertId, email, role, fullName }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: r.insertId, email, fullName, role } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : null;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;
    const search = req.query.search as string || req.query.q as string;
    const category = req.query.category as string;
    const sortBy = req.query.sortBy as string || 'popular';
    
    let query = 'SELECT * FROM products WHERE 1=1';
    let params: any[] = [];
    if (search) { query += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (category && category !== 'all') { query += ' AND category = ?'; params.push(category); }
    if (sortBy === 'price-low') query += ' ORDER BY price ASC';
    else if (sortBy === 'price-high') query += ' ORDER BY price DESC';
    else query += ' ORDER BY id DESC';

    if (page !== null) {
      const offset = (page - 1) * limit;
      const [rows]: any = await pool.query(query + ' LIMIT ? OFFSET ?', [...params, limit, offset]);
      const [totalRows]: any = await pool.query('SELECT COUNT(*) as total FROM products WHERE 1=1' + (category && category !== 'all' ? ' AND category = ?' : ''), category && category !== 'all' ? [category] : []);
      return res.json({ products: rows, pagination: { total: totalRows[0].total, page, limit, totalPages: Math.ceil(totalRows[0].total / limit) } });
    }
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/products', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
  try {
    const p = Schemas.product.parse(req.body);
    const [r]: any = await pool.query('INSERT INTO products (name,category,price,stock,description,model_compatibility,image_url,colors,specifications) VALUES (?,?,?,?,?,?,?,?,?)', [p.name, p.category, p.price, p.stock, p.description, p.modelCompatibility, p.imageUrl, JSON.stringify(p.colors || []), JSON.stringify(p.specifications || [])]);
    res.json({ id: r.insertId });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/products/:id', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
  await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ message: 'Deleted' });
});

// --- ORDERS ---
app.get('/api/orders', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  res.json(rows);
});

app.post('/api/orders', async (req: any, res) => {
  const o = req.body;
  const shipping = o.shipping || {};
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const orderId = `ORD-${Date.now()}`;
    await conn.query('INSERT INTO orders (id, user_id, full_name, email, phone, address, city, area, postal_code, payment_method, subtotal, shipping_fee, tax, total) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [orderId, req.user?.id || null, o.fullName || shipping.fullName, o.email || shipping.email, o.phone || shipping.phone, o.address || shipping.address, o.city || shipping.city, o.area || shipping.area, o.postalCode || shipping.postalCode, o.paymentMethod, o.subtotal, o.shippingFee, o.tax, o.total]);
    if (o.items) {
      const items = o.items.map((i: any) => [orderId, i.id, i.name, i.quantity, i.price, i.selectedColor]);
      await conn.query('INSERT INTO order_items (order_id, product_id, product_name, quantity, price, selected_color) VALUES ?', [items]);
    }
    await conn.commit();
    res.json({ orderId });
  } catch (err: any) { await conn.rollback(); res.status(500).json({ error: err.message }); } finally { conn.release(); }
});

// --- CATEGORIES, CMS, MENUS, ANNOUNCEMENTS ---
app.get('/api/categories', async (req, res) => { const [rows] = await pool.query('SELECT * FROM categories'); res.json(rows); });
app.get('/api/cms/:slug', async (req, res) => { const [rows]: any = await pool.query('SELECT * FROM cms_pages WHERE slug = ?', [req.params.slug]); res.json(rows[0] || { title: 'Missing', content: '' }); });
app.get('/api/menus', async (req, res) => { const [rows] = await pool.query('SELECT * FROM menu_items ORDER BY position ASC'); res.json(rows); });
app.get('/api/announcements', async (req, res) => { const [rows] = await pool.query('SELECT * FROM announcements WHERE is_active = 1 ORDER BY position ASC'); res.json(rows); });
app.get('/api/social-links', async (req, res) => { const [rows] = await pool.query('SELECT * FROM social_links WHERE is_active = 1 ORDER BY position ASC'); res.json(rows); });

export default app;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 http://localhost:${PORT}`));
}
