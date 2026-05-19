import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAll, getOne, query } from '@/lib/db'
import crypto from 'crypto'

function generateKey() {
  const rawKey = `sk-${crypto.randomBytes(32).toString('hex')}`
  const hash = crypto.createHash('sha256').update(rawKey).digest('hex')
  const prefix = rawKey.slice(0, 12)
  return { hash, prefix }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const keys = await getAll('SELECT id, name, prefix, workspace_id, last_used, created_at FROM api_keys WHERE user_id =  ORDER BY created_at DESC', [session.user.id])
  return NextResponse.json({ keys })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { name, workspaceId } = await req.json()
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
    const { hash, prefix } = generateKey()
    const id = require('crypto').randomUUID().replace(/-/g, '').slice(0, 24)
    await query('INSERT INTO api_keys (id, name, key_hash, prefix, user_id, workspace_id) VALUES (, , , , , )', [id, name, hash, prefix, session.user.id, workspaceId || null])
    return NextResponse.json({ key: { id, name, prefix, created_at: new Date().toISOString() } })
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await query('DELETE FROM api_keys WHERE id =  AND user_id = ', [id, session.user.id])
  return NextResponse.json({ success: true })
}
