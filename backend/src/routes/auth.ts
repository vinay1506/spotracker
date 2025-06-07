import express, { Request, Response } from 'express';
import axios from 'axios';
import querystring from 'querystring';
import { SpotifyTokens, SpotifyUser } from '../types';

const router = express.Router();

// Spotify API endpoints
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// Generate random string for state parameter
const generateRandomString = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Login route
router.get('/login', (req: Request, res: Response) => {
  const state = generateRandomString(16);
  const scope = 'user-read-private user-read-email user-top-read user-read-recently-played';

  // Store state and redirect URI in session
  req.session.state = state;
  req.session.redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  // Log session data for debugging
  console.log('Session data:', {
    state: req.session.state,
    redirectUri: req.session.redirectUri,
    sessionID: req.sessionID
  });

  // Log environment variables for debugging
  console.log('Environment variables:', {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    nodeEnv: process.env.NODE_ENV
  });

  // Construct authorization URL
  const authUrl = new URL(SPOTIFY_AUTH_URL);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', process.env.SPOTIFY_CLIENT_ID || '');
  authUrl.searchParams.append('scope', scope);
  authUrl.searchParams.append('redirect_uri', req.session.redirectUri || '');
  authUrl.searchParams.append('state', state);

  res.redirect(authUrl.toString());
});

// Callback route
router.get('/callback', async (req: Request, res: Response) => {
  const { code, state } = req.query;
  const storedState = req.session.state;

  if (!state || !storedState || state !== storedState) {
    console.error('State mismatch:', { received: state, stored: storedState });
    return res.status(400).json({ error: 'State mismatch' });
  }

  try {
    const tokenResponse = await axios.post(
      SPOTIFY_TOKEN_URL,
      querystring.stringify({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: req.session.redirectUri
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`
        }
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Store tokens in session
    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;
    req.session.tokenExpiry = Date.now() + expires_in * 1000;

    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Failed to exchange code for token' });
  }
});

// Refresh token route
router.post('/refresh', async (req: Request, res: Response) => {
  const refreshToken = req.session.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token available' });
  }

  try {
    const response = await axios.post(
      SPOTIFY_TOKEN_URL,
      querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`
        }
      }
    );

    const { access_token, expires_in } = response.data;

    // Update session with new access token
    req.session.accessToken = access_token;
    req.session.tokenExpiry = Date.now() + expires_in * 1000;

    res.json({ access_token, expires_in });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Logout route
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Check auth status route
router.get('/status', (req: Request, res: Response) => {
  const isAuthenticated = !!req.session.accessToken;
  const tokenExpiry = req.session.tokenExpiry;
  const needsRefresh = tokenExpiry ? Date.now() >= tokenExpiry : true;

  res.json({
    isAuthenticated,
    needsRefresh,
    hasSession: !!req.session,
    sessionID: req.sessionID
  });
});

export default router;
