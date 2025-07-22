import crypto from 'crypto';

// Constants for encryption
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

export function generateMasterKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function deriveKey(
  phoneNumber: string,
  otp: string,
  masterKey: string
): Uint8Array {
  const salt = new Uint8Array(
    crypto.createHash('sha256').update(phoneNumber).digest()
  );

  return new Uint8Array(
    crypto.pbkdf2Sync(
      `${otp}${masterKey}`,
      salt,
      100000, // Number of iterations
      KEY_LENGTH,
      'sha256'
    )
  );
}

export function encrypt(text: string | number, key: Uint8Array): string {
  // Generate IV
  const iv = new Uint8Array(crypto.randomBytes(IV_LENGTH));

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Convert number to string if needed
  const textToEncrypt = typeof text === 'number' ? text.toString() : text;

  // Encrypt
  let encrypted = cipher.update(textToEncrypt, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Get auth tag
  const authTag = cipher.getAuthTag();

  // Combine IV, encrypted text, and auth tag
  const combined = new Uint8Array(
    iv.length + authTag.length + Buffer.from(encrypted, 'hex').length
  );
  combined.set(iv);
  combined.set(new Uint8Array(authTag), iv.length);
  combined.set(
    new Uint8Array(Buffer.from(encrypted, 'hex')),
    iv.length + authTag.length
  );

  return Buffer.from(combined).toString('base64');
}

export function decrypt(encryptedData: string, key: Uint8Array): string {
  // Convert from base64
  const data = new Uint8Array(Buffer.from(encryptedData, 'base64'));

  // Extract IV, auth tag, and encrypted text
  const iv = data.slice(0, IV_LENGTH);
  const authTag = data.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = data.slice(IV_LENGTH + AUTH_TAG_LENGTH);

  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(new Uint8Array(authTag));

  // Decrypt
  const decrypted = Buffer.concat([
    new Uint8Array(decipher.update(new Uint8Array(encrypted))),
    new Uint8Array(decipher.final())
  ]);

  return decrypted.toString('utf8');
}

export function encryptField(
  value: string | number | null,
  key: Uint8Array
): string | null {
  if (value === null) return null;
  return encrypt(value, key);
}

export function decryptField(
  value: string | null,
  key: Uint8Array
): string | null {
  if (value === null) return null;
  return decrypt(value, key);
}

export function generatePermanentKey(): Uint8Array {
  const buffer = crypto.randomBytes(KEY_LENGTH);
  return new Uint8Array(buffer);
}

export function encryptPermanentKey(
  key: Uint8Array,
  masterKey: string
): string {
  const iv = new Uint8Array(crypto.randomBytes(12));
  const masterKeyBuffer = new Uint8Array(Buffer.from(masterKey, 'hex'));
  const cipher = crypto.createCipheriv('aes-256-gcm', masterKeyBuffer, iv);
  const encrypted = cipher.update(key);
  const final = cipher.final();
  const authTag = cipher.getAuthTag();

  // Create a new Uint8Array with the total length
  const result = new Uint8Array(
    iv.length + authTag.length + encrypted.length + final.length
  );
  result.set(iv);
  result.set(authTag, iv.length);
  result.set(encrypted, iv.length + authTag.length);
  result.set(final, iv.length + authTag.length + encrypted.length);

  return Buffer.from(result).toString('base64');
}

export function decryptPermanentKey(
  encryptedKey: string,
  masterKey: string
): Uint8Array {
  const buffer = Buffer.from(encryptedKey, 'base64');
  const iv = new Uint8Array(buffer.slice(0, 12));
  const authTag = new Uint8Array(buffer.slice(12, 28));
  const encrypted = new Uint8Array(buffer.slice(28));
  const masterKeyBuffer = new Uint8Array(Buffer.from(masterKey, 'hex'));

  const decipher = crypto.createDecipheriv('aes-256-gcm', masterKeyBuffer, iv);
  decipher.setAuthTag(authTag);

  const decrypted = decipher.update(encrypted);
  const final = decipher.final();

  const result = new Uint8Array(decrypted.length + final.length);
  result.set(decrypted);
  result.set(final, decrypted.length);

  return result;
}

export function encryptRecoveryKey(
  key: string,
  permanentKey: Uint8Array
): string {
  const iv = new Uint8Array(crypto.randomBytes(12));
  const cipher = crypto.createCipheriv('aes-256-gcm', permanentKey, iv);
  const encrypted = cipher.update(key, 'utf8');
  const final = cipher.final();
  const authTag = cipher.getAuthTag();

  // Create a new Uint8Array with the total length
  const result = new Uint8Array(
    iv.length + authTag.length + encrypted.length + final.length
  );
  result.set(iv);
  result.set(authTag, iv.length);
  result.set(encrypted, iv.length + authTag.length);
  result.set(final, iv.length + authTag.length + encrypted.length);

  return Buffer.from(result).toString('base64');
}

export function decryptRecoveryKey(
  encryptedKey: string,
  permanentKey: Uint8Array
): string {
  const buffer = Buffer.from(encryptedKey, 'base64');
  const iv = new Uint8Array(buffer.slice(0, 12));
  const authTag = new Uint8Array(buffer.slice(12, 28));
  const encrypted = new Uint8Array(buffer.slice(28));

  const decipher = crypto.createDecipheriv('aes-256-gcm', permanentKey, iv);
  decipher.setAuthTag(authTag);

  const decrypted = decipher.update(encrypted);
  const final = decipher.final();

  // Create a new Uint8Array with the total length
  const result = new Uint8Array(decrypted.length + final.length);
  result.set(decrypted);
  result.set(final, decrypted.length);

  return Buffer.from(result).toString('utf8');
}

export function generateRecoveryKey(): string {
  const randomBytes = crypto.randomBytes(32); // 256 bits
  return randomBytes.toString('hex');
}
