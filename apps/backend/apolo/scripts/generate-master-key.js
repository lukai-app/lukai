const crypto = require('crypto');

// Generate a 32-byte (256-bit) key
const masterKey = crypto.randomBytes(32).toString('hex');

console.log('Generated Master Key:', masterKey);
console.log('\nCopy this key and add it to your .env file as ENCRYPTION_MASTER_KEY');
