import React, { useState, useEffect } from 'react';
import { Prompt } from '../types/index.ts';
import { PromptCard } from '../components/PromptCard.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../components/Toast.tsx';
import {
  Copy,
  Check,
  Heart,
  Bookmark,
  Share2,
  Eye,
  Calendar,
  Sparkles,
  Layers,
  Bot,
  Tag,
  ArrowLeft,
  Crown,
  Flag,
  User,
  ExternalLink,
} from 'lucide-react';

interface PromptDetailPageProps {
  idOrSlug: string;
  navigate: (route: string) => void;
}

export const PromptDetailPage: React.FC<PromptDetailPageProps> = ({
  idOrSlug,
  navigate,
}) => {
  const { user, token } = useAuth();
  const { showToast } = useToast();

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copyCount, setCopyCount] = useState(0);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate content');
  const [reportMessage, setReportMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/prompts/${idOrSlug}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then((data) => {
        setPrompt(data);
        setIsFavorited(data.isFavorited || false);
        setIsSaved(data.isSaved || false);
        setCopyCount(data.copyCount || 0);
      })
      .catch((err) => {
        console.error(err);
        setPrompt(null);
      })
      .finally(() => setLoading(false));
  }, [idOrSlug, token]);

  const handleCopy = async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setCopyCount((prev) => prev + 1);
      showToast('Prompt copied successfully!');

      fetch(`/api/prompts/${prompt.id}/copy`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => {});

      setTimeout(() => setCopied(false), 2400);
    } catch {
      showToast('Failed to copy prompt to clipboard', 'error');
    }
  };

  const handleFavorite = async () => {
    if (!prompt) return;
    if (!user) {
      showToast('Please sign in to add to favorites', 'info');
      return;
    }
    const next = !isFavorited;
    setIsFavorited(next);
    try {
      const res = await fetch(`/api/prompts/${prompt.id}/favorite`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      showToast(data.message || (data.favorited ? 'Added to favorites' : 'Removed from favorites'));
    } catch {
      setIsFavorited(!next);
    }
  };

  const handleSave = async () => {
    if (!prompt) return;
    if (!user) {
      showToast('Please sign in to save prompt to library', 'info');
      return;
    }
    const next = !isSaved;
    setIsSaved(next);
    try {
      const res = await fetch(`/api/prompts/${prompt.id}/save`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      showToast(data.message || (data.saved ? 'Saved to private library' : 'Removed from saved'));
    } catch {
      setIsSaved(!next);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: prompt?.title,
          text: `Check out this AI prompt on JITENDRA PROMPTS: ${prompt?.title}`,
          url,
        });
      } catch {
        await navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!');
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    try {
      const res = await fetch(`/api/prompts/${prompt.id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason: reportReason, message: reportMessage }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Report submitted for admin review.');
        setReportModalOpen(false);
      } else {
        showToast(data.error || 'Failed to submit report', 'error');
      }
    } catch {
      showToast('Failed to submit report', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#A5A5A5]">Loading prompt details...</p>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="max-w-xl mx-auto px-4 py-28 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#18140B] border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-4 text-[#F5D77A]">
          ✦
        </div>
        <h1 className="font-display font-black text-2xl text-white uppercase">
          THIS PROMPT DOESN’T EXIST.
        </h1>
        <p className="text-xs text-[#A5A5A5] mt-2 mb-6">
          The requested prompt may have been removed or the URL is incorrect.
        </p>
        <button
          onClick={() => navigate('/explore')}
          className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider gold-btn"
        >
          BACK TO EXPLORE
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28">
      {/* Back Button */}
      <button
        onClick={() => navigate('/explore')}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A5A5A5] hover:text-[#F5D77A] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Explore</span>
      </button>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
        {/* Left Column: Large Preview Image/Video */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="relative rounded-3xl overflow-hidden bg-[#0D0D0D] border-2 border-[rgba(212,175,55,0.3)] shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.15)] group">
            <img
              src={prompt.previewImage}
              alt={prompt.title}
              className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-102"
            />
            {/* Top Overlay Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              {prompt.promptType === 'premium' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#F5D77A] to-[#D4AF37] text-black shadow-lg">
                  <Crown className="w-3.5 h-3.5 fill-current" />
                  PREMIUM
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-[#F5D77A] border border-[#D4AF37]/40">
                  FREE
                </span>
              )}

              {prompt.isTrending && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-950/80 backdrop-blur-md text-amber-300 border border-amber-500/50">
                  TRENDING
                </span>
              )}
            </div>
          </div>

          {/* Quick Metrics & Author Bar */}
          <div className="p-4 rounded-2xl bg-[#0F0F0F] border border-[rgba(212,175,55,0.2)] flex items-center justify-between">
            {/* Author */}
            <div className="flex items-center gap-3">
              {prompt.author?.avatarUrl ? (
                <img
                  src={prompt.author.avatarUrl}
                  alt=""
                  className="w-10 h-10 rounded-xl object-cover border border-[#D4AF37]/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#1e1a12] text-[#F5D77A] text-sm flex items-center justify-center font-bold">
                  {prompt.author?.fullName?.[0] || 'C'}
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-white">{prompt.author?.fullName || 'Creator'}</p>
                <p className="text-[11px] text-[#A5A5A5]">@{prompt.author?.username || 'creator'}</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-4 text-xs text-[#A5A5A5]">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-bold text-white">{prompt.views.toLocaleString()}</span> views
              </span>
              <span className="flex items-center gap-1.5">
                <Copy className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-bold text-white">{copyCount.toLocaleString()}</span> copies
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Prompt Details & Complete Prompt Box */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Header Metadata */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">
                {prompt.category?.name}
              </span>
              <span className="text-[#A5A5A5] text-xs">•</span>
              <span className="text-xs font-semibold text-[#F5D77A] flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {prompt.model?.name}
              </span>
              {prompt.style && (
                <>
                  <span className="text-[#A5A5A5] text-xs">•</span>
                  <span className="text-xs text-[#A5A5A5]">{prompt.style}</span>
                </>
              )}
            </div>

            <h1 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight leading-tight">
              {prompt.title}
            </h1>

            {prompt.description && (
              <p className="mt-3 text-sm text-[#A5A5A5] leading-relaxed">
                {prompt.description}
              </p>
            )}
          </div>

          {/* LARGE PROMPT EDITOR-STYLE BOX */}
          <div className="rounded-2xl bg-[#080808] border-2 border-[rgba(212,175,55,0.35)] shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Box Header */}
            <div className="px-4 py-2.5 bg-[#14120B] border-b border-[rgba(212,175,55,0.25)] flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-2 text-[#F5D77A] font-bold uppercase tracking-wider text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#F5D77A]" />
                COMPLETE PROMPT
              </span>
              <span className="text-[10px] text-[#A5A5A5]">UTF-8 READY</span>
            </div>

            {/* Prompt Content */}
            <div className="p-5 font-mono text-xs sm:text-sm text-gray-100 leading-relaxed whitespace-pre-wrap select-all selection:bg-[#D4AF37] selection:text-black">
              {prompt.content}
            </div>

            {/* In-box copy bar */}
            <div className="p-3 bg-[#0d0c08] border-t border-[rgba(212,175,55,0.15)] flex items-center justify-between">
              <span className="text-[11px] text-[#A5A5A5]">
                Optimized for {prompt.model?.name || 'AI Diffusion'}
              </span>
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  copied ? 'bg-emerald-600 text-white' : 'gold-btn'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY PROMPT</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={handleCopy}
              className={`col-span-2 py-3 px-5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                copied ? 'bg-emerald-600 text-white' : 'gold-btn'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>COPIED TO CLIPBOARD</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>COPY PROMPT</span>
                </>
              )}
            </button>

            <button
              onClick={handleSave}
              className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                isSaved
                  ? 'bg-[#D4AF37]/20 border border-[#F5D77A] text-[#F5D77A]'
                  : 'bg-[#141414] border border-white/10 text-[#A5A5A5] hover:text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'SAVED' : 'SAVE'}</span>
            </button>

            <button
              onClick={handleShare}
              className="py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#141414] border border-white/10 text-[#A5A5A5] hover:text-[#F5D77A] flex items-center justify-center gap-1.5 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>SHARE</span>
            </button>
          </div>

          {/* Prompt Information Specifications */}
          <div className="p-5 rounded-2xl bg-[#0F0F0F] border border-[rgba(212,175,55,0.2)]">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#F5D77A] mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              PROMPT INFORMATION
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#A5A5A5] block">AI Model:</span>
                <span className="font-semibold text-white mt-0.5 block">
                  {prompt.model?.name || 'Universal'}
                </span>
              </div>
              <div>
                <span className="text-[#A5A5A5] block">Category:</span>
                <span className="font-semibold text-white mt-0.5 block">
                  {prompt.category?.name || 'Cinematic'}
                </span>
              </div>
              <div>
                <span className="text-[#A5A5A5] block">Visual Style:</span>
                <span className="font-semibold text-white mt-0.5 block">
                  {prompt.style || 'Photorealistic'}
                </span>
              </div>
              <div>
                <span className="text-[#A5A5A5] block">Created Date:</span>
                <span className="font-semibold text-white mt-0.5 block">
                  {new Date(prompt.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Tags */}
            {prompt.tags && prompt.tags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <span className="text-[11px] text-[#A5A5A5] block mb-2 font-medium">Tags:</span>
                <div className="flex flex-wrap gap-1.5">
                  {prompt.tags.map((t) => (
                    <span
                      key={t.id}
                      onClick={() => navigate(`/explore?search=${encodeURIComponent(t.name)}`)}
                      className="px-2.5 py-1 rounded-md text-[11px] bg-black/60 border border-[#D4AF37]/20 text-[#A5A5A5] hover:text-[#F5D77A] hover:border-[#D4AF37]/50 cursor-pointer transition-all"
                    >
                      #{t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Report link */}
            <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setReportModalOpen(true)}
                className="text-[11px] text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <Flag className="w-3 h-3" />
                <span>Report prompt</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Prompts */}
      {prompt.related && prompt.related.length > 0 && (
        <div className="mt-16 pt-12 border-t border-[rgba(212,175,55,0.2)]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display font-bold text-xl sm:text-2xl text-white uppercase tracking-tight">
              RELATED <span className="gold-text-gradient">PROMPTS</span>
            </h2>
            <button
              onClick={() => navigate(`/explore?category=${prompt.category?.slug}`)}
              className="text-xs font-bold uppercase tracking-wider text-[#F5D77A] hover:underline"
            >
              See all in {prompt.category?.name}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {prompt.related.map((rp) => (
              <PromptCard
                key={rp.id!}
                prompt={rp as Prompt}
                onNavigate={(slugOrId) => navigate(`/prompt/${slugOrId}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0F0F0F] border border-[rgba(212,175,55,0.3)] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-display font-bold text-lg text-white mb-2">Report Prompt</h3>
            <p className="text-xs text-[#A5A5A5] mb-4">
              Help our moderation team keep JITENDRA PROMPTS high quality and compliant.
            </p>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#D4AF37] mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Inappropriate content">Inappropriate / NSFW content</option>
                  <option value="Copyright infringement">Copyright / Intellectual Property</option>
                  <option value="Low quality or broken prompt">Low quality or broken prompt</option>
                  <option value="Spam or misleading">Spam or misleading title</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#D4AF37] mb-1">Details (Optional)</label>
                <textarea
                  rows={3}
                  value={reportMessage}
                  onChange={(e) => setReportMessage(e.target.value)}
                  placeholder="Provide additional context..."
                  className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#A5A5A5] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold gold-btn"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
