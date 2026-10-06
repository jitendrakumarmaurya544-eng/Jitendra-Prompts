import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').unique(), // Firebase Auth UID or local identifier
  fullName: text('full_name').notNull(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  website: text('website'),
  role: text('role').notNull().default('user'), // 'user', 'editor', 'admin'
  status: text('status').notNull().default('active'), // 'active', 'suspended'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login'),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull().default(''),
  icon: text('icon').notNull().default('Sparkles'),
  image: text('image').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const aiModels = pgTable('ai_models', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logo: text('logo').notNull().default(''),
  description: text('description').notNull().default(''),
  website: text('website').notNull().default(''),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const prompts = pgTable('prompts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull().default(''),
  content: text('content').notNull(),
  categoryId: integer('category_id')
    .references(() => categories.id)
    .notNull(),
  modelId: integer('model_id')
    .references(() => aiModels.id)
    .notNull(),
  style: text('style').notNull().default('Cinematic'),
  previewImage: text('preview_image').notNull().default(''),
  previewVideo: text('preview_video'),
  promptType: text('prompt_type').notNull().default('free'), // 'free', 'premium'
  status: text('status').notNull().default('published'), // 'draft', 'pending', 'published', 'rejected'
  isFeatured: boolean('is_featured').notNull().default(false),
  isTrending: boolean('is_trending').notNull().default(false),
  views: integer('views').notNull().default(0),
  copyCount: integer('copy_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const promptTags = pgTable(
  'prompt_tags',
  {
    promptId: integer('prompt_id')
      .references(() => prompts.id, { onDelete: 'cascade' })
      .notNull(),
    tagId: integer('tag_id')
      .references(() => tags.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.promptId, table.tagId] })
  ]
);

export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  promptId: integer('prompt_id')
    .references(() => prompts.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const savedPrompts = pgTable('saved_prompts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  promptId: integer('prompt_id')
    .references(() => prompts.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const promptViews = pgTable('prompt_views', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  promptId: integer('prompt_id')
    .references(() => prompts.id, { onDelete: 'cascade' })
    .notNull(),
  ipHash: text('ip_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const promptCopies = pgTable('prompt_copies', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  promptId: integer('prompt_id')
    .references(() => prompts.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull().default('info'),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  promptId: integer('prompt_id')
    .references(() => prompts.id, { onDelete: 'cascade' })
    .notNull(),
  reason: text('reason').notNull(),
  message: text('message').notNull().default(''),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  settingKey: text('setting_key').notNull().unique(),
  settingValue: text('setting_value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  prompts: many(prompts),
  favorites: many(favorites),
  savedPrompts: many(savedPrompts),
  notifications: many(notifications),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  prompts: many(prompts),
}));

export const aiModelsRelations = relations(aiModels, ({ many }) => ({
  prompts: many(prompts),
}));

export const promptsRelations = relations(prompts, ({ one, many }) => ({
  author: one(users, {
    fields: [prompts.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [prompts.categoryId],
    references: [categories.id],
  }),
  model: one(aiModels, {
    fields: [prompts.modelId],
    references: [aiModels.id],
  }),
  favorites: many(favorites),
  savedPrompts: many(savedPrompts),
  views: many(promptViews),
  copies: many(promptCopies),
  promptTags: many(promptTags),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  prompt: one(prompts, {
    fields: [favorites.promptId],
    references: [prompts.id],
  }),
}));

export const savedPromptsRelations = relations(savedPrompts, ({ one }) => ({
  user: one(users, {
    fields: [savedPrompts.userId],
    references: [users.id],
  }),
  prompt: one(prompts, {
    fields: [savedPrompts.promptId],
    references: [prompts.id],
  }),
}));

export const promptTagsRelations = relations(promptTags, ({ one }) => ({
  prompt: one(prompts, {
    fields: [promptTags.promptId],
    references: [prompts.id],
  }),
  tag: one(tags, {
    fields: [promptTags.tagId],
    references: [tags.id],
  }),
}));
