function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}
// We'll use the Web Crypto API for client-side encryption
export async function importKey(keyString: string): Promise<CryptoKey> {
  const keyData = hexToBytes(keyString);

  const importedKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );

  return importedKey;
}

export async function decrypt(
  encryptedData: string,
  key: CryptoKey
): Promise<string> {
  const data = Buffer.from(encryptedData, 'base64');

  // Extract IV (12 bytes), auth tag (16 bytes), and ciphertext
  const iv = data.subarray(0, 12);

  const authTag = data.subarray(12, 28);

  const ciphertext = data.subarray(28);

  const combined = new Uint8Array(ciphertext.length + authTag.length);
  combined.set(new Uint8Array(ciphertext), 0);
  combined.set(new Uint8Array(authTag), ciphertext.length);

  const decryptedData = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: 128, // 128 bits = 16 bytes
    },
    key,
    combined
  );

  return new TextDecoder().decode(decryptedData);
}

export async function decryptField(
  value: string | null,
  key: CryptoKey
): Promise<string | null> {
  if (value === null) return null;
  return decrypt(value, key);
}

// Helper to handle encrypted numbers
export async function decryptNumber(
  value: string | null,
  key: CryptoKey
): Promise<number | null> {
  if (value === null) return null;
  const decrypted = await decrypt(value, key);
  return parseFloat(decrypted);
}
