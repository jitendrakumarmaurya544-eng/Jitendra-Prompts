import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { verifyJwt } from '../lib/jwt.ts';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthenticatedUser {
  id: number;
  uid?: string | null;
  fullName: string;
  username: string;
  email: string;
  role: string;
  status: string;
  avatarUrl?: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export async function resolveUserFromToken(token: string): Promise<AuthenticatedUser | null> {
  // 1. Try local JWT
  const jwtPayload = verifyJwt(token);
  if (jwtPayload && jwtPayload.userId) {
    const [user] = await db
      .select({
        id: users.id,
        uid: users.uid,
        fullName: users.fullName,
        username: users.username,
        email: users.email,
        role: users.role,
        status: users.status,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, jwtPayload.userId));
    if (user && user.status === 'active') {
      return user;
    }
  }

  // 2. Try Firebase ID Token
  try {
    const decodedFirebase = await adminAuth.verifyIdToken(token);
    if (decodedFirebase && decodedFirebase.uid) {
      // Find or create in DB
      let [existingUser] = await db
        .select({
          id: users.id,
          uid: users.uid,
          fullName: users.fullName,
          username: users.username,
          email: users.email,
          role: users.role,
          status: users.status,
          avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(eq(users.uid, decodedFirebase.uid));

      if (!existingUser) {
        // Fallback by email
        if (decodedFirebase.email) {
          const [byEmail] = await db
            .select()
            .from(users)
            .where(eq(users.email, decodedFirebase.email.toLowerCase()));
          if (byEmail) {
            await db
              .update(users)
              .set({ uid: decodedFirebase.uid, lastLogin: new Date() })
              .where(eq(users.id, byEmail.id));
            existingUser = {
              id: byEmail.id,
              uid: decodedFirebase.uid,
              fullName: byEmail.fullName,
              username: byEmail.username,
              email: byEmail.email,
              role: byEmail.role,
              status: byEmail.status,
              avatarUrl: byEmail.avatarUrl,
            };
          }
        }
      }

      if (!existingUser && decodedFirebase.email) {
        const baseUsername = (decodedFirebase.email.split('@')[0] || 'creator').replace(/[^a-zA-Z0-9_]/g, '');
        const finalUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
        const [inserted] = await db
          .insert(users)
          .values({
            uid: decodedFirebase.uid,
            email: decodedFirebase.email.toLowerCase(),
            username: finalUsername,
            fullName: decodedFirebase.name || baseUsername || 'Creator',
            avatarUrl: decodedFirebase.picture || null,
            role: 'user',
            status: 'active',
          })
          .returning();

        existingUser = {
          id: inserted.id,
          uid: inserted.uid,
          fullName: inserted.fullName,
          username: inserted.username,
          email: inserted.email,
          role: inserted.role,
          status: inserted.status,
          avatarUrl: inserted.avatarUrl,
        };
      }

      if (existingUser && existingUser.status === 'active') {
        return existingUser;
      }
    }
  } catch (fbErr) {
    // Not a Firebase token or expired
  }

  return null;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split('Bearer ')[1].trim();
  const user = await resolveUserFromToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }

  req.user = user;
  next();
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1].trim();
    const user = await resolveUserFromToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
};

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  await requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
  });
};

export const requireEditorOrAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  await requireAuth(req, res, () => {
    if (req.user?.role !== 'admin' && req.user?.role !== 'editor') {
      return res.status(403).json({ error: 'Forbidden: Editor or Admin access required' });
    }
    next();
  });
};
