import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'jitendra-prompts-super-secret-key-2026-luxury-gold';

export function signJwt(payload: Record<string, any>, expiresInSeconds: number = 86400 * 7): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };

  const encode = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const headerEncoded = encode(header);
  const payloadEncoded = encode(fullPayload);
  const data = `${headerEncoded}.${payloadEncoded}`;

  const signature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifyJwt(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerEncoded, payloadEncoded, signature] = parts;
    const data = `${headerEncoded}.${payloadEncoded}`;
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadEncoded, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}
