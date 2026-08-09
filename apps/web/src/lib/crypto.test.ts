import { describe, expect, it } from 'vitest';
import {
  generateSessionKey,
  exportKeyToBase64,
  importKeyFromBase64,
  encryptPayload,
  decryptPayload,
} from './crypto';

describe('WebCrypto Module (apps/web/src/lib/crypto)', () => {
  it('generates a valid AES-GCM 256-bit key', async () => {
    const key = await generateSessionKey();
    expect(key.algorithm.name).toBe('AES-GCM');
    expect((key.algorithm as AesKeyAlgorithm).length).toBe(256);
  });

  it('exports and imports key losslessly via Base64', async () => {
    const originalKey = await generateSessionKey();
    const base64Key = await exportKeyToBase64(originalKey);
    expect(base64Key).toBeDefined();

    const importedKey = await importKeyFromBase64(base64Key);
    expect(importedKey.algorithm.name).toBe('AES-GCM');
  });

  it('encrypts plaintext into ciphertext/iv frame and decrypts back to original plaintext', async () => {
    const key = await generateSessionKey();
    const originalPlaintext = JSON.stringify({
      tool: 'query_database',
      sql: 'SELECT id, customer_name FROM sales WHERE amount > 500',
    });

    const encryptedFrame = await encryptPayload(key, originalPlaintext);
    expect(encryptedFrame.ciphertext).toBeDefined();
    expect(encryptedFrame.iv).toBeDefined();
    expect(encryptedFrame.ciphertext).not.toBe(originalPlaintext);

    const decryptedText = await decryptPayload(key, encryptedFrame);
    expect(decryptedText).toBe(originalPlaintext);
  });
});
