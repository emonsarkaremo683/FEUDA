import dotenv from 'dotenv';
dotenv.config();
try {
    const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '');
    const key = parsed.private_key;
    console.log('Key length:', key.length);
    console.log('Key ends with newline:', key.endsWith('\n'));
    console.log('Number of lines:', key.split('\n').length);
    // Check if there are any literal backslashes followed by n
    console.log('Contains literal \\\\n:', key.includes('\\n'));
} catch (e) {
    console.error('Parse Error:', e.message);
}
