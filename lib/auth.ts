import crypto from 'crypto';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'qc_session';

export function ensureSession(ip: string | undefined) {
  const cookieStore = cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set({
      name: SESSION_COOKIE,
      value: sessionId,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });
  }
  return sessionId;
}

export function verifyAdmin(headers: Headers) {
  const token = headers.get('x-admin-token');
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return false;
  }
  return true;
}
