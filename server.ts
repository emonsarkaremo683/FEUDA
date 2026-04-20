import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import multer from "multer";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** 
 * NEXUS OBSIDIAN CORE v3.1 (Obsidian Edition)
 * High-performance ERP/E-commerce Engine
 */

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const JWT_SECRET = process.env.JWT_SECRET || 'obsidian_core_secret_primary';

  const Security = {
    hash: (password: string, salt = crypto.randomBytes(16).toString('hex')) => {
      const hash = crypto.createHash('sha512').update(password + salt).digest('hex');
      return `${salt}:${hash}`;
    },
    verify: (password: string, stored: string) => {
      const [salt, hash] = stored.split(':');
      if (!salt || !hash) return false;
      return crypto.createHash('sha512').update(password + salt).digest('hex') === hash;
    }
  };

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  });
  const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

  app.use(cors());
  app.use(express.json());
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'jeestore',
    port: parseInt(process.env.DB_PORT || '3306'),
    multipleStatements: true
  };

  let pool: any;
  try {
    const tempConn = await mysql.createConnection({ ...dbConfig, database: undefined });
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await tempConn.end();
    pool = mysql.createPool(dbConfig);
    console.log(`✅ [Obsidian Node] Nexus Core Linked to Database: ${dbConfig.database}`);
  } catch (err) {
    console.error(`❌ [Critical Fault] Database Link Severed: ${err.message}`);
    process.exit(1);
  }

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

    CREATE TABLE IF NOT EXISTS footer_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        label VARCHAR(255) NOT NULL,
        url VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        position INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(schemaFile);
    const [admins] = await pool.query('SELECT * FROM users WHERE role = "admin"');
    if (admins.length === 0) {
      await pool.query('INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Root Admin', 'admin@feuda.com', Security.hash('admin123'), 'admin']);
    }
  } catch (err) { console.warn(`⚠️ [Obsidian Warning] Schema error: ${err.message}`); }

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
    if (users.length === 0) return res.status(404).json({ error: 'User missing' });
    res.json(users[0]);
  });

  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const [users]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0 || !Security.verify(password, users[0].password_hash))
      return res.status(401).json({ error: 'Auth Failed' });
    const user = users[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, fullName: user.full_name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role } });
  });

  app.post('/api/register', async (req, res) => {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ error: 'All fields required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    try {
      const [existing]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) return res.status(409).json({ error: 'Email already registered' });
      const [r]: any = await pool.query(
        'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [fullName, email, Security.hash(password), 'user']
      );
      const token = jwt.sign({ id: r.insertId, email, role: 'user', fullName }, JWT_SECRET, { expiresIn: '24h' });
      res.status(201).json({ token, user: { id: r.insertId, email, fullName, role: 'user' } });
    } catch (err: any) {
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

  // --- PRODUCTS ---
  app.get('/api/products', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(rows);
  });
  app.post('/api/products', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    const p = req.body;
    const [r]: any = await pool.query('INSERT INTO products (name,category,price,stock,description,model_compatibility,image_url,colors,specifications) VALUES (?,?,?,?,?,?,?,?,?)',
      [p.name, p.category, p.price, p.stock, p.description, p.modelCompatibility, p.imageUrl, JSON.stringify(p.colors), JSON.stringify(p.specifications)]);
    res.json({ id: r.insertId });
  });
  app.put('/api/products/:id', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    const p = req.body;
    await pool.query(
      'UPDATE products SET name=?, category=?, price=?, stock=?, description=?, model_compatibility=?, image_url=?, colors=?, specifications=?, is_best_seller=? WHERE id=?',
      [p.name, p.category, p.price, p.stock, p.description, p.modelCompatibility, p.imageUrl,
       JSON.stringify(p.colors || []), JSON.stringify(p.specifications || []), p.isBestSeller || false, req.params.id]
    );
    res.json({ message: 'Product Updated' });
  });
  app.delete('/api/products/:id', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product Deleted' });
  });

  // --- ORDERS ---
  app.get('/api/orders', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows);
  });
  app.post('/api/orders', async (req: any, res) => {
    const o = req.body;
    // Support both flat fields and nested shipping object
    const shipping = o.shipping || {};
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const orderId = o.orderId || `ORD-${Date.now()}`;
      const userId = req.user?.id || null;
      await conn.query(
        'INSERT INTO orders (id, user_id, full_name, email, phone, address, city, area, postal_code, payment_method, subtotal, shipping_fee, tax, total, source) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [
          orderId, userId,
          o.fullName || shipping.fullName,
          o.email    || shipping.email,
          o.phone    || shipping.phone,
          o.address  || shipping.address,
          o.city     || shipping.city,
          o.area     || shipping.area,
          o.postalCode || shipping.postalCode,
          o.paymentMethod,
          o.subtotal, o.shippingFee, o.tax, o.total,
          o.source || 'Online'
        ]
      );
      if (o.items && o.items.length > 0) {
        const items = o.items.map((i: any) => [orderId, i.id, i.name, i.quantity, i.price, i.selectedColor || null]);
        await conn.query('INSERT INTO order_items (order_id, product_id, product_name, quantity, price, selected_color) VALUES ?', [items]);
        
        // Decrement stock and log inventory for each item
        for (const item of o.items) {
          await conn.query('UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?', [item.quantity, item.id]);
          await conn.query('INSERT INTO inventory_logs (product_id, type, quantity, reason) VALUES (?, ?, ?, ?)', 
            [item.id, 'OUT', item.quantity, `Order ${orderId} (${o.source || 'Online'})`]);
        }
      }
      await conn.commit();
      res.json({ orderId });
    } catch (err: any) {
      await conn.rollback();
      res.status(500).json({ error: err.message });
    } finally {
      conn.release();
    }
  });

  // GET user's own orders (non-admin)
  app.get('/api/orders/mine', Gatekeeper.authenticate, async (req: any, res) => {
    const [rows] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  });

  // GET single order with items (for order detail page)
  app.get('/api/orders/:id', Gatekeeper.authenticate, async (req: any, res) => {
    const [orders]: any = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = orders[0];
    // Only allow admin or the order owner
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
    res.json({ ...order, items });
  });

  // PUT update order status
  app.put('/api/orders/:id/status', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status Updated' });
  });

  // --- ANALYTICS ---
  app.get('/api/analytics/stats', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    try {
      const [rev]: any = await pool.query('SELECT SUM(total) as revenue FROM orders WHERE status != "Cancelled"');
      const [ords]: any = await pool.query('SELECT COUNT(*) as count FROM orders');
      const [prods]: any = await pool.query('SELECT COUNT(*) as count FROM products');
      const [users]: any = await pool.query('SELECT COUNT(*) as count FROM users');
      const [recent]: any = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5');
      
      const [bySource]: any = await pool.query('SELECT source, SUM(total) as value FROM orders GROUP BY source');
      const [byCategory]: any = await pool.query('SELECT category, COUNT(*) as count FROM products GROUP BY category');

      res.json({ 
        revenue: rev[0].revenue || 0, 
        orders: ords[0].count, 
        products: prods[0].count, 
        users: users[0].count, 
        recentOrders: recent,
        segments: { bySource, byCategory }
      });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // --- CATEGORIES & CMS & MENUS ---
  app.get('/api/categories', async (req, res) => { res.json((await pool.query('SELECT * FROM categories'))[0]); });
  app.post('/api/categories', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    const { name, slug, description, imageUrl } = req.body;
    const [r]: any = await pool.query('INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)', [name, slug, description, imageUrl]);
    res.json({ id: r.insertId });
  });
  app.put('/api/categories/:id', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    const { name, slug, description, imageUrl } = req.body;
    await pool.query('UPDATE categories SET name=?, slug=?, description=?, image_url=? WHERE id=?',
      [name, slug, description, imageUrl, req.params.id]);
    res.json({ message: 'Category Updated' });
  });
  app.delete('/api/categories/:id', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category Cleared' });
  });

  app.get('/api/cms', async (req, res) => { res.json((await pool.query('SELECT * FROM cms_pages'))[0]); });
  app.post('/api/cms/homepage-layout', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    const { layout } = req.body;
    await pool.query('INSERT INTO cms_pages (slug, title, content) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE content = ?', 
      ['homepage-layout', 'Homepage Layout Configuration', JSON.stringify(layout), JSON.stringify(layout)]);
    res.json({ message: 'Orchestration Updated' });
  });
  app.get('/api/cms/:slug', async (req, res) => {
    const [rows]: any = await pool.query('SELECT * FROM cms_pages WHERE slug = ?', [req.params.slug]);
    res.json(rows[0] || { title: 'Page Missing', content: '<p>Under Construction</p>' });
  });
  app.put('/api/cms/:id', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    const { title, content, slug } = req.body;
    await pool.query('UPDATE cms_pages SET title=?, content=?, slug=? WHERE id=?', [title, content, slug, req.params.id]);
    res.json({ message: 'Content Updated' });
  });

  app.get('/api/menus', async (req, res) => { res.json((await pool.query('SELECT * FROM menu_items ORDER BY position ASC'))[0]); });
  app.post('/api/menus', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    const { label, url, parent_id, position, location, layout_style } = req.body;
    await pool.query('INSERT INTO menu_items (label, url, parent_id, position, location, layout_style) VALUES (?, ?, ?, ?, ?, ?)', [label, url, parent_id || null, position || 0, location || 'header', layout_style || 'Default']);
    res.json({ message: 'Menu Item Synced' });
  });
  app.delete('/api/menus/:id', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    await pool.query('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Menu Item Purged' });
  });

  // --- ERP LOGS ---
  app.get('/api/inventory/logs', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    res.json((await pool.query('SELECT l.*, p.name as product_name FROM inventory_logs l JOIN products p ON l.product_id = p.id ORDER BY l.created_at DESC'))[0]);
  });
  app.post('/api/inventory/logs', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    const { productId, type, quantity, reason } = req.body;
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query('INSERT INTO inventory_logs (product_id, type, quantity, reason) VALUES (?,?,?,?)', [productId, type, quantity, reason]);
      await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [type === 'IN' ? quantity : -quantity, productId]);
      await conn.commit(); res.json({ message: 'Logged' });
    } catch (err) { await conn.rollback(); res.status(500).json({ error: err.message }); } finally { conn.release(); }
  });

  app.get('/api/orders/:id/tracking', async (req, res) => { res.json((await pool.query('SELECT * FROM order_tracking WHERE order_id = ? ORDER BY created_at DESC', [req.params.id]))[0]); });
  app.post('/api/orders/:id/tracking', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    const { status, location, notes } = req.body;
    await pool.query('INSERT INTO order_tracking (order_id, status, location, notes) VALUES (?,?,?,?)', [req.params.id, status, location, notes]);
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Tracked' });
  });

  app.post('/api/upload', Gatekeeper.authenticate, Gatekeeper.adminOnly, upload.single('image'), (req, res) => {
    res.json({ imageUrl: `/uploads/${req.file?.filename}` });
  });

  // --- PAYMENTS & HARDWARE ---
  app.get('/api/payments', async (req, res) => { res.json((await pool.query('SELECT * FROM payments'))[0]); });
  app.post('/api/payments', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    const { name, type, account_number, instructions, is_active } = req.body;
    await pool.query('INSERT INTO payments (name, type, account_number, instructions, is_active) VALUES (?, ?, ?, ?, ?)', 
      [name, type, account_number, instructions, is_active || 1]);
    res.json({ message: 'Payment Method Logged' });
  });

  app.put('/api/payments/:id', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    const { name, type, account_number, instructions, is_active } = req.body;
    await pool.query(
      'UPDATE payments SET name=?, type=?, account_number=?, instructions=?, is_active=? WHERE id=?',
      [name, type, account_number, instructions, is_active, req.params.id]
    );
    res.json({ message: 'Payment Method Updated' });
  });
  app.delete('/api/payments/:id', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    await pool.query('DELETE FROM payments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Payment Method Deleted' });
  });

  // --- FOOTER LINKS ---
  app.get('/api/footer-links', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM footer_links ORDER BY category, position');
    res.json(rows);
  });
  app.post('/api/footer-links', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    const { label, url, category, position } = req.body;
    const [r]: any = await pool.query('INSERT INTO footer_links (label, url, category, position) VALUES (?, ?, ?, ?)', [label, url, category, position || 0]);
    res.json({ id: r.insertId });
  });
  app.put('/api/footer-links/:id', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    const { label, url, category, position } = req.body;
    await pool.query('UPDATE footer_links SET label=?, url=?, category=?, position=? WHERE id=?', [label, url, category, position, req.params.id]);
    res.json({ message: 'Footer Link Updated' });
  });
  app.delete('/api/footer-links/:id', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    await pool.query('DELETE FROM footer_links WHERE id = ?', [req.params.id]);
    res.json({ message: 'Footer Link Deleted' });
  });

  // PUT update menu item
  app.put('/api/menus/:id', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    const { label, url, parent_id, position, location, is_active } = req.body;
    await pool.query(
      'UPDATE menu_items SET label=?, url=?, parent_id=?, position=?, location=?, is_active=? WHERE id=?',
      [label, url, parent_id || null, position || 0, location || 'header', is_active ?? true, req.params.id]
    );
    res.json({ message: 'Menu Item Updated' });
  });

  // PUT update CMS page
  app.put('/api/cms/:slug', Gatekeeper.authenticate, Gatekeeper.adminOnly, async (req, res) => {
    const { title, content } = req.body;
    await pool.query(
      'INSERT INTO cms_pages (slug, title, content) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE title=?, content=?',
      [req.params.slug, title, content, title, content]
    );
    res.json({ message: 'Page Updated' });
  });

  // Update user profile (self)
  app.put('/api/me', Gatekeeper.authenticate, async (req: any, res) => {
    const { fullName, phone } = req.body;
    await pool.query('UPDATE users SET full_name=? WHERE id=?', [fullName, req.user.id]);
    res.json({ message: 'Profile Updated' });
  });

  // Change password
  app.put('/api/me/password', Gatekeeper.authenticate, async (req: any, res) => {
    const { currentPassword, newPassword } = req.body;
    const [users]: any = await pool.query('SELECT * FROM users WHERE id=?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    if (!Security.verify(currentPassword, users[0].password_hash))
      return res.status(401).json({ error: 'Current password is incorrect' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    await pool.query('UPDATE users SET password_hash=? WHERE id=?', [Security.hash(newPassword), req.user.id]);
    res.json({ message: 'Password Changed' });
  });

  app.get('/api/devices', async (req, res) => {
    const [rows]: any = await pool.query('SELECT DISTINCT model_compatibility FROM products WHERE model_compatibility IS NOT NULL');
    res.json(rows.map((r: any) => r.model_compatibility));
  });

  // --- VITE ---
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const dist = path.join(process.cwd(), 'dist');
    app.use(express.static(dist));
    app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 [Obsidican Core v3.1] Orbiting http://localhost:${PORT}`));
}

startServer();
