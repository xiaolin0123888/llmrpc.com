const bcrypt = require('./node_modules/bcryptjs')
const { Pool } = require('./node_modules/pg')
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres123@localhost:5432/llmcluster' })
;(async () => {
  // Get a user with password
  const r = await pool.query('SELECT id, email, password FROM users WHERE password IS NOT NULL LIMIT 1')
  const u = r.rows[0]
  console.log('Test user:', u.email)
  // Try common passwords
  const pwds = ['password', 'password123', 'admin123', 'Test123456', 'test123456', '123456', 'password1']
  for (const pwd of pwds) {
    const v = await bcrypt.compare(pwd, u.password)
    if (v) { console.log('FOUND PASSWORD:', pwd); break }
  }
  console.log('Done checking')
  await pool.end()
})()