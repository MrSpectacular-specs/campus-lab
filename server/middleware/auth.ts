import type { Request, Response, NextFunction } from 'express';
import { db } from '../db/database';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'faculty' | 'mentor' | 'student';
  institution_id: string | null;
  avatar_url: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      sessionToken?: string;
    }
  }
}

export const SESSION_COOKIE_NAME = 'campuslab_session';

/**
 * Middleware that inspects HTTP-only session cookie and attaches req.user if valid.
 */
export function sessionMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (!token) {
    return next();
  }

  try {
    const now = new Date().toISOString();
    const session = db
      .prepare(`
        SELECT s.id, s.user_id, s.expires_at, u.email, u.full_name, u.role, u.institution_id, u.avatar_url
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ? AND s.expires_at > ?
      `)
      .get(token, now) as (AuthUser & { id: string; user_id: string; expires_at: string }) | undefined;

    if (session) {
      req.user = {
        id: session.user_id,
        email: session.email,
        full_name: session.full_name,
        role: session.role,
        institution_id: session.institution_id,
        avatar_url: session.avatar_url,
      };
      req.sessionToken = token;
    }
  } catch (err) {
    console.error('[AuthMiddleware Error]', err);
  }

  next();
}

/**
 * Guard: Requires user to be authenticated.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required. Please sign in to access this workspace.',
    });
    return;
  }
  next();
}

/**
 * Guard: Requires user to possess one of the specified roles.
 */
export function requireRole(...allowedRoles: ('admin' | 'faculty' | 'mentor' | 'student')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access restricted. Your role '${req.user.role}' is not authorized for this operation.`,
      });
      return;
    }

    next();
  };
}
