import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAll } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const txs = await getAll(
    `SELECT id, type, amount, description, metadata, created_at
     FROM transactions
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 100`,
    [session.user.userId]
  )

  return NextResponse.json({ transactions: txs })
}
