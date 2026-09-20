import { randomBytes } from 'crypto';
import type { Request, Response } from 'express';
import { google } from 'googleapis';
import { GOOGLE_CLIENT_URL, GOOGLE_SCOPES, createGoogleOAuthClient } from '../google';
import {
  consumePendingGoogleAuthorization,
  deleteGoogleSession,
  getGoogleSession,
  getOrCreateGoogleSessionId,
  savePendingGoogleAuthorization,
  saveGoogleSession,
  setGoogleSessionCookie,
} from '../google-session';
import type { GoogleAuthStatusResponse } from '../types/google-auth';

export const startGoogleAuthorization = async (req: Request, res: Response): Promise<void> => {
  const sessionId = getOrCreateGoogleSessionId(req, res);
  const state = randomBytes(32).toString('hex');
  await savePendingGoogleAuthorization(state, { sessionId });
  res.redirect(createGoogleOAuthClient().generateAuthUrl({
    access_type: 'offline', prompt: 'consent', scope: GOOGLE_SCOPES, state,
  }));
};

export const finishGoogleAuthorization = async (req: Request, res: Response): Promise<void> => {
  const code = typeof req.query.code === 'string' ? req.query.code : undefined;
  const state = typeof req.query.state === 'string' ? req.query.state : undefined;
  const pending = state ? await consumePendingGoogleAuthorization(state) : undefined;
  if (!code || !pending) {
    res.status(400).send('Invalid or expired Google authorization request.');
    return;
  }
  try {
    const oauthClient = createGoogleOAuthClient();
    const { tokens } = await oauthClient.getToken(code);
    oauthClient.setCredentials(tokens);
    const userInfo = await google.oauth2({ version: 'v2', auth: oauthClient }).userinfo.get();
    if (!userInfo.data.email) throw new Error('Google did not return an email address.');
    await saveGoogleSession(pending.sessionId, { tokens, email: userInfo.data.email });
    setGoogleSessionCookie(res, pending.sessionId);
    res.redirect(`${GOOGLE_CLIENT_URL}/?google=connected`);
  } catch (error) {
    console.error('Google authorization failed:', error);
    res.status(500).send('Google authorization failed. Please return to the app and try again.');
  }
};

export const getGoogleAuthorizationStatus = async (
  req: Request,
  res: Response<GoogleAuthStatusResponse>
): Promise<void> => {
  const session = await getGoogleSession(req);
  if (!session) {
    res.json({ connected: false });
    return;
  }
  res.json({ connected: true, email: session.email });
};

export const disconnectGoogle = async (req: Request, res: Response): Promise<void> => {
  await deleteGoogleSession(req, res);
  res.status(204).send();
};
