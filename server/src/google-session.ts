import { randomBytes } from 'crypto';
import type { Request, Response } from 'express';
import { Redis } from '@upstash/redis';
import { createGoogleOAuthClient } from './google';

const SESSION_COOKIE = 'atrades_google_session';
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const OAUTH_STATE_TTL_SECONDS = 10 * 60;
type GoogleTokens = Parameters<ReturnType<typeof createGoogleOAuthClient>['setCredentials']>[0];
type GoogleSession = { tokens: GoogleTokens; email: string };
type PendingAuthorization = { sessionId: string };

const memorySessions = new Map<string, GoogleSession>();
const memoryStates = new Map<string, PendingAuthorization>();
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? Redis.fromEnv()
  : undefined;

const sessionKey = (id: string) => `google-session:${id}`;
const stateKey = (state: string) => `google-oauth-state:${state}`;

const getSessionId = (req: Request): string | undefined => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;
  const cookies = Object.fromEntries(cookieHeader.split(';').flatMap(cookie => {
    const separatorIndex = cookie.indexOf('=');
    if (separatorIndex === -1) return [];
    return [[cookie.slice(0, separatorIndex).trim(), decodeURIComponent(cookie.slice(separatorIndex + 1).trim())]];
  }));
  return cookies[SESSION_COOKIE];
};

export const setGoogleSessionCookie = (res: Response, sessionId: string): void => {
  const isDeployed = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  res.cookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: isDeployed ? 'none' : 'lax',
    secure: isDeployed,
    maxAge: SESSION_TTL_SECONDS * 1000,
    path: '/',
  });
};

export const getOrCreateGoogleSessionId = (req: Request, res: Response): string => {
  const existingSessionId = getSessionId(req);
  if (existingSessionId) return existingSessionId;
  const sessionId = randomBytes(32).toString('hex');
  setGoogleSessionCookie(res, sessionId);
  return sessionId;
};

export const savePendingGoogleAuthorization = async (
  state: string,
  pending: PendingAuthorization
): Promise<void> => {
  if (redis) {
    await redis.set(stateKey(state), pending, { ex: OAUTH_STATE_TTL_SECONDS });
    return;
  }
  memoryStates.set(state, pending);
  setTimeout(() => memoryStates.delete(state), OAUTH_STATE_TTL_SECONDS * 1000).unref();
};

export const consumePendingGoogleAuthorization = async (
  state: string
): Promise<PendingAuthorization | undefined> => {
  if (redis) {
    const pending = await redis.getdel<PendingAuthorization>(stateKey(state));
    return pending ?? undefined;
  }
  const pending = memoryStates.get(state);
  memoryStates.delete(state);
  return pending;
};

export const saveGoogleSession = async (
  sessionId: string,
  session: GoogleSession
): Promise<void> => {
  if (redis) {
    await redis.set(sessionKey(sessionId), session, { ex: SESSION_TTL_SECONDS });
    return;
  }
  memorySessions.set(sessionId, session);
};

export const getGoogleSession = async (req: Request): Promise<GoogleSession | undefined> => {
  const sessionId = getSessionId(req);
  if (!sessionId) return undefined;
  if (redis) return (await redis.get<GoogleSession>(sessionKey(sessionId))) ?? undefined;
  return memorySessions.get(sessionId);
};

export const deleteGoogleSession = async (req: Request, res: Response): Promise<void> => {
  const sessionId = getSessionId(req);
  if (sessionId && redis) await redis.del(sessionKey(sessionId));
  if (sessionId) memorySessions.delete(sessionId);
  res.clearCookie(SESSION_COOKIE, { path: '/' });
};

export const getAuthorizedGoogleClient = async (req: Request) => {
  const sessionId = getSessionId(req);
  const session = await getGoogleSession(req);
  if (!session || !sessionId) return undefined;
  const oauthClient = createGoogleOAuthClient();
  oauthClient.setCredentials(session.tokens);
  oauthClient.on('tokens', refreshedTokens => {
    void saveGoogleSession(sessionId, {
      ...session,
      tokens: { ...session.tokens, ...refreshedTokens },
    });
  });
  return oauthClient;
};
