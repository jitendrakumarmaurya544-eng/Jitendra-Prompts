import React, { useState, useEffect } from 'react';
import { Prompt, Category, SiteSettings } from '../types/index.ts';
import { PromptCard } from '../components/PromptCard.tsx';
import { useToast } from '../components/Toast.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Heart,
  Crown,
  Eye,
  Camera,
  Film,
  Zap,
  Box,
  Brain,
  Wand2,
  Image,
  Video,
  Layers,
  ShoppingBag,
  User,
  Briefcase,
  Play,
  TrendingUp,
  Flame,
  Award,
} from 'lucide-react';

interface HomePageProps {
  navigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { user, token } = useAuth();
  const { showToast } = useToast();

  const [promptOfDay, setPromptOfDay] = useState<Prompt | null>(null);
  const [trendingPrompts, setTrendingPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [podCopied, setPodCopied] = useState(false);
  const [podFav, setPodFav] = useState(false);

  useEffect(() => {
    // Fetch settings
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch((e) => console.error(e));

    // Fetch Prompt of the Day
    fetch('/api/prompts/pod')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.id) {
          setPromptOfDay(data);
          setPodFav(data.isFavorited || false);
        }
      })
      .catch((e) => console.error(e));

    // Fetch Trending
    fetch('/api/prompts/trending')
      .then((r) => r.json())
      .then((data) => setTrendingPrompts(data))
      .catch((e) => console.error(e));

    // Fetch Categories
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch((e) => console.error(e));
  }, []);

  const handleCopyPod = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!promptOfDay) return;
    try {
      await navigator.clipboard.writeText(promptOfDay.content);
      setPodCopied(true);
      showToast('Prompt copied successfully!');
      fetch(`/api/prompts/${promptOfDay.id}/copy`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => {});
      setTimeout(() => setPodCopied(false), 2200);
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  const handleFavoritePod = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      showToast('Please login to save favorites', 'info');
      return;
    }
    if (!promptOfDay) return;
    const next = !podFav;
    setPodFav(next);
    try {
      const res = await fetch(`/api/prompts/${promptOfDay.id}/favorite`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      showToast(data.message || (data.favorited ? 'Added to favorites' : 'Removed'));
    } catch {
      setPodFav(!next);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Film':
        return <Film className="w-5 h-5 text-[#F5D77A]" />;
      case 'Camera':
        return <Camera className="w-5 h-5 text-[#F5D77A]" />;
      case 'Box':
        return <Box className="w-5 h-5 text-[#F5D77A]" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-[#F5D77A]" />;
      case 'User':
        return <User className="w-5 h-5 text-[#F5D77A]" />;
      case 'Video':
        return <Video className="w-5 h-5 text-[#F5D77A]" />;
      case 'Play':
        return <Play className="w-5 h-5 text-[#F5D77A]" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-[#F5D77A]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#F5D77A]" />;
    }
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden pb-16">
      {/* ==========================================
          1. HERO SECTION
         ========================================== */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Glow orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & CTA */}
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18140B] border border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.2)] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#F5D77A] animate-ping" />
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#F5D77A]">
                {settings?.hero_badge || 'THE AI PROMPT LIBRARY'}
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="font-display font-black text-4xl sm:text-6xl xl:text-7xl leading-[1.08] tracking-tight text-white uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              TURN YOUR IDEAS <br />
              <span className="gold-text-gradient-bright">INTO VISUALS.</span>
            </h1>

            {/* Highlight */}
            <div className="mt-3 flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-[#161616] border border-[#D4AF37]/30 text-xs sm:text-sm font-black uppercase tracking-widest text-[#F5D77A]">
                {settings?.hero_highlight || 'POWERFUL PROMPTS.'}
              </span>
              <span className="text-xs text-[#A5A5A5] uppercase tracking-widest font-semibold">
                FOR 8K CINEMATOGRAPHY & ART
              </span>
            </div>

            {/* Description */}
            <p className="mt-6 text-base sm:text-lg text-[#A5A5A5] max-w-xl leading-relaxed">
              {settings?.hero_description ||
                'Discover premium AI prompts for images, videos, design, business, marketing and creativity.'}
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/explore')}
                className="px-7 py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-widest gold-btn flex items-center gap-2"
              >
                <span>EXPLORE PROMPTS</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/create-prompt')}
                className="px-7 py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-widest gold-btn-outline"
              >
                CREATE YOUR PROMPT
              </button>
            </div>

            {/* Sub-features list inspired by reference image */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[rgba(212,175,55,0.2)] w-full">
              <div className="flex items-center gap-2 text-xs text-[#A5A5A5]">
                <Check className="w-4 h-4 text-[#F5D77A]" />
                <span>Instant 1-Click Copy</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#A5A5A5]">
                <Check className="w-4 h-4 text-[#F5D77A]" />
                <span>Verified Studio Renders</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#A5A5A5]">
                <Check className="w-4 h-4 text-[#F5D77A]" />
                <span>Midjourney • Flux • Runway</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual - Floating 3D Prompt of the Day Card + Floating 3D Objects */}
          <div className="lg:col-span-5 relative flex justify-center items-center z-10 perspective-1000">
            {/* Floating 3D Objects around the card */}
            {/* 1. AI Brain */}
            <div className="absolute -top-6 -left-6 z-20 w-12 h-12 rounded-2xl bg-[#14120B] border border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center animate-float pointer-events-none">
              <Brain className="w-6 h-6 text-[#F5D77A]" />
            </div>

            {/* 2. Camera */}
            <div className="absolute -top-8 right-6 z-20 w-11 h-11 rounded-2xl bg-[#14120B] border border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center animate-float-delayed pointer-events-none">
              <Camera className="w-5 h-5 text-[#F5D77A]" />
            </div>

            {/* 3. Magic Wand */}
            <div className="absolute top-1/2 -left-8 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-[#14120B] border border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center animate-float pointer-events-none">
              <Wand2 className="w-5 h-5 text-[#F5D77A]" />
            </div>

            {/* 4. 3D Cube */}
            <div className="absolute top-1/3 -right-6 z-20 w-11 h-11 rounded-2xl bg-[#14120B] border border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center animate-float-delayed pointer-events-none">
              <Box className="w-5 h-5 text-[#F5D77A]" />
            </div>

            {/* 5. Lightning */}
            <div className="absolute -bottom-6 left-8 z-20 w-10 h-10 rounded-2xl bg-[#14120B] border border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center animate-float pointer-events-none">
              <Zap className="w-5 h-5 text-[#F5D77A]" />
            </div>

            {/* 6. Image Icon */}
            <div className="absolute -bottom-8 right-12 z-20 w-11 h-11 rounded-2xl bg-[#14120B] border border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center animate-float-delayed pointer-events-none">
              <Image className="w-5 h-5 text-[#F5D77A]" />
            </div>

            {/* 7. Video Icon */}
            <div className="absolute bottom-1/4 -right-8 z-20 w-10 h-10 rounded-2xl bg-[#14120B] border border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center animate-float pointer-events-none">
              <Video className="w-5 h-5 text-[#F5D77A]" />
            </div>

            {/* Large 3D Prompt of the Day Card */}
            {promptOfDay ? (
              <div
                onClick={() => navigate(`/prompt/${promptOfDay.slug || promptOfDay.id}`)}
                className="w-full max-w-md rounded-3xl overflow-hidden bg-[#0F0F0F] border-2 border-[rgba(245,215,122,0.45)] shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(212,175,55,0.25)] cursor-pointer group transition-all duration-500 hover:scale-[1.02]"
              >
                {/* Header Badge */}
                <div className="px-5 py-3 bg-[#18140B] border-b border-[#D4AF37]/30 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#F5D77A]">
                    <Sparkles className="w-3.5 h-3.5 text-[#F5D77A]" />
                    PROMPT OF THE DAY
                  </span>
                  {promptOfDay.model && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white border border-[#D4AF37]/30">
                      {promptOfDay.model.name}
                    </span>
                  )}
                </div>

                {/* Preview Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-black">
                  <img
                    src={promptOfDay.previewImage}
                    alt={promptOfDay.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5D77A] uppercase tracking-wider">
                      {promptOfDay.category?.name}
                    </span>
                    <span className="text-[11px] text-[#A5A5A5] flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {promptOfDay.views} views
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <h3 className="font-heading font-bold text-lg text-white group-hover:text-[#F5D77A] transition-colors line-clamp-1">
                    {promptOfDay.title}
                  </h3>

                  {/* Prompt Box Preview */}
                  <div className="mt-3 p-3 rounded-xl bg-black/70 border border-[rgba(212,175,55,0.2)] font-mono text-xs text-[#A5A5A5] line-clamp-3 leading-relaxed relative">
                    {promptOfDay.content}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <button
                      onClick={handleCopyPod}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        podCopied ? 'bg-emerald-600 text-white' : 'gold-btn'
                      }`}
                    >
                      {podCopied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>COPIED!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>COPY PROMPT</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleFavoritePod}
                      className={`p-2.5 rounded-xl border transition-all ${
                        podFav
                          ? 'bg-red-950/80 border-red-500/60 text-red-400'
                          : 'bg-[#181818] border-[#D4AF37]/30 text-white hover:text-red-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${podFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md h-96 rounded-3xl bg-[#121212] animate-pulse border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                Loading Prompt of the Day...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==========================================
          2. HERO STATISTICS (Section 5)
         ========================================== */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-4 mb-24 z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-[#0A0A0A]/90 border border-[rgba(212,175,55,0.25)] shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
          <div className="flex flex-col items-center justify-center p-3 text-center border-r border-[rgba(212,175,55,0.15)] last:border-none">
            <span className="font-display font-black text-3xl sm:text-4xl lg:text-5xl gold-text-gradient-bright tracking-tight">
              {settings?.stat_prompts || '10K+'}
            </span>
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#A5A5A5] mt-1">
              Prompts
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 text-center md:border-r border-[rgba(212,175,55,0.15)] last:border-none">
            <span className="font-display font-black text-3xl sm:text-4xl lg:text-5xl gold-text-gradient-bright tracking-tight">
              {settings?.stat_categories || '50+'}
            </span>
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#A5A5A5] mt-1">
              Categories
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 text-center border-r border-[rgba(212,175,55,0.15)] last:border-none">
            <span className="font-display font-black text-3xl sm:text-4xl lg:text-5xl gold-text-gradient-bright tracking-tight">
              {settings?.stat_tools || '20+'}
            </span>
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#A5A5A5] mt-1">
              AI Tools
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 text-center">
            <span className="font-display font-black text-3xl sm:text-4xl lg:text-5xl gold-text-gradient-bright tracking-tight">
              {settings?.stat_creators || '25K+'}
            </span>
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#A5A5A5] mt-1">
              Creators
            </span>
          </div>
        </div>
      </section>

      {/* ==========================================
          3. FEATURED CATEGORIES (Section 6)
         ========================================== */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-2">
              <Layers className="w-4 h-4" />
              <span>EXPLORE DISCIPLINES</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white uppercase tracking-tight">
              FEATURED <span className="gold-text-gradient">CATEGORIES</span>
            </h2>
          </div>

          <button
            onClick={() => navigate('/categories')}
            className="text-xs font-bold uppercase tracking-wider text-[#F5D77A] hover:text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.slice(0, 8).map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/explore?category=${cat.slug}`)}
              className="group relative rounded-2xl overflow-hidden bg-[#0E0E0E] border border-[rgba(212,175,55,0.2)] hover:border-[#F5D77A] p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:shadow-[0_15px_35px_rgba(212,175,55,0.2)] flex flex-col justify-between min-h-[160px]"
            >
              {/* Subtle category background image blur */}
              {cat.image && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{ backgroundImage: `url(${cat.image})` }}
                />
              )}

              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#18140B] border border-[#D4AF37]/30 flex items-center justify-center mb-3 group-hover:border-[#F5D77A] transition-colors">
                  {getCategoryIcon(cat.icon)}
                </div>
                <h3 className="font-heading font-bold text-white text-base group-hover:text-[#F5D77A] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-[#A5A5A5] line-clamp-2 mt-1">
                  {cat.description}
                </p>
              </div>

              <div className="relative z-10 mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-[#A5A5A5] text-[11px]">
                  {cat.promptCount || 0} prompts
                </span>
                <span className="text-[#F5D77A] font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
          4. TRENDING PROMPTS GRID (Section 7)
         ========================================== */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-28">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
              <Flame className="w-4 h-4" />
              <span>COMMUNITY FAVORITES</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white uppercase tracking-tight">
              TRENDING <span className="gold-text-gradient">PROMPTS</span>
            </h2>
          </div>

          <button
            onClick={() => navigate('/explore?sort=trending')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider gold-btn-outline flex items-center gap-2"
          >
            <span>View All Prompts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingPrompts.map((p) => (
            <PromptCard
              key={p.id}
              prompt={p}
              onNavigate={(slugOrId) => navigate(`/prompt/${slugOrId}`)}
            />
          ))}
        </div>
      </section>

      {/* ==========================================
          5. "MILLIONAIRE MODE" CINEMATIC CREATOR BANNER
             (Direct Inspiration from Attached Reference Image)
         ========================================== */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-28">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#14120B] via-[#0A0A0A] to-[#050505] border-2 border-[rgba(245,215,122,0.35)] p-8 sm:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
          {/* Subtle gold lines */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-[#D4AF37]/40 text-[#F5D77A] text-[11px] font-black uppercase tracking-[0.2em] mb-4">
              <Award className="w-3.5 h-3.5" />
              <span>THE MILLIONAIRE MODE COLLECTION</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight leading-tight">
              CREATE YOUR <span className="gold-text-gradient-bright">MILLIONAIRE MODE LIFE</span>
            </h2>

            <p className="mt-4 text-sm sm:text-base text-[#A5A5A5] leading-relaxed">
              13 Cinematic Video & Image Prompts crafted for high-performance entrepreneurs, solopreneurs, and visionaries. “Turn your dreams into visuals. Because energy + vision = reality.”
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-lg bg-black/80 border border-[#D4AF37]/30 text-[#F5D77A] font-bold">
                #LawOfAssumption
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-black/80 border border-[#D4AF37]/30 text-[#F5D77A] font-bold">
                #MillionaireMindset
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-black/80 border border-[#D4AF37]/30 text-[#F5D77A] font-bold">
                #SolopreneurLife
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-black/80 border border-[#D4AF37]/30 text-[#F5D77A] font-bold">
                #CinematicAesthetic
              </span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/explore?search=Millionaire')}
                className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider gold-btn"
              >
                DISCOVER THE COLLECTION
              </button>
              <button
                onClick={() => navigate('/create-prompt')}
                className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider gold-btn-outline"
              >
                SUBMIT YOUR EDITORIAL PROMPT
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          6. VIP CREATOR CALL TO ACTION
         ========================================== */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="p-8 sm:p-14 rounded-3xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.25)] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <Sparkles className="w-10 h-10 text-[#F5D77A] mx-auto mb-4 animate-bounce" />
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white uppercase tracking-tight">
            STOP WAITING FOR YOUR FUTURE. <br />
            <span className="gold-text-gradient">START PROMPTING IT TODAY.</span>
          </h2>
          <p className="text-sm text-[#A5A5A5] max-w-xl mx-auto mt-4 leading-relaxed">
            Join thousands of visionary creators unlocking high-resolution cinematic prompts for Midjourney, Flux, Runway, and Kling AI.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/explore')}
              className="px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider gold-btn"
            >
              START EXPLORING NOW
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
