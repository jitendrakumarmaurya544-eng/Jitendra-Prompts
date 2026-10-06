import React, { useState, useEffect } from 'react';
import { Category } from '../types/index.ts';
import { Layers, ArrowRight, Sparkles, Film, Camera, Box, ShoppingBag, User, Video, Play, Briefcase } from 'lucide-react';

interface CategoriesPageProps {
  navigate: (route: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ navigate }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Film':
        return <Film className="w-6 h-6 text-[#F5D77A]" />;
      case 'Camera':
        return <Camera className="w-6 h-6 text-[#F5D77A]" />;
      case 'Box':
        return <Box className="w-6 h-6 text-[#F5D77A]" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-6 h-6 text-[#F5D77A]" />;
      case 'User':
        return <User className="w-6 h-6 text-[#F5D77A]" />;
      case 'Video':
        return <Video className="w-6 h-6 text-[#F5D77A]" />;
      case 'Play':
        return <Play className="w-6 h-6 text-[#F5D77A]" />;
      case 'Briefcase':
        return <Briefcase className="w-6 h-6 text-[#F5D77A]" />;
      default:
        return <Sparkles className="w-6 h-6 text-[#F5D77A]" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18140B] border border-[#D4AF37]/30 text-[#F5D77A] text-[11px] font-bold uppercase tracking-widest mb-3">
          <Layers className="w-3.5 h-3.5" />
          <span>PROMPT DOMAINS</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl uppercase text-white tracking-tight">
          PROMPT <span className="gold-text-gradient">CATEGORIES</span>
        </h1>
        <p className="mt-3 text-sm text-[#A5A5A5] leading-relaxed">
          Explore specialized AI prompt architectures organized by visual medium, camera discipline, and creative genre.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 rounded-3xl bg-[#121212] animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/explore?category=${c.slug}`)}
              className="group relative rounded-3xl overflow-hidden bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)] hover:border-[#F5D77A] p-6 cursor-pointer transition-all duration-400 hover:-translate-y-2 shadow-[0_15px_35px_rgba(0,0,0,0.85)] hover:shadow-[0_20px_45px_rgba(212,175,55,0.2)] flex flex-col justify-between min-h-[220px]"
            >
              {c.image && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-15 group-hover:opacity-25 transition-opacity"
                  style={{ backgroundImage: `url(${c.image})` }}
                />
              )}

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[#18140B] border border-[#D4AF37]/40 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  {getIcon(c.icon)}
                </div>
                <h3 className="font-heading font-black text-xl text-white group-hover:text-[#F5D77A] transition-colors">
                  {c.name}
                </h3>
                <p className="text-xs text-[#A5A5A5] mt-2 leading-relaxed line-clamp-3">
                  {c.description}
                </p>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="font-bold text-[#D4AF37]">
                  {c.promptCount || 0} PROMPTS
                </span>
                <span className="text-[#F5D77A] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  EXPLORE <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
