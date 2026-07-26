import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs/promises';
import { authenticate } from '@google-cloud/local-auth';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function getOAuth2ClientFromEnv(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing required Google OAuth environment variables in .env file.');
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

async function loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
  try {
    const content = await fs.readFile(TOKEN_PATH, 'utf8');
    const tokenCredentials = JSON.parse(content);
    
    const oAuth2Client = getOAuth2ClientFromEnv();
    oAuth2Client.setCredentials(tokenCredentials);
    return oAuth2Client;
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client: OAuth2Client): Promise<void> {
  if (!client.credentials) return;
  
  await fs.writeFile(TOKEN_PATH, JSON.stringify(client.credentials, null, 2));
}

async function authorize(): Promise<OAuth2Client> {
  const client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }

  const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH;
  if (!credentialsPath) {
    throw new Error(
      'Missing GOOGLE_CREDENTIALS_PATH in .env. Set it to the path of your Google OAuth client JSON file.'
    );
  }

  const authorizedClient = await authenticate({
    scopes: SCOPES,
    keyfilePath: path.resolve(credentialsPath)
  });

  await saveCredentials(authorizedClient);
  return authorizedClient;
}

(async () => {
  try {
    const authClient = await authorize();
    console.log('Successfully Authenticated using Environment Variables!');
  } catch (error) {
    console.error('Authentication workflow failed:', error);
  }
})();
