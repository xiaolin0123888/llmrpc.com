import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import RegisterClient from './RegisterClient'

export default async function RegisterPage() {
  const session = await auth()
  if (session?.user) redirect('/dashboard')
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Loading...</div>}>
      <RegisterClient />
    </Suspense>
  )
}