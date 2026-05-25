import { NextRequest, NextResponse } from 'next/server'
import { getOne, execute } from '@/lib/db'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 401 })
    }
    const apiKey = authHeader.slice(7)
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
    const keyRecord = await getOne(
      'SELECT a.user_id, u.is_banned, u.credits FROM api_keys a JOIN users u ON u.id = a.user_id WHERE a.key_hash = $1',
      [keyHash]
    )
    if (!keyRecord) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    if (keyRecord.is_banned) return NextResponse.json({ error: 'Account suspended' }, { status: 403 })

    const body = await req.json()
    const model = body.model
    if (!model) return NextResponse.json({ error: 'model is required' }, { status: 400 })

    // Estimate tokens (rough)
    const inputText = JSON.stringify(body.messages ?? '')
    const estimatedTokens = Math.ceil(inputText.length / 4)

    if ((keyRecord.credits ?? 0) < estimatedTokens) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
    }

    // Proxy to SiliconFlow
    const { siliconflow } = await import('@/lib/models')
    const response = await siliconflow.post('/chat/completions', { ...body, model })

    // Deduct credits (simplified: deduct based on response)
    const outputText = JSON.stringify(response)
    const cost = Math.ceil(outputText.length / 4)
    await execute('UPDATE users SET credits = credits - $1 WHERE id = $2', [Math.max(1, cost), keyRecord.user_id])
    await execute(
      'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [keyRecord.user_id, 'API_USAGE', -Math.max(1, cost), `API call: ${model}`]
    )
    await execute('UPDATE api_keys SET last_used = NOW() WHERE user_id = $1', [keyRecord.user_id])

    return NextResponse.json(response)
  } catch (err: any) {
    console.error('[proxy error]', err)
    const msg = err?.response?.data ? JSON.stringify(err.response.data) : 'Proxy error'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}