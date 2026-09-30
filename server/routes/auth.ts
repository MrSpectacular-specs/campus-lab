import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db/database';
import { SESSION_COOKIE_NAME, type AuthUser } from '../middleware/auth';

const router = Router();

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SEVEN_DAYS_MS,
    path: '/',
  });
}

function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * POST /api/auth/signup
 * Public self-registration (defaults to 'student' role)
 */
router.post('/signup', (req: Request, res: Response) => {
  const { email, password, full_name, institution_id } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ error: 'Valid email address is required.' });
    return;
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }
  if (!full_name || typeof full_name !== 'string' || !full_name.trim()) {
    res.status(400).json({ error: 'Full name is required.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check existing user
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    res.status(409).json({ error: 'An account with this email address already exists.' });
    return;
  }

  // Verify institution exists if provided
  let validInstId: string | null = null;
  if (institution_id) {
    const inst = db.prepare('SELECT id FROM institutions WHERE id = ?').get(institution_id) as { id: string } | undefined;
    if (inst) validInstId = inst.id;
  }

  const userId = crypto.randomUUID();
  const passwordHash = bcrypt.hashSync(password, 10);
  const now = new Date().toISOString();

  // Public signup strictly defaults to student role
  const role = 'student';

  db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, role, institution_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(userId, normalizedEmail, passwordHash, full_name.trim(), role, validInstId, now, now);

  // Automatically log in by generating session
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SEVEN_DAYS_MS).toISOString();

  db.prepare(`
    INSERT INTO sessions (id, user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(sessionToken, userId, expiresAt, now);

  setSessionCookie(res, sessionToken);

  const user: AuthUser = {
    id: userId,
    email: normalizedEmail,
    full_name: full_name.trim(),
    role,
    institution_id: validInstId,
    avatar_url: null,
  };

  res.status(201).json({ user });
});

/**
 * POST /api/auth/login
 */
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const userRow = db.prepare(`
    SELECT id, email, password_hash, full_name, role, institution_id, avatar_url
    FROM users
    WHERE email = ?
  `).get(normalizedEmail) as (AuthUser & { password_hash: string }) | undefined;

  if (!userRow) {
    res.status(401).json({ error: 'Email or password is incorrect.' });
    return;
  }

  const passwordValid = bcrypt.compareSync(password, userRow.password_hash);
  if (!passwordValid) {
    res.status(401).json({ error: 'Email or password is incorrect.' });
    return;
  }

  // Create persistent session
  const sessionToken = crypto.randomUUID();
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + SEVEN_DAYS_MS).toISOString();

  db.prepare(`
    INSERT INTO sessions (id, user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(sessionToken, userRow.id, expiresAt, now);

  setSessionCookie(res, sessionToken);

  const user: AuthUser = {
    id: userRow.id,
    email: userRow.email,
    full_name: userRow.full_name,
    role: userRow.role,
    institution_id: userRow.institution_id,
    avatar_url: userRow.avatar_url,
  };

  res.json({ user });
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req: Request, res: Response) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (token) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
  }
  clearSessionCookie(res);
  res.json({ success: true });
});

/**
 * GET /api/auth/session
 * Returns current authenticated user or null
 */
router.get('/session', (req: Request, res: Response) => {
  res.json({ user: req.user ?? null });
});

export default router;
