const bcrypt = require('./node_modules/bcryptjs')
const { Pool } = require('./node_modules/pg')
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres123@localhost:5432/llmcluster' })
;(async () => {
  // Try to register a test user
  const hash = await bcrypt.hash('Test123456', 10)
  try {
    const r = await pool.query(
      "INSERT INTO users (email, password, name, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, email",
      ['tom_test_' + Date.now() + '@test.com', hash, 'Tom Test']
    )
    console.log('Registered:', JSON.stringify(r.rows[0]))
  } catch(e) {
    if (e.code === '23505') console.log('User already exists')
    else console.error('Error:', e.message, e.code)
  }
  await pool.end()
})()