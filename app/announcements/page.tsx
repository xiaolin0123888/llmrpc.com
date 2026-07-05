'use client'

import { useEffect, useState } from 'react'
import { Calendar, ChevronRight, Megaphone } from 'lucide-react'
import Link from 'next/link'

interface Announcement {
  id: number
  title: string
  content: string
  show_homepage: boolean
  created_at: string
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/announcements')
      .then(r => r.json())
      .then(d => {
        setAnnouncements(d.announcements || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const opts: Intl.DateTimeFormatOptions = {
      year: 'numeric', month: 'long', day: 'numeric'
    }
    return d.toLocaleDateString('en-US', opts)
  }

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Simple header */}
      <header className="border-b border-[#2a2a3a]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="6" fill="#6366f1"/>
              <path d="M8 10h12M8 14h8M8 18h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="font-semibold text-base tracking-tight">LLMCluster</span>
          </Link>
          <Link href="/" className="text-sm text-[#8888a0] hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Megaphone size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
            <p className="text-sm text-[#8888a0]">Latest updates and news from LLMCluster</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                <div className="h-5 bg-white/5 rounded w-1/3 mb-3" />
                <div className="h-4 bg-white/5 rounded w-full mb-2" />
                <div className="h-4 bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Announcements list */}
        {!loading && (
          <div className="space-y-4">
            {announcements.map((a, idx) => (
              <div
                key={a.id}
                className="glass-card rounded-xl p-6 transition-all hover:border-indigo-500/30"
                style={{
                  animation: `fadeIn 0.3s ease-out ${idx * 0.05}s both`,
                }}
              >
                {/* Badge */}
                {a.show_homepage && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-[11px] font-medium mb-3">
                    <Megaphone size={11} />
                    Featured
                  </span>
                )}
                {idx === 0 && !a.show_homepage && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-medium mb-3">
                    Latest
                  </span>
                )}

                {/* Title */}
                <h2 className="text-lg font-semibold mb-2">{a.title}</h2>

                {/* Content */}
                <p className="text-sm text-[#b0b0c8] leading-relaxed whitespace-pre-line">{a.content}</p>

                {/* Date */}
                <div className="flex items-center gap-1.5 mt-4 text-xs text-[#666680]">
                  <Calendar size={12} />
                  <span>{formatDate(a.created_at)}</span>
                </div>
              </div>
            ))}

            {announcements.length === 0 && (
              <div className="text-center py-20">
                <Megaphone size={40} className="mx-auto text-[#3a3a4a] mb-4" />
                <p className="text-[#8888a0]">No announcements yet. Check back later!</p>
                <Link href="/" className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 mt-4 transition-colors">
                  Return home <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2a2a3a] mt-20">
        <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#8888a0]">
            <span>LLMCluster</span>
            <span>·</span>
            <span>Powered by SiliconFlow</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#8888a0]">
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="/docs">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
