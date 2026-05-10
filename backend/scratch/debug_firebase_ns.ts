import * as admin from 'firebase-admin';
console.log('admin:', !!admin);
console.log('admin.credential:', !!admin?.credential);
if (admin?.credential) {
    console.log('admin.credential.cert:', !!admin.credential.cert);
} else {
    // Check if it's in the default property
    const defaultAdmin = (admin as any).default;
    console.log('admin.default:', !!defaultAdmin);
    console.log('admin.default.credential:', !!defaultAdmin?.credential);
}
