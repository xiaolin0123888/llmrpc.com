const bcrypt = require('./node_modules/bcryptjs')
const { Pool } = require('./node_modules/pg')
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres123@localhost:5432/llmcluster' })
;(async () => {
  const hash = await bcrypt.hash('test123456', 10)
  try {
    const r = await pool.query(
      'INSERT INTO users (email, password, name, created_at) VALUES (, , , NOW()) RETURNING id, email',
      ['xfyy688@gmail.com', hash, 'xfyy']
    )
    console.log('Registered:', JSON.stringify(r.rows[0]))
  } catch(e) {
    if (e.code === '23505') console.log('User already exists')
    else console.error('Error:', e.message)
  }
  await pool.end()
})()
