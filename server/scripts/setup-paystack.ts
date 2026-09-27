import fs from 'fs';
import path from 'path';

// Usage: npm run setup:paystack -- sk_test_xxx pk_test_xxx
const [secretKey, publicKey] = process.argv.slice(2);

if (!secretKey || !publicKey) {
  console.error('Usage: npm run setup:paystack -- <sk_test_...> <pk_test_...>');
  console.error('Get both keys from dashboard.paystack.com -> Settings -> API Keys & Webhooks');
  process.exit(1);
}

if (!secretKey.startsWith('sk_test_')) {
  console.error('ERROR: secret key must start with sk_test_ (use TEST keys, not live ones!)');
  process.exit(1);
}
if (!publicKey.startsWith('pk_test_')) {
  console.error('ERROR: public key must start with pk_test_');
  process.exit(1);
}

async function main() {
  // 1. Validate the secret key against the real Paystack API before saving anything.
  console.log('Validating keys with Paystack...');
  const res = await fetch('https://api.paystack.co/transaction?perPage=1', {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const json = (await res.json()) as { status: boolean; message?: string };

  if (!json.status) {
    console.error(`ERROR: Paystack rejected the secret key: ${json.message ?? res.status}`);
    console.error('Double-check you copied the full "Secret key" from the Test tab of API Keys & Webhooks.');
    process.exit(1);
  }
  console.log('✓ Secret key is valid');

  // 2. Write both keys into the root .env.
  const envPath = path.resolve(__dirname, '../../.env');
  let env = fs.readFileSync(envPath, 'utf-8');
  env = env.replace(/^PAYSTACK_SECRET_KEY=.*$/m, `PAYSTACK_SECRET_KEY=${secretKey}`);
  env = env.replace(/^PAYSTACK_PUBLIC_KEY=.*$/m, `PAYSTACK_PUBLIC_KEY=${publicKey}`);
  fs.writeFileSync(envPath, env);

  console.log('✓ Keys written to .env');
  console.log('  Next: restart the API (npm run dev:server), then donate with test card 4084 0840 8408 4081');
}

main().catch((e) => {
  console.error('Validation request failed:', e.message);
  process.exit(1);
});
