import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOne, execute } from '@/lib/db'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  // Check if key exists and belongs to user
  const keyExists = await getOne(
    'SELECT id FROM api_keys WHERE id = $1 AND user_id = $2',
    [id, session.user.userId]
  )
  if (!keyExists) return NextResponse.json({ error: 'Key not found' }, { status: 404 })

  // Check if key has encrypted secret
  const secret = await getOne(
    'SELECT encrypted_key FROM api_key_secrets WHERE key_hash = (SELECT key_hash FROM api_keys WHERE id = $1)',
    [id]
  )
  if (!secret) return NextResponse.json({
    error: 'This old key cannot be revealed. Please delete it and create a new key.',
    code: 'NO_SECRET'
  }, { status: 400 })

  await execute('UPDATE api_keys SET last_used = NOW() WHERE id = $1', [id])
  return NextResponse.json({ key: decryptKey(secret.encrypted_key) })

}

function decryptKey(encrypted: string): string {
  const data = Buffer.from(encrypted, 'hex')
  const iv = data.slice(0, 16)
  const tag = data.slice(16, 32)
  const encrypted_text = data.slice(32)
  const key = crypto.scryptSync(process.env.NEXTAUTH_SECRET!, 'llmcluster-salt', 32)
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  return decipher.update(encrypted_text, undefined, 'utf8') + decipher.final('utf8')
}