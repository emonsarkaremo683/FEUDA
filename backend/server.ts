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
import { z } from "zod";
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * FEUDA ULTIMATE CORE v4.0
 * Domain: http://feudatech.com
 */

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'feuda_primary_secure_secret';
const FRONTEND_URLS = ['http://feudatech.com', 'https://feuda.vercel.app', 'http://localhost:5173', 'https://feuda-frontend.vercel.app'];

// Security & Utils
const Security = {
  hash: async (p: string) => await bcrypt.hash(p, 12),
  verify: async (p: string, h: string) => {
    if (h.includes(':')) {
      const [salt, hash] = h.split(':');
      return crypto.createHash('sha512').update(p + salt).digest('hex') === hash;
    }
    return await bcrypt.compare(p, h);
  }
};

const Schemas = {
  product: z.object({ name: z.string(), category: z.string(), price: z.number(), stock: z.number(), description: z.string().optional(), modelCompatibility: z.string().optional(), imageUrl: z.string().optional(), colors: z.array(z.any()).optional(), specifications: z.array(z.any()).optional(), isBestSeller: z.boolean().optional() }),
  category: z.object({ name: z.string(), slug: z.string(), description: z.string().optional(), imageUrl: z.string().optional() }),
  cmsPage: z.object({ title: z.string(), content: z.string(), slug: z.string() }),
  menuItem: z.object({ label: z.string(), url: z.string().optional().nullable(), parent_id: z.number().optional().nullable(), position: z.number().optional(), location: z.string().optional(), layout_style: z.string().optional(), is_active: z.boolean().optional() }),
  announcement: z.object({ message: z.string(), url: z.string().optional(), is_active: z.boolean().optional(), position: z.number().optional() })
};

// Middleware
app.use(cors({ origin: FRONTEND_URLS, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Storage (Vercel-limited: /tmp is ephemeral)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Database
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306'),
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 15000
};

const pool = mysql.createPool(dbConfig);
let dbInitialized = false;

async function initDB() {
  if (dbInitialized) return;
  try {
    const conn = await mysql.createConnection({ ...dbConfig, database: undefined });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await conn.end();

    const schema = `
      CREATE TABLE IF NOT EXISTS products (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, category VARCHAR(100) NOT NULL, price DECIMAL(10,2) NOT NULL, stock INT DEFAULT 0, description TEXT, model_compatibility VARCHAR(255), image_url VARCHAR(255), is_best_seller BOOLEAN DEFAULT FALSE, colors TEXT, specifications TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, full_name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, role ENUM('admin', 'user') DEFAULT 'user', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS categories (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) UNIQUE NOT NULL, slug VARCHAR(100) UNIQUE NOT NULL, description TEXT, image_url VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS cms_pages (id INT AUTO_INCREMENT PRIMARY KEY, slug VARCHAR(100) UNIQUE NOT NULL, title VARCHAR(255) NOT NULL, content LONGTEXT NOT NULL, last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS menu_items (id INT AUTO_INCREMENT PRIMARY KEY, label VARCHAR(255) NOT NULL, url VARCHAR(255) DEFAULT NULL, parent_id INT NULL, position INT DEFAULT 0, is_active BOOLEAN DEFAULT TRUE, location VARCHAR(50) DEFAULT 'header', layout_style VARCHAR(100) DEFAULT 'Default', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE CASCADE);
      CREATE TABLE IF NOT EXISTS announcements (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255) NOT NULL, url VARCHAR(255), is_active BOOLEAN DEFAULT TRUE, position INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS social_links (id INT AUTO_INCREMENT PRIMARY KEY, platform VARCHAR(50) NOT NULL, url VARCHAR(255) NOT NULL, icon VARCHAR(255), position INT DEFAULT 0, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS orders (id VARCHAR(50) PRIMARY KEY, user_id INT NULL, full_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, phone VARCHAR(20) NOT NULL, address TEXT NOT NULL, city VARCHAR(100) NOT NULL, area VARCHAR(100) NOT NULL, postal_code VARCHAR(20) NOT NULL, payment_method VARCHAR(50) NOT NULL, subtotal DECIMAL(10,2) NOT NULL, shipping_fee DECIMAL(10,2) NOT NULL, tax DECIMAL(10,2) NOT NULL, total DECIMAL(10,2) NOT NULL, status ENUM('Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Processing', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `;
    await pool.query(schema);
    dbInitialized = true;
  } catch (e) { console.error("DB Init Error:", e); }
}

app.use(async (req, res, next) => {
  if (req.path === '/api/health') return next();
  await initDB();
  next();
});

const Gatekeeper = {
  auth: (req: any, res: any, next: any) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      req.user = user;
      next();
    });
  },
  admin: (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    next();
  }
};

// --- AUTH ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const [users]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (users.length === 0 || !(await Security.verify(password, users[0].password_hash))) return res.status(401).json({ error: 'Invalid credentials' });
  const user = users[0];
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, fullName: user.full_name }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role } });
});

app.post('/api/register', async (req, res) => {
  const { fullName, email, password } = req.body;
  const [total]: any = await pool.query('SELECT COUNT(*) as count FROM users');
  const role = total[0].count === 0 ? 'admin' : 'user';
  const [r]: any = await pool.query('INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)', [fullName, email, await Security.hash(password), role]);
  const token = jwt.sign({ id: r.insertId, email, role, fullName }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: r.insertId, email, fullName, role } });
});

app.get('/api/me', Gatekeeper.auth, async (req: any, res) => {
  const [users]: any = await pool.query('SELECT id, email, full_name as fullName, role FROM users WHERE id = ?', [req.user.id]);
  res.json(users[0]);
});

// --- UPLOAD ---
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  // Note: On Vercel, this file is ephemeral. Use Cloudinary for production.
  res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename });
});

// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
  res.json(rows);
});

app.post('/api/products', Gatekeeper.auth, Gatekeeper.admin, async (req, res) => {
  const p = req.body;
  const [r]: any = await pool.query('INSERT INTO products (name,category,price,stock,description,model_compatibility,image_url,colors,specifications) VALUES (?,?,?,?,?,?,?,?,?)', [p.name, p.category, p.price, p.stock, p.description, p.modelCompatibility, p.imageUrl, JSON.stringify(p.colors || []), JSON.stringify(p.specifications || [])]);
  res.json({ id: r.insertId });
});

app.put('/api/products/:id', Gatekeeper.auth, Gatekeeper.admin, async (req, res) => {
  const p = req.body;
  await pool.query('UPDATE products SET name=?, category=?, price=?, stock=?, description=?, model_compatibility=?, image_url=?, colors=?, specifications=? WHERE id=?', [p.name, p.category, p.price, p.stock, p.description, p.modelCompatibility, p.imageUrl, JSON.stringify(p.colors || []), JSON.stringify(p.specifications || []), req.params.id]);
  res.json({ message: 'Updated' });
});

app.delete('/api/products/:id', Gatekeeper.auth, Gatekeeper.admin, async (req, res) => {
  await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ message: 'Deleted' });
});

// --- CATEGORIES ---
app.get('/api/categories', async (req, res) => res.json((await pool.query('SELECT * FROM categories'))[0]));
app.post('/api/categories', Gatekeeper.auth, Gatekeeper.admin, async (req, res) => {
  const { name, slug, description, imageUrl } = req.body;
  const [r]: any = await pool.query('INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)', [name, slug, description, imageUrl]);
  res.json({ id: r.insertId });
});
app.delete('/api/categories/:id', Gatekeeper.auth, Gatekeeper.admin, async (req, res) => {
  await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
  res.json({ message: 'Deleted' });
});

// --- CMS ---
app.get('/api/cms', async (req, res) => res.json((await pool.query('SELECT * FROM cms_pages'))[0]));
app.get('/api/cms/:slug', async (req, res) => {
  const [rows]: any = await pool.query('SELECT * FROM cms_pages WHERE slug = ?', [req.params.slug]);
  res.json(rows[0] || { title: 'Not Found', content: '' });
});
app.post('/api/cms', Gatekeeper.auth, Gatekeeper.admin, async (req, res) => {
  const { title, content, slug } = req.body;
  const [r]: any = await pool.query('INSERT INTO cms_pages (slug, title, content) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE title=?, content=?', [slug, title, content, title, content]);
  res.json({ id: r.insertId || slug });
});
app.delete('/api/cms/:id', Gatekeeper.auth, Gatekeeper.admin, async (req, res) => {
  await pool.query('DELETE FROM cms_pages WHERE id = ?', [req.params.id]);
  res.json({ message: 'Deleted' });
});

// --- MENUS ---
app.get('/api/menus', async (req, res) => res.json((await pool.query('SELECT * FROM menu_items ORDER BY position ASC'))[0]));
app.post('/api/menus', Gatekeeper.auth, Gatekeeper.admin, async (req, res) => {
  const m = req.body;
  const [r]: any = await pool.query('INSERT INTO menu_items (label, url, parent_id, position, location, layout_style, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)', [m.label, m.url, m.parent_id, m.position, m.location, m.layout_style, m.is_active]);
  res.json({ id: r.insertId });
});
app.put('/api/menus/:id', Gatekeeper.auth, Gatekeeper.admin, async (req, res) => {
  const m = req.body;
  await pool.query('UPDATE menu_items SET label=?, url=?, parent_id=?, position=?, location=?, layout_style=?, is_active=? WHERE id=?', [m.label, m.url, m.parent_id, m.position, m.location, m.layout_style, m.is_active, req.params.id]);
  res.json({ message: 'Updated' });
});
app.delete('/api/menus/:id', Gatekeeper.auth, Gatekeeper.admin, async (req, res) => {
  await pool.query('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
  res.json({ message: 'Deleted' });
});

// --- ANNOUNCEMENTS ---
app.get('/api/announcements', async (req, res) => res.json((await pool.query('SELECT * FROM announcements WHERE is_active=1 ORDER BY position ASC'))[0]));
app.post('/api/announcements', Gatekeeper.auth, Gatekeeper.admin, async (req, res) => {
  const a = req.body;
  const [r]: any = await pool.query('INSERT INTO announcements (message, url, is_active, position) VALUES (?, ?, ?, ?)', [a.message, a.url, a.is_active, a.position]);
  res.json({ id: r.insertId });
});

// --- SOCIAL LINKS ---
app.get('/api/social-links', async (req, res) => res.json((await pool.query('SELECT * FROM social_links WHERE is_active=1 ORDER BY position ASC'))[0]));
app.post('/api/social-links', Gatekeeper.auth, Gatekeeper.admin, async (req, res) => {
  const s = req.body;
  const [r]: any = await pool.query('INSERT INTO social_links (platform, url, icon, position, is_active) VALUES (?, ?, ?, ?, ?)', [s.platform, s.url, s.icon, s.position, s.is_active]);
  res.json({ id: r.insertId });
});

// --- ANALYTICS ---
app.get('/api/analytics/stats', Gatekeeper.auth, Gatekeeper.admin, async (req, res) => {
  const [rev]: any = await pool.query('SELECT SUM(total) as revenue FROM orders');
  const [ords]: any = await pool.query('SELECT COUNT(*) as count FROM orders');
  const [prods]: any = await pool.query('SELECT COUNT(*) as count FROM products');
  const [users]: any = await pool.query('SELECT COUNT(*) as count FROM users');
  res.json({ revenue: rev[0].revenue || 0, orders: ords[0].count, products: prods[0].count, users: users[0].count });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', domain: 'feudatech.com' }));

export default app;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 http://localhost:${PORT}`));
}
