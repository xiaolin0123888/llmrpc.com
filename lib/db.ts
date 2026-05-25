import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export const query = (text: string, params?: any[]) =>
  pool.query(text, params)

export const getOne = async (text: string, params?: any[]) => {
  const result = await pool.query(text, params)
  return result.rows[0] || null
}

export const getAll = async (text: string, params?: any[]) => {
  const result = await pool.query(text, params)
  return result.rows
}

export const execute = async (text: string, params?: any[]) => {
  const result = await pool.query(text, params)
  return result.rowCount ?? result.rows.length
}

export default pool