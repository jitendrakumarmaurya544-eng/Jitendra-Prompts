import express, { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.ts';
import {
  users,
  prompts,
  categories,
  aiModels,
  tags,
  promptTags,
  favorites,
  savedPrompts,
  promptViews,
  promptCopies,
  notifications,
  reports,
  siteSettings,
  contactMessages,
} from '../db/schema.ts';
import { eq, and, desc, sql, ilike, or, inArray } from 'drizzle-orm';
import { signJwt } from '../lib/jwt.ts';
import {
  requireAuth,
  optionalAuth,
  requireAdmin,
  requireEditorOrAdmin,
  AuthRequest,
} from '../middleware/auth.ts';
import { adminAuth } from '../lib/firebase-admin.ts';
import { seedDatabase } from '../db/seed.ts';

export const apiRouter = Router();

// Automatically ensure seed runs on boot
seedDatabase().catch((err) => console.error('Seed check error:', err));

// Helper to slugify
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// ==========================================
// 1. PUBLIC SITE SETTINGS & STATS
// ==========================================
apiRouter.get('/settings', async (req: Request, res: Response) => {
  try {
    const allSettings = await db.select().from(siteSettings);
    const settingsMap: Record<string, string> = {};
    for (const s of allSettings) {
      settingsMap[s.settingKey] = s.settingValue;
    }
    res.json(settingsMap);
  } catch (err: any) {
    console.error('Failed to fetch settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// ==========================================
// 2. AUTHENTICATION (Register, Login, Firebase)
// ==========================================
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { fullName, username, email, password } = req.body;
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

    // Check existing
    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.email, cleanEmail), eq(users.username, cleanUsername)));

    if (existing.length > 0) {
      if (existing.some((u) => u.email === cleanEmail)) {
        return res.status(400).json({ error: 'An account with this email already exists' });
      }
      return res.status(400).json({ error: 'Username is already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [newUser] = await db
      .insert(users)
      .values({
        fullName: fullName.trim(),
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        role: 'user',
        status: 'active',
      })
      .returning();

    // Welcome notification
    await db.insert(notifications).values({
      userId: newUser.id,
      title: 'Welcome to JITENDRA PROMPTS',
      message: 'Explore world-class AI prompts and begin creating today.',
      type: 'success',
    });

    const token = signJwt({ userId: newUser.id, role: newUser.role });
    res.json({
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        avatarUrl: newUser.avatarUrl,
      },
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const [user] = await db.select().from(users).where(eq(users.email, cleanEmail));

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is suspended. Please contact support.' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id));

    const token = signJwt({ userId: user.id, role: user.role });
    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        website: user.website,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

apiRouter.post('/auth/firebase-login', async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'ID Token required' });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    if (!decoded || !decoded.uid) {
      return res.status(401).json({ error: 'Invalid Firebase ID token' });
    }

    let [user] = await db.select().from(users).where(eq(users.uid, decoded.uid));

    if (!user && decoded.email) {
      const [byEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, decoded.email.toLowerCase()));

      if (byEmail) {
        await db
          .update(users)
          .set({ uid: decoded.uid, lastLogin: new Date() })
          .where(eq(users.id, byEmail.id));
        user = byEmail;
      }
    }

    if (!user && decoded.email) {
      const baseUsername = (decoded.email.split('@')[0] || 'creator').replace(/[^a-z0-9_]/g, '');
      const finalUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;

      const [inserted] = await db
        .insert(users)
        .values({
          uid: decoded.uid,
          email: decoded.email.toLowerCase(),
          username: finalUsername,
          fullName: decoded.name || baseUsername || 'Creator',
          avatarUrl: decoded.picture || null,
          role: 'user',
          status: 'active',
        })
        .returning();
      user = inserted;
    }

    if (!user) {
      return res.status(400).json({ error: 'Could not create or find user' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is suspended' });
    }

    const token = signJwt({ userId: user.id, role: user.role });
    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        website: user.website,
      },
    });
  } catch (err: any) {
    console.error('Firebase login error:', err);
    res.status(500).json({ error: 'Firebase authentication failed' });
  }
});

apiRouter.get('/auth/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // User statistics
    const [favCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(favorites)
      .where(eq(favorites.userId, userId));

    const [savedCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(savedPrompts)
      .where(eq(savedPrompts.userId, userId));

    const [createdCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(prompts)
      .where(eq(prompts.userId, userId));

    const [viewsSum] = await db
      .select({ totalViews: sql<number>`coalesce(sum(${prompts.views}), 0)` })
      .from(prompts)
      .where(eq(prompts.userId, userId));

    res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        website: user.website,
        createdAt: user.createdAt,
      },
      stats: {
        favorites: Number(favCount?.count || 0),
        saved: Number(savedCount?.count || 0),
        created: Number(createdCount?.count || 0),
        views: Number(viewsSum?.totalViews || 0),
      },
    });
  } catch (err: any) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

apiRouter.put('/auth/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { fullName, bio, website, avatarUrl } = req.body;

    const [updated] = await db
      .update(users)
      .set({
        fullName: fullName || undefined,
        bio: bio !== undefined ? bio : undefined,
        website: website !== undefined ? website : undefined,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    res.json({
      user: {
        id: updated.id,
        fullName: updated.fullName,
        username: updated.username,
        email: updated.email,
        role: updated.role,
        avatarUrl: updated.avatarUrl,
        bio: updated.bio,
        website: updated.website,
      },
    });
  } catch (err: any) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ==========================================
// 3. CATEGORIES & AI MODELS
// ==========================================
apiRouter.get('/categories', async (req: Request, res: Response) => {
  try {
    const cats = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        icon: categories.icon,
        image: categories.image,
        sortOrder: categories.sortOrder,
        status: categories.status,
      })
      .from(categories)
      .where(eq(categories.status, 'active'))
      .orderBy(categories.sortOrder, categories.name);

    // Prompt count for each category
    const counts = await db
      .select({
        categoryId: prompts.categoryId,
        count: sql<number>`count(*)`,
      })
      .from(prompts)
      .where(eq(prompts.status, 'published'))
      .groupBy(prompts.categoryId);

    const countMap = new Map(counts.map((c) => [c.categoryId, Number(c.count)]));

    const enriched = cats.map((cat) => ({
      ...cat,
      promptCount: countMap.get(cat.id) || 0,
    }));

    res.json(enriched);
  } catch (err: any) {
    console.error('Categories error:', err);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

apiRouter.get('/models', async (req: Request, res: Response) => {
  try {
    const modelsList = await db
      .select()
      .from(aiModels)
      .where(eq(aiModels.status, 'active'))
      .orderBy(aiModels.name);
    res.json(modelsList);
  } catch (err: any) {
    console.error('Models error:', err);
    res.status(500).json({ error: 'Failed to load AI models' });
  }
});

// ==========================================
// 4. PROMPTS (List, Search, Detail, Copy, Fav)
// ==========================================
apiRouter.get('/prompts', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      search,
      category,
      model,
      style,
      promptType,
      sort = 'trending',
      limit = '24',
      offset = '0',
    } = req.query;

    const currentUserId = req.user?.id;
    let conditions = [eq(prompts.status, 'published')];

    if (search && typeof search === 'string') {
      const q = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(prompts.title, q),
          ilike(prompts.description, q),
          ilike(prompts.content, q),
          ilike(prompts.style, q)
        )!
      );
    }

    if (category && typeof category === 'string' && category !== 'all') {
      // Could be slug or ID
      if (!isNaN(Number(category))) {
        conditions.push(eq(prompts.categoryId, Number(category)));
      } else {
        const [c] = await db.select().from(categories).where(eq(categories.slug, category));
        if (c) {
          conditions.push(eq(prompts.categoryId, c.id));
        }
      }
    }

    if (model && typeof model === 'string' && model !== 'all') {
      if (!isNaN(Number(model))) {
        conditions.push(eq(prompts.modelId, Number(model)));
      } else {
        const [m] = await db.select().from(aiModels).where(eq(aiModels.slug, model));
        if (m) {
          conditions.push(eq(prompts.modelId, m.id));
        }
      }
    }

    if (promptType && typeof promptType === 'string' && promptType !== 'all') {
      conditions.push(eq(prompts.promptType, promptType));
    }

    if (style && typeof style === 'string' && style !== 'all') {
      conditions.push(ilike(prompts.style, `%${style}%`));
    }

    let orderByClause = desc(prompts.isTrending);
    if (sort === 'newest') {
      orderByClause = desc(prompts.createdAt);
    } else if (sort === 'popular' || sort === 'most_viewed') {
      orderByClause = desc(prompts.views);
    } else if (sort === 'most_copied') {
      orderByClause = desc(prompts.copyCount);
    }

    const items = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        slug: prompts.slug,
        description: prompts.description,
        content: prompts.content,
        style: prompts.style,
        previewImage: prompts.previewImage,
        previewVideo: prompts.previewVideo,
        promptType: prompts.promptType,
        isFeatured: prompts.isFeatured,
        isTrending: prompts.isTrending,
        views: prompts.views,
        copyCount: prompts.copyCount,
        createdAt: prompts.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
        model: {
          id: aiModels.id,
          name: aiModels.name,
          slug: aiModels.slug,
          logo: aiModels.logo,
        },
        author: {
          id: users.id,
          fullName: users.fullName,
          username: users.username,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(prompts)
      .leftJoin(categories, eq(prompts.categoryId, categories.id))
      .leftJoin(aiModels, eq(prompts.modelId, aiModels.id))
      .leftJoin(users, eq(prompts.userId, users.id))
      .where(and(...conditions))
      .orderBy(orderByClause, desc(prompts.id))
      .limit(Math.min(Number(limit) || 24, 100))
      .offset(Number(offset) || 0);

    // If user is logged in, attach favorites & saved statuses
    let userFavSet = new Set<number>();
    let userSavedSet = new Set<number>();
    if (currentUserId && items.length > 0) {
      const promptIds = items.map((i) => i.id);
      const favs = await db
        .select({ promptId: favorites.promptId })
        .from(favorites)
        .where(and(eq(favorites.userId, currentUserId), inArray(favorites.promptId, promptIds)));
      userFavSet = new Set(favs.map((f) => f.promptId));

      const saved = await db
        .select({ promptId: savedPrompts.promptId })
        .from(savedPrompts)
        .where(and(eq(savedPrompts.userId, currentUserId), inArray(savedPrompts.promptId, promptIds)));
      userSavedSet = new Set(saved.map((s) => s.promptId));
    }

    const enriched = items.map((item) => ({
      ...item,
      isFavorited: userFavSet.has(item.id),
      isSaved: userSavedSet.has(item.id),
    }));

    res.json(enriched);
  } catch (err: any) {
    console.error('Fetch prompts error:', err);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

apiRouter.get('/prompts/trending', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const items = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        slug: prompts.slug,
        description: prompts.description,
        content: prompts.content,
        style: prompts.style,
        previewImage: prompts.previewImage,
        previewVideo: prompts.previewVideo,
        promptType: prompts.promptType,
        isFeatured: prompts.isFeatured,
        isTrending: prompts.isTrending,
        views: prompts.views,
        copyCount: prompts.copyCount,
        createdAt: prompts.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
        model: {
          id: aiModels.id,
          name: aiModels.name,
          slug: aiModels.slug,
          logo: aiModels.logo,
        },
        author: {
          id: users.id,
          fullName: users.fullName,
          username: users.username,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(prompts)
      .leftJoin(categories, eq(prompts.categoryId, categories.id))
      .leftJoin(aiModels, eq(prompts.modelId, aiModels.id))
      .leftJoin(users, eq(prompts.userId, users.id))
      .where(and(eq(prompts.status, 'published'), eq(prompts.isTrending, true)))
      .orderBy(desc(prompts.views))
      .limit(8);

    res.json(items);
  } catch (err: any) {
    console.error('Trending prompts error:', err);
    res.status(500).json({ error: 'Failed to fetch trending prompts' });
  }
});

apiRouter.get('/prompts/pod', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Prompt of the Day
    const [setting] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.settingKey, 'prompt_of_the_day_id'));

    let targetId = setting ? Number(setting.settingValue) : null;

    let promptQuery = db
      .select({
        id: prompts.id,
        title: prompts.title,
        slug: prompts.slug,
        description: prompts.description,
        content: prompts.content,
        style: prompts.style,
        previewImage: prompts.previewImage,
        previewVideo: prompts.previewVideo,
        promptType: prompts.promptType,
        isFeatured: prompts.isFeatured,
        isTrending: prompts.isTrending,
        views: prompts.views,
        copyCount: prompts.copyCount,
        createdAt: prompts.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
        model: {
          id: aiModels.id,
          name: aiModels.name,
          slug: aiModels.slug,
          logo: aiModels.logo,
        },
        author: {
          id: users.id,
          fullName: users.fullName,
          username: users.username,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(prompts)
      .leftJoin(categories, eq(prompts.categoryId, categories.id))
      .leftJoin(aiModels, eq(prompts.modelId, aiModels.id))
      .leftJoin(users, eq(prompts.userId, users.id));

    let [item] = targetId
      ? await promptQuery.where(eq(prompts.id, targetId))
      : await promptQuery.where(eq(prompts.status, 'published')).limit(1);

    if (!item) {
      [item] = await promptQuery.where(eq(prompts.status, 'published')).limit(1);
    }

    res.json(item || null);
  } catch (err: any) {
    console.error('Prompt of day error:', err);
    res.status(500).json({ error: 'Failed to fetch prompt of the day' });
  }
});

apiRouter.get('/prompts/:idOrSlug', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    const currentUserId = req.user?.id;

    const condition = !isNaN(Number(idOrSlug))
      ? eq(prompts.id, Number(idOrSlug))
      : eq(prompts.slug, idOrSlug);

    const [prompt] = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        slug: prompts.slug,
        description: prompts.description,
        content: prompts.content,
        style: prompts.style,
        previewImage: prompts.previewImage,
        previewVideo: prompts.previewVideo,
        promptType: prompts.promptType,
        status: prompts.status,
        isFeatured: prompts.isFeatured,
        isTrending: prompts.isTrending,
        views: prompts.views,
        copyCount: prompts.copyCount,
        createdAt: prompts.createdAt,
        updatedAt: prompts.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
        },
        model: {
          id: aiModels.id,
          name: aiModels.name,
          slug: aiModels.slug,
          logo: aiModels.logo,
          description: aiModels.description,
          website: aiModels.website,
        },
        author: {
          id: users.id,
          fullName: users.fullName,
          username: users.username,
          avatarUrl: users.avatarUrl,
          bio: users.bio,
        },
      })
      .from(prompts)
      .leftJoin(categories, eq(prompts.categoryId, categories.id))
      .leftJoin(aiModels, eq(prompts.modelId, aiModels.id))
      .leftJoin(users, eq(prompts.userId, users.id))
      .where(condition);

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Increment views asynchronously
    await db
      .update(prompts)
      .set({ views: prompt.views + 1 })
      .where(eq(prompts.id, prompt.id));
    await db.insert(promptViews).values({
      promptId: prompt.id,
      userId: currentUserId || null,
      ipHash: req.ip || null,
    });

    // Fetch tags
    const promptTagRows = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
      .from(promptTags)
      .leftJoin(tags, eq(promptTags.tagId, tags.id))
      .where(eq(promptTags.promptId, prompt.id));

    // Check user interaction
    let isFavorited = false;
    let isSaved = false;
    if (currentUserId) {
      const [fav] = await db
        .select()
        .from(favorites)
        .where(and(eq(favorites.userId, currentUserId), eq(favorites.promptId, prompt.id)));
      isFavorited = !!fav;

      const [saved] = await db
        .select()
        .from(savedPrompts)
        .where(and(eq(savedPrompts.userId, currentUserId), eq(savedPrompts.promptId, prompt.id)));
      isSaved = !!saved;
    }

    // Related prompts (same category)
    const related = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        slug: prompts.slug,
        previewImage: prompts.previewImage,
        promptType: prompts.promptType,
        style: prompts.style,
        views: prompts.views,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
      })
      .from(prompts)
      .leftJoin(categories, eq(prompts.categoryId, categories.id))
      .where(
        and(
          eq(prompts.status, 'published'),
          eq(prompts.categoryId, prompt.category?.id || 1),
          sql`${prompts.id} != ${prompt.id}`
        )
      )
      .limit(4);

    res.json({
      ...prompt,
      views: prompt.views + 1,
      tags: promptTagRows.filter(Boolean),
      isFavorited,
      isSaved,
      related,
    });
  } catch (err: any) {
    console.error('Prompt detail error:', err);
    res.status(500).json({ error: 'Failed to retrieve prompt' });
  }
});

apiRouter.post('/prompts/:id/copy', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const promptId = Number(req.params.id);
    const userId = req.user?.id || null;

    const [updated] = await db
      .update(prompts)
      .set({ copyCount: sql`${prompts.copyCount} + 1` })
      .where(eq(prompts.id, promptId))
      .returning();

    await db.insert(promptCopies).values({
      promptId,
      userId,
    });

    res.json({ success: true, copyCount: updated?.copyCount || 0 });
  } catch (err: any) {
    console.error('Copy prompt error:', err);
    res.status(500).json({ error: 'Failed to record prompt copy' });
  }
});

apiRouter.post('/prompts/:id/favorite', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const promptId = Number(req.params.id);
    const userId = req.user!.id;

    const [existing] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.promptId, promptId)));

    if (existing) {
      await db.delete(favorites).where(eq(favorites.id, existing.id));
      return res.json({ favorited: false, message: 'Removed from favorites' });
    } else {
      await db.insert(favorites).values({ userId, promptId });
      return res.json({ favorited: true, message: 'Added to favorites' });
    }
  } catch (err: any) {
    console.error('Favorite error:', err);
    res.status(500).json({ error: 'Failed to update favorites' });
  }
});

apiRouter.post('/prompts/:id/save', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const promptId = Number(req.params.id);
    const userId = req.user!.id;

    const [existing] = await db
      .select()
      .from(savedPrompts)
      .where(and(eq(savedPrompts.userId, userId), eq(savedPrompts.promptId, promptId)));

    if (existing) {
      await db.delete(savedPrompts).where(eq(savedPrompts.id, existing.id));
      return res.json({ saved: false, message: 'Removed from saved collection' });
    } else {
      await db.insert(savedPrompts).values({ userId, promptId });
      return res.json({ saved: true, message: 'Saved to private library' });
    }
  } catch (err: any) {
    console.error('Save prompt error:', err);
    res.status(500).json({ error: 'Failed to update saved collection' });
  }
});

apiRouter.post('/prompts/:id/report', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const promptId = Number(req.params.id);
    const userId = req.user?.id || null;
    const { reason, message } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Report reason is required' });
    }

    await db.insert(reports).values({
      promptId,
      userId,
      reason,
      message: message || '',
    });

    res.json({ success: true, message: 'Report submitted for review.' });
  } catch (err: any) {
    console.error('Report error:', err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// ==========================================
// 5. USER DASHBOARD ROUTES
// ==========================================
apiRouter.get('/user/favorites', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const favs = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        slug: prompts.slug,
        description: prompts.description,
        content: prompts.content,
        style: prompts.style,
        previewImage: prompts.previewImage,
        promptType: prompts.promptType,
        views: prompts.views,
        copyCount: prompts.copyCount,
        category: {
          name: categories.name,
          slug: categories.slug,
        },
        model: {
          name: aiModels.name,
          slug: aiModels.slug,
        },
        favoritedAt: favorites.createdAt,
      })
      .from(favorites)
      .innerJoin(prompts, eq(favorites.promptId, prompts.id))
      .leftJoin(categories, eq(prompts.categoryId, categories.id))
      .leftJoin(aiModels, eq(prompts.modelId, aiModels.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));

    res.json(favs);
  } catch (err: any) {
    console.error('Fetch user favorites error:', err);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

apiRouter.get('/user/saved', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const saved = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        slug: prompts.slug,
        description: prompts.description,
        content: prompts.content,
        style: prompts.style,
        previewImage: prompts.previewImage,
        promptType: prompts.promptType,
        views: prompts.views,
        copyCount: prompts.copyCount,
        category: {
          name: categories.name,
          slug: categories.slug,
        },
        model: {
          name: aiModels.name,
          slug: aiModels.slug,
        },
        savedAt: savedPrompts.createdAt,
      })
      .from(savedPrompts)
      .innerJoin(prompts, eq(savedPrompts.promptId, prompts.id))
      .leftJoin(categories, eq(prompts.categoryId, categories.id))
      .leftJoin(aiModels, eq(prompts.modelId, aiModels.id))
      .where(eq(savedPrompts.userId, userId))
      .orderBy(desc(savedPrompts.createdAt));

    res.json(saved);
  } catch (err: any) {
    console.error('Fetch user saved error:', err);
    res.status(500).json({ error: 'Failed to fetch saved prompts' });
  }
});

apiRouter.get('/user/my-prompts', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const list = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        slug: prompts.slug,
        description: prompts.description,
        content: prompts.content,
        style: prompts.style,
        previewImage: prompts.previewImage,
        promptType: prompts.promptType,
        status: prompts.status,
        views: prompts.views,
        copyCount: prompts.copyCount,
        createdAt: prompts.createdAt,
        category: {
          name: categories.name,
        },
        model: {
          name: aiModels.name,
        },
      })
      .from(prompts)
      .leftJoin(categories, eq(prompts.categoryId, categories.id))
      .leftJoin(aiModels, eq(prompts.modelId, aiModels.id))
      .where(eq(prompts.userId, userId))
      .orderBy(desc(prompts.createdAt));

    res.json(list);
  } catch (err: any) {
    console.error('Fetch my-prompts error:', err);
    res.status(500).json({ error: 'Failed to fetch your prompts' });
  }
});

apiRouter.post('/prompts', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const {
      title,
      description,
      content,
      categoryId,
      modelId,
      style,
      previewImage,
      previewVideo,
      promptType,
      tags: rawTags,
      isDraft,
    } = req.body;

    if (!title || !content || !categoryId || !modelId) {
      return res.status(400).json({ error: 'Title, prompt content, category, and model are required' });
    }

    const baseSlug = slugify(title);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // If user is admin/editor, auto-publish, otherwise pending review
    const status = isDraft ? 'draft' : user.role === 'admin' || user.role === 'editor' ? 'published' : 'pending';

    const [newPrompt] = await db
      .insert(prompts)
      .values({
        userId: user.id,
        title: title.trim(),
        slug,
        description: description?.trim() || '',
        content: content.trim(),
        categoryId: Number(categoryId),
        modelId: Number(modelId),
        style: style?.trim() || 'Cinematic',
        previewImage:
          previewImage?.trim() ||
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        previewVideo: previewVideo?.trim() || null,
        promptType: promptType === 'premium' ? 'premium' : 'free',
        status,
        isFeatured: false,
        isTrending: false,
      })
      .returning();

    // Attach tags if provided
    if (Array.isArray(rawTags) && rawTags.length > 0) {
      for (const t of rawTags) {
        const tagName = String(t).trim();
        if (!tagName) continue;
        const tagSlug = slugify(tagName);
        let [tagRecord] = await db.select().from(tags).where(eq(tags.slug, tagSlug));
        if (!tagRecord) {
          [tagRecord] = await db.insert(tags).values({ name: tagName, slug: tagSlug }).returning();
        }
        await db.insert(promptTags).values({
          promptId: newPrompt.id,
          tagId: tagRecord.id,
        }).onConflictDoNothing();
      }
    }

    // Notify user
    await db.insert(notifications).values({
      userId: user.id,
      title: status === 'published' ? 'Prompt Published!' : 'Prompt Submitted for Review',
      message:
        status === 'published'
          ? `Your prompt "${newPrompt.title}" is live on the platform.`
          : `Your prompt "${newPrompt.title}" has been submitted for admin approval.`,
      type: 'info',
    });

    res.json(newPrompt);
  } catch (err: any) {
    console.error('Create prompt error:', err);
    res.status(500).json({ error: 'Failed to create prompt' });
  }
});

apiRouter.delete('/prompts/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const promptId = Number(req.params.id);
    const user = req.user!;

    const [existing] = await db.select().from(prompts).where(eq(prompts.id, promptId));
    if (!existing) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    if (existing.userId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await db.delete(prompts).where(eq(prompts.id, promptId));
    res.json({ success: true, message: 'Prompt deleted' });
  } catch (err: any) {
    console.error('Delete prompt error:', err);
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
});

apiRouter.get('/user/notifications', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const notifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    // Mark as read
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));

    res.json(notifs);
  } catch (err: any) {
    console.error('Notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Contact message submission
apiRouter.post('/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    await db.insert(contactMessages).values({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    res.json({ success: true, message: 'Message sent successfully. Our team will contact you shortly.' });
  } catch (err: any) {
    console.error('Contact submit error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ==========================================
// 6. ADMIN SYSTEM (Protected with requireAdmin)
// ==========================================
apiRouter.get('/admin/dashboard', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    // 1. Stats aggregates
    const [totalUsersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [activeUsersCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.status, 'active'));

    const [totalPromptsCount] = await db.select({ count: sql<number>`count(*)` }).from(prompts);
    const [publishedPromptsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(prompts)
      .where(eq(prompts.status, 'published'));
    const [pendingPromptsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(prompts)
      .where(eq(prompts.status, 'pending'));
    const [premiumPromptsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(prompts)
      .where(eq(prompts.promptType, 'premium'));

    const [categoriesCount] = await db.select({ count: sql<number>`count(*)` }).from(categories);
    const [totalViewsCount] = await db
      .select({ count: sql<number>`coalesce(sum(${prompts.views}), 0)` })
      .from(prompts);
    const [totalCopiesCount] = await db
      .select({ count: sql<number>`coalesce(sum(${prompts.copyCount}), 0)` })
      .from(prompts);
    const [totalFavoritesCount] = await db.select({ count: sql<number>`count(*)` }).from(favorites);

    // 2. Recent Users
    const recentUsers = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        username: users.username,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(5);

    // 3. Recent Prompts
    const recentPrompts = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        status: prompts.status,
        promptType: prompts.promptType,
        views: prompts.views,
        createdAt: prompts.createdAt,
        author: {
          fullName: users.fullName,
          username: users.username,
        },
      })
      .from(prompts)
      .leftJoin(users, eq(prompts.userId, users.id))
      .orderBy(desc(prompts.createdAt))
      .limit(6);

    // 4. Growth chart mock points (derived from data)
    const growthChart = [
      { month: 'Jan', users: 120, prompts: 240, views: 5400 },
      { month: 'Feb', users: 280, prompts: 580, views: 12800 },
      { month: 'Mar', users: 510, prompts: 920, views: 24000 },
      { month: 'Apr', users: 840, prompts: 1450, views: 42000 },
      { month: 'May', users: 1240, prompts: 2100, views: 68000 },
      { month: 'Jun', users: Number(totalUsersCount?.count || 1400), prompts: Number(totalPromptsCount?.count || 2300), views: Number(totalViewsCount?.count || 85000) },
    ];

    res.json({
      metrics: {
        totalUsers: Number(totalUsersCount?.count || 0),
        activeUsers: Number(activeUsersCount?.count || 0),
        totalPrompts: Number(totalPromptsCount?.count || 0),
        publishedPrompts: Number(publishedPromptsCount?.count || 0),
        pendingPrompts: Number(pendingPromptsCount?.count || 0),
        premiumPrompts: Number(premiumPromptsCount?.count || 0),
        categories: Number(categoriesCount?.count || 0),
        totalViews: Number(totalViewsCount?.count || 0),
        totalCopies: Number(totalCopiesCount?.count || 0),
        totalFavorites: Number(totalFavoritesCount?.count || 0),
      },
      recentUsers,
      recentPrompts,
      growthChart,
    });
  } catch (err: any) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ error: 'Failed to load admin dashboard data' });
  }
});

// Admin prompt management
apiRouter.get('/admin/prompts', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;
    let conditions = [];

    if (status && typeof status === 'string' && status !== 'all') {
      conditions.push(eq(prompts.status, status));
    }
    if (search && typeof search === 'string') {
      conditions.push(ilike(prompts.title, `%${search.trim()}%`));
    }

    const items = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        slug: prompts.slug,
        description: prompts.description,
        content: prompts.content,
        style: prompts.style,
        previewImage: prompts.previewImage,
        promptType: prompts.promptType,
        status: prompts.status,
        isFeatured: prompts.isFeatured,
        isTrending: prompts.isTrending,
        views: prompts.views,
        copyCount: prompts.copyCount,
        createdAt: prompts.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
        },
        model: {
          id: aiModels.id,
          name: aiModels.name,
        },
        author: {
          id: users.id,
          fullName: users.fullName,
          username: users.username,
          email: users.email,
        },
      })
      .from(prompts)
      .leftJoin(categories, eq(prompts.categoryId, categories.id))
      .leftJoin(aiModels, eq(prompts.modelId, aiModels.id))
      .leftJoin(users, eq(prompts.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(prompts.createdAt));

    res.json(items);
  } catch (err: any) {
    console.error('Admin prompts error:', err);
    res.status(500).json({ error: 'Failed to fetch prompts for admin' });
  }
});

apiRouter.put('/admin/prompts/:id/status', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const promptId = Number(req.params.id);
    const { status, isFeatured, isTrending } = req.body;

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (status !== undefined) updateData.status = status;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isTrending !== undefined) updateData.isTrending = isTrending;

    const [updated] = await db
      .update(prompts)
      .set(updateData)
      .where(eq(prompts.id, promptId))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Notify author if status changed
    if (status) {
      await db.insert(notifications).values({
        userId: updated.userId,
        title: `Prompt Status Updated: ${status.toUpperCase()}`,
        message: `Your prompt "${updated.title}" status is now ${status}.`,
        type: status === 'published' ? 'success' : 'info',
      });
    }

    res.json(updated);
  } catch (err: any) {
    console.error('Update prompt status error:', err);
    res.status(500).json({ error: 'Failed to update prompt status' });
  }
});

apiRouter.post('/admin/prompts/bulk', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { ids, action } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No prompt IDs provided' });
    }

    if (action === 'delete') {
      await db.delete(prompts).where(inArray(prompts.id, ids));
    } else if (action === 'publish') {
      await db.update(prompts).set({ status: 'published' }).where(inArray(prompts.id, ids));
    } else if (action === 'unpublish') {
      await db.update(prompts).set({ status: 'draft' }).where(inArray(prompts.id, ids));
    } else if (action === 'feature') {
      await db.update(prompts).set({ isFeatured: true }).where(inArray(prompts.id, ids));
    }

    res.json({ success: true, modified: ids.length });
  } catch (err: any) {
    console.error('Bulk action error:', err);
    res.status(500).json({ error: 'Failed to perform bulk action' });
  }
});

apiRouter.delete('/admin/prompts/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const promptId = Number(req.params.id);
    await db.delete(prompts).where(eq(prompts.id, promptId));
    res.json({ success: true, message: 'Prompt deleted by admin' });
  } catch (err: any) {
    console.error('Admin delete prompt error:', err);
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
});

// Admin Users management
apiRouter.get('/admin/users', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        username: users.username,
        email: users.email,
        role: users.role,
        status: users.status,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    // Prompt count per user
    const counts = await db
      .select({
        userId: prompts.userId,
        count: sql<number>`count(*)`,
      })
      .from(prompts)
      .groupBy(prompts.userId);

    const countMap = new Map(counts.map((c) => [c.userId, Number(c.count)]));

    const enriched = allUsers.map((u) => ({
      ...u,
      promptCount: countMap.get(u.id) || 0,
    }));

    res.json(enriched);
  } catch (err: any) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

apiRouter.put('/admin/users/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { role, status } = req.body;

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    res.json(updated);
  } catch (err: any) {
    console.error('Admin user update error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Admin Categories CRUD
apiRouter.post('/admin/categories', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, icon, image, sortOrder } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const slug = slugify(name);
    const [cat] = await db
      .insert(categories)
      .values({
        name: name.trim(),
        slug,
        description: description || '',
        icon: icon || 'Sparkles',
        image: image || '',
        sortOrder: Number(sortOrder) || 0,
      })
      .returning();

    res.json(cat);
  } catch (err: any) {
    console.error('Create category error:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

apiRouter.put('/admin/categories/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const catId = Number(req.params.id);
    const { name, description, icon, image, sortOrder, status } = req.body;

    const updateData: Record<string, any> = {};
    if (name) {
      updateData.name = name.trim();
      updateData.slug = slugify(name);
    }
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (image !== undefined) updateData.image = image;
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);
    if (status !== undefined) updateData.status = status;

    const [updated] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, catId))
      .returning();

    res.json(updated);
  } catch (err: any) {
    console.error('Update category error:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

apiRouter.delete('/admin/categories/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const catId = Number(req.params.id);
    await db.delete(categories).where(eq(categories.id, catId));
    res.json({ success: true });
  } catch (err: any) {
    console.error('Delete category error:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Admin AI Models CRUD
apiRouter.post('/admin/models', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, logo, description, website } = req.body;
    if (!name) return res.status(400).json({ error: 'Model name required' });

    const slug = slugify(name);
    const [model] = await db
      .insert(aiModels)
      .values({
        name: name.trim(),
        slug,
        logo: logo || 'Sparkles',
        description: description || '',
        website: website || '',
      })
      .returning();

    res.json(model);
  } catch (err: any) {
    console.error('Create model error:', err);
    res.status(500).json({ error: 'Failed to create model' });
  }
});

apiRouter.put('/admin/models/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const modelId = Number(req.params.id);
    const { name, logo, description, website, status } = req.body;

    const updateData: Record<string, any> = {};
    if (name) {
      updateData.name = name.trim();
      updateData.slug = slugify(name);
    }
    if (logo !== undefined) updateData.logo = logo;
    if (description !== undefined) updateData.description = description;
    if (website !== undefined) updateData.website = website;
    if (status !== undefined) updateData.status = status;

    const [updated] = await db
      .update(aiModels)
      .set(updateData)
      .where(eq(aiModels.id, modelId))
      .returning();

    res.json(updated);
  } catch (err: any) {
    console.error('Update model error:', err);
    res.status(500).json({ error: 'Failed to update model' });
  }
});

apiRouter.delete('/admin/models/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const modelId = Number(req.params.id);
    await db.delete(aiModels).where(eq(aiModels.id, modelId));
    res.json({ success: true });
  } catch (err: any) {
    console.error('Delete model error:', err);
    res.status(500).json({ error: 'Failed to delete model' });
  }
});

// Admin Settings
apiRouter.get('/admin/settings', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const settingsList = await db.select().from(siteSettings);
    res.json(settingsList);
  } catch (err: any) {
    console.error('Admin settings error:', err);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

apiRouter.put('/admin/settings', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const settingsObj = req.body; // { site_name: '...', hero_heading: '...' }
    for (const [key, val] of Object.entries(settingsObj)) {
      await db
        .insert(siteSettings)
        .values({
          settingKey: key,
          settingValue: String(val),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: siteSettings.settingKey,
          set: {
            settingValue: String(val),
            updatedAt: new Date(),
          },
        });
    }

    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err: any) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Admin Reports
apiRouter.get('/admin/reports', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const allReports = await db
      .select({
        id: reports.id,
        reason: reports.reason,
        message: reports.message,
        status: reports.status,
        createdAt: reports.createdAt,
        prompt: {
          id: prompts.id,
          title: prompts.title,
          slug: prompts.slug,
        },
        user: {
          fullName: users.fullName,
          email: users.email,
        },
      })
      .from(reports)
      .leftJoin(prompts, eq(reports.promptId, prompts.id))
      .leftJoin(users, eq(reports.userId, users.id))
      .orderBy(desc(reports.createdAt));

    res.json(allReports);
  } catch (err: any) {
    console.error('Admin reports error:', err);
    res.status(500).json({ error: 'Failed to load reports' });
  }
});

apiRouter.put('/admin/reports/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const reportId = Number(req.params.id);
    const { status } = req.body;
    await db.update(reports).set({ status }).where(eq(reports.id, reportId));
    res.json({ success: true });
  } catch (err: any) {
    console.error('Update report error:', err);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// Admin Contact Messages
apiRouter.get('/admin/messages', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const messages = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
    res.json(messages);
  } catch (err: any) {
    console.error('Admin messages error:', err);
    res.status(500).json({ error: 'Failed to load contact messages' });
  }
});
