import type { Request, Response, NextFunction } from 'express';
import {
  OAuthTokenRequestSchema,
  OAuthTokenResponseSchema,
  createErrorEnvelope,
} from '@repo/mcp-contracts';
import {
  createAuthorizationCode,
  consumeAuthorizationCode,
  issueAccessToken,
  verifyAccessToken,
} from './pkce-store';
import { getEnv } from '../env';

export function handleAuthorize(req: Request, res: Response): void {
  const clientId = req.query['client_id'] as string;
  const redirectUri = req.query['redirect_uri'] as string;
  const responseType = req.query['response_type'] as string;
  const codeChallenge = req.query['code_challenge'] as string | undefined;
  const codeChallengeMethod = req.query['code_challenge_method'] as string | undefined;
  const state = req.query['state'] as string | undefined;

  if (!clientId || !redirectUri || responseType !== 'code') {
    res
      .status(400)
      .json(createErrorEnvelope('INVALID_INPUT', 'Missing or invalid authorize parameters'));
    return;
  }

  const code = createAuthorizationCode(clientId, redirectUri, codeChallenge, codeChallengeMethod);
  const redirectUrl = new URL(redirectUri);
  redirectUrl.searchParams.set('code', code);
  if (state) redirectUrl.searchParams.set('state', state);

  res.redirect(redirectUrl.toString());
}

export function handleToken(req: Request, res: Response): void {
  const parseResult = OAuthTokenRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json(createErrorEnvelope('INVALID_INPUT', 'Invalid token request format'));
    return;
  }

  const body = parseResult.data;

  if (body.grant_type === 'authorization_code') {
    const isValid = consumeAuthorizationCode(
      body.code,
      body.client_id,
      body.redirect_uri,
      body.code_verifier
    );
    if (!isValid) {
      res
        .status(400)
        .json(createErrorEnvelope('UNAUTHORIZED', 'Invalid or expired authorization code'));
      return;
    }
    const tokenData = issueAccessToken(body.client_id);
    const responseBody = OAuthTokenResponseSchema.parse({
      access_token: tokenData.accessToken,
      token_type: 'Bearer',
      expires_in: tokenData.expiresIn,
    });
    res.json(responseBody);
    return;
  }

  if (body.grant_type === 'client_credentials') {
    const env = getEnv();
    if (
      body.client_id !== env.RELAY_OAUTH_CLIENT_ID ||
      body.client_secret !== env.RELAY_OAUTH_CLIENT_SECRET
    ) {
      res.status(401).json(createErrorEnvelope('UNAUTHORIZED', 'Invalid client credentials'));
      return;
    }
    const tokenData = issueAccessToken(body.client_id);
    const responseBody = OAuthTokenResponseSchema.parse({
      access_token: tokenData.accessToken,
      token_type: 'Bearer',
      expires_in: tokenData.expiresIn,
    });
    res.json(responseBody);
    return;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res
      .status(401)
      .json(createErrorEnvelope('UNAUTHORIZED', 'Missing or malformed Authorization header'));
    return;
  }

  const token = authHeader.substring(7);
  if (!verifyAccessToken(token)) {
    res.status(401).json(createErrorEnvelope('UNAUTHORIZED', 'Invalid or expired Bearer token'));
    return;
  }

  next();
}
