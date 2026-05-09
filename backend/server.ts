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

// Security & Utils
const Security = {
  oldVerify: (password: string, stored: string) => {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    return crypto.createHash('sha512').update(password + salt).digest('hex') === hash;
  },
  hash: async (password: string) => await bcrypt.hash(password, 12),
  verify: async (password: string, stored: string) => {
    if (!stored.includes(':')) return await bcrypt.compare(password, stored);
    return Security.oldVerify(password, stored);
  }
};

const Schemas = {
  register: z.object({ fullName: z.string().min(2), email: z.string().email(), password: z.string().min(8) }),
  login: z.object({ email: z.string().email(), password: z.string().min(1) }),
  product: z.object({ name: z.string().min(1), category: z.string().min(1), price: z.number(), stock: z.number(), description: z.string().optional(), modelCompatibility: z.string().optional(), imageUrl: z.string().optional(), colors: z.array(z.any()).optional(), specifications: z.array(z.any()).optional(), isBestSeller: z.boolean().optional() })
};

// Middleware
app.use(cors({ origin: [FRONTEND_URL, 'http://localhost:5173', 'https://feuda.vercel.app', 'https://feuda-frontend.vercel.app'], credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// DB Setup
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
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
      CREATE TABLE IF NOT EXISTS categories (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) UNIQUE NOT NULL, slug VARCHAR(100) UNIQUE NOT NULL, description TEXT, image_url VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS cms_pages (id INT AUTO_INCREMENT PRIMARY KEY, slug VARCHAR(100) UNIQUE NOT NULL, title VARCHAR(255) NOT NULL, content LONGTEXT NOT NULL, last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS menu_items (id INT AUTO_INCREMENT PRIMARY KEY, label VARCHAR(255) NOT NULL, url VARCHAR(255) DEFAULT NULL, parent_id INT NULL, position INT DEFAULT 0, is_active BOOLEAN DEFAULT TRUE, location VARCHAR(50) DEFAULT 'header', layout_style VARCHAR(100) DEFAULT 'Default', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE CASCADE);
      CREATE TABLE IF NOT EXISTS announcements (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255) NOT NULL, url VARCHAR(255), is_active BOOLEAN DEFAULT TRUE, position INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS social_links (id INT AUTO_INCREMENT PRIMARY KEY, platform VARCHAR(50) NOT NULL, url VARCHAR(255) NOT NULL, icon VARCHAR(255), position INT DEFAULT 0, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `;
    await pool.query(schemaFile);
    dbInitialized = true;
  } catch (err: any) { dbError = err.message; console.error(err); }
}

app.get('/api/health', (req, res) => res.json({ status: 'ok', db: dbInitialized ? 'connected' : 'connecting', env_host: process.env.DB_HOST }));

app.use(async (req, res, next) => {
  if (req.path === '/api/health') return next();
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

// Auth
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = Schemas.login.parse(req.body);
    const [users]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ error: 'Auth Failed' });
    const user = users[0];
    if (!await Security.verify(password, user.password_hash)) return res.status(401).json({ error: 'Auth Failed' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, fullName: user.full_name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/register', async (req, res) => {
  try {
    const { fullName, email, password } = Schemas.register.parse(req.body);
    const [existing]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ error: 'Email registered' });
    const [total]: any = await pool.query('SELECT COUNT(*) as count FROM users');
    const role = total[0].count === 0 ? 'admin' : 'user';
    const [r]: any = await pool.query('INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)', [fullName, email, await Security.hash(password), role]);
    const token = jwt.sign({ id: r.insertId, email, role, fullName }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: r.insertId, email, fullName, role } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/me', Gatekeeper.authenticate, async (req: any, res) => {
  const [users]: any = await pool.query('SELECT id, email, full_name as fullName, role FROM users WHERE id = ?', [req.user.id]);
  res.json(users[0]);
});

// Products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
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

// Others
app.get('/api/categories', async (req, res) => { res.json((await pool.query('SELECT * FROM categories'))[0]); });
app.get('/api/menus', async (req, res) => { res.json((await pool.query('SELECT * FROM menu_items ORDER BY position ASC'))[0]); });
app.get('/api/announcements', async (req, res) => { res.json((await pool.query('SELECT * FROM announcements WHERE is_active = 1 ORDER BY position ASC'))[0]); });
app.get('/api/social-links', async (req, res) => { res.json((await pool.query('SELECT * FROM social_links WHERE is_active = 1 ORDER BY position ASC'))[0]); });
app.get('/api/cms/:slug', async (req, res) => { const [rows]: any = await pool.query('SELECT * FROM cms_pages WHERE slug = ?', [req.params.slug]); res.json(rows[0] || { title: 'Missing', content: '' }); });

export default app;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 http://localhost:${PORT}`));
}
