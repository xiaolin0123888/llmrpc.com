import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOne } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const key = await getOne('SELECT key_full FROM api_keys WHERE id = $1 AND user_id = $2', [id, session.user.userId])
  if (!key) return NextResponse.json({ error: 'Key not found' }, { status: 404 })
  await import('@/lib/db').then(m => m.execute('UPDATE api_keys SET last_used = NOW() WHERE id = $1', [id]))
  return NextResponse.json({ key: key.key_full })
}