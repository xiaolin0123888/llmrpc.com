const fs = require('fs');
const path = require('path');
const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const m = line.match(/^([A-Z_]+)="(.+)"$/);
  if (m) env[m[1]] = m[2];
});

const BASE = env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
const auth = Buffer.from(env.PAYPAL_CLIENT_ID + ':' + env.PAYPAL_CLIENT_SECRET).toString('base64');

async function ppFetch(p, method, body) {
  const tokenRes = await fetch(BASE + '/v1/oauth2/token', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + auth, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const { access_token } = await tokenRes.json();
  const opts = { method, headers: { Authorization: 'Bearer ' + access_token, 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + p, opts);
  return res.json();
}

async function main() {
  // List all webhooks
  const data = await ppFetch('/v1/notifications/webhooks', 'GET');
  console.log(JSON.stringify(data, null, 2));
}
main();
