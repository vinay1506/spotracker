import 'express-session';

declare module 'express-session' {
  interface SessionData {
    state?: string;
    redirectUri?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: number;
  }
} 