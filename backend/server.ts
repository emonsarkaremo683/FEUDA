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

app.use(cors({ origin: [FRONTEND_URL, 'http://localhost:5173', 'https://feuda.vercel.app', 'https://feuda-frontend.vercel.app'], credentials: true }));
app.use(express.json());

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

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    db: dbInitialized ? 'connected' : 'connecting',
    env: { DB_HOST: process.env.DB_HOST || 'NOT SET' }
  });
});

app.use(async (req, res, next) => {
  if (req.path === '/api/health') return next();
  if (!dbInitialized) await initializeDatabase();
  if (dbError) return res.status(500).json({ error: "Database Link Error", details: dbError });
  next();
});

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/menus', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menu_items ORDER BY position ASC');
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/announcements', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM announcements WHERE is_active = 1 ORDER BY position ASC');
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/social-links', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM social_links WHERE is_active = 1 ORDER BY position ASC');
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default app;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 http://localhost:${PORT}`));
}
