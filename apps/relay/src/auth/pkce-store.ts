import crypto from 'node:crypto';

export interface AuthorizationCodeEntry {
  code: string;
  clientId: string;
  redirectUri: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
  expiresAt: number;
}

const authCodeStore = new Map<string, AuthorizationCodeEntry>();
const accessTokenStore = new Map<string, { clientId: string; expiresAt: number }>();

export function createAuthorizationCode(
  clientId: string,
  redirectUri: string,
  codeChallenge?: string,
  codeChallengeMethod?: string
): string {
  const code = `code_${crypto.randomBytes(16).toString('hex')}`;
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

  authCodeStore.set(code, {
    code,
    clientId,
    redirectUri,
    codeChallenge,
    codeChallengeMethod,
    expiresAt,
  });

  return code;
}

export function consumeAuthorizationCode(
  code: string,
  clientId: string,
  redirectUri: string,
  codeVerifier?: string
): boolean {
  const entry = authCodeStore.get(code);
  if (!entry) return false;

  // Code can only be used once
  authCodeStore.delete(code);

  if (Date.now() > entry.expiresAt) return false;
  if (entry.clientId !== clientId || entry.redirectUri !== redirectUri) return false;

  if (entry.codeChallenge) {
    if (!codeVerifier) return false;
    // Standard SHA256 PKCE verification
    const calculatedChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    if (calculatedChallenge !== entry.codeChallenge) return false;
  }

  return true;
}

export function issueAccessToken(clientId: string): { accessToken: string; expiresIn: number } {
  const accessToken = `dd_at_${crypto.randomBytes(24).toString('hex')}`;
  const expiresIn = 3600; // 1 hour
  accessTokenStore.set(accessToken, {
    clientId,
    expiresAt: Date.now() + expiresIn * 1000,
  });
  return { accessToken, expiresIn };
}

export function verifyAccessToken(token: string): boolean {
  const entry = accessTokenStore.get(token);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    accessTokenStore.delete(token);
    return false;
  }
  return true;
}

export function revokeClientTokens(clientId: string): void {
  for (const [token, entry] of accessTokenStore.entries()) {
    if (entry.clientId === clientId) {
      accessTokenStore.delete(token);
    }
  }
}
