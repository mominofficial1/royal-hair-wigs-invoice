import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'royal_auth_session';
const DEFAULT_SECRET = 'royal-hair-wigs-ultra-secure-jwt-secret-key-2026-production';
const SECRET_KEY = new TextEncoder().encode(process.env.SESSION_SECRET || DEFAULT_SECRET);

// Rate limiting in-memory store for login attempts
interface RateLimitRecord {
  attempts: number;
  blockedUntil: number;
}
const loginAttempts = new Map<string, RateLimitRecord>();

export function checkRateLimit(ip: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) return { allowed: true };

  if (record.blockedUntil > now) {
    const waitSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  if (record.blockedUntil <= now && record.attempts >= 5) {
    // Reset after block period
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { attempts: 0, blockedUntil: 0 };
  record.attempts += 1;

  if (record.attempts >= 5) {
    // Block for 15 minutes after 5 failed attempts
    record.blockedUntil = now + 15 * 60 * 1000;
  }

  loginAttempts.set(ip, record);
}

export function clearRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}

export function getExpectedCredentials() {
  return {
    username: process.env.AUTH_USERNAME || 'astroinvoice',
    password: process.env.AUTH_PASSWORD || 'Orbit#42646',
  };
}

export function verifyCredentials(inputUser: string, inputPass: string): boolean {
  const expected = getExpectedCredentials();
  return inputUser.trim() === expected.username && inputPass.trim() === expected.password;
}

export async function createSessionToken(username: string): Promise<string> {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<{ username: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return { username: payload.username as string };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{ username: string } | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  return verifySessionToken(sessionCookie.value);
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
