const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

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
    const tables = ['products', 'categories', 'menu_items', 'announcements', 'social_links', 'cms_pages'];
    for (const table of tables) {
      await connection.query(`TRUNCATE TABLE ${table}`);
      console.log(`Truncated ${table}`);
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Insert Categories
    const categories = [
      ['Clear Cases', 'clear-cases', 'Crystal clear protection that never yellows.', 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=800'],
      ['MagSafe', 'magsafe', 'Seamless magnetic integration for your accessories.', 'https://images.unsplash.com/photo-1605464315542-bda3e2f4e605?q=80&w=800'],
      ['Chargers', 'chargers', 'High-speed GaN charging solutions.', 'https://images.unsplash.com/photo-1625517407001-a0016028704b?q=80&w=800'],
      ['Screen Protectors', 'screen-protectors', '9H hardness sapphire glass protection.', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?q=80&w=800'],
      ['Lens Guards', 'lens-guards', 'Individual lens protection with aerospace aluminum.', 'https://images.unsplash.com/photo-1592750475338-74b7b2191392?q=80&w=800']
    ];
    await connection.query('INSERT INTO categories (name, slug, description, image_url) VALUES ?', [categories]);
    console.log('Inserted Categories');

    // 3. Insert Devices (optional, as product compatibility is often free-text)
    // const devices = [['iPhone 17 Pro Max'], ['iPhone 17 Pro'], ['iPhone 17'], ['iPhone 16 Series'], ['All Models']];
    // await connection.query('INSERT INTO devices (name) VALUES ?', [devices]);
    // console.log('Inserted Devices');

    // 4. Insert Products (matching frontend/src/data/products.ts)
    const productData = [
      [
        'Titanium Hybrid Clear Case', 
        'Clear Cases', 
        29.99, 
        45, 
        `Experience the perfect blend of protection and aesthetics. Our Titanium Hybrid Clear Case features a shock-absorbent TPU bumper and a crystal-clear polycarbonate back that won't yellow over time.`,
        'iPhone 15 Pro, iPhone 15 Pro Max', 
        'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800', 
        1, 
        JSON.stringify([
          { name: 'Crystal Clear', hex: '#FFFFFF', images: ['https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800'] }, 
          { name: 'Graphite', hex: '#4B4B4B', images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&q=80&w=800'] }]), 
        JSON.stringify([
          'MIL-STD 810G Certified', 
          'Raised 1.5mm Screen Lip', 
          'Precision Cutouts', 
          'Anti-Yellowing Coating'])
      ],
      [
        'MagSafe Carbon Fiber Elite', 
        'MagSafe', 
        49.99, 
        12, 
        'Ultra-slim, ultra-strong. Crafted from real aerospace-grade aramid fiber, this case provides superior protection without the weight. Fully compatible with all MagSafe accessories.', 
        'iPhone 14/15 Series', 
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=800', 
        1, 
        JSON.stringify([
          { name: 'Matte Black', hex: '#1A1A1A', images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=800'] }]), 
        JSON.stringify([
          'Aramid Fiber Construction', 
          'N52 Strong Magnets', 
          '0.6mm Ultra-Thin', 
          'Scratch Resistant'])
      ],
      [
        'Privacy Tempered Glass Pro', 
        'Screen Protectors', 
        19.99, 
        150, 
        'Keep your business your own. Our 28-degree privacy filter ensures your screen is only visible to you. Made from 9H hardness tempered glass for maximum durability.', 
        'Universal iPhone Sizes', 
        'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=800', 
        0, 
        JSON.stringify([
          { name: 'Clear', hex: '#FFFFFF', images: ['https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=800'] }]), 
        JSON.stringify([
          '9H Hardness', 
          '2.5D Rounded Edges', 
          'Oleophobic Coating', 
          'Bubble-Free Installation'])
      ],
      [
        '30W GaN Nano Charger', 
        'Chargers', 
        24.99, 
        85, 
        'Small size, massive power. Utilizing Gallium Nitride (GaN) technology, this charger is 50% smaller than standard bricks while providing full 30W fast charging.', 
        'USB-C Devices', 
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800', 
        0, 
        JSON.stringify([
          { name: 'Arctic White', hex: '#F5F5F5', images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800'] }, 
          { name: 'Midnight', hex: '#000000', images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800'] }]), 
        JSON.stringify([
          '30W PD Fast Charge', 
          'GaN Technology', 
          'Overheat Protection', 
          'Ultra-Compact Design'])
      ],
      [
        'Sapphire Lens Protector', 
        'Lens Guards', 
        14.99, 
        200, 
        'Protect your cameras without compromising photo quality. Individual sapphire-coated glass rings for each lens.', 
        'iPhone 15 Pro / Max', 
        'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800', 
        0, 
        JSON.stringify([
          { name: 'Clear', hex: '#FFFFFF', images: ['https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800'] }]), 
        JSON.stringify([
          'Sapphire Coating', 
          'AR Anti-Reflection', 
          'Aluminum Alloy Frame', 
          'Zero Image Distortion'])
      ],
      [
        'Liquid Silicone Soft Touch', 
        'Clear Cases', 
        24.99, 
        60, 
        'Premium liquid silicone case with a soft microfiber lining. Incredible hand feel with military-grade drop protection.', 
        'iPhone 13/14/15 Series', 
        'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800', 
        0, 
        JSON.stringify([
          { name: 'Sand Pink', hex: '#F4D7D7', images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800'] }, 
          { name: 'Navy Blue', hex: '#1B2E3C', images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=800'] }, 
          { name: 'Pine Green', hex: '#2D3E2F', images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&q=80&w=800'] }]), 
        JSON.stringify([
          'Soft-Touch Silicone', 
          'Microfiber Lining', 
          'Full Coverage', 
          'Easy to Clean'])
      ],
      [
        'MagSafe Leather Wallet', 
        'MagSafe', 
        34.99, 
        40, 
        'Keep your essential cards close. Crafted from premium vegan leather with built-in magnets that snap perfectly to your iPhone.', 
        'MagSafe Compatible iPhones', 
        'https://images.unsplash.com/photo-1622461066258-2086381e967a?auto=format&fit=crop&q=80&w=800', 
        0, 
        JSON.stringify([
          { name: 'Black', hex: '#000000', images: ['https://images.unsplash.com/photo-1622461066258-2086381e967a?auto=format&fit=crop&q=80&w=800'] }]), 
        JSON.stringify([
          'Holds up to 3 cards', 
          'Shielded Magnets', 
          'Premium Vegan Leather', 
          'Slim Profile'])
      ],
      [
        'USB-C to Lightning Braided Cable', 
        'Chargers', 
        18.99, 
        300, 
        'Built to last. This 2-meter braided cable is MFi certified and tested to withstand over 15,000 bends.', 
        'Lightning Devices', 
        'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&q=80&w=800', 
        0, 
        JSON.stringify([
          { name: 'Black', hex: '#000000', images: ['https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&q=80&w=800'] }]), 
        JSON.stringify([
          '2 Meter Length', 
          'Nylon Braided', 
          'MFi Certified', 
          'Fast Charge Support'])
      ]
    ];
    await connection.query('INSERT INTO products (name, category, price, stock, description, model_compatibility, image_url, is_best_seller, colors, specifications) VALUES ?', [productData]);
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
        { id: 1, badge: 'New Collection', title: 'Discover Our Latest Cases', subtitle: 'Premium Protection.', desc: 'Sleek designs, ultimate durability. Find your perfect fit.', image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=1200' },
        { id: 2, badge: 'Best Sellers', title: 'MagSafe Essentials', subtitle: 'Effortless Power.', desc: 'Charge wirelessly, attach accessories seamlessly. Simplify your life.', image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1200' }
      ] } },
      { id: 'Categories', label: 'Shop By Category', type: 'component', visible: true, order: 2, data: {} },
      { id: 'TabbedProductShowcase', label: 'Trending Now', type: 'component', visible: true, order: 3, data: {} },
      { id: 'flash_sale_1', label: 'Daily Deal', type: 'flash_sale', visible: true, order: 4, data: { promoText: 'Limited Time Offer!', endDate: '2026-12-31T23:59:59', category: 'MagSafe' } },
      { id: 'StorySection', label: 'Our Story', type: 'component', visible: true, order: 5, data: { sectionTitle: 'Crafting Excellence for <span class="text-primary">You</span>', stories: [
        { id: 1, title: 'Quality Materials', video: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-close-up-1551-large.mp4' },
        { id: 2, title: 'Innovation & Design', video: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-keyboard-904-large.mp4' }
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
