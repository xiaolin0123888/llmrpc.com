const bcrypt = require('./node_modules/bcryptjs')
const { Pool } = require('./node_modules/pg')
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres123@localhost:5432/llmcluster' })
;(async () => {
  // Fix admin password
  const hash = await bcrypt.hash('admin123', 12)
  try {
    await pool.query('UPDATE admin_users SET password = $1 WHERE email = $2', [hash, 'admin@llmrpc.com'])
    console.log('Admin password updated')
  } catch(e) { console.error('Update error:', e.message) }
  
  // Fix test user password
  const hash2 = await bcrypt.hash('Test1234', 12)
  try {
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hash2, 'login_test_1779724330760@test.com'])
    console.log('Test user password updated')
  } catch(e) { console.error('User update error:', e.message) }
  
  // Verify
  const r = await pool.query('SELECT email, password FROM admin_users WHERE email = $1', ['admin@llmrpc.com'])
  const valid = await bcrypt.compare('admin123', r.rows[0].password)
  console.log('Admin password verified:', valid)
  
  await pool.end()
})()