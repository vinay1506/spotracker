import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import apiRoutes from './routes/api';

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '..', '.env');
console.log('Loading environment variables from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

console.log('Environment variables loaded successfully');
console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? 'Set' : 'Not Set');

const app = express();
const PORT = process.env.PORT || 8888;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://127.0.0.1:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Health check route
app.get('/health', (req, res) => {
  const sessionInfo = {
    hasTokens: !!req.session?.tokens,
    hasUser: !!req.session?.user,
    sessionId: req.sessionID,
    tokenExpiry: req.session?.tokens?.expires_at ? new Date(req.session.tokens.expires_at) : null
  };

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    session: sessionInfo
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log('=== Server Environment Variables ===');
  console.log('PORT:', process.env.PORT);
  console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? 'Set' : 'Not Set');
  console.log('SPOTIFY_REDIRECT_URI:', process.env.SPOTIFY_REDIRECT_URI);
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🎵 Spotify OAuth: ${process.env.SPOTIFY_CLIENT_ID ? 'Configured' : 'Not configured'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
});

export default app;
