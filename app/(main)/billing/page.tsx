'use client'
import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface Transaction { id: string; type: string; amount: number; description: string; createdAt: string }
interface Plan { id: number; name: string; price: number; monthly_quota: number; overage_rate: number; is_active: boolean }

const CREDIT_PACKAGES = [
  { key: '100K', label: '100K tokens', price: '$1',  priceNum: 1.00 },
  { key: '500K', label: '500K tokens', price: '$5',  priceNum: 5.00 },
  { key: '1M',   label: '1M tokens',   price: '$10', priceNum: 10.00 },
  { key: '5M',   label: '5M tokens',   price: '$45', priceNum: 45.00 },
]

function formatQuota(tokens: number): string {
  if (!isFinite(tokens)) return 'Unlimited'
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`
  return tokens.toLocaleString()
}

function BillingContent() {
  const searchParams = useSearchParams()
  const [credits, setCredits] = useState(0)
  const [currentPlan, setCurrentPlan] = useState('FREE')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [usage, setUsage] = useState<{ used: number; quota: number; daysLeft: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [paypalLoading, setPaypalLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showNotification = useCallback((type: 'success' | 'error', msg: string) => {
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current)
    setNotification({ type, msg })
    notifTimerRef.current = setTimeout(() => {
      setNotification(null)
      notifTimerRef.current = null
    }, 5000)
  }, [])

  useEffect(() => {
    return () => {
      if (notifTimerRef.current) clearTimeout(notifTimerRef.current)
    }
  }, [])

  // Handle PayPal return
  const paypalHandledRef = useRef(false)

  useEffect(() => {
    const status = searchParams.get('paypal')
    if (paypalHandledRef.current || !status) return

    if (status === 'success') {
      paypalHandledRef.current = true
      const orderId = sessionStorage.getItem('paypal_order_id')
      if (orderId) {
        capturePaypalOrder(orderId)
      }
      window.history.replaceState({}, '', '/billing')
    } else if (status === 'cancelled') {
      paypalHandledRef.current = true
      showNotification('error', 'PayPal payment was cancelled.')
      window.history.replaceState({}, '', '/billing')
    }
  }, [searchParams, showNotification])

  const capturePaypalOrder = useCallback(async (orderId: string) => {
    setPaypalLoading(true)
    try {
      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()
      if (data.success) {
        sessionStorage.removeItem('paypal_order_id')
        setCredits(data.credits)
        showNotification('success', `Successfully added ${Number(data.tokens).toLocaleString()} credits!`)
      } else {
        // If already fulfilled, clean up orderId so user doesn't keep retrying
        if (data.error === 'Already fulfilled') {
          sessionStorage.removeItem('paypal_order_id')
        }
        showNotification('error', data.error || 'Payment capture failed.')
      }
    } catch {
      showNotification('error', 'Network error during payment capture.')
    }
    setPaypalLoading(false)
  }, [showNotification])

  const purchaseWithPayPal = useCallback(async (pkgKey: string) => {
    setPaypalLoading(true)
    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: pkgKey }),
      })
      const data = await res.json()
      if (data.orderId && data.approveUrl) {
        sessionStorage.setItem('paypal_order_id', data.orderId)
        window.location.href = data.approveUrl
      } else {
        showNotification('error', data.error || 'Failed to create PayPal order.')
        setPaypalLoading(false)
      }
    } catch {
      showNotification('error', 'Network error. Please try again.')
      setPaypalLoading(false)
    }
  }, [showNotification])

  useEffect(() => {
    // Independent fetches so one failure doesn't block the other
    const loadCredits = fetch('/api/credits').then(r => r.json()).catch(() => ({}))
    const loadPlans = fetch('/api/plans').then(r => r.json()).catch(() => ({ plans: [] }))

    Promise.all([loadCredits, loadPlans]).then(([creditsData, plansData]) => {
      setCredits(creditsData.credits ?? 0)
      setCurrentPlan(creditsData.currentPlan || 'FREE')
      setTransactions(creditsData.transactions || [])
      setPlans(plansData.plans || [])
      if (creditsData.usage) setUsage(creditsData.usage)
      setLoading(false)
    })
  }, [])

  const isLoading = paypalLoading

  // Build display plans
  const displayPlans = [
    { id: 0, name: 'Free', price: 0, monthly_quota: 50000, overage_rate: 0, is_active: true, desc: 'For testing', isFree: true },
    ...plans.map((p: Plan) => ({ ...p, is_active: true, desc: "" })),
  ]

  const usagePercent = usage && usage.quota > 0 && isFinite(usage.quota)
    ? Math.min(100, (usage.used / usage.quota) * 100)
    : null

  const getUsageBarClass = () => {
    if (!usagePercent) return ''
    if (usagePercent > 90) return 'danger'
    if (usagePercent > 75) return 'warning'
    return ''
  }

  // Toast styles matching site look
  const toastStyles = {
    success: { background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' },
    error: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
  }

  return (
    <div className="billing-container">
      {/* Toast */}
      {notification && (
        <div className="billing-toast" style={toastStyles[notification.type]}>
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <div className="billing-header">
        <h1>Billing</h1>
        <p>Manage your membership and credits</p>
      </div>

      {/* Plan + Credits overview */}
      <div className="billing-balance">
        <div className="billing-balance-label">Current Plan</div>
        <div className="billing-balance-amount" style={{ fontSize: '2.5rem' }}>
          {loading ? '...' : currentPlan}
        </div>
        <div className="billing-balance-sub">
          {credits.toLocaleString()} credits remaining
        </div>
      </div>

      {/* Usage bar */}
      {usage && isFinite(usage.quota) && (
        <div className="billing-usage">
          <div className="billing-usage-header">
            <span className="billing-usage-title">Monthly Usage</span>
            <span className="billing-usage-days">{usage.daysLeft} days left</span>
          </div>
          <div className="billing-usage-stats">
            <span className="billing-usage-used">{formatQuota(usage.used)}</span>
            <span className="billing-usage-quota">/ {formatQuota(usage.quota)} tokens</span>
          </div>
          <div className="billing-usage-bar">
            <div
              className={`billing-usage-fill ${getUsageBarClass()}`}
              style={{ width: `${usagePercent ?? 0}%` }}
            />
          </div>
          {usagePercent && usagePercent > 80 && (
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 500, color: usagePercent > 90 ? '#ef4444' : '#f59e0b' }}>
              {usagePercent >= 100
                ? 'Quota exceeded — additional usage charged at overage rate'
                : 'Approaching quota limit — consider upgrading'}
            </p>
          )}
        </div>
      )}

      {/* ===== Membership Plans ===== */}
      <div className="billing-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <h2 className="billing-section-title" style={{ marginBottom: 0 }}>Membership Plans</h2>
          <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.6rem', borderRadius: 99, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontWeight: 600 }}>Monthly</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {displayPlans.map((plan: any) => {
            const isCurrent = plan.name.toUpperCase() === currentPlan.toUpperCase()
            return (
              <div
                key={plan.id || plan.name}
                className={`billing-plan${isCurrent ? ' current' : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  paddingTop: '1.75rem',
                }}
              >
                {/* Badge */}
                {isCurrent && (
                  <span style={{
                    position: 'absolute', top: '-0.6rem', left: '50%', transform: 'translateX(-50%)',
                    background: '#2563eb', color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                    padding: '0.15rem 0.8rem', borderRadius: 99, whiteSpace: 'nowrap',
                  }}>
                    CURRENT
                  </span>
                )}

                {/* Icon */}
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                  {plan.isFree ? '🔰' : plan.name === 'Basic' ? '⭐' : plan.name === 'Pro' ? '💎' : plan.name === 'Enterprise' ? '🏢' : '🚀'}
                </div>

                <div className="billing-plan-name">{plan.name}</div>
                <div className="billing-plan-price">
                  {plan.price === 0 ? 'Free' : `$${plan.price % 1 === 0 ? Number(plan.price).toFixed(0) : Number(plan.price).toFixed(2)}`}
                  {plan.price > 0 && <span>/mo</span>}
                </div>
                <div className="billing-plan-quota">{formatQuota(plan.monthly_quota)} / mo</div>

                {!plan.isFree && (
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.75rem' }}>
                    {Number(plan.overage_rate) > 0
                      ? `Overage: $${Number(plan.overage_rate).toFixed(4)}/1K`
                      : 'No overage fees'}
                  </div>
                )}

                <div style={{ flex: 1 }} />

                <button
                  disabled
                  className={`billing-plan-btn${isCurrent ? ' current' : plan.isFree ? '' : ' active'}`}
                  style={!isCurrent ? {
                    background: '#f3f4f6',
                    color: '#d1d5db',
                    cursor: 'not-allowed',
                  } : {}}
                >
                  {isCurrent ? 'Current plan' : plan.isFree ? 'Free' : 'Temporarily unavailable'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ===== Buy Extra Credits ===== */}
      <div className="billing-section">
        <details style={{ cursor: 'pointer' }}>
          <summary style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', listStyle: 'none', marginBottom: '1rem' }}>
            <h2 className="billing-section-title" style={{ marginBottom: 0 }}>Buy Extra Credits</h2>
            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.6rem', borderRadius: 99, background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', fontWeight: 600 }}>Top-up</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#9ca3af' }}>▼</span>
          </summary>
          <div className="billing-packages">
            {CREDIT_PACKAGES.map(pkg => (
              <div key={pkg.key} className="billing-package">
                <div className="billing-pkg-name">{pkg.label}</div>
                <div className="billing-pkg-price">{pkg.price}</div>
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <button
                    className="billing-pkg-btn paypal"
                    onClick={() => purchaseWithPayPal(pkg.key)}
                    disabled={isLoading}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .76-.659h6.155c2.556 0 4.17.558 4.948 2.787.506 1.448.37 3.22-.37 4.545a5.513 5.513 0 0 1-3.037 2.863c-.98.371-2.036.558-3.137.558H8.833a.77.77 0 0 0-.758.658l-1.02 12.88a.64.64 0 0 1-.633.54l-.346.04z"/>
                    </svg>
                    PayPal
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem', textAlign: 'center' }}>
            💳 Extra credits never expire. They&apos;re used after your plan&apos;s monthly quota is exhausted.
          </p>
        </details>
      </div>

      {/* ===== Transaction History ===== */}
      <div className="billing-section">
        <h2 className="billing-section-title">Transaction History</h2>
        {loading ? (
          <div className="billing-table-card">
            <div className="billing-empty">Loading...</div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="billing-table-card">
            <div className="billing-empty">No transactions yet</div>
          </div>
        ) : (
          <div className="billing-table-card">
            <table className="billing-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td>{tx.description}</td>
                    <td className={tx.amount > 0 ? 'tx-positive' : 'tx-negative'}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Loading billing...</p>
      </div>
    }>
      <BillingContent />
    </Suspense>
  )
}
