import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAll, execute, getOne } from '@/lib/db'
import crypto from 'crypto'
import { safeJson } from '@/lib/safe-json'

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
    const [body, parseError] = await safeJson<{ name?: string }>(req)
    if (parseError) return parseError

    const name = body?.name?.trim()
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
    const keyFull = 'sk-llm-' + crypto.randomBytes(24).toString('hex')
    const keyHash = crypto.createHash('sha256').update(keyFull).digest('hex')
    const prefix = keyFull.slice(0, 12)
    await execute(
      'INSERT INTO api_keys (user_id, name, key_hash, prefix) VALUES ($1, $2, $3, $4)',
      [session.user.userId, name, keyHash, prefix]
    )
    await execute(
      'INSERT INTO api_key_secrets (key_hash, encrypted_key) VALUES ($1, $2)',
      [keyHash, encryptKey(keyFull)]
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
  await execute('DELETE FROM api_keys WHERE id = $1 AND user_id = $2', [id, session.user.userId])
  return NextResponse.json({ success: true })
}

function encryptKey(text: string): string {
  const key = crypto.scryptSync(process.env.NEXTAUTH_SECRET!, 'llmcluster-salt', 32)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('hex')
}
