export interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: 'user' | 'editor' | 'admin';
  status: 'active' | 'suspended';
  avatarUrl?: string | null;
  bio?: string | null;
  website?: string | null;
  createdAt?: string;
  lastLogin?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  sortOrder: number;
  status: string;
  promptCount?: number;
}

export interface AIModel {
  id: number;
  name: string;
  slug: string;
  logo: string;
  description: string;
  website: string;
  status: string;
}

export interface PromptTag {
  id: number;
  name: string;
  slug: string;
}

export interface Prompt {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  style: string;
  previewImage: string;
  previewVideo?: string | null;
  promptType: 'free' | 'premium';
  status: 'draft' | 'pending' | 'published' | 'rejected';
  isFeatured: boolean;
  isTrending: boolean;
  views: number;
  copyCount: number;
  createdAt: string;
  updatedAt?: string;
  category?: {
    id?: number;
    name: string;
    slug: string;
    description?: string;
  };
  model?: {
    id?: number;
    name: string;
    slug: string;
    logo?: string;
    description?: string;
    website?: string;
  };
  author?: {
    id: number;
    fullName: string;
    username: string;
    avatarUrl?: string | null;
    bio?: string | null;
  };
  tags?: PromptTag[];
  isFavorited?: boolean;
  isSaved?: boolean;
  related?: Partial<Prompt>[];
}

export interface SiteSettings {
  site_name: string;
  tagline: string;
  secondary_tagline: string;
  contact_email: string;
  hero_badge: string;
  hero_heading: string;
  hero_highlight: string;
  hero_description: string;
  stat_prompts: string;
  stat_categories: string;
  stat_tools: string;
  stat_creators: string;
  prompt_of_the_day_id: string;
  [key: string]: string;
}
