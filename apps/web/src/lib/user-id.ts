const USER_ID_KEY = 'dashdraft_user_id';
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';

export function generateNanoid(size: number = 21): string {
  const bytes = new Uint8Array(size);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < size; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  let id = '';
  for (let i = 0; i < size; i++) {
    const byte = bytes[i];
    if (byte !== undefined) {
      id += ALPHABET[byte % ALPHABET.length];
    }
  }
  return id;
}

export function getStoredUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_ID_KEY);
}

export function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return generateNanoid(21);
  const existing = localStorage.getItem(USER_ID_KEY);
  if (existing) return existing;

  const newId = generateNanoid(21);
  localStorage.setItem(USER_ID_KEY, newId);
  return newId;
}

export function setStoredUserId(userId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_ID_KEY, userId);
}
