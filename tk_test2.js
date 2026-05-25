const { Pool } = require('./node_modules/pg')
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres123@localhost:5432/llmcluster' })
// Check what email is being used in screenshot: xfyy688@gmail.com
pool.query('SELECT id, email, created_at FROM users WHERE email = ', ['xfyy688@gmail.com']).then(r => {
  if (r.rows.length === 0) { console.log('xfyy688@gmail.com not found in users table'); return }
  console.log('Found:', JSON.stringify(r.rows[0]))
  pool.end()
}).catch(e => { console.error(e.message); pool.end() })

// Also check admin email
pool.query('SELECT id, email FROM admin_users').then(r => {
  console.log('Admin users:', JSON.stringify(r.rows))
  pool.end()
}).catch(e => { console.error('Admin check error:', e.message); pool.end() })
