export default function RefundPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '6rem 2rem 3rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '2rem' }}>
        Refund Policy
      </h1>
      <div style={{ color: 'var(--text-gray)', lineHeight: 1.8, fontSize: '0.95rem' }}>
        <p style={{ marginBottom: '1rem' }}>Last updated: July 2026</p>

        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          1. Credit Purchases — Non-Refundable
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          All one-time credit purchases are <strong>final and non-refundable</strong>. Credits are
          immediately available for use and consume upstream API resources with real costs on our side.
          Once purchased, credits cannot be refunded under any circumstances, including partial or
          zero usage.
        </p>

        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          2. Subscriptions
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Subscription payments are non-refundable except in cases of confirmed service outage
          exceeding 48 consecutive hours, or technical issues confirmed by our team that prevent
          you from using the Service for the majority of the billing period.
        </p>
        <p style={{ marginBottom: '1.5rem' }}>
          Subscription refunds are handled on a case-by-case basis and, if approved, apply
          only to the most recent billing period.
        </p>

        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          3. Non-Refundable Cases
        </h2>
        <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
          <li>All credit (one-time) purchases — no exceptions.</li>
          <li>Partial usage of a subscription billing period.</li>
          <li>User error, including incorrect API key usage or misuse of the Service.</li>
          <li>Termination of account due to violation of Terms of Service.</li>
        </ul>

        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          4. Contact
        </h2>
        <p>
          For subscription-related refund inquiries, contact us at support@llmrpc.com with your
          account details and reason for the request. We will review your case within 3–5
          business days. Credit purchase refund requests will not be considered.
        </p>
      </div>
    </div>
  )
}