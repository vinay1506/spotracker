import 'express-session';

declare module 'express-session' {
  interface Session {
    state?: string;
    redirectUri?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: number;
  }
} 