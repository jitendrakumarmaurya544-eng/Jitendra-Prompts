import React, { useState } from 'react';
import { Prompt } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from './Toast.tsx';
import {
  Copy,
  Check,
  Heart,
  Eye,
  Sparkles,
  Crown,
  Share2,
  ExternalLink,
} from 'lucide-react';

interface PromptCardProps {
  prompt: Prompt;
  onNavigate?: (idOrSlug: string | number) => void;
  onFavoriteChange?: (id: number, isFavorited: boolean) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  onNavigate,
  onFavoriteChange,
}) => {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isFav, setIsFav] = useState(prompt.isFavorited || false);
  const [copyCount, setCopyCount] = useState(prompt.copyCount || 0);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setCopyCount((prev) => prev + 1);
      showToast('Prompt copied successfully!');

      // Record copy in backend
      fetch(`/api/prompts/${prompt.id}/copy`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => {});

      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      showToast('Failed to copy prompt to clipboard', 'error');
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      showToast('Please login to save favorites', 'info');
      return;
    }

    const nextState = !isFav;
    setIsFav(nextState);
    if (onFavoriteChange) onFavoriteChange(prompt.id, nextState);

    try {
      const res = await fetch(`/api/prompts/${prompt.id}/favorite`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.favorited !== undefined) {
        setIsFav(data.favorited);
        showToast(data.message || (data.favorited ? 'Added to favorites' : 'Removed from favorites'));
      }
    } catch {
      setIsFav(!nextState); // Rollback
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/prompt/${prompt.slug || prompt.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: prompt.title,
          text: `Check out this AI prompt on JITENDRA PROMPTS: ${prompt.title}`,
          url,
        });
      } catch {
        // Fallback to copy link
        await navigator.clipboard.writeText(url);
        showToast('Prompt link copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(url);
      showToast('Prompt link copied to clipboard!');
    }
  };

  return (
    <div
      onClick={() => onNavigate && onNavigate(prompt.slug || prompt.id)}
      className="group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)] hover:border-[rgba(245,215,122,0.55)] transition-all duration-400 ease-out hover:-translate-y-1.5 shadow-[0_15px_35px_rgba(0,0,0,0.85)] hover:shadow-[0_20px_45px_rgba(212,175,55,0.18)]"
    >
      {/* Top Media Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#121212]">
        <img
          src={prompt.previewImage}
          alt={prompt.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Cinematic Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            {prompt.promptType === 'premium' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#F5D77A] to-[#D4AF37] text-black shadow-md">
                <Crown className="w-3 h-3 fill-current" />
                PREMIUM
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-md text-[#F5D77A] border border-[#D4AF37]/30">
                FREE
              </span>
            )}

            {prompt.isTrending && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-950/80 backdrop-blur-md text-amber-300 border border-amber-500/40">
                <Sparkles className="w-2.5 h-2.5" />
                TRENDING
              </span>
            )}

            {prompt.isFeatured && !prompt.isTrending && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950/60 backdrop-blur-md text-[#F5D77A] border border-[#D4AF37]/40">
                FEATURED
              </span>
            )}
          </div>

          {/* Favorite & Share buttons (clickable) */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={handleShare}
              title="Share Prompt"
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/25 text-white/80 hover:text-[#F5D77A] hover:border-[#D4AF37]/60 flex items-center justify-center transition-all hover:scale-105"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFavorite}
              title={isFav ? 'Remove Favorite' : 'Add to Favorites'}
              className={`w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center transition-all hover:scale-105 ${
                isFav
                  ? 'bg-red-950/80 border-red-500/60 text-red-400'
                  : 'bg-black/60 border-[#D4AF37]/25 text-white/80 hover:text-red-400 hover:border-red-500/40'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* AI Model Tag Pill at bottom-left of preview */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10 pointer-events-none">
          {prompt.model && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-black/80 backdrop-blur-md border border-[#D4AF37]/35 text-[#F5D77A]">
              <span>✦</span>
              {prompt.model.name}
            </span>
          )}
          {prompt.style && (
            <span className="hidden sm:inline-block px-2 py-1 rounded-md text-[10px] bg-black/60 backdrop-blur-md text-[#A5A5A5] border border-white/10">
              {prompt.style}
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-[#A5A5A5] mb-1.5">
            <span className="uppercase tracking-widest font-semibold text-[#D4AF37]">
              {prompt.category?.name || 'Cinematic'}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-[#A5A5A5]" />
                {prompt.views.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Copy className="w-3 h-3 text-[#A5A5A5]" />
                {copyCount.toLocaleString()}
              </span>
            </div>
          </div>

          <h3 className="font-heading font-bold text-white text-base group-hover:text-[#F5D77A] transition-colors line-clamp-1">
            {prompt.title}
          </h3>

          <p className="text-xs text-[#A5A5A5] line-clamp-2 mt-1.5 leading-relaxed">
            {prompt.description || prompt.content}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="mt-4 pt-3 border-t border-[rgba(212,175,55,0.15)] flex items-center justify-between gap-2">
          {/* Author snippet */}
          <div className="flex items-center gap-2 min-w-0">
            {prompt.author?.avatarUrl ? (
              <img
                src={prompt.author.avatarUrl}
                alt=""
                className="w-5 h-5 rounded-full object-cover border border-[#D4AF37]/30"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#1e1a12] text-[#F5D77A] text-[9px] flex items-center justify-center font-bold">
                {prompt.author?.fullName?.[0] || 'C'}
              </div>
            )}
            <span className="text-xs text-[#A5A5A5] truncate">
              {prompt.author?.username || 'Creator'}
            </span>
          </div>

          {/* Copy Prompt Button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'gold-btn'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
