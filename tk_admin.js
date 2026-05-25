const bcrypt = require('./node_modules/bcryptjs')
const { Pool } = require('./node_modules/pg')
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres123@localhost:5432/llmcluster' })
pool.query('SELECT id, email, password FROM admin_users LIMIT 5').then(r => {
  r.rows.forEach(u => console.log('Admin:', u.email, 'pw prefix:', u.password?.substring(0,20)))
  return bcrypt.compare('admin123', r.rows[0].password)
}).then(v => { console.log('admin123 valid:', v); pool.end() }).catch(e => { console.error(e.message); pool.end() })