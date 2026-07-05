import { NextResponse } from 'next/server'
import { getModels } from '@/lib/models'

export async function GET() {
  const models = await getModels()
  const data = models.map(m => ({
    id: m.id,
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: m.provider,
    permission: [],
    root: m.id,
    parent: null,
  }))
  return NextResponse.json({ object: 'list', data })
}