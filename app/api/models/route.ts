import { NextRequest, NextResponse } from 'next/server'
import { getModels } from '@/lib/siliconflow'

export async function GET(req: NextRequest) {
  try {
    const models = await getModels()
    return NextResponse.json({ models })
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
