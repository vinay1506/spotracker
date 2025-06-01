
import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.tokens?.access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Check if token is expired
  const now = Date.now();
  if (req.session.tokens.expires_at <= now) {
    return res.status(401).json({ error: 'Token expired' });
  }

  next();
};
