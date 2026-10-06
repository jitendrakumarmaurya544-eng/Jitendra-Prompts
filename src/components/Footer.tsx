import React from 'react';
import { JPLogo } from './JPLogo.tsx';
import { Sparkles, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="relative bg-[#050505] border-t border-[rgba(212,175,55,0.2)] pt-16 pb-24 md:pb-16 overflow-hidden">
      {/* Background ambient gold gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-[#D4AF37]/10 to-transparent pointer-events-none blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[rgba(212,175,55,0.15)]">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <JPLogo size="lg" />
            <p className="text-sm text-[#A5A5A5] max-w-sm leading-relaxed mt-2">
              JITENDRA PROMPTS is the premier luxury prompt engineering ecosystem designed for high-caliber creators, filmmakers, and digital entrepreneurs.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F5D77A] tracking-wider uppercase mt-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>“Your Ideas. Your Prompts. Your Creation.”</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#F5D77A] mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A5A5A5]">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/explore')}
                  className="hover:text-white transition-colors"
                >
                  Prompt Library
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/categories')}
                  className="hover:text-white transition-colors"
                >
                  Categories
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/trending')}
                  className="hover:text-white transition-colors"
                >
                  Trending Prompts
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/create-prompt')}
                  className="hover:text-white transition-colors flex items-center gap-1 text-[#F5D77A]"
                >
                  <span>Submit Prompt</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#F5D77A] mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A5A5A5]">
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="hover:text-white transition-colors"
                >
                  About the Platform
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="hover:text-white transition-colors"
                >
                  Contact & Inquiries
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="hover:text-white transition-colors"
                >
                  Creator Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/admin/login')}
                  className="hover:text-white transition-colors text-white/50"
                >
                  Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#F5D77A] mb-4">
              Connect
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A5A5A5]">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#F5D77A] transition-colors flex items-center gap-1.5"
                >
                  <span>Instagram</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#F5D77A] transition-colors flex items-center gap-1.5"
                >
                  <span>YouTube</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#F5D77A] transition-colors flex items-center gap-1.5"
                >
                  <span>X (Twitter)</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#F5D77A] transition-colors flex items-center gap-1.5"
                >
                  <span>Facebook</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A5A5A5]">
          <p>© {new Date().getFullYear()} JITENDRA PROMPTS. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="gold-text-gradient font-bold tracking-wider">
              “CREATE BETTER. PROMPT SMARTER.”
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
