
const mysql = require('mysql2/promise');
const crypto = require('crypto');

async function fix() {
  const salt = crypto.randomBytes(16).toString('hex');
  const password = 'admin123';
  const hash = crypto.createHash('sha512').update(password + salt).digest('hex');
  const fullHash = `${salt}:${hash}`;

  const c = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'jeestore'
  });
  
  await c.query('UPDATE users SET password_hash = ? WHERE email = "admin@feuda.com"', [fullHash]);
  console.log('✅ Admin password hash updated successfully.');
  await c.end();
}
fix().catch(console.error);
