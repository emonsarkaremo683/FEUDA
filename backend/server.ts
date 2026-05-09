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

/** 
 * NEXUS OBSIDIAN CORE v3.2 (Vercel Optimized)
 * High-performance ERP/E-commerce Engine
 */

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
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp'), // Use /tmp for Vercel compatibility
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// --- MIDDLEWARE ---
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
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
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Database Initialization Middleware
let dbInitialized = false;
async function initializeDatabase() {
  if (dbInitialized) return;
  try {
    console.log("📡 [Database] Initializing Schema...");
    const tempConn = await mysql.createConnection({ ...dbConfig, database: undefined });
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await tempConn.end();

    const schemaFile = `
      CREATE TABLE IF NOT EXISTS products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          stock INT DEFAULT 0,
          description TEXT,
          model_compatibility VARCHAR(255),
          image_url VARCHAR(255),
          is_best_seller BOOLEAN DEFAULT FALSE,
          colors TEXT,
          specifications TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('admin', 'user') DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(50) PRIMARY KEY,
          user_id INT NULL,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          address TEXT NOT NULL,
          city VARCHAR(100) NOT NULL,
          area VARCHAR(100) NOT NULL,
          postal_code VARCHAR(20) NOT NULL,
          payment_method VARCHAR(50) NOT NULL,
          subtotal DECIMAL(10, 2) NOT NULL,
          shipping_fee DECIMAL(10, 2) NOT NULL,
          tax DECIMAL(10, 2) NOT NULL,
          total DECIMAL(10, 2) NOT NULL,
          status ENUM('Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Processing',
          source ENUM('Online', 'POS') DEFAULT 'Online',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id VARCHAR(50) NOT NULL,
          product_id INT NOT NULL,
          product_name VARCHAR(255) NOT NULL,
          quantity INT NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          selected_color VARCHAR(50),
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS inventory_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL,
          type ENUM('IN', 'OUT') NOT NULL,
          quantity INT NOT NULL,
          reason VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS order_tracking (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id VARCHAR(50) NOT NULL,
          status VARCHAR(100) NOT NULL,
          location VARCHAR(255),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          slug VARCHAR(100) UNIQUE NOT NULL,
          description TEXT,
          image_url VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cms_pages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          slug VARCHAR(100) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          content LONGTEXT NOT NULL,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS menu_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          label VARCHAR(255) NOT NULL,
          url VARCHAR(255) DEFAULT NULL,
          parent_id INT NULL,
          position INT DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          location VARCHAR(50) DEFAULT 'header',
          layout_style VARCHAR(100) DEFAULT 'Default',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS payments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          type VARCHAR(50) NOT NULL,
          account_number VARCHAR(100),
          is_active BOOLEAN DEFAULT TRUE,
          instructions TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS social_links (
          id INT AUTO_INCREMENT PRIMARY KEY,
          platform VARCHAR(50) NOT NULL,
          url VARCHAR(255) NOT NULL,
          icon VARCHAR(255),
          position INT DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS devices (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS announcements (
          id INT AUTO_INCREMENT PRIMARY KEY,
          message VARCHAR(255) NOT NULL,
          url VARCHAR(255),
          is_active BOOLEAN DEFAULT TRUE,
          position INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS reviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL,
          user_id INT NULL,
          user_name VARCHAR(255) NOT NULL,
          rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `;

    await pool.query(schemaFile);

    // Seeding logic
    const [existingPages]: any = await pool.query('SELECT COUNT(*) as count FROM cms_pages');
    if (existingPages[0].count === 0) {
      console.log('🌱 [Seeding] Populating Initial CMS Content...');
      await pool.query(`
        INSERT IGNORE INTO cms_pages (slug, title, content) VALUES
        ('homepage-layout', 'Homepage Layout', '[{"id":"Hero","label":"Hero Banner","type":"component","visible":true,"order":1},{"id":"TabbedProductShowcase","label":"Tabbed Showcase","type":"component","visible":true,"order":2},{"id":"StorySection","label":"Our Story","type":"component","visible":true,"order":3},{"id":"Categories","label":"Shop By Category","type":"component","visible":true,"order":4},{"id":"TrustSection","label":"Trust Badges","type":"component","visible":true,"order":5}]'),
        ('theme-settings', 'Theme Customization', '{"primary":"#9333ea","accent":"#2563eb","background":"#0f172a","text":"#f8fafc","card":"#1e293b","border":"#334155","primaryGradient":"linear-gradient(to right, #9333ea, #db2777)","heroGradient":"radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)"}'),
        ('contact', 'Contact Us', '<h1>Contact Us</h1><p>Default content for Contact Us.</p>'),
        ('shipping-policy', 'Shipping Policy', '<h1>Shipping Policy</h1><p>Default content for Shipping Policy.</p>'),
        ('returns-refunds', 'Returns & Refunds', '<h1>Returns & Refunds</h1><p>Default content for Returns & Refunds.</p>'),
        ('faq', 'FAQ', '<h1>FAQ</h1><p>Default content for FAQ.</p>'),
        ('privacy-policy', 'Privacy Policy', '<h1>Privacy Policy</h1><p>Default content for Privacy Policy.</p>'),
        ('terms-service', 'Terms of Service', '<h1>Terms of Service</h1><p>Default content for Terms of Service.</p>'),
        ('cookie-policy', 'Cookie Policy', '<h1>Cookie Policy</h1><p>Default content for Cookie Policy.</p>');
      `);
    }

    const [admins]: any = await pool.query('SELECT * FROM users WHERE role = "admin"');
    if (admins.length === 0) {
      await pool.query('INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Root Admin', 'admin@feuda.com', await Security.hash('admin123'), 'admin']);
    }

    const [footerMenus]: any = await pool.query('SELECT COUNT(*) as count FROM menu_items WHERE location = "footer"');
    if (footerMenus[0].count === 0) {
      await pool.query(`
        INSERT IGNORE INTO menu_items (label, url, location, position, layout_style) VALUES
        ('Contact Us', '/cms/contact', 'footer', 1, 'Support'),
        ('Shipping Policy', '/cms/shipping-policy', 'footer', 2, 'Support'),
        ('Returns & Refunds', '/cms/returns-refunds', 'footer', 3, 'Support'),
        ('FAQ', '/cms/faq', 'footer', 4, 'Support'),
        ('Privacy Policy', '/cms/privacy-policy', 'footer', 5, 'Legal'),
        ('Terms of Service', '/cms/terms-service', 'footer', 6, 'Legal'),
        ('Cookie Policy', '/cms/cookie-policy', 'footer', 7, 'Legal'),
        ('All Products', '/category/all', 'footer', 1, 'Shop'),
        ('Clear Cases', '/category/clear-cases', 'footer', 2, 'Shop'),
        ('MagSafe', '/category/magsafe', 'footer', 3, 'Shop');
      `);
    }

    dbInitialized = true;
    console.log("✅ [Database] System Ready");
  } catch (err: any) {
    console.error(`❌ [Critical Fault] Database Initialization Failed: ${err.message}`);
    // Do not process.exit(1) on Vercel
    if (!process.env.VERCEL) process.exit(1);
  }
}

// Middleware to ensure DB is initialized
app.use(async (req, res, next) => {
  if (!dbInitialized) await initializeDatabase();
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

// --- ROUTES ---

app.get('/api/me', Gatekeeper.authenticate, async (req: any, res) => {
  const [users]: any = await pool.query('SELECT id, email, full_name as fullName, role FROM users WHERE id = ?', [req.user.id]);
  if (users.length === 0) return res.status(404).json({ error: 'User missing' });
  res.json(users[0]);
});

app.post('/api/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = Schemas.login.parse(req.body);
    const [users]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) return res.status(401).json({ error: 'Auth Failed' });
    
    const user = users[0];
    const isOldFormat = user.password_hash.includes(':');
    const isValid = isOldFormat 
      ? Security.oldVerify(password, user.password_hash)
      : await bcrypt.compare(password, user.password_hash);

    if (!isValid) return res.status(401).json({ error: 'Auth Failed' });

    if (isOldFormat) {
      const newHash = await Security.hash(password);
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id]);
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, fullName: user.full_name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role } });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues[0].message });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/register', authLimiter, async (req, res) => {
  try {
    const { fullName, email, password } = Schemas.register.parse(req.body);
    const [existing]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ error: 'Email already registered' });
    
    const [totalUsers]: any = await pool.query('SELECT COUNT(*) as count FROM users');
    const role = totalUsers[0].count === 0 ? 'admin' : 'user';
    
    const hashedPassword = await Security.hash(password);
    const [r]: any = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [fullName, email, hashedPassword, role]
    );
    
    const token = jwt.sign({ id: r.insertId, email, role, fullName }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: r.insertId, email, fullName, role } });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues[0].message });
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
  const [users]: any = await pool.query('SELECT id, email, full_name as fullName, role, created_at FROM users ORDER BY created_at DESC');
  res.json(users);
});

app.patch('/api/users/:id/role', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
  await pool.query('UPDATE users SET role = ? WHERE id = ?', [req.body.role, req.params.id]);
  res.json({ message: 'Role Updated' });
});

app.get('/api/products', async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page as string) : null;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;
  const search = req.query.search as string || req.query.q as string;
  const category = req.query.category as string;
  const inStock = req.query.inStock === 'true';
  const sortBy = req.query.sortBy as string || 'popular';
  
  let query = 'SELECT * FROM products WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
  const params: any[] = [];

  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)';
    countQuery += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (category && category !== 'all') {
    query += ' AND category = ?';
    countQuery += ' AND category = ?';
    params.push(category);
  }

  if (inStock) {
    query += ' AND stock > 0';
    countQuery += ' AND stock > 0';
  }

  if (sortBy === 'price-low') query += ' ORDER BY price ASC';
  else if (sortBy === 'price-high') query += ' ORDER BY price DESC';
  else query += ' ORDER BY id DESC';

  try {
    if (page !== null) {
      const offset = (page - 1) * limit;
      const [rows]: any = await pool.query(query + ' LIMIT ? OFFSET ?', [...params, limit, offset]);
      const [totalRows]: any = await pool.query(countQuery, params);
      return res.json({ products: rows, pagination: { total: totalRows[0].total, page, limit, totalPages: Math.ceil(totalRows[0].total / limit) } });
    }
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/products', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
  try {
    const p = Schemas.product.parse(req.body);
    const [r]: any = await pool.query('INSERT INTO products (name,category,price,stock,description,model_compatibility,image_url,colors,specifications) VALUES (?,?,?,?,?,?,?,?,?)',
      [p.name, p.category, p.price, p.stock, p.description, p.modelCompatibility, p.imageUrl, JSON.stringify(p.colors || []), JSON.stringify(p.specifications || [])]);
    res.json({ id: r.insertId });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues[0].message });
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
  try {
    const p = Schemas.product.parse(req.body);
    await pool.query(
      'UPDATE products SET name=?, category=?, price=?, stock=?, description=?, model_compatibility=?, image_url=?, colors=?, specifications=?, is_best_seller=? WHERE id=?',
      [p.name, p.category, p.price, p.stock, p.description, p.modelCompatibility, p.imageUrl,
       JSON.stringify(p.colors || []), JSON.stringify(p.specifications || []), p.isBestSeller || false, req.params.id]
    );
    res.json({ message: 'Product Updated' });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues[0].message });
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
  await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ message: 'Product Deleted' });
});

app.get('/api/reviews/:productId', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC', [req.params.productId]);
  res.json(rows);
});

app.post('/api/reviews', Gatekeeper.authenticate, async (req: any, res) => {
  const { productId, rating, comment } = req.body;
  if (!productId || !rating) return res.status(400).json({ error: 'Product ID and rating required' });
  try {
    const [r]: any = await pool.query('INSERT INTO reviews (product_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [productId, req.user.id, req.user.fullName, rating, comment]);
    res.status(201).json({ id: r.insertId, message: 'Review Posted' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

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
    const orderId = o.orderId || `ORD-${Date.now()}`;
    await conn.query(
      'INSERT INTO orders (id, user_id, full_name, email, phone, address, city, area, postal_code, payment_method, subtotal, shipping_fee, tax, total, source) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [orderId, req.user?.id || null, o.fullName || shipping.fullName, o.email || shipping.email, o.phone || shipping.phone, o.address || shipping.address, o.city || shipping.city, o.area || shipping.area, o.postalCode || shipping.postalCode, o.paymentMethod, o.subtotal, o.shippingFee, o.tax, o.total, o.source || 'Online']
    );
    if (o.items && o.items.length > 0) {
      const items = o.items.map((i: any) => [orderId, i.id, i.name, i.quantity, i.price, i.selectedColor || null]);
      await conn.query('INSERT INTO order_items (order_id, product_id, product_name, quantity, price, selected_color) VALUES ?', [items]);
      for (const item of o.items) {
        await conn.query('UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?', [item.quantity, item.id]);
        await conn.query('INSERT INTO inventory_logs (product_id, type, quantity, reason) VALUES (?, ?, ?, ?)', [item.id, 'OUT', item.quantity, `Order ${orderId}`]);
      }
    }
    await conn.commit();
    res.json({ orderId });
  } catch (err: any) { await conn.rollback(); res.status(500).json({ error: err.message }); } finally { conn.release(); }
});

app.get('/api/orders/mine', Gatekeeper.authenticate, async (req: any, res) => {
  const [rows] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
  res.json(rows);
});

app.get('/api/orders/:id', Gatekeeper.authenticate, async (req: any, res) => {
  const [orders]: any = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  if (orders.length === 0) return res.status(404).json({ error: 'Order not found' });
  if (req.user.role !== 'admin' && orders[0].user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
  res.json({ ...orders[0], items });
});

app.put('/api/orders/:id/status', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ message: 'Status Updated' });
});

app.get('/api/analytics/stats', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
  try {
    const [rev]: any = await pool.query('SELECT SUM(total) as revenue FROM orders WHERE status != "Cancelled"');
    const [ords]: any = await pool.query('SELECT COUNT(*) as count FROM orders');
    const [prods]: any = await pool.query('SELECT COUNT(*) as count FROM products');
    const [users]: any = await pool.query('SELECT COUNT(*) as count FROM users');
    const [recent]: any = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5');
    const [bySource]: any = await pool.query('SELECT source, SUM(total) as value FROM orders GROUP BY source');
    const [byCategory]: any = await pool.query('SELECT category, COUNT(*) as count FROM products GROUP BY category');
    res.json({ revenue: rev[0].revenue || 0, orders: ords[0].count, products: prods[0].count, users: users[0].count, recentOrders: recent, segments: { bySource, byCategory } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/categories', async (req, res) => { res.json((await pool.query('SELECT * FROM categories'))[0]); });
app.post('/api/categories', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
  try {
    const { name, slug, description, imageUrl } = Schemas.category.parse(req.body);
    const [r]: any = await pool.query('INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)', [name, slug, description, imageUrl]);
    res.json({ id: r.insertId });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues[0].message });
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cms/:slug', async (req, res) => {
  const [rows]: any = await pool.query('SELECT * FROM cms_pages WHERE slug = ?', [req.params.slug]);
  res.json(rows[0] || { title: 'Page Missing', content: '<p>Under Construction</p>' });
});

app.post('/api/cms', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
  try {
    const { title, content, slug } = Schemas.cmsPage.parse(req.body);
    const [r]: any = await pool.query('INSERT INTO cms_pages (slug, title, content) VALUES (?, ?, ?)', [slug, title, content]);
    res.status(201).json({ id: r.insertId, message: 'Page Created' });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues[0].message });
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/menus', async (req, res) => { res.json((await pool.query('SELECT * FROM menu_items ORDER BY position ASC'))[0]); });

app.get('/api/announcements', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM announcements WHERE is_active = TRUE ORDER BY position ASC');
  res.json(rows);
});

// Profile & Password
app.put('/api/me', Gatekeeper.authenticate, async (req: any, res) => {
  const { fullName } = req.body;
  await pool.query('UPDATE users SET full_name=? WHERE id=?', [fullName, req.user.id]);
  res.json({ message: 'Profile Updated' });
});

app.put('/api/me/password', Gatekeeper.authenticate, async (req: any, res) => {
  const { currentPassword, newPassword } = req.body;
  const [users]: any = await pool.query('SELECT * FROM users WHERE id=?', [req.user.id]);
  if (users.length === 0) return res.status(404).json({ error: 'User not found' });
  if (!await Security.verify(currentPassword, users[0].password_hash)) return res.status(401).json({ error: 'Current password is incorrect' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  await pool.query('UPDATE users SET password_hash=? WHERE id=?', [await Security.hash(newPassword), req.user.id]);
  res.json({ message: 'Password Changed' });
});

// Export app for Vercel
export default app;

// Listen only if running locally
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [FEUDA API] Running on http://localhost:${PORT}`);
  });
}
