export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '6rem 2rem 3rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '2rem' }}>Privacy Policy</h1>
      <div style={{ color: 'var(--text-gray)', lineHeight: 1.8, fontSize: '0.95rem' }}>
        <p style={{ marginBottom: '1rem' }}>Last updated: May 2026</p>
        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>1. Information We Collect</h2>
        <p style={{ marginBottom: '1.5rem' }}>We collect information you provide directly, including email addresses, names, and API usage data.</p>
        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>2. How We Use Your Information</h2>
        <p style={{ marginBottom: '1.5rem' }}>We use your information to provide and improve our services, process payments, and communicate with you about your account.</p>
        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>3. Data Security</h2>
        <p style={{ marginBottom: '1.5rem' }}>We implement appropriate security measures to protect your personal information from unauthorized access or disclosure.</p>
        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>4. Contact Us</h2>
        <p>For privacy-related questions, contact us at privacy@llmrpc.com</p>
      </div>
    </div>
  )
}