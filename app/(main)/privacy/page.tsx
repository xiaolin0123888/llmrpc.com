export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '6rem 2rem 3rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '2rem' }}>Privacy Policy</h1>
      <div style={{ color: 'var(--text-gray)', lineHeight: 1.8, fontSize: '0.95rem' }}>
        <p style={{ marginBottom: '1rem' }}>Last updated: May 2026</p>

        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>1. Introduction</h2>
        <p style={{ marginBottom: '1.5rem' }}>LLMRpc ("we", "us", or "our") operates the website llmrpc.com (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal information when you use our Service.</p>

        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>2. Information We Collect</h2>
        <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
          <li>Account information: email address, API key, and subscription plan details.</li>
          <li>Usage data: API request logs, token consumption, and plan usage statistics.</li>
          <li>Payment information: processed securely via third-party payment providers; we do not store full payment card details.</li>
        </ul>

        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>3. How We Use Your Information</h2>
        <p style={{ marginBottom: '1.5rem' }}>We use your data to provide and maintain the Service, process payments, send service-related notifications, and improve our platform performance.</p>

        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>4. Data Security</h2>
        <p style={{ marginBottom: '1.5rem' }}>We take reasonable security measures to protect your personal data. However, no method of transmission over the internet is 100% secure.</p>

        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>5. Third-Party Services</h2>
        <p style={{ marginBottom: '1.5rem' }}>Our Service may contain links to third-party sites. We have no control over their privacy policies.</p>

        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>6. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please contact us at support@llmrpc.com</p>
      </div>
    </div>
  )
}