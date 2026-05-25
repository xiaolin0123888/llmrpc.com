const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const pool = new Pool({ host: '127.0.0.1', port: 5432, user: 'postgres', password: 'postgres123', database: 'llmcluster' });
async function main() {
  const hash = bcrypt.hashSync('Test1234', 10);
  console.log('Hash:', hash);
  const r = await pool.query('UPDATE users SET password= WHERE email=', [hash, 'test999@example.com']);
  console.log('test999 rows affected:', r.rowCount);
  const r2 = await pool.query('UPDATE users SET password= WHERE email=', [hash, 'newuser@example.com']);
  console.log('newuser rows affected:', r2.rowCount);
  await pool.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
