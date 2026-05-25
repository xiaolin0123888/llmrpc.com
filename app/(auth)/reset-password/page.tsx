import { Suspense } from 'react'
import ResetPasswordClient from './ResetPasswordClient'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Loading...</div>}>
      <ResetPasswordClient />
    </Suspense>
  )
}