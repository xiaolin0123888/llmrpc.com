'use client'
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

const THEMES: Record<Theme, { label: string; bg: string; border: string; sample: string }> = {
  light: {
    label: 'Light',
    bg: '#ffffff',
    border: '#e5e7eb',
    sample: 'rgba(255,255,255,0.95)',
  },
  dark: {
    label: 'Dark',
    bg: '#0f1117',
    border: '#1f2937',
    sample: 'rgba(15,17,23,0.95)',
  },
  system: {
    label: 'System',
    bg: 'linear-gradient(135deg, #fff 50%, #0f1117 50%)',
    border: '#e5e7eb',
    sample: 'rgba(255,255,255,0.95)',
  },
}

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>('light')
  const [themeMsg, setThemeMsg] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [profileMsg, setProfileMsg] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved) setTheme(saved)
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(d => { if (d.name) setDisplayName(d.name) })
  }, [])

  const handleTheme = (t: Theme) => {
    setTheme(t)
    localStorage.setItem('theme', t)
    if (t === 'dark') {
      document.documentElement.style.setProperty('--bg-main', '#0f1117')
      document.documentElement.style.setProperty('--bg-card', '#1a1d27')
      document.documentElement.style.setProperty('--border', '#1f2937')
      document.documentElement.style.setProperty('--text-dark', '#e5e7eb')
      document.documentElement.style.setProperty('--text-gray', '#9ca3af')
      document.documentElement.style.setProperty('--primary', '#3b82f6')
      document.body.style.background = '#0f1117'
      document.body.style.color = '#e5e7eb'
    } else if (t === 'light') {
      document.documentElement.style.setProperty('--bg-main', '#ffffff')
      document.documentElement.style.setProperty('--bg-card', '#f9fafb')
      document.documentElement.style.setProperty('--border', '#e5e7eb')
      document.documentElement.style.setProperty('--text-dark', '#111111')
      document.documentElement.style.setProperty('--text-gray', '#6b7280')
      document.documentElement.style.setProperty('--primary', '#2563eb')
      document.body.style.background = '#ffffff'
      document.body.style.color = '#111111'
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        document.documentElement.style.setProperty('--bg-main', '#0f1117')
        document.documentElement.style.setProperty('--bg-card', '#1a1d27')
        document.documentElement.style.setProperty('--border', '#1f2937')
        document.documentElement.style.setProperty('--text-dark', '#e5e7eb')
        document.documentElement.style.setProperty('--text-gray', '#9ca3af')
        document.body.style.background = '#0f1117'
        document.body.style.color = '#e5e7eb'
      }
    }
    setThemeMsg('Theme saved — refresh for full effect')
    setTimeout(() => setThemeMsg(''), 3000)
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    setProfileMsg('')
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: displayName }),
      })
      if (res.ok) setProfileMsg('Profile updated!')
      else setProfileMsg('Failed to update')
    } finally {
      setSavingProfile(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '2rem' }}>Settings</h1>

      {/* Theme */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.3rem' }}>Theme</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '1.2rem' }}>Choose your site appearance</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {(Object.keys(THEMES) as Theme[]).map(t => {
            const { label, bg, border, sample } = THEMES[t]
            const isActive = theme === t
            return (
              <button
                key={t}
                onClick={() => handleTheme(t)}
                style={{
                  border: `2px solid ${isActive ? 'var(--primary)' : border}`,
                  borderRadius: 10,
                  overflow: 'hidden',
                  background: 'var(--bg-main)',
                  cursor: 'pointer',
                  padding: 0,
                  textAlign: 'left',
                }}
              >
                <div style={{ height: 60, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ width: '70%', height: 24, background: sample, borderRadius: 4, border: `1px solid ${border}` }} />
                  {isActive && (
                    <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
                  )}
                </div>
                <div style={{ padding: '0.5rem', textAlign: 'center', borderTop: `1px solid ${border}` }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: isActive ? 600 : 400, color: 'var(--text-dark)' }}>{label}</span>
                </div>
              </button>
            )
          })}
        </div>
        {themeMsg && <p style={{ color: '#16a34a', fontSize: '0.875rem', marginTop: '1rem' }}>{themeMsg}</p>}
      </div>

      {/* Profile */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.3rem' }}>Profile</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '1.2rem' }}>Manage your account info</p>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-gray)', marginBottom: '0.4rem' }}>Display Name</label>
          <input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            style={{ width: '100%', padding: '0.7rem 1rem', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-main)', color: 'var(--text-dark)', fontSize: '0.9rem', outline: 'none' }}
          />
        </div>
        {profileMsg && <p style={{ color: profileMsg.includes('update') ? '#16a34a' : '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{profileMsg}</p>}
        <button
          onClick={handleSaveProfile}
          disabled={savingProfile}
          className="btn-primary"
          style={{ padding: '0.6rem 1.5rem', opacity: savingProfile ? 0.6 : 1 }}
        >
          {savingProfile ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Footer links */}
      <div style={{ textAlign: 'center', marginTop: '2rem', padding: '0 1rem', fontSize: '0.8rem', color: 'var(--text-gray)' }}>
        <span>© 2026 LLMRpc.com. All rights reserved.</span>
        <span style={{ margin: '0 0.75rem', color: 'var(--border)' }}>|</span>
        <a href="/privacy" style={{ color: 'var(--text-gray)', marginRight: '1rem' }}>Privacy Policy</a>
        <a href="/terms" style={{ color: 'var(--text-gray)', marginRight: '1rem' }}>Terms of Service</a>
        <a href="/refund" style={{ color: 'var(--text-gray)' }}>Refund Policy</a>
      </div>
    </div>
  )
}