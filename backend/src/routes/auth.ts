import express from 'express';
import axios from 'axios';
import querystring from 'querystring';
import { SpotifyTokens, SpotifyUser } from '../types';

const router = express.Router();

// Generate random string for state parameter
const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// Login route
router.get('/login', (req, res) => {
  try {
    // Log the full environment
    console.log('=== Login Route Environment ===');
    console.log('process.env keys:', Object.keys(process.env));
    console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID);
    console.log('SPOTIFY_REDIRECT_URI:', process.env.SPOTIFY_REDIRECT_URI);
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('============================');

    if (!process.env.SPOTIFY_CLIENT_ID) {
      const error = 'SPOTIFY_CLIENT_ID is not set in environment variables';
      console.error(error);
      console.error('Current working directory:', process.cwd());
      console.error('Environment file location:', require('path').resolve(process.cwd(), '.env'));
      return res.status(500).json({ 
        error: 'Server configuration error: Missing SPOTIFY_CLIENT_ID',
        details: {
          workingDirectory: process.cwd(),
          envFileLocation: require('path').resolve(process.cwd(), '.env'),
          envKeys: Object.keys(process.env)
        }
      });
    }

    if (!process.env.SPOTIFY_REDIRECT_URI) {
      console.error('SPOTIFY_REDIRECT_URI is not set in environment variables');
      return res.status(500).json({ error: 'Server configuration error: Missing SPOTIFY_REDIRECT_URI' });
    }

    const state = generateRandomString(16);
    req.session.state = state;

    const scope = [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'user-read-recently-played',
      'user-read-currently-playing',
      'user-read-playback-state'
    ].join(' ');

    const queryParams = querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      state
    });

    const authUrl = `https://accounts.spotify.com/authorize?${queryParams}`;
    console.log('Redirecting to Spotify auth URL:', authUrl);
    res.redirect(authUrl);
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Callback route
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    console.error('Spotify auth error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}?error=access_denied`);
  }

  if (state !== req.session.state) {
    console.error('State mismatch');
    return res.redirect(`${process.env.FRONTEND_URL}?error=state_mismatch`);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const tokens: SpotifyTokens = {
      ...tokenResponse.data,
      expires_at: Date.now() + (tokenResponse.data.expires_in * 1000)
    };

    // Get user profile
    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    });

    const user: SpotifyUser = userResponse.data;

    // Store in session
    req.session.tokens = tokens;
    req.session.user = user;

    console.log('User authenticated:', user.display_name);
    res.redirect(`${process.env.FRONTEND_URL}?success=true`);
  } catch (error) {
    console.error('Token exchange error:', error);
    res.redirect(`${process.env.FRONTEND_URL}?error=token_exchange_failed`);
  }
});

// Refresh token route
router.post('/refresh-token', async (req, res) => {
  if (!req.session?.tokens?.refresh_token) {
    return res.status(401).json({ error: 'No refresh token available' });
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: req.session.tokens.refresh_token,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const newTokens: SpotifyTokens = {
      ...req.session.tokens,
      ...response.data,
      expires_at: Date.now() + (response.data.expires_in * 1000)
    };

    req.session.tokens = newTokens;
    res.json({ success: true });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// Check auth status
router.get('/status', (req, res) => {
  if (req.session?.tokens?.access_token && req.session?.user) {
    res.json({
      authenticated: true,
      user: req.session.user
    });
  } else {
    res.json({ authenticated: false });
  }
});

export default router;
