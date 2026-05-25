import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAll } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const keys = await getAll('SELECT id, name, prefix, last_used, created_at FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC', [session.user.userId])
  return NextResponse.json({ keys })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { name } = await req.json()
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
    const crypto = await import('crypto')
    const keyFull = `sk-llm-${crypto.randomBytes(24).toString('hex')}`
    const keyHash = crypto.createHash('sha256').update(keyFull).digest('hex')
    const prefix = keyFull.slice(0, 12)
    const { execute, getOne } = await import('@/lib/db')
    await execute(
      'INSERT INTO api_keys (user_id, name, key_hash, prefix, key_full) VALUES ($1, $2, $3, $4, $5)',
      [session.user.userId, name, keyHash, prefix, keyFull]
    )
    const key = await getOne('SELECT id FROM api_keys WHERE key_hash = $1', [keyHash])
    return NextResponse.json({ key_id: key.id, key: keyFull, prefix })
  } catch (err) {
    console.error('[keys POST error]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const { execute } = await import('@/lib/db')
  await execute('DELETE FROM api_keys WHERE id = $1 AND user_id = $2', [id, session.user.userId])
  return NextResponse.json({ success: true })
}