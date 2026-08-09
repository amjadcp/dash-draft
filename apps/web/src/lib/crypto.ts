/**
 * WebCrypto Security Module for DashDraft Browser Client (`apps/web`)
 * Enforces payload confidentiality via AES-GCM (256-bit).
 * Key never leaves the browser; relay receives ciphertext only.
 */

export interface EncryptedPayloadFrame {
  ciphertext: string; // Base64 encoded payload
  iv: string; // Base64 encoded Initialization Vector (12 bytes)
}

export async function generateSessionKey(): Promise<CryptoKey> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('WebCrypto API is not supported in this environment');
  }

  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function exportKeyToBase64(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return bufferToBase64(new Uint8Array(exported));
}

export async function importKeyFromBase64(base64Key: string): Promise<CryptoKey> {
  const keyBuffer = base64ToBuffer(base64Key);
  return await window.crypto.subtle.importKey(
    'raw',
    keyBuffer.buffer as ArrayBuffer,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptPayload(
  key: CryptoKey,
  plaintext: string
): Promise<EncryptedPayloadFrame> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    data
  );

  return {
    ciphertext: bufferToBase64(new Uint8Array(encryptedBuffer)),
    iv: bufferToBase64(iv),
  };
}

export async function decryptPayload(
  key: CryptoKey,
  frame: EncryptedPayloadFrame
): Promise<string> {
  const ciphertextBuffer = base64ToBuffer(frame.ciphertext);
  const ivBuffer = base64ToBuffer(frame.iv);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer.buffer as ArrayBuffer,
    },
    key,
    ciphertextBuffer.buffer as ArrayBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

function bufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.byteLength; i++) {
    const byte = buffer[i];
    if (byte !== undefined) {
      binary += String.fromCharCode(byte);
    }
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
