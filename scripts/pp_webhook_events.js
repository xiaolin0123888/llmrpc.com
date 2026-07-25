const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const m = line.match(/^([A-Z_]+)="(.+)"$/);
  if (m) env[m[1]] = m[2];
});

const CLIENT_ID = env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = env.PAYPAL_CLIENT_SECRET;
const WEBHOOK_ID = env.PAYPAL_WEBHOOK_ID;
const BASE = env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function ppFetch(path, method, body) {
  const auth = Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64');
  const tokenRes = await fetch(BASE + '/v1/oauth2/token', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + auth, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const { access_token } = await tokenRes.json();
  const opts = { method, headers: { Authorization: 'Bearer ' + access_token, 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  const data = await res.json();
  if (!res.ok) { console.error('ERROR ' + path + ':', res.status, JSON.stringify(data)); return null; }
  return data;
}

async function main() {
  // List current webhook event types
  console.log('Current webhook events:');
  const existing = await ppFetch('/v1/notifications/webhooks/' + WEBHOOK_ID, 'GET');
  if (!existing) return;

  const currentEvents = new Set((existing.event_types || []).map(e => e.name));
  for (const evt of currentEvents) {
    console.log('  ' + evt);
  }

  // Subscription events we need
  const neededEvents = [
    { name: 'BILLING.SUBSCRIPTION.ACTIVATED' },
    { name: 'BILLING.SUBSCRIPTION.PAYMENT.COMPLETED' },
  ];

  const toAdd = neededEvents.filter(e => !currentEvents.has(e.name));
  
  if (toAdd.length === 0) {
    console.log('\nAll subscription events already registered.');
    return;
  }

  console.log('\nAdding events:');
  for (const evt of toAdd) {
    console.log('  Adding ' + evt.name + '...');
    const result = await ppFetch(
      '/v1/notifications/webhooks/' + WEBHOOK_ID + '/event-types',
      'POST',
      [evt]
    );
    if (result) console.log('    OK');
  }

  console.log('\nDone.');
}

main().catch(console.error);
