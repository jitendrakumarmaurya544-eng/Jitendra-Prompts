import React, { useState, useEffect } from 'react';
import { Prompt, Category, AIModel } from '../types/index.ts';
import { PromptCard } from '../components/PromptCard.tsx';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Sparkles,
  Layers,
  Bot,
  Flame,
  Clock,
  Eye,
  Crown,
  Copy,
} from 'lucide-react';

interface ExplorePageProps {
  navigate: (route: string) => void;
  initialQuery?: string;
  initialCategory?: string;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  navigate,
  initialQuery = '',
  initialCategory = '',
}) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [selectedModel, setSelectedModel] = useState('all');
  const [selectedType, setSelectedType] = useState('all'); // all, free, premium
  const [sortBy, setSortBy] = useState('trending'); // trending, newest, popular, most_copied
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories and models on mount
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch((e) => console.error(e));

    fetch('/api/models')
      .then((r) => r.json())
      .then((data) => setModels(data))
      .catch((e) => console.error(e));
  }, []);

  // Fetch prompts when filters change
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
    if (selectedModel && selectedModel !== 'all') params.append('model', selectedModel);
    if (selectedType && selectedType !== 'all') params.append('promptType', selectedType);
    params.append('sort', sortBy);
    params.append('limit', '40');

    fetch(`/api/prompts?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setPrompts(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        console.error(e);
        setPrompts([]);
      })
      .finally(() => setLoading(false));
  }, [search, selectedCategory, selectedModel, selectedType, sortBy]);

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedModel('all');
    setSelectedType('all');
    setSortBy('trending');
  };

  const hasActiveFilters =
    search || selectedCategory !== 'all' || selectedModel !== 'all' || selectedType !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18140B] border border-[#D4AF37]/30 text-[#F5D77A] text-[11px] font-bold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PROMPT MARKETPLACE & ARCHIVE</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl uppercase text-white tracking-tight">
          EXPLORE <span className="gold-text-gradient">PROMPTS</span>
        </h1>
        <p className="mt-3 text-sm text-[#A5A5A5] leading-relaxed">
          High-definition prompt engineering crafted for photorealism, cinematography, and luxury brand design.
        </p>
      </div>

      {/* Top Search Bar */}
      <div className="relative max-w-3xl mx-auto mb-8">
        <div className="relative flex items-center rounded-2xl bg-[#0D0D0D] border-2 border-[rgba(212,175,55,0.3)] shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.15)] overflow-hidden focus-within:border-[#F5D77A]">
          <Search className="w-5 h-5 text-[#D4AF37] ml-4 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search image, cinematic, portrait, 3D prompts..."
            className="w-full bg-transparent text-white px-3 py-4 text-sm placeholder-[#A5A5A5] focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="p-2 text-[#A5A5A5] hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`mr-2.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-[#D4AF37]/20 text-[#F5D77A] border border-[#D4AF37]/40'
                : 'bg-white/5 text-[#A5A5A5] hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Expandable Filter Drawer */}
      {showFilters && (
        <div className="max-w-4xl mx-auto mb-8 p-6 rounded-2xl bg-[#0F0F0F] border border-[rgba(212,175,55,0.25)] shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Model Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" />
                AI Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">All AI Tools</option>
                {models.map((m) => (
                  <option key={m.id} value={m.slug}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Free / Premium Tier */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                Tier
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">Free & Premium</option>
                <option value="free">Free Only</option>
                <option value="premium">Premium Only</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={clearAllFilters}
                className="text-xs text-red-400 hover:text-red-300 font-semibold"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sort Pills and Category Quick Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        {/* Category Scroll Bar */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition-all ${
              selectedCategory === 'all'
                ? 'gold-btn'
                : 'bg-[#121212] border border-white/10 text-[#A5A5A5] hover:text-white'
            }`}
          >
            All
          </button>
          {categories.slice(0, 6).map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.slug)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition-all ${
                selectedCategory === c.slug
                  ? 'gold-btn'
                  : 'bg-[#121212] border border-white/10 text-[#A5A5A5] hover:text-white'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1 bg-[#121212] p-1 rounded-xl border border-white/10 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setSortBy('trending')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
              sortBy === 'trending' ? 'bg-[#D4AF37]/20 text-[#F5D77A]' : 'text-[#A5A5A5] hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3" />
            Trending
          </button>
          <button
            onClick={() => setSortBy('newest')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
              sortBy === 'newest' ? 'bg-[#D4AF37]/20 text-[#F5D77A]' : 'text-[#A5A5A5] hover:text-white'
            }`}
          >
            <Clock className="w-3 h-3" />
            Newest
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
              sortBy === 'popular' ? 'bg-[#D4AF37]/20 text-[#F5D77A]' : 'text-[#A5A5A5] hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            Most Viewed
          </button>
        </div>
      </div>

      {/* Prompt Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-[#121212] animate-pulse border border-[rgba(212,175,55,0.1)]"
            />
          ))}
        </div>
      ) : prompts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {prompts.map((p) => (
            <PromptCard
              key={p.id}
              prompt={p}
              onNavigate={(slugOrId) => navigate(`/prompt/${slugOrId}`)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 px-4 rounded-3xl bg-[#0E0E0E] border border-[rgba(212,175,55,0.2)] max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#18140B] border border-[#D4AF37]/40 flex items-center justify-center mx-auto mb-4 text-[#F5D77A]">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-bold text-xl text-white">No Prompts Found</h3>
          <p className="text-xs text-[#A5A5A5] mt-2 max-w-sm mx-auto">
            We couldn't find any prompts matching your current search or filters. Try adjusting your query or resetting filters.
          </p>
          <button
            onClick={clearAllFilters}
            className="mt-6 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider gold-btn"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
