import { encrypt, decrypt } from './encryption';

export type EncryptedModel<T> = {
  [K in keyof T]: T[K];
};

export function encryptModel<T extends object>(
  model: T,
  encryptionKey: Uint8Array
): EncryptedModel<T> {
  const encryptedModel: Partial<T> = {};

  for (const [key, value] of Object.entries(model)) {
    if (typeof value === 'string' || typeof value === 'number') {
      encryptedModel[key as keyof T] = encrypt(
        value.toString(),
        encryptionKey
      ) as T[keyof T];
    } else {
      encryptedModel[key as keyof T] = value as T[keyof T];
    }
  }

  return encryptedModel as EncryptedModel<T>;
}

export function decryptModel<T extends object>(
  model: T,
  encryptionKey: Uint8Array
): EncryptedModel<T> {
  const decryptedModel: Partial<T> = {};

  for (const [key, value] of Object.entries(model)) {
    if (typeof value === 'string') {
      decryptedModel[key as keyof T] = decrypt(
        value,
        encryptionKey
      ) as T[keyof T];
    } else {
      decryptedModel[key as keyof T] = value as T[keyof T];
    }
  }

  return decryptedModel as EncryptedModel<T>;
}

export function encryptInclude<T extends Record<string, any>>(
  data: T[],
  key: Uint8Array
): T[] {
  return data.map((item) => encryptModel(item, key));
}

export function decryptInclude<T extends Record<string, any>>(
  data: T[],
  key: Uint8Array
): T[] {
  return data.map((item) => decryptModel(item, key));
}
