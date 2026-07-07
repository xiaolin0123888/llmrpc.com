import { Resend } from 'resend'

const FROM = 'LLMRpc <noreply@llmrpc.com>'

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is required')
  }
  return new Resend(apiKey)
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const { data, error } = await getResend().emails.send({
    from: FROM,
    to: email,
    subject: 'Reset your LLMRpc password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #0a0a0a; padding: 32px; border-radius: 12px; border: 1px solid #27272a;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L12 12l4.179-2.25m0 0L16.75 12l-4.179 2.25" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span style="font-size: 18px; font-weight: 600; color: #fff;">LLMRpc</span>
          </div>
          <h1 style="font-size: 20px; font-weight: 600; color: #fff; margin: 0 0 12px;">Reset your password</h1>
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">You requested a password reset for your LLMRpc account. Click the button below to set a new password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; margin-bottom: 24px;">Reset password</a>
          <p style="color: #52525b; font-size: 12px; line-height: 1.5; margin: 0 0 8px;">If you didn't request this, you can safely ignore this email. This link will expire in 1 hour and can only be used once.</p>
          <p style="color: #52525b; font-size: 12px; margin: 0;">Or copy this URL into your browser:</p>
          <p style="color: #3b82f6; font-size: 12px; word-break: break-all; margin: 4px 0 0;">${resetUrl}</p>
        </div>
      </div>
    `,
  })
  if (error) { console.error('[Resend Error]', error); throw new Error('Failed to send email') }
  return data
}

export async function sendVerificationEmail(email: string, verifyUrl: string) {
  const { data, error } = await getResend().emails.send({
    from: FROM,
    to: email,
    subject: 'Verify your LLMRpc account — get 100,000 credits!',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #0a0a0a; padding: 32px; border-radius: 12px; border: 1px solid #27272a;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L12 12l4.179-2.25m0 0L16.75 12l-4.179 2.25" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span style="font-size: 18px; font-weight: 600; color: #fff;">LLMRpc</span>
          </div>
          <h1 style="font-size: 20px; font-weight: 600; color: #fff; margin: 0 0 12px;">Verify your email to get started</h1>
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">Welcome! Click the button below to verify your email address. Once confirmed, you'll receive <strong style="color: #60a5fa;">100,000 free credits</strong> to start using our full model library.</p>
          <a href="${verifyUrl}" style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; margin-bottom: 24px;">Verify email & claim 100,000 credits</a>
          <p style="color: #52525b; font-size: 12px; line-height: 1.5; margin: 0 0 8px;">This verification link expires in 24 hours and can only be used once.</p>
          <p style="color: #52525b; font-size: 12px; margin: 0;">Or copy this URL into your browser:</p>
          <p style="color: #3b82f6; font-size: 12px; word-break: break-all; margin: 4px 0 0;">${verifyUrl}</p>
        </div>
      </div>
    `,
  })
  if (error) { console.error('[Resend Error]', error); throw new Error('Failed to send email') }
  return data
}
