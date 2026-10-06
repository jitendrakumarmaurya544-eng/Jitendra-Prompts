import React, { useState, useEffect } from 'react';
import { Prompt } from '../types/index.ts';
import { PromptCard } from '../components/PromptCard.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Bookmark, Compass, ArrowRight } from 'lucide-react';

interface SavedPromptsPageProps {
  navigate: (route: string) => void;
}

export const SavedPromptsPage: React.FC<SavedPromptsPageProps> = ({ navigate }) => {
  const { user, token } = useAuth();
  const [saved, setSaved] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch('/api/user/saved', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setSaved(Array.isArray(data) ? data : []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [token]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 rounded-3xl bg-[#0F0F0F] border border-[rgba(212,175,55,0.3)] text-center">
        <Bookmark className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
        <h2 className="font-display font-bold text-xl text-white">Sign In to View Saved Prompts</h2>
        <p className="text-xs text-[#A5A5A5] mt-2 mb-6">
          Access your privately bookmarked prompts anytime.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase gold-btn"
        >
          LOGIN NOW
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-1">
            <Bookmark className="w-4 h-4 text-[#F5D77A]" />
            <span>PRIVATE LIBRARY</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
            SAVED <span className="gold-text-gradient">PROMPTS</span>
          </h1>
        </div>

        <button
          onClick={() => navigate('/explore')}
          className="text-xs font-bold uppercase tracking-wider text-[#F5D77A] hover:underline flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Compass className="w-4 h-4" />
          <span>Discover More</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-[#121212] animate-pulse border border-white/5" />
          ))}
        </div>
      ) : saved.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {saved.map((p) => (
            <PromptCard
              key={p.id}
              prompt={p}
              onNavigate={(slugOrId) => navigate(`/prompt/${slugOrId}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 rounded-3xl bg-[#0E0E0E] border border-[rgba(212,175,55,0.2)] max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#18140B] border border-[#D4AF37]/40 flex items-center justify-center mx-auto mb-4 text-[#F5D77A]">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-bold text-xl text-white">No Saved Prompts Yet</h3>
          <p className="text-xs text-[#A5A5A5] mt-2 max-w-sm mx-auto">
            Save prompts during your creative discovery sessions to build your personal production library.
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="mt-6 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider gold-btn inline-flex items-center gap-2"
          >
            <span>Explore Prompts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
