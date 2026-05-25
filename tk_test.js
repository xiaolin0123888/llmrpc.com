const bcrypt = require('./node_modules/bcryptjs')
const { Pool } = require('./node_modules/pg')
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres123@localhost:5432/llmcluster' })
pool.query('SELECT id, email, password FROM users WHERE email = $1', ['test999@example.com']).then(r => {
  const u = r.rows[0]
  console.log('User:', u.email, 'pw prefix:', u.password.substring(0,20))
  return bcrypt.compare('password123', u.password)
}).then(valid => {
  console.log('Password valid:', valid)
  pool.end()
}).catch(e => {
  console.error('Error:', e.message)
  pool.end()
})