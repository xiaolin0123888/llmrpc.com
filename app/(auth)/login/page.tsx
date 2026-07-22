import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import LoginClient from './LoginClient'

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) redirect('/dashboard')
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Loading...</div>}>
      <LoginClient />
    </Suspense>
  )
}
