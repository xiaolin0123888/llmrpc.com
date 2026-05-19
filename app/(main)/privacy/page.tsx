export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Privacy Policy</h1>
      <p style={{ color: 'var(--text-gray)', fontSize: '0.88rem', marginBottom: '2.5rem' }}>Last updated: May 2026</p>

      <div style={{ lineHeight: 1.8, color: 'var(--text-gray)' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-dark)', margin: '2rem 0 0.8rem' }}>1. Introduction</h2>
        <p style={{ fontSize: '0.92rem', marginBottom: '1rem' }}>LLMRpc (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the website LLMRpc.com (the &quot;Service&quot;). This page informs you of our policies regarding the collection, use, and disclosure of personal information when you use our Service.</p>

        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-dark)', margin: '2rem 0 0.8rem' }}>2. Information We Collect</h2>
        <ul style={{ fontSize: '0.92rem', marginBottom: '1rem', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Account information: email address, API key, and subscription plan details.</li>
          <li style={{ marginBottom: '0.5rem' }}>Usage data: API request logs, token consumption, and plan usage statistics.</li>
          <li style={{ marginBottom: '0.5rem' }}>Payment information: processed securely via third-party payment providers; we do not store full payment card details.</li>
        </ul>

        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-dark)', margin: '2rem 0 0.8rem' }}>3. How We Use Your Information</h2>
        <p style={{ fontSize: '0.92rem', marginBottom: '1rem' }}>We use your data to provide and maintain the Service, process payments, send service-related notifications, and improve our platform performance.</p>

        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-dark)', margin: '2rem 0 0.8rem' }}>4. Data Security</h2>
        <p style={{ fontSize: '0.92rem', marginBottom: '1rem' }}>We take reasonable security measures to protect your personal data. However, no method of transmission over the internet is 100% secure.</p>

        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-dark)', margin: '2rem 0 0.8rem' }}>5. Third-Party Services</h2>
        <p style={{ fontSize: '0.92rem', marginBottom: '1rem' }}>Our Service may contain links to third-party sites. We have no control over their privacy policies.</p>

        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-dark)', margin: '2rem 0 0.8rem' }}>6. Contact Us</h2>
        <p style={{ fontSize: '0.92rem' }}>If you have questions about this Privacy Policy, please contact us at <a href="mailto:xfyy688@gmail.com" style={{ color: 'var(--primary)' }}>xfyy688@gmail.com</a></p>
      </div>
    </div>
  )
}
