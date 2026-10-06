import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Prompt } from '../types/index.ts';
import { PromptCard } from '../components/PromptCard.tsx';
import {
  LayoutDashboard,
  Heart,
  Bookmark,
  Sparkles,
  Eye,
  PlusSquare,
  User as UserIcon,
  LogOut,
  Compass,
  ArrowRight,
  TrendingUp,
  FolderHeart,
  Shield,
  Clock,
} from 'lucide-react';

interface DashboardPageProps {
  navigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const { user, logout, stats, token } = useAuth();
  const [recommended, setRecommended] = useState<Prompt[]>([]);
  const [recentPrompts, setRecentPrompts] = useState<Prompt[]>([]);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);

  useEffect(() => {
    // Fetch recommended prompts
    fetch('/api/prompts/trending')
      .then((r) => r.json())
      .then((data) => setRecommended(data.slice(0, 4)))
      .catch((e) => console.error(e));

    // Fetch user recent prompts
    if (token) {
      fetch('/api/user/my-prompts', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => setRecentPrompts(Array.isArray(data) ? data.slice(0, 4) : []))
        .catch((e) => console.error(e));

      fetch('/api/user/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => setNotificationsList(Array.isArray(data) ? data.slice(0, 5) : []))
        .catch((e) => console.error(e));
    }
  }, [token]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-[#0F0F0F] border border-[rgba(212,175,55,0.3)] text-center">
        <h2 className="font-display font-bold text-xl text-white">Sign In Required</h2>
        <p className="text-xs text-[#A5A5A5] mt-2 mb-6">
          Please sign in to access your creator dashboard.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase gold-btn"
        >
          GO TO LOGIN
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 rounded-2xl bg-[#0C0C0C] border border-[rgba(212,175,55,0.25)] p-4 shadow-xl">
          <div className="flex items-center gap-3 p-3 mb-4 border-b border-white/5">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="w-12 h-12 rounded-xl object-cover border border-[#D4AF37]/40"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#1a170f] text-[#F5D77A] font-black text-lg flex items-center justify-center border border-[#D4AF37]/30">
                {user.fullName[0]}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-white truncate">{user.fullName}</h3>
              <p className="text-xs text-[#A5A5A5] truncate">@{user.username}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] uppercase font-bold bg-[#D4AF37]/20 text-[#F5D77A]">
                {user.role}
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#D4AF37]/20 text-[#F5D77A] border border-[#D4AF37]/30"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => navigate('/explore')}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#A5A5A5] hover:text-white hover:bg-white/5 transition-colors"
            >
              <Compass className="w-4 h-4 text-[#D4AF37]" />
              <span>Explore Prompts</span>
            </button>
            <button
              onClick={() => navigate('/favorites')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#A5A5A5] hover:text-white hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-red-400" />
                <span>Favorites</span>
              </div>
              <span className="text-[11px] font-bold text-[#F5D77A]">{stats.favorites}</span>
            </button>
            <button
              onClick={() => navigate('/saved')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#A5A5A5] hover:text-white hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 text-[#D4AF37]" />
                <span>Saved Prompts</span>
              </div>
              <span className="text-[11px] font-bold text-[#F5D77A]">{stats.saved}</span>
            </button>
            <button
              onClick={() => navigate('/my-prompts')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#A5A5A5] hover:text-white hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>My Prompts</span>
              </div>
              <span className="text-[11px] font-bold text-[#F5D77A]">{stats.created}</span>
            </button>
            <button
              onClick={() => navigate('/create-prompt')}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-black gold-btn mt-3"
            >
              <PlusSquare className="w-4 h-4" />
              <span>Create Prompt</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#A5A5A5] hover:text-white hover:bg-white/5 transition-colors"
            >
              <UserIcon className="w-4 h-4 text-[#D4AF37]" />
              <span>Profile & Settings</span>
            </button>

            {user.role === 'admin' && (
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#F5D77A] bg-amber-950/40 border border-[#D4AF37]/40 hover:bg-amber-950/60 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Portal</span>
              </button>
            )}

            <div className="pt-3 border-t border-white/5 mt-2">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Dashboard Content */}
        <main className="lg:col-span-9 space-y-8">
          {/* Welcome Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#14120B] via-[#0E0E0E] to-[#080808] border border-[rgba(212,175,55,0.3)] shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF37]">
                CREATOR DASHBOARD
              </span>
              <h1 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight mt-1">
                WELCOME BACK, <span className="gold-text-gradient">{user.fullName.split(' ')[0]}</span>.
              </h1>
              <p className="text-xs sm:text-sm text-[#A5A5A5] mt-2 max-w-lg leading-relaxed">
                Discover new AI models, manage your submitted prompts, and track your global creation reach.
              </p>
            </div>
            <Sparkles className="w-32 h-32 text-[#D4AF37]/10 absolute -right-4 -bottom-4 pointer-events-none" />
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#A5A5A5]">Saved Prompts</span>
                <Bookmark className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <span className="font-display font-black text-2xl sm:text-3xl text-white">
                {stats.saved}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#A5A5A5]">Favorites</span>
                <Heart className="w-4 h-4 text-red-400" />
              </div>
              <span className="font-display font-black text-2xl sm:text-3xl text-white">
                {stats.favorites}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#A5A5A5]">Created Prompts</span>
                <Sparkles className="w-4 h-4 text-[#F5D77A]" />
              </div>
              <span className="font-display font-black text-2xl sm:text-3xl text-white">
                {stats.created}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#A5A5A5]">Prompt Views</span>
                <Eye className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <span className="font-display font-black text-2xl sm:text-3xl text-white">
                {stats.views}
              </span>
            </div>
          </div>

          {/* Notifications & Recent Activity */}
          {notificationsList.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Recent Notifications
              </h3>
              <div className="space-y-2">
                {notificationsList.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl bg-[#141414] border border-white/5 flex items-start justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{n.title}</h4>
                      <p className="text-[11px] text-[#A5A5A5] mt-0.5">{n.message}</p>
                    </div>
                    <span className="text-[10px] text-zinc-500 shrink-0">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Prompts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-white uppercase tracking-tight">
                RECOMMENDED <span className="gold-text-gradient">FOR YOU</span>
              </h3>
              <button
                onClick={() => navigate('/explore')}
                className="text-xs font-bold text-[#F5D77A] hover:underline flex items-center gap-1"
              >
                <span>View More</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommended.map((p) => (
                <PromptCard
                  key={p.id}
                  prompt={p}
                  onNavigate={(slugOrId) => navigate(`/prompt/${slugOrId}`)}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
