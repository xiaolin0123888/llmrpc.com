import { NextRequest, NextResponse } from 'next/server'
import { getAll, execute } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req)
  if ('error' in auth) return auth.error
  try { return NextResponse.json({ announcements: await getAll('SELECT * FROM announcements ORDER BY created_at DESC') }) }
  catch (err) { console.error(err); return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req)
  if ('error' in auth) return auth.error
  try {
    const { title, content, show_homepage } = await req.json()
    if (!title || !content) return NextResponse.json({ error: 'Required' }, { status: 400 })
    await execute('INSERT INTO announcements (title, content, show_homepage) VALUES ($1, $2, $3)', [title, content, show_homepage ?? false])
    return NextResponse.json({ success: true })
  } catch (err) { console.error(err); return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}

export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req)
  if ('error' in auth) return auth.error
  try {
    const { id, title, content, show_homepage } = await req.json()
    await execute('UPDATE announcements SET title=$1, content=$2, show_homepage=$3 WHERE id=$4', [title, content, show_homepage ?? false, id])
    return NextResponse.json({ success: true })
  } catch (err) { console.error(err); return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin(req)
  if ('error' in auth) return auth.error
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await execute('DELETE FROM announcements WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (err) { console.error(err); return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}
