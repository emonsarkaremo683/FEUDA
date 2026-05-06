
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306')
};

async function seed() {
  const connection = await mysql.createConnection(dbConfig);
  console.log('Connected to database for seeding...');

  try {
    // 1. Clear existing data (Careful! This is for mock completion)
    // For safety, we only delete if requested, but here we want "mock completion"
    // Let's TRUNCATE tables to start fresh
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = ['products', 'categories', 'menu_items', 'announcements', 'social_links', 'devices', 'cms_pages'];
    for (const table of tables) {
      await connection.query(`TRUNCATE TABLE ${table}`);
      console.log(`Truncated ${table}`);
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Insert Categories
    const categories = [
      ['Clear Cases', 'clear-cases', 'Crystal clear protection that never yellows.', 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=800'],
      ['MagSafe Series', 'magsafe', 'Seamless magnetic integration for your accessories.', 'https://images.unsplash.com/photo-1605464315542-bda3e2f4e605?q=80&w=800'],
      ['Power & Cables', 'chargers', 'High-speed GaN charging solutions.', 'https://images.unsplash.com/photo-1625517407001-a0016028704b?q=80&w=800'],
      ['Screen Protectors', 'screen-protectors', '9H hardness sapphire glass protection.', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?q=80&w=800'],
      ['Lens Protection', 'lens-guards', 'Individual lens protection with aerospace aluminum.', 'https://images.unsplash.com/photo-1592750475338-74b7b2191392?q=80&w=800']
    ];
    await connection.query('INSERT INTO categories (name, slug, description, image_url) VALUES ?', [categories]);
    console.log('Inserted Categories');

    // 3. Insert Devices
    const devices = [['iPhone 17 Pro Max'], ['iPhone 17 Pro'], ['iPhone 17'], ['iPhone 16 Series'], ['All Models']];
    await connection.query('INSERT INTO devices (name) VALUES ?', [devices]);
    console.log('Inserted Devices');

    // 4. Insert Products
    const productData = [
      ['Nexus Crystal Clear', 'Clear Cases', 29.99, 150, 'The ultimate non-yellowing clear case.', 'iPhone 17 Pro', 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=800', 1, JSON.stringify(['Crystal', 'Space Gray', 'Alpine Blue'])],
      ['Obsidian MagSafe Elite', 'MagSafe Series', 39.99, 100, 'Premium matte finish with N52 magnets.', 'iPhone 17 Pro Max', 'https://images.unsplash.com/photo-1605464315542-bda3e2f4e605?q=80&w=800', 1, JSON.stringify(['Matte Black', 'Deep Purple'])],
      ['Titan Sapphire Glass', 'Screen Protectors', 24.99, 300, 'Scratch-resistant sapphire coating.', 'All Models', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?q=80&w=800', 0, JSON.stringify(['Clear'])],
      ['GaN 100W Turbo', 'Power & Cables', 59.99, 80, 'Multi-port charging for all your devices.', 'All Models', 'https://images.unsplash.com/photo-1625517407001-a0016028704b?q=80&w=800', 1, JSON.stringify(['White', 'Black'])],
      ['Aero Lens Shield', 'Lens Protection', 19.99, 200, 'Individual rings for maximum lens safety.', 'iPhone 17 Pro', 'https://images.unsplash.com/photo-1592750475338-74b7b2191392?q=80&w=800', 0, JSON.stringify(['Graphite', 'Silver', 'Gold'])],
      ['Carbon Fiber X', 'MagSafe Series', 49.99, 50, 'Real aerospace-grade carbon fiber.', 'iPhone 17 Pro Max', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800', 1, JSON.stringify(['Carbon Black'])],
      ['Aura Glow Case', 'Clear Cases', 34.99, 120, 'Iridescent finish that changes with light.', 'iPhone 17', 'https://images.unsplash.com/photo-1512499617640-c74ae3a49dd5?q=80&w=800', 0, JSON.stringify(['Aurora'])],
      ['Armor Guard Pro', 'Clear Cases', 44.99, 60, '12ft drop protection in a slim profile.', 'iPhone 16 Series', 'https://images.unsplash.com/photo-1581333100576-b73bbe793a53?q=80&w=800', 0, JSON.stringify(['Tactical Gray', 'Navy'])]
    ];
    await connection.query('INSERT INTO products (name, category, price, stock, description, model_compatibility, image_url, is_best_seller, colors) VALUES ?', [productData]);
    console.log('Inserted Products');

    // 5. Insert Menu Items
    const menuItems = [
      ['Shop All', '/category/all', null, 1, 1, 'header', 'Default'],
      ['MagSafe', '/category/magsafe', null, 2, 1, 'header', 'mega'],
      ['Cases', null, null, 3, 1, 'header', 'grid'],
      ['Accessories', null, null, 4, 1, 'header', 'Default'],
      ['Support', '/cms/faq', null, 1, 1, 'footer', 'Support'],
      ['Shipping', '/cms/shipping-policy', null, 2, 1, 'footer', 'Support'],
      ['Privacy', '/cms/privacy-policy', null, 3, 1, 'footer', 'Legal'],
      ['Terms', '/cms/terms-service', null, 4, 1, 'footer', 'Legal']
    ];
    await connection.query('INSERT INTO menu_items (label, url, parent_id, position, is_active, location, layout_style) VALUES ?', [menuItems]);
    console.log('Inserted Menu Items');

    // 6. Insert Announcements
    const announcements = [
      ['FREE INTERNATIONAL SHIPPING ON ALL ORDERS OVER $100', null, 1, 1],
      ['LIMITED EDITION CARBON FIBER SERIES IS NOW LIVE', '/category/magsafe', 2, 1],
      ['USE CODE FAUDA10 FOR 10% OFF YOUR FIRST PURCHASE', null, 3, 1]
    ];
    await connection.query('INSERT INTO announcements (message, url, position, is_active) VALUES ?', [announcements]);
    console.log('Inserted Announcements');

    // 7. Insert Social Links
    const socials = [
      ['Instagram', 'https://instagram.com/feuda', 'instagram', 1, 1],
      ['X (Twitter)', 'https://twitter.com/feuda', 'twitter', 2, 1],
      ['Facebook', 'https://facebook.com/feuda', 'facebook', 3, 1]
    ];
    await connection.query('INSERT INTO social_links (platform, url, icon, position, is_active) VALUES ?', [socials]);
    console.log('Inserted Social Links');

    // 8. CMS Pages & Layout
    const homepageLayout = [
      { id: 'Hero', label: 'Main Showcase', type: 'component', visible: true, order: 1, data: { slides: [
        { id: 1, badge: 'New Era', title: 'Obsidian Series', subtitle: 'Indestructible.', desc: 'Forged from aerospace-grade materials. The pinnacle of protection.', image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=1200' },
        { id: 2, badge: 'Collection', title: 'Clear Evolution', subtitle: 'Non-Yellowing.', desc: 'Crystal clear engineering that stays transparent forever.', image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1200' }
      ] } },
      { id: 'Categories', label: 'Shop By Category', type: 'component', visible: true, order: 2, data: {} },
      { id: 'TabbedProductShowcase', label: 'Trending Now', type: 'component', visible: true, order: 3, data: {} },
      { id: 'flash_sale_1', label: 'Midnight Deal', type: 'flash_sale', visible: true, order: 4, data: { promoText: 'Midnight Special', endDate: '2026-12-31T23:59:59', category: 'MagSafe Series' } },
      { id: 'StorySection', label: 'Our Story', type: 'component', visible: true, order: 5, data: { sectionTitle: 'Engineering the <span class="text-primary">Impossible</span>', stories: [
        { id: 1, title: 'Impact Testing', video: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-close-up-1551-large.mp4' },
        { id: 2, title: 'Material Science', video: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-keyboard-904-large.mp4' }
      ] } },
      { id: 'TrustSection', label: 'Trust Badges', type: 'component', visible: true, order: 6, data: {} },
      { id: 'newsletter_1', label: 'Newsletter', type: 'newsletter', visible: true, order: 7, data: {} }
    ];

    const themeSettings = {
      primary: '#3b82f6',
      accent: '#9333ea',
      background: '#050a14',
      text: '#ffffff',
      card: '#0f172a',
      border: '#1e293b'
    };

    await connection.query('INSERT INTO cms_pages (slug, title, content) VALUES ?', [[
      ['homepage-layout', 'Homepage Layout', JSON.stringify(homepageLayout)],
      ['theme-settings', 'Theme Customization', JSON.stringify(themeSettings)],
      ['contact', 'Contact', '<h1>Contact Us</h1>'],
      ['faq', 'FAQ', '<h1>FAQ</h1>'],
      ['shipping-policy', 'Shipping Policy', '<h1>Shipping Policy</h1>']
    ]]);
    console.log('Inserted CMS Pages');

    console.log('🚀 DATABASE FULLY POPULATED WITH MOCK DATA');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await connection.end();
  }
}

seed();
