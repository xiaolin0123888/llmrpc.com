import { getAll } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const announcements = await getAll<any[]>(
      `SELECT id, title, content, show_homepage, created_at
       FROM announcements
       ORDER BY created_at DESC
       LIMIT 20`
    )
    return NextResponse.json({ announcements })
  } catch (err) {
    console.error('Failed to fetch announcements:', err)
    return NextResponse.json({ announcements: [] })
  }
}
