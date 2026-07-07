import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOne, execute } from '@/lib/db'
import { safeJson } from '@/lib/safe-json'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await getOne('SELECT id, email, name, credits, created_at FROM users WHERE id = $1', [session.user.userId])
  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const [body, parseError] = await safeJson<{ name?: string | null }>(req)
    if (parseError) return parseError

    const name = body?.name?.trim() || null
    await execute('UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2', [name ?? null, session.user.userId])
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
