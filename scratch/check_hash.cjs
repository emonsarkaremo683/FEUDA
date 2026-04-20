
const mysql = require('mysql2/promise');
async function check() {
  const c = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'jeestore'
  });
  const [rows] = await c.query('SELECT password_hash FROM users WHERE email = "admin@feuda.com"');
  console.log(rows[0].password_hash);
  await c.end();
}
check();
