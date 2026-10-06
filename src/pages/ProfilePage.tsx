import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../components/Toast.tsx';
import { User as UserIcon, Globe, Sparkles, Heart, Eye, Save, ArrowRight } from 'lucide-react';

interface ProfilePageProps {
  navigate: (route: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ navigate }) => {
  const { user, stats, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateProfile({ fullName, bio, website, avatarUrl });
    setLoading(false);

    if (res.success) {
      showToast('Profile updated successfully!');
    } else {
      showToast(res.error || 'Failed to update profile', 'error');
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 rounded-3xl bg-[#0F0F0F] border border-[rgba(212,175,55,0.3)] text-center">
        <h2 className="font-display font-bold text-xl text-white">Sign In Required</h2>
        <p className="text-xs text-[#A5A5A5] mt-2 mb-6">
          Sign in to customize your creator profile.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase gold-btn"
        >
          LOGIN
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18140B] border border-[#D4AF37]/30 text-[#F5D77A] text-[11px] font-bold uppercase tracking-widest mb-2">
          <UserIcon className="w-3.5 h-3.5" />
          <span>CREATOR IDENTITY</span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
          PROFILE & <span className="gold-text-gradient">SETTINGS</span>
        </h1>
      </div>

      {/* Creator Overview Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0C0C0C] border border-[rgba(212,175,55,0.25)] shadow-xl mb-8 flex flex-col sm:flex-row items-center gap-6">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-24 h-24 rounded-2xl object-cover border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-[#1a170f] text-[#F5D77A] font-black text-3xl flex items-center justify-center border-2 border-[#D4AF37]">
            {user.fullName[0]}
          </div>
        )}

        <div className="text-center sm:text-left flex-1">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-white">{user.fullName}</h2>
          <p className="text-xs text-[#A5A5A5] mt-0.5">@{user.username} • {user.email}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37]/20 text-[#F5D77A] border border-[#D4AF37]/30">
            {user.role} tier creator
          </span>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5 text-center sm:text-left">
            <div>
              <span className="text-[10px] text-[#A5A5A5] uppercase tracking-wider block">Created</span>
              <span className="font-display font-black text-xl text-white">{stats.created}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#A5A5A5] uppercase tracking-wider block">Favorites</span>
              <span className="font-display font-black text-xl text-white">{stats.favorites}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#A5A5A5] uppercase tracking-wider block">Views</span>
              <span className="font-display font-black text-xl text-white">{stats.views}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)] space-y-6">
        <h3 className="font-display font-bold text-lg text-white uppercase tracking-tight">
          Edit Profile Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F5D77A]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
              Website / Portfolio
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourportfolio.com"
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F5D77A]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
            Avatar Image URL
          </label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F5D77A]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
            Creator Bio
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell other creators about your visual style and AI specialties..."
            className="w-full bg-[#141414] border border-white/10 rounded-xl p-4 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F5D77A]"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest gold-btn flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{loading ? 'SAVING...' : 'SAVE CHANGES'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
