import admin from 'firebase-admin';
console.log('admin:', !!admin);
console.log('admin.credential:', !!admin?.credential);
if (admin?.credential) {
    console.log('admin.credential.cert:', !!admin.credential.cert);
}
