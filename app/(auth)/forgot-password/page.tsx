import { Suspense } from 'react'
import ForgotPasswordClient from './ForgotPasswordClient'

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Loading...</div>}>
      <ForgotPasswordClient />
    </Suspense>
  )
}