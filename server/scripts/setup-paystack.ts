import 'dotenv/config';
import axios from 'axios';

const secretKey = process.env.PAYSTACK_SECRET_KEY;
const publicKey = process.env.PAYSTACK_PUBLIC_KEY;

if (!secretKey?.startsWith('sk_test_') || !publicKey?.startsWith('pk_test_')) {
  console.error('Set valid PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY test values in server/.env first.');
  process.exit(1);
}

async function main() {
  try {
    const response = await axios.get('https://api.paystack.co/transaction?perPage=1', {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    if (!response.data.status) throw new Error('Paystack did not accept the configured key.');
    console.log('Paystack test credentials are valid. Restart the API before testing donations.');
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    console.error(status === 401
      ? 'Paystack rejected the test secret key. Replace it in server/.env and retry.'
      : 'Could not validate Paystack credentials. Check the key and network connection.');
    process.exitCode = 1;
  }
}

void main();
