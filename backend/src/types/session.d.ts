import { Session, SessionData } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    state?: string;
    redirectUri?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: number;
  }
}

export interface CustomSession extends Session {
  state?: string;
  redirectUri?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: number;
} 