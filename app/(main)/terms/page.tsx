export default function TermsPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Terms of Service</h1>
      <p style={{ color: 'var(--text-gray)', fontSize: '0.88rem', marginBottom: '2.5rem' }}>Last updated: May 2026</p>

      <div style={{ lineHeight: 1.8 }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-dark)', margin: '2rem 0 0.8rem' }}>1. Acceptance of Terms</h2>
        <p style={{ color: 'var(--text-gray)', fontSize: '0.92rem', marginBottom: '1rem' }}>By accessing or using LLMRpc (&quot;the Service&quot;), you agree to be bound by these Terms of Service.</p>

        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-dark)', margin: '2rem 0 0.8rem' }}>2. Service Description</h2>
        <p style={{ color: 'var(--text-gray)', fontSize: '0.92rem', marginBottom: '1rem' }}>LLMRpc provides access to AI model inference services via API. We do not guarantee uninterrupted or error-free operation.</p>

        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-dark)', margin: '2rem 0 0.8rem' }}>3. User Responsibilities</h2>
        <ul style={{ color: 'var(--text-gray)', fontSize: '0.92rem', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>You agree to use the Service only for lawful purposes.</li>
          <li style={{ marginBottom: '0.5rem' }}>You must not share your API key with unauthorized parties.</li>
          <li style={{ marginBottom: '0.5rem' }}>You are responsible for all activities conducted under your account.</li>
        </ul>

        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-dark)', margin: '2rem 0 0.8rem' }}>4. Fees and Payments</h2>
        <p style={{ color: 'var(--text-gray)', fontSize: '0.92rem', marginBottom: '1rem' }}>All fees are listed on our pricing page. Payments are non-refundable unless otherwise stated in our Refund Policy.</p>

        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-dark)', margin: '2rem 0 0.8rem' }}>5. Limitation of Liability</h2>
        <p style={{ color: 'var(--text-gray)', fontSize: '0.92rem', marginBottom: '1rem' }}>LLMRpc shall not be liable for any indirect, incidental, or consequential damages arising from the use of the Service.</p>

        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-dark)', margin: '2rem 0 0.8rem' }}>6. Termination</h2>
        <p style={{ color: 'var(--text-gray)', fontSize: '0.92rem', marginBottom: '1rem' }}>We reserve the right to suspend or terminate your account at any time for violation of these terms.</p>

        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-dark)', margin: '2rem 0 0.8rem' }}>7. Contact Us</h2>
        <p style={{ color: 'var(--text-gray)', fontSize: '0.92rem' }}>For questions about these Terms, please contact us at <a href="mailto:xfyy688@gmail.com" style={{ color: 'var(--primary)' }}>xfyy688@gmail.com</a></p>
      </div>
    </div>
  )
}
