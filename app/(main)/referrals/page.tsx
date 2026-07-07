import { auth } from '@/lib/auth'
import { getOne } from '@/lib/db'
import Link from 'next/link'
import CopyButton from '@/components/CopyButton'

export default async function ReferralsPage() {
  const session = await auth()
  const user = session ? await getOne('SELECT referral_code, referral_count FROM users WHERE id = $1', [session.user.id]) : null
  const referrerLink = user ? `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${user.referral_code}` : ''

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Affiliate Program</h1>
      <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>Earn credits by referring friends to LLMRpc.</p>

      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1a1a2e 100%)', borderRadius: 14, padding: '2rem', marginBottom: '2rem', border: '1px solid #2563eb33' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {[
            { label: 'Your Code', value: user?.referral_code?.toUpperCase() ?? 'N/A' },
            { label: 'Total Referrals', value: user?.referral_count ?? 0 },
          ].map(s => (
            <div key={s.label}>
              <p style={{ color: '#93c5fd', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.4rem' }}>{s.label}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {user && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Your referral link:</p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input readOnly value={referrerLink} style={{ flex: 1, padding: '0.65rem 1rem', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-main)', color: 'var(--text-dark)', fontSize: '0.875rem' }} />
            <CopyButton text={referrerLink} />
          </div>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.8rem', marginTop: '0.75rem' }}>You and your referral both earn credits when they sign up and make their first purchase.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { icon: '🎁', title: 'Give 150K', desc: 'Give 150,000 credits to your referral' },
          { icon: '🎁', title: 'Get 150K', desc: 'Get 150,000 credits when they purchase' },
          { icon: '∞', title: 'No limit', desc: 'Unlimited referrals' },
        ].map(f => (
          <div key={f.title} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{f.icon}</div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.3rem' }}>{f.title}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}