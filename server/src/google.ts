import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

export const GOOGLE_SCOPES = ['openid', 'email', 'https://www.googleapis.com/auth/spreadsheets'];

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required ${name} environment variable.`);
  return value;
};

export const createGoogleOAuthClient = () => new google.auth.OAuth2(
  getRequiredEnv('GOOGLE_CLIENT_ID'),
  getRequiredEnv('GOOGLE_CLIENT_SECRET'),
  getRequiredEnv('GOOGLE_REDIRECT_URI')
);

export const GOOGLE_CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';
