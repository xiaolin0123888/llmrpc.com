export default function TermsPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '6rem 2rem 3rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '2rem' }}>Terms of Service</h1>
      <div style={{ color: 'var(--text-gray)', lineHeight: 1.8, fontSize: '0.95rem' }}>
        <p style={{ marginBottom: '1rem' }}>Last updated: May 2026</p>

        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>1. Acceptance of Terms</h2>
        <p style={{ marginBottom: '1.5rem' }}>By accessing or using LLMRpc ("the Service"), you agree to be bound by these Terms of Service.</p>

        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>2. Service Description</h2>
        <p style={{ marginBottom: '1.5rem' }}>LLMRpc provides access to AI model inference services via API. We do not guarantee uninterrupted or error-free operation.</p>

        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>3. User Responsibilities</h2>
        <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
          <li>You agree to use the Service only for lawful purposes.</li>
          <li>You must not share your API key with unauthorized parties.</li>
          <li>You are responsible for all activities conducted under your account.</li>
        </ul>

        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>4. Fees and Payments</h2>
        <p style={{ marginBottom: '1.5rem' }}>All fees are listed on our pricing page. Payments are non-refundable unless otherwise stated in our Refund Policy.</p>

        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>5. Limitation of Liability</h2>
        <p style={{ marginBottom: '1.5rem' }}>LLMRpc shall not be liable for any indirect, incidental, or consequential damages arising from the use of the Service.</p>

        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>6. Termination</h2>
        <p style={{ marginBottom: '1.5rem' }}>We reserve the right to suspend or terminate your account at any time for violation of these terms.</p>

        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>7. Contact Us</h2>
        <p>For questions about these Terms, please contact us at support@llmrpc.com</p>
      </div>
    </div>
  )
}