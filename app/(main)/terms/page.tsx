export default function TermsPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '6rem 2rem 3rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '2rem' }}>Terms of Service</h1>
      <div style={{ color: 'var(--text-gray)', lineHeight: 1.8, fontSize: '0.95rem' }}>
        <p style={{ marginBottom: '1rem' }}>Last updated: May 2026</p>
        <p style={{ marginBottom: '1.5rem' }}>By using LLMRpc, you agree to the following terms. Please read them carefully before using our service.</p>
        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>1. Acceptance of Terms</h2>
        <p style={{ marginBottom: '1.5rem' }}>By accessing or using LLMRpc, you agree to be bound by these Terms of Service.</p>
        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>2. Use of Service</h2>
        <p style={{ marginBottom: '1.5rem' }}>You may use our API service solely for lawful purposes. You agree not to misuse our services or use them for any illegal activities.</p>
        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>3. API Usage</h2>
        <p style={{ marginBottom: '1.5rem' }}>You are responsible for maintaining the confidentiality of your API keys. Usage is billed according to the credits in your account.</p>
        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>4. Limitation of Liability</h2>
        <p>LLMRpc is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages.</p>
      </div>
    </div>
  )
}