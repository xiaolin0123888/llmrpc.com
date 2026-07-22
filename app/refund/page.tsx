export default function RefundPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '6rem 2rem 3rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '2rem' }}>
        Refund Policy
      </h1>
      <div style={{ color: 'var(--text-gray)', lineHeight: 1.8, fontSize: '0.95rem' }}>
        <p style={{ marginBottom: '1rem' }}>Last updated: May 2026</p>

        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          1. Eligibility
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Refunds may be considered under the following conditions:
        </p>
        <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
          <li>
            Service downtime exceeding 48 consecutive hours affecting your entire subscription
            period.
          </li>
          <li>
            Technical issues confirmed by our team that prevent you from using the Service.
          </li>
        </ul>

        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          2. Non-Refundable Cases
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Subscriptions are non-refundable in the following situations:
        </p>
        <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
          <li>Partial usage of the token quota, even if unused.</li>
          <li>
            User error, including but not limited to incorrect API key usage or misuse of the
            Service.
          </li>
          <li>Termination of account due to violation of Terms of Service.</li>
        </ul>

        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          3. How to Request a Refund
        </h2>
        <p>
          To request a refund, contact us at support@llmrpc.com with your account details and reason
          for the request. We will review your case within 3&ndash;5 business days.
        </p>
      </div>
    </div>
  )
}
