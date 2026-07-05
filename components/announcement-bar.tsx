'use client'

import { useEffect, useState } from 'react'
import { X, Megaphone } from 'lucide-react'

interface Announcement {
  id: number
  title: string
  content: string
  show_homepage: boolean
  created_at: string
}

const DISMISS_KEY = 'llm_announcements_dismissed'

export function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(DISMISS_KEY) || '[]')
      setDismissedIds(new Set(stored))
    } catch { /* ignore */ }

    fetch('/api/announcements')
      .then(r => r.json())
      .then(d => {
        const active = (d.announcements || []).filter((a: Announcement) => a.show_homepage)
        setAnnouncements(active)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const dismiss = (id: number) => {
    const next = new Set(dismissedIds)
    next.add(id)
    setDismissedIds(next)
    localStorage.setItem(DISMISS_KEY, JSON.stringify([...next]))
  }

  const visible = announcements.filter(a => !dismissedIds.has(a.id))
  const items = visible.slice(0, 3)

  if (loading || items.length === 0) return null

  return (
    <div>
      {items.map((a, idx) => (
        <div
          key={a.id}
          className="flex items-start gap-3 px-6 py-2.5 text-sm bg-blue-50 border-b border-blue-100 text-blue-800"
        >
          <Megaphone size={14} className="mt-0.5 shrink-0 text-blue-400" />
          <div className="flex-1 min-w-0">
            <span className="font-medium mr-1.5">{a.title}</span>
            <span className="text-blue-600/80">{a.content}</span>
          </div>
          <button
            onClick={() => dismiss(a.id)}
            className="shrink-0 p-0.5 rounded hover:bg-blue-100 transition-colors text-blue-400 hover:text-blue-600"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
