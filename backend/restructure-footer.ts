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

async function restructureFooter() {
  const connection = await mysql.createConnection(dbConfig);
  console.log('Connected to DB...');

  // 1. Clear existing footer items
  await connection.query('DELETE FROM menu_items WHERE location = "footer"');
  console.log('Cleared old footer items.');

  // 2. Define Footer Headers
  const headers = [
    { label: 'Shop', position: 1 },
    { label: 'Support', position: 2 },
    { label: 'Legal', position: 3 }
  ];

  for (const h of headers) {
    const [result]: any = await connection.query(
      'INSERT INTO menu_items (label, url, location, position, is_active) VALUES (?, ?, ?, ?, ?)',
      [h.label, null, 'footer', h.position, true]
    );
    const parentId = result.insertId;

    // 3. Add children based on header
    if (h.label === 'Shop') {
      const links = [
        ['All Products', '/category/all', 1],
        ['Clear Cases', '/category/clear-cases', 2],
        ['MagSafe', '/category/magsafe', 3],
        ['Screen Protectors', '/category/screen-protectors', 4]
      ];
      for (const l of links) {
        await connection.query(
          'INSERT INTO menu_items (label, url, location, position, parent_id, is_active) VALUES (?, ?, ?, ?, ?, ?)',
          [l[0], l[1], 'footer', l[2], parentId, true]
        );
      }
    } else if (h.label === 'Support') {
      const links = [
        ['Contact Us', '/cms/contact', 1],
        ['Shipping Policy', '/cms/shipping-policy', 2],
        ['Returns & Refunds', '/cms/returns-refunds', 3],
        ['FAQ', '/cms/faq', 4]
      ];
      for (const l of links) {
        await connection.query(
          'INSERT INTO menu_items (label, url, location, position, parent_id, is_active) VALUES (?, ?, ?, ?, ?, ?)',
          [l[0], l[1], 'footer', l[2], parentId, true]
        );
      }
    } else if (h.label === 'Legal') {
      const links = [
        ['Privacy Policy', '/cms/privacy-policy', 1],
        ['Terms of Service', '/cms/terms-service', 2],
        ['Cookie Policy', '/cms/cookie-policy', 3]
      ];
      for (const l of links) {
        await connection.query(
          'INSERT INTO menu_items (label, url, location, position, parent_id, is_active) VALUES (?, ?, ?, ?, ?, ?)',
          [l[0], l[1], 'footer', l[2], parentId, true]
        );
      }
    }
  }

  console.log('Footer restructured successfully!');
  await connection.end();
}

restructureFooter().catch(console.error);
