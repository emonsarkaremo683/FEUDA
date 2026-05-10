import dotenv from 'dotenv';
dotenv.config();
console.log('Value:', process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
try {
    const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '');
    console.log('Parsed private_key snippet:', parsed.private_key?.substring(0, 50));
    console.log('Contains newline character:', parsed.private_key?.includes('\n'));
} catch (e) {
    console.error('Parse Error:', e.message);
}
