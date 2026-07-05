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
  const [purchasing, setPurchasing] = useState(false)
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
        sessionStorage.removeItem('paypal_order_id')
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
        setCredits(data.credits)
        showNotification('success', `Successfully added ${Number(data.tokens).toLocaleString()} credits!`)
      } else {
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

  const purchaseCreditsDirect = useCallback(async (amount: number) => {
    setPurchasing(true)
    try {
      const res = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })
      const data = await res.json()
      if (data.success) {
        setCredits(data.credits)
        showNotification('success', `Added ${amount.toLocaleString()} credits!`)
      } else {
        showNotification('error', data.error || 'Purchase failed.')
      }
    } catch {
      showNotification('error', 'Network error. Please try again.')
    }
    setPurchasing(false)
  }, [showNotification])

  useEffect(() => {
    Promise.all([
      fetch('/api/credits').then(r => r.json()),
      fetch('/api/plans').then(r => r.json()),
    ]).then(([creditsData, plansData]) => {
      setCredits(creditsData.credits ?? 0)
      setCurrentPlan(creditsData.currentPlan || 'FREE')
      setTransactions(creditsData.transactions || [])
      setPlans(plansData.plans || [])
      if (creditsData.usage) setUsage(creditsData.usage)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const isLoading = purchasing || paypalLoading

  // Build display plans
  const displayPlans = [
    { id: 0, name: 'Free', price: 0, monthly_quota: 50000, overage_rate: 0, is_active: true, desc: 'For testing', isFree: true },
    ...plans.filter((p: Plan) => p.is_active).map((p: Plan) => ({ ...p, desc: '' })),
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

  return (
    <div className="billing-container">
      {/* Toast notification */}
      {notification && (
        <div className={`billing-toast ${notification.type}`}>
          {notification.msg}
        </div>
      )}

      {/* Page header */}
      <div className="billing-header">
        <h1>Billing</h1>
        <p>Manage your credits and subscription</p>
      </div>

      {/* Credits balance */}
      <div className="billing-balance">
        <div className="billing-balance-label">Available Credits</div>
        <div className="billing-balance-amount">
          {loading ? '...' : credits.toLocaleString()}
        </div>
        <div className="billing-balance-sub">tokens remaining</div>
      </div>

      {/* Usage this period */}
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
            <p className={`billing-usage-hint ${usagePercent > 90 ? 'danger' : 'warning'}`}>
              {usagePercent >= 100
                ? 'Quota exceeded — additional usage charged at overage rate'
                : 'Approaching quota limit — consider upgrading'}
            </p>
          )}
        </div>
      )}

      {/* Buy Credits */}
      <div className="billing-section">
        <h2 className="billing-section-title">Buy Credits</h2>
        <div className="billing-packages">
          {CREDIT_PACKAGES.map(pkg => (
            <div key={pkg.key} className="billing-package">
              <div className="billing-pkg-name">{pkg.label}</div>
              <div className="billing-pkg-price">{pkg.price}</div>
              <div className="billing-pkg-btns">
                <button
                  className="billing-pkg-btn paypal"
                  onClick={() => purchaseWithPayPal(pkg.key)}
                  disabled={isLoading}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.770 0 1 .76-.659h6.155c2.556 0 4.17.558 4.948 2.787.506 1.448.37 3.22-.37 4.545a5.513 5.513 0 0 1-3.037 2.863c-.98.371-2.036.558-3.137.558H8.833a.77.77 0 0 0-.758.658l-1.02 12.88a.64.640 0 1-.633.54l-.346.04z"/>
                  </svg>
                  PayPal
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="billing-packages-note">
          💳 PayPal payments are processed securely. Credits are added immediately after payment.
        </p>
      </div>

      {/* Subscription Plans */}
      <div className="billing-section">
        <h2 className="billing-section-title">Subscription Plans</h2>
        <div className="billing-plans">
          {displayPlans.map((plan: any) => {
            const isCurrent = plan.name.toUpperCase() === currentPlan.toUpperCase()
            return (
              <div
                key={plan.id || plan.name}
                className={`billing-plan${isCurrent ? ' current' : ''}${plan.isFree ? ' free' : ''}`}
              >
                {isCurrent && <span className="billing-plan-badge">Current Plan</span>}
                <div className="billing-plan-name">{plan.name}</div>
                <div className="billing-plan-price">
                  {plan.price === 0 ? 'Free' : `$${Number(plan.price).toFixed(0)}`}
                  {plan.price > 0 && <span>/mo</span>}
                </div>
                <div className="billing-plan-quota">{formatQuota(plan.monthly_quota)}/mo</div>
                <div className="billing-plan-overage">
                  {Number(plan.overage_rate) > 0
                    ? `Overage: $${Number(plan.overage_rate).toFixed(4)}/1K tokens`
                    : plan.isFree ? 'Upgrade to add more' : 'No overage fees'}
                </div>
                <button
                  disabled={isCurrent || plan.isFree}
                  className={`billing-plan-btn${isCurrent ? ' current' : plan.isFree ? ' disabled' : ' active'}`}
                >
                  {isCurrent ? 'Current plan' : plan.isFree ? 'Free plan' : `Subscribe to ${plan.name}`}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Transaction History */}
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
        <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Loading billing...</p>
      </div>
    }>
      <BillingContent />
    </Suspense>
  )
}
