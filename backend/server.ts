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
import admin from 'firebase-admin'; // Firebase Admin SDK

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

// Initialize Firebase Admin SDK
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n').replace(/\n/g, '\n');
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (e) {
    console.error("Failed to initialize Firebase Admin:", e);
  }
} else {
  console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not found. Firebase Admin SDK not initialized.");
}

// Security & Utils
const Security = {
  // Bcrypt is no longer directly used for Firebase users, but might be for legacy or admin-created users
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
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), 'public', 'uploads')),
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
      CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, firebase_uid VARCHAR(128) UNIQUE, full_name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255), role ENUM('admin', 'user') DEFAULT 'user', email_verified BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
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

// NEW: Firebase Authentication Endpoint
app.post('/api/firebase-auth', async (req, res) => {
  if (!admin.apps.length) {
    return res.status(500).json({ error: "Firebase Admin SDK not initialized." });
  }
  const idToken = req.headers.authorization?.split(' ')[1];
  const { uid, email, fullName, emailVerified } = req.body; // Data from frontend for initial user creation/update

  if (!idToken) {
    return res.status(401).json({ error: 'No Firebase ID token provided.' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (decodedToken.uid !== uid) {
        return res.status(403).json({ error: "Firebase UID mismatch." });
    }

    let userRole = 'user';
    let userId = null;

    // Check if user already exists in MySQL
    const [existingUsers]: any = await pool.query('SELECT id, role FROM users WHERE firebase_uid = ? OR email = ?', [uid, email]);
    let dbUser;

    if (existingUsers.length > 0) {
      dbUser = existingUsers[0];
      userRole = dbUser.role; // Maintain existing role
      userId = dbUser.id;
      // Update existing user details if necessary (e.g., emailVerified status, full_name)
      await pool.query('UPDATE users SET full_name = ?, email = ?, email_verified = ? WHERE id = ?', [fullName || decodedToken.name, email || decodedToken.email, emailVerified || decodedToken.email_verified, userId]);
    } else {
      // New user: Create in MySQL
      const [totalUsers]: any = await pool.query('SELECT COUNT(*) as count FROM users');
      const role = totalUsers[0].count === 0 ? 'admin' : 'user'; // First user is admin

      const [result]: any = await pool.query('INSERT INTO users (firebase_uid, full_name, email, role, email_verified) VALUES (?, ?, ?, ?, ?)', [uid, fullName || decodedToken.name, email || decodedToken.email, role, emailVerified || decodedToken.email_verified]);
      userId = result.insertId;
      userRole = role;
    }

    // Mint custom JWT for your backend
    const customToken = jwt.sign(
      { id: userId, email: email || decodedToken.email, role: userRole, fullName: fullName || decodedToken.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token: customToken,
      user: {
        id: userId.toString(),
        uid: uid,
        email: email || decodedToken.email,
        fullName: fullName || decodedToken.name || '',
        role: userRole,
        emailVerified: emailVerified || decodedToken.email_verified,
      }
    });

  } catch (err: any) {
    console.error('Firebase ID token verification failed:', err);
    res.status(403).json({ error: 'Invalid Firebase ID token.' });
  }
});

// DEPRECATED: Old Authentication Endpoints - replaced by Firebase flow
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [users]: any = await pool.query('SELECT id, email, password, full_name, role, firebase_uid, email_verified FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, fullName: user.full_name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id.toString(),
        uid: user.firebase_uid,
        email: user.email,
        fullName: user.full_name || '',
        role: user.role,
        emailVerified: user.email_verified,
      },
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/register', (req, res) => {
  res.status(501).json({ error: "Registration via /api/register is deprecated. Please use Firebase authentication." });
});

app.get('/api/me', Gatekeeper.auth, async (req: any, res) => {
  const [users]: any = await pool.query('SELECT id, firebase_uid as uid, email, full_name as fullName, role, email_verified as emailVerified FROM users WHERE id = ?', [req.user.id]);
  res.json(users[0]);
});

// --- UPLOAD ---
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  // Note: On Vercel, this file is ephemeral. Use Cloudinary for production.
  const path = `/uploads/${req.file.filename}`;
  res.json({ 
    url: path, 
    imageUrl: path,
    filename: req.file.filename 
  });
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
