
CREATE DATABASE IF NOT EXISTS fauda_shop;

USE fauda_shop;

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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Seed initial categories if none exist
INSERT IGNORE INTO categories (name, slug) VALUES 
('Clear Cases', 'clear-cases'),
('MagSafe', 'magsafe'),
('Screen Protectors', 'screen-protectors'),
('Chargers', 'chargers'),
('Lens Guards', 'lens-guards');

-- Seed initial CMS pages if none exist
INSERT IGNORE INTO cms_pages (slug, title, content) VALUES
('contact', 'Contact Us', '<h1>Contact Us</h1><p>Default content for Contact Us.</p>'),
('shipping-policy', 'Shipping Policy', '<h1>Shipping Policy</h1><p>Default content for Shipping Policy.</p>'),
('returns-refunds', 'Returns & Refunds', '<h1>Returns & Refunds</h1><p>Default content for Returns & Refunds.</p>'),
('faq', 'FAQ', '<h1>FAQ</h1><p>Default content for FAQ.</p>'),
('privacy-policy', 'Privacy Policy', '<h1>Privacy Policy</h1><p>Default content for Privacy Policy.</p>'),
('terms-service', 'Terms of Service', '<h1>Terms of Service</h1><p>Default content for Terms of Service.</p>'),
('cookie-policy', 'Cookie Policy', '<h1>Cookie Policy</h1><p>Default content for Cookie Policy.</p>');

-- Seed initial menu items
INSERT IGNORE INTO menu_items (id, label, url, location, position, parent_id) VALUES
(1, 'Shop All', '/category/all', 'header', 1, NULL),
(2, 'Cases', NULL, 'header', 2, NULL),
(3, 'Clear Cases', '/category/clear-cases', 'header', 3, 2),
(4, 'MagSafe', '/category/magsafe', 'header', 4, 2),
(5, 'Screen Protectors', '/category/screen-protectors', 'header', 5, NULL),
(6, 'Accessories', NULL, 'header', 6, NULL),
(7, 'Chargers', '/category/chargers', 'header', 7, 6),
(8, 'Lens Guards', '/category/lens-guards', 'header', 8, 6),
(9, 'Contact', '/cms/contact', 'header', 9, NULL);
