import React, { useState } from 'react';
import { JPLogo } from './JPLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Search,
  Heart,
  PlusCircle,
  Menu,
  X,
  User as UserIcon,
  LayoutDashboard,
  LogOut,
  Shield,
  FolderHeart,
  Compass,
  Sparkles,
  Layers,
} from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  navigate,
  onOpenSearch,
}) => {
  const { user, logout, stats } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/', icon: Sparkles },
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Categories', path: '/categories', icon: Layers },
    { label: 'Trending', path: '/trending', icon: Sparkles },
    { label: 'Create Prompt', path: '/create-prompt', icon: PlusCircle, highlight: true },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full gold-glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Monogram & Name */}
        <div
          onClick={() => handleNav('/')}
          className="cursor-pointer transition-opacity hover:opacity-95"
        >
          <JPLogo size="md" />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.path;
            if (link.highlight) {
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className="ml-2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider gold-btn"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </button>
              );
            }

            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`relative px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'text-[#F5D77A] bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.3)] shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                    : 'text-[#A5A5A5] hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#F5D77A] rounded-full shadow-[0_0_8px_#F5D77A]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Side: Search, Favorites, Auth */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#121212] border border-[rgba(212,175,55,0.25)] text-[#A5A5A5] hover:text-[#F5D77A] hover:border-[#F5D77A]/50 transition-all text-xs font-medium group"
          >
            <Search className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Search prompts...</span>
            <kbd className="hidden sm:inline-block text-[10px] bg-black/60 px-1.5 py-0.5 rounded border border-white/10 text-white/50">
              ⌘K
            </kbd>
          </button>

          {/* Favorites Link */}
          <button
            onClick={() => handleNav('/favorites')}
            title="Favorites"
            className="relative p-2.5 rounded-xl bg-[#121212] border border-[rgba(212,175,55,0.2)] text-[#A5A5A5] hover:text-red-400 hover:border-red-500/40 transition-all"
          >
            <Heart className="w-4 h-4" />
            {stats.favorites > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D4AF37] text-black text-[9px] font-black flex items-center justify-center">
                {stats.favorites}
              </span>
            )}
          </button>

          {/* User Auth or Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-[#121212] border border-[rgba(212,175,55,0.3)] hover:border-[#F5D77A] transition-all"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#8c6d14] text-black font-black text-xs flex items-center justify-center">
                    {user.fullName?.[0] || 'U'}
                  </div>
                )}
                <span className="hidden md:inline text-xs font-bold text-white pr-1">
                  {user.fullName.split(' ')[0]}
                </span>
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.3)] shadow-[0_20px_40px_rgba(0,0,0,0.9)] py-2 z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
                    <p className="text-[11px] text-[#A5A5A5] truncate">@{user.username}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-extrabold bg-[#D4AF37]/20 text-[#F5D77A] border border-[#D4AF37]/30">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => handleNav('/dashboard')}
                      className="w-full text-left px-4 py-2 text-xs text-[#A5A5A5] hover:text-[#F5D77A] hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#D4AF37]" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => handleNav('/my-prompts')}
                      className="w-full text-left px-4 py-2 text-xs text-[#A5A5A5] hover:text-[#F5D77A] hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      My Prompts
                    </button>
                    <button
                      onClick={() => handleNav('/saved')}
                      className="w-full text-left px-4 py-2 text-xs text-[#A5A5A5] hover:text-[#F5D77A] hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                    >
                      <FolderHeart className="w-4 h-4 text-[#D4AF37]" />
                      Saved Prompts
                    </button>
                    <button
                      onClick={() => handleNav('/profile')}
                      className="w-full text-left px-4 py-2 text-xs text-[#A5A5A5] hover:text-[#F5D77A] hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-[#D4AF37]" />
                      Profile & Settings
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleNav('/admin/dashboard')}
                        className="w-full text-left px-4 py-2 text-xs text-[#F5D77A] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 flex items-center gap-2.5 transition-colors font-bold"
                      >
                        <Shield className="w-4 h-4 text-[#F5D77A]" />
                        Admin Portal
                      </button>
                    )}
                  </div>

                  <div className="pt-1 border-t border-white/10">
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNav('/login')}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider gold-btn"
              >
                LOGIN
              </button>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#121212] border border-[rgba(212,175,55,0.25)] text-white hover:text-[#F5D77A]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-20 bg-[#080808]/95 backdrop-blur-2xl border-b border-[rgba(212,175,55,0.3)] p-6 shadow-2xl animate-in slide-in-from-top-4">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`flex items-center justify-between p-3 rounded-xl text-sm font-bold uppercase tracking-wider ${
                  currentRoute === link.path
                    ? 'bg-[#D4AF37]/20 text-[#F5D77A] border border-[#D4AF37]/30'
                    : 'text-[#A5A5A5] hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{link.label}</span>
                <link.icon className="w-4 h-4 text-[#D4AF37]" />
              </button>
            ))}

            {!user ? (
              <div className="pt-4 mt-2 border-t border-white/10 flex gap-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider gold-btn text-center"
                >
                  LOGIN
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider gold-btn-outline text-center"
                >
                  REGISTER
                </button>
              </div>
            ) : (
              <div className="pt-4 mt-2 border-t border-white/10 flex flex-col gap-2">
                <button
                  onClick={() => handleNav('/dashboard')}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-white/5 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#D4AF37]" />
                  Dashboard
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => handleNav('/admin/dashboard')}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold text-[#F5D77A] bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </button>
                )}
                <button
                  onClick={logout}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold text-red-400 bg-red-950/30 border border-red-500/20 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
