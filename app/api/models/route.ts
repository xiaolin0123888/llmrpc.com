import { NextRequest, NextResponse } from 'next/server'
import { getModels } from '@/lib/models'

export async function GET(req: NextRequest) {
  const models = await getModels()
  return NextResponse.json({ models })
}