import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials, createSessionToken, setSessionCookie, checkRateLimit, recordFailedAttempt, clearRateLimit } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many failed login attempts. Please try again in ${rateCheck.waitSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const isValid = verifyCredentials(username, password);

    if (!isValid) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: 'Invalid username or password. Please verify your credentials.' },
        { status: 401 }
      );
    }

    clearRateLimit(ip);
    const token = await createSessionToken(username);
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: { username },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error during login.' },
      { status: 500 }
    );
  }
}
