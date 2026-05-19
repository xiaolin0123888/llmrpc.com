import { NextRequest, NextResponse } from 'next/server'
import { getOne, query } from '@/lib/db'
import { proxyRequest } from '@/lib/siliconflow'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) return NextResponse.json({ error: 'API key required' }, { status: 401 })
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex')
    const keyRecord = await getOne('SELECT ak.id, ak.user_id, u.credits FROM api_keys ak JOIN users u ON u.id = ak.user_id WHERE ak.key_hash = ', [hashedKey])
    if (!keyRecord) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    if (keyRecord.credits <= 0) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
    const body = await req.json()
    if (!body.model) return NextResponse.json({ error: 'model required' }, { status: 400 })
    try {
      const response = await proxyRequest(body.model, body)
      const estimate = Math.ceil((JSON.stringify(body.messages || []).length / 4) * 1.5)
      if (estimate > 0) {
        await query('UPDATE users SET credits = credits -  WHERE id = ', [estimate, keyRecord.user_id])
        await query('INSERT INTO transactions (user_id, type, amount, description, metadata) VALUES (, , , , )', [keyRecord.user_id, 'USAGE', -estimate, `API usage: ${body.model}`, JSON.stringify({ model: body.model })])
        await query('UPDATE api_keys SET last_used = NOW() WHERE id = ', [keyRecord.id])
      }
      return NextResponse.json(response)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Request failed'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
