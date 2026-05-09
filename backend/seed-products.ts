import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306'),
};

async function seed() {
  const connection = await mysql.createConnection(dbConfig);
  console.log('Connected to DB for seeding...');

  const products = [
    {
      name: 'iPhone 15 Pro Obsidian Case',
      category: 'Clear Cases',
      price: 2500,
      stock: 50,
      description: 'Ultra-durable obsidian series clear case with MagSafe support.',
      model_compatibility: 'iPhone 15 Pro',
      image_url: 'https://images.unsplash.com/photo-1695653422715-991ec3a0db7a?q=80&w=800&auto=format&fit=crop',
      is_best_seller: 1,
      colors: JSON.stringify([{ name: 'Graphite', hex: '#1c1c1c', images: [] }]),
      specifications: JSON.stringify(['MagSafe Compatible', 'Military Grade Drop Protection'])
    },
    {
      name: 'MagSafe Leather Wallet',
      category: 'MagSafe',
      price: 1800,
      stock: 30,
      description: 'Premium vegan leather wallet with strong magnetic attachment.',
      model_compatibility: 'All MagSafe iPhones',
      image_url: 'https://images.unsplash.com/photo-1623126908029-58cb08a2b272?q=80&w=800&auto=format&fit=crop',
      is_best_seller: 0,
      colors: JSON.stringify([{ name: 'Midnight', hex: '#191970', images: [] }]),
      specifications: JSON.stringify(['Holds 3 cards', 'RFID Shielding'])
    },
    {
        name: 'Screen Protector Pro',
        category: 'Screen Protectors',
        price: 800,
        stock: 100,
        description: '9H hardness tempered glass for ultimate screen protection.',
        model_compatibility: 'iPhone 15 Series',
        image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop',
        is_best_seller: 1,
        colors: JSON.stringify([{ name: 'Clear', hex: '#ffffff', images: [] }]),
        specifications: JSON.stringify(['Anti-fingerprint', 'Shatter-proof'])
    }
  ];

  for (const p of products) {
    await connection.query(
      'INSERT IGNORE INTO products (name, category, price, stock, description, model_compatibility, image_url, is_best_seller, colors, specifications) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [p.name, p.category, p.price, p.stock, p.description, p.model_compatibility, p.image_url, p.is_best_seller, p.colors, p.specifications]
    );
  }

  const [categories]: any = await connection.query('SELECT COUNT(*) as count FROM categories');
  if (categories[0].count === 0) {
    const cats = [
        ['Clear Cases', 'clear-cases'],
        ['MagSafe', 'magsafe'],
        ['Screen Protectors', 'screen-protectors']
    ];
    await connection.query('INSERT IGNORE INTO categories (name, slug) VALUES ?', [cats]);
  }

  console.log('Seeding completed successfully!');
  await connection.end();
}

seed().catch(console.error);
