import { auth } from '@/lib/auth'
import { getOne } from '@/lib/db'
import Link from 'next/link'
import CopyButton from '@/components/CopyButton'

const REFERRAL_BONUS = 500000

export default async function ReferralsPage() {
  const session = await auth()

  let refCode = ''
  let refCount = 0
  let totalEarned = 0
  let referrerLink = ''

  if (session) {
    const user = await getOne(
      'SELECT referral_code, referral_count FROM users WHERE id = $1',
      [session.user!.id]
    )
    refCode = user?.referral_code ?? ''
    refCount = user?.referral_count ?? 0
    referrerLink = `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${refCode}`

    // Total earned from actual referral transaction history, not estimation
    const earned = await getOne(
      `SELECT COALESCE(SUM(reward), 0)::int AS total FROM referrals WHERE referrer_id = $1 AND status = 'CREDITED'`,
      [session.user!.id]
    )
    totalEarned = earned?.total ?? 0
  }

  return (
    <div style={{ maxWidth: 750, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Invite & Earn</h1>
      <p style={{ color: 'var(--text-gray)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
        Share your unique link. When someone signs up and verifies their email, both of you earn credits. No limits.
      </p>

      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)', borderRadius: 16, padding: '2rem 2rem 1.5rem', marginBottom: '2rem', border: '1px solid #2563eb33' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ color: '#93c5fd', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Code</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{refCode ? refCode.toUpperCase() : 'N/A'}</p>
          </div>
          <div>
            <p style={{ color: '#93c5fd', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Invites</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{refCount}</p>
          </div>
          <div>
            <p style={{ color: '#93c5fd', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Earned</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#22c55e' }}>
              {totalEarned > 0 ? totalEarned.toLocaleString() : '0'}
            </p>
          </div>
        </div>
      </div>

      {session && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem', marginBottom: '0.75rem', fontWeight: 500 }}>🔗 Your invite link:</p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input readOnly value={referrerLink} style={{ flex: 1, padding: '0.7rem 1rem', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-main)', color: 'var(--text-dark)', fontSize: '0.875rem', fontFamily: 'monospace' }} />
            <CopyButton text={referrerLink} />
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>How it works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            { step: '1', icon: '🔗', title: 'Share Your Link', desc: 'Copy your unique invite link and share it anywhere.' },
            { step: '2', icon: '✅', title: 'They Sign Up & Verify', desc: 'Your friend creates an account and verifies their email.' },
            { step: '3', icon: '💰', title: 'Both Get Rewards', desc: `They get 1M free credits. You get ${(REFERRAL_BONUS / 1000).toFixed(0)}K for each invite.` },
          ].map(f => (
            <div key={f.step} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.4rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { icon: '🎁', title: `You Get ${(REFERRAL_BONUS / 1000).toFixed(0)}K`, desc: `${REFERRAL_BONUS.toLocaleString()} credits credited instantly when they verify email`, highlight: true },
          { icon: '🚀', title: 'They Get 1M', desc: '1,000,000 free signup credits — no credit card needed', highlight: true },
          { icon: '∞', title: 'Unlimited Invites', desc: 'No cap. Invite as many developers as you want.', highlight: false },
        ].map(f => (
          <div key={f.title} style={{
            background: f.highlight ? 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)' : 'var(--bg-card)',
            border: f.highlight ? '2px solid #22c55e40' : '1px solid var(--border)',
            borderRadius: 12, padding: '1.5rem 1rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{f.icon}</div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.3rem' }}>{f.title}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', lineHeight: 1.4 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
