const bcrypt = require('./node_modules/bcryptjs')
const { Pool } = require('./node_modules/pg')
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres123@localhost:5432/llmcluster' })
;(async () => {
  // Create test user with known password
  const hash = await bcrypt.hash('Test1234', 10)
  const email = 'login_test_' + Date.now() + '@test.com'
  try {
    await pool.query(
      'INSERT INTO users (email, password, name, created_at) VALUES ($1, $2, $3, NOW())',
      [email, hash, 'Login Test']
    )
    console.log('Created user:', email, 'password: Test1234')
    // Test login by verifying password
    const r = await pool.query('SELECT id, email, password FROM users WHERE email = $1', [email])
    const u = r.rows[0]
    const valid = await bcrypt.compare('Test1234', u.password)
    console.log('Verify result:', valid, '(should be true)')
  } catch(e) {
    console.error('Error:', e.message)
  }
  await pool.end()
})()