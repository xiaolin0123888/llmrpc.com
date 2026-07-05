'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface Transaction { id: string; type: string; amount: number; description: string; createdAt: string }
interface Plan { id: number; name: string; price: number; monthly_quota: number; overage_rate: number; is_active: boolean }

function formatQuota(tokens: number): string {
  if (!isFinite(tokens)) return 'Unlimited'
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`
  return tokens.toLocaleString()
}

export default function BillingPage() {
  const { data: session } = useSession()
  const [credits, setCredits] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [usage, setUsage] = useState<{ used: number; quota: number; daysLeft: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    if (!session) return

    Promise.all([
      fetch('/api/credits').then(r => r.json()),
      fetch('/api/plans').then(r => r.json()),
    ]).then(([creditsData, plansData]) => {
      setCredits(creditsData.credits ?? 0)
      setTransactions(creditsData.transactions || [])
      setPlans(plansData.plans || [])
      if (creditsData.usage) setUsage(creditsData.usage)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [session])

  const purchaseCredits = async (amount: number) => {
    setPurchasing(true)
    try {
      const res = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })
      const data = await res.json()
      if (data.success) setCredits(data.credits)
    } catch {}
    setPurchasing(false)
  }

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-[#8888a0]">Please <Link href="/login" className="text-[#6366f1]">sign in</Link>.</p>
    </div>
  )

  // Build display plans: prepend a Free tier with 100K quota
  const displayPlans = [
    { id: 0, name: 'Free', price: 0, monthly_quota: 100_000, overage_rate: 0, is_active: true, desc: 'For testing', isFree: true },
    ...plans.filter((p: Plan) => p.is_active).map((p: Plan) => ({ ...p, desc: '' })),
  ]

  const currentPlanName = (session as any)?.user?.plan || 'FREE'
  const usagePercent = usage && usage.quota > 0 && isFinite(usage.quota)
    ? Math.min(100, (usage.used / usage.quota) * 100)
    : null

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#2a2a3a]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#6366f1"/>
              <path d="M8 10h12M8 14h8M8 18h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="font-semibold text-base tracking-tight">LLMCluster</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-[#8888a0] hover:text-white">Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Billing</h1>
        <p className="text-sm text-[#8888a0] mb-8">Manage your credits and subscription</p>

        {/* Credits balance */}
        <div className="glass-card rounded-xl p-8 mb-8 text-center">
          <div className="text-xs text-[#8888a0] mb-2">Available Credits</div>
          <div className="text-5xl font-bold mb-2">{loading ? '...' : credits.toLocaleString()}</div>
          <div className="text-sm text-[#8888a0]">tokens remaining</div>
        </div>

        {/* Usage this period */}
        {usage && isFinite(usage.quota) && (
          <div className="glass-card rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm font-medium">Monthly Usage</div>
              <div className="text-xs text-[#8888a0]">{usage.daysLeft} days left</div>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold">{formatQuota(usage.used)}</span>
              <span className="text-sm text-[#8888a0]">/ {formatQuota(usage.quota)} tokens</span>
            </div>
            <div className="w-full h-2 bg-[#1a1a24] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usagePercent && usagePercent > 90 ? 'bg-[#ef4444]' : usagePercent && usagePercent > 75 ? 'bg-[#f59e0b]' : 'bg-[#6366f1]'}`}
                style={{ width: `${usagePercent ?? 0}%` }}
              />
            </div>
            {usagePercent && usagePercent > 80 && (
              <p className="text-xs text-[#f59e0b] mt-2">
                {usagePercent > 100 ? 'Quota exceeded — additional usage will be charged at overage rate' : 'Approaching quota limit — consider upgrading'}
              </p>
            )}
          </div>
        )}

        {/* Purchase credits */}
        <div className="mb-12">
          <h2 className="text-lg font-medium mb-4">Buy Credits</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[100000, 500000, 1000000, 5000000].map(amount => (
              <button key={amount} onClick={() => purchaseCredits(amount)} disabled={purchasing} className="glass-card rounded-lg p-4 hover:border-[#6366f1]/50 transition-all text-center group">
                <div className="text-xl font-bold mb-1">{(amount / 1000).toLocaleString()}K</div>
                <div className="text-xs text-[#8888a0]">tokens</div>
                <div className="text-sm font-medium mt-2 text-[#6366f1] group-hover:text-[#818cf8]">${(amount / 100000).toFixed(0)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Subscription plans */}
        <div className="mb-12">
          <h2 className="text-lg font-medium mb-4">Subscription Plans</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {displayPlans.map((plan: any, i: number) => {
              const isCurrent = plan.name.toUpperCase() === currentPlanName
              return (
                <div key={plan.id || plan.name} className={`glass-card rounded-lg p-5 ${isCurrent ? 'border-[#6366f1] border-2' : ''} ${plan.isFree ? 'opacity-60' : ''}`}>
                  {isCurrent && <div className="text-xs text-[#6366f1] font-medium mb-1">Current Plan</div>}
                  <div className="text-sm font-medium mb-1">{plan.name}</div>
                  <div className="text-2xl font-bold mb-1">
                    {plan.price === 0 ? 'Free' : `$${Number(plan.price).toFixed(0)}`}
                    {plan.price > 0 && <span className="text-sm font-normal text-[#8888a0]">/mo</span>}
                  </div>
                  <div className="text-xs text-[#8888a0] mb-2">{formatQuota(plan.monthly_quota)}/mo</div>
                  {Number(plan.overage_rate) > 0 ? (
                    <div className="text-xs text-[#555] mb-3">Overage: ${Number(plan.overage_rate).toFixed(4)}/1K tokens</div>
                  ) : (
                    <div className="text-xs text-[#555] mb-3">{plan.isFree ? 'Upgrade to add more' : 'No overage'}</div>
                  )}
                  <button
                    disabled={isCurrent || plan.isFree}
                    className={`w-full py-2 rounded-md text-xs font-medium transition-colors ${
                      isCurrent
                        ? 'bg-[#2a2a3a] text-[#8888a0] cursor-not-allowed'
                        : plan.isFree
                        ? 'bg-[#2a2a3a] text-[#555] cursor-not-allowed'
                        : 'bg-[#6366f1] hover:bg-[#818cf8] text-white'
                    }`}
                  >
                    {isCurrent ? 'Current plan' : plan.isFree ? 'Free plan' : `Subscribe to ${plan.name}`}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Transaction history */}
        <div>
          <h2 className="text-lg font-medium mb-4">Transaction History</h2>
          {loading ? (
            <div className="glass-card rounded-lg p-8 text-center text-sm text-[#8888a0] animate-pulse">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="glass-card rounded-lg p-8 text-center text-sm text-[#8888a0]">No transactions yet</div>
          ) : (
            <div className="glass-card rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a2a3a]">
                    <th className="text-left px-4 py-3 text-xs text-[#8888a0]">Date</th>
                    <th className="text-left px-4 py-3 text-xs text-[#8888a0]">Description</th>
                    <th className="text-right px-4 py-3 text-xs text-[#8888a0]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} className="border-b border-[#1a1a24]">
                      <td className="px-4 py-3 text-xs text-[#8888a0]">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-xs">{tx.description}</td>
                      <td className={`px-4 py-3 text-xs text-right font-medium ${tx.amount > 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}