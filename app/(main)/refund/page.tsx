export default function RefundPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Refund Policy</h1>
      <p style={{ color: 'var(--text-gray)', fontSize: '0.88rem', marginBottom: '2.5rem' }}>Last updated: May 2026</p>

      <div style={{ lineHeight: 1.8 }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-dark)', margin: '2rem 0 0.8rem' }}>1. Eligibility</h2>
        <p style={{ color: 'var(--text-gray)', fontSize: '0.92rem', marginBottom: '0.8rem' }}>Refunds may be considered under the following conditions:</p>
        <ul style={{ color: 'var(--text-gray)', fontSize: '0.92rem', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Service downtime exceeding 48 consecutive hours affecting your entire subscription period.</li>
          <li style={{ marginBottom: '0.5rem' }}>Technical issues confirmed by our team that prevent you from using the Service.</li>
        </ul>

        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-dark)', margin: '2rem 0 0.8rem' }}>2. Non-Refundable Cases</h2>
        <p style={{ color: 'var(--text-gray)', fontSize: '0.92rem', marginBottom: '0.8rem' }}>Subscriptions are non-refundable in the following situations:</p>
        <ul style={{ color: 'var(--text-gray)', fontSize: '0.92rem', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Partial usage of the token quota, even if unused.</li>
          <li style={{ marginBottom: '0.5rem' }}>User error, including but not limited to incorrect API key usage or misuse of the Service.</li>
          <li style={{ marginBottom: '0.5rem' }}>Termination of account due to violation of Terms of Service.</li>
        </ul>

        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-dark)', margin: '2rem 0 0.8rem' }}>3. How to Request a Refund</h2>
        <p style={{ color: 'var(--text-gray)', fontSize: '0.92rem' }}>
          To request a refund, contact us at <a href="mailto:xfyy688@gmail.com" style={{ color: 'var(--primary)' }}>xfyy688@gmail.com</a> with your account details and reason for the request. We will review your case within 3–5 business days.
        </p>
      </div>
    </div>
  )
}
