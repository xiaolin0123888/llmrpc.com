import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import LoginClient from './LoginClient'

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) redirect('/dashboard')
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f5f5' }}><div style={{ color: '#666666', fontSize: '14px' }}>Loading...</div></div>}>
      <LoginClient />
    </Suspense>
  )
}