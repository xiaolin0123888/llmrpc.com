const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const m = line.match(/^([A-Z_]+)="(.+)"$/);
  if (m) env[m[1]] = m[2];
});

const CLIENT_ID = env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = env.PAYPAL_CLIENT_SECRET;
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
  // Check if product already exists
  console.log('Listing existing products...');
  const existing = await ppFetch('/v1/catalogs/products?page_size=20', 'GET');
  let product = existing?.products?.find(p => p.name === 'LLMRpc Monthly Plan');
  
  if (product) {
    console.log('Product exists:', product.id);
  } else {
    console.log('Creating product...');
    product = await ppFetch('/v1/catalogs/products', 'POST', {
      name: 'LLMRpc Monthly Plan',
      type: 'SERVICE',
      category: 'SOFTWARE',
      description: 'Monthly AI API access subscription',
    });
    if (!product) { console.log('Product creation failed'); return; }
    console.log('Product ID:', product.id);
  }

  // List existing plans to avoid duplicates
  console.log('\nListing existing plans...');
  const plansRes = await ppFetch('/v1/billing/plans?product_id=' + product.id + '&page_size=20', 'GET');
  const existingPlanNames = (plansRes?.plans || []).map(p => p.name);

  const tiers = [
    { name: 'LLMRpc Basic', env: 'PAYPAL_PLAN_BASIC', price: '9.99' },
    { name: 'LLMRpc Pro', env: 'PAYPAL_PLAN_PRO', price: '49.00' },
    { name: 'LLMRpc Enterprise', env: 'PAYPAL_PLAN_ENTERPRISE', price: '99.00' },
    { name: 'LLMRpc Unlimited', env: 'PAYPAL_PLAN_UNLIMITED', price: '199.00' },
  ];

  console.log('');
  const planIds = {};
  for (const tier of tiers) {
    if (existingPlanNames.includes(tier.name)) {
      const existingPlan = (plansRes?.plans || []).find(p => p.name === tier.name);
      console.log(tier.name + ': exists ' + existingPlan.id + ' (status: ' + existingPlan.status + ')');
      planIds[tier.env] = existingPlan.id;
      continue;
    }

    console.log('Creating plan: ' + tier.name + ' ($' + tier.price + ')');
    const plan = await ppFetch('/v1/billing/plans', 'POST', {
      product_id: product.id,
      name: tier.name,
      status: 'ACTIVE',
      billing_cycles: [{
        frequency: { interval_unit: 'MONTH', interval_count: 1 },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0,
        pricing_scheme: { fixed_price: { value: tier.price, currency_code: 'USD' } },
      }],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CANCEL',
        payment_failure_threshold: 3,
      },
    });
    if (plan) {
      console.log('  Plan ID: ' + plan.id + '  Status: ' + plan.status);
      planIds[tier.env] = plan.id;
    }
  }

  console.log('\n=== Add to .env.local ===');
  for (const [key, val] of Object.entries(planIds)) {
    console.log(key + '=' + val);
  }
}

main().catch(console.error);
