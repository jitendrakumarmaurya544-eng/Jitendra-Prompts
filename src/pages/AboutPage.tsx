import React from 'react';
import { Sparkles, Crown, ArrowRight, ShieldCheck, Film, Zap, Award } from 'lucide-react';

interface AboutPageProps {
  navigate: (route: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#18140B] border border-[#D4AF37]/35 text-[#F5D77A] text-[11px] font-bold uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MANIFESTO & MISSION</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl uppercase text-white tracking-tight leading-tight">
          THE FUTURE OF <br />
          <span className="gold-text-gradient-bright">PROMPT CREATION.</span>
        </h1>
        <p className="mt-4 text-base text-[#A5A5A5] leading-relaxed">
          “Your Ideas. Your Prompts. Your Creation.”
        </p>
      </div>

      {/* Cinematic Storytelling Section 1 */}
      <div className="rounded-3xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.25)] p-8 sm:p-12 mb-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] block mb-2">
            01 / THE ELEVATION OF PROMPT CRAFT
          </span>
          <h2 className="font-display font-bold text-2xl text-white uppercase mb-4">
            From Simple Text to Millionaire Artistry
          </h2>
          <p className="text-sm text-[#A5A5A5] leading-relaxed mb-4">
            JITENDRA PROMPTS was founded with a singular conviction: generative artificial intelligence is not merely a tool for generic imagery, but an expansive digital cinematography studio for creators with vision.
          </p>
          <p className="text-sm text-[#A5A5A5] leading-relaxed">
            By meticulously formulating parameters for camera focal lengths, atmospheric volumetrics, dynamic raytracing, and high-fashion luxury palettes, our platform bridges the gap between raw imagination and breathtaking visual reality.
          </p>
        </div>
      </div>

      {/* Grid of Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-[rgba(212,175,55,0.2)]">
          <div className="w-10 h-10 rounded-xl bg-[#18140B] border border-[#D4AF37]/40 flex items-center justify-center mb-4 text-[#F5D77A]">
            <Film className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-white mb-2">
            Cinematic Precision
          </h3>
          <p className="text-xs text-[#A5A5A5] leading-relaxed">
            Every verified prompt is tested across modern diffusion and video engines—ensuring accurate aspect ratios, lighting gradients, and texture depth.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-[rgba(212,175,55,0.2)]">
          <div className="w-10 h-10 rounded-xl bg-[#18140B] border border-[#D4AF37]/40 flex items-center justify-center mb-4 text-[#F5D77A]">
            <Crown className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-white mb-2">
            Luxury Visual Identity
          </h3>
          <p className="text-xs text-[#A5A5A5] leading-relaxed">
            Inspired by editorial luxury and modern executive lifestyles, our library emphasizes sophisticated obsidian and gold palettes with immaculate polish.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-[rgba(212,175,55,0.2)]">
          <div className="w-10 h-10 rounded-xl bg-[#18140B] border border-[#D4AF37]/40 flex items-center justify-center mb-4 text-[#F5D77A]">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-white mb-2">
            Instant 1-Click Workflow
          </h3>
          <p className="text-xs text-[#A5A5A5] leading-relaxed">
            Effortless copy-to-clipboard functionality, fast model tagging, and private libraries allow creators to iterate rapidly without friction.
          </p>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center p-10 rounded-3xl bg-[#0B0B0B] border border-[rgba(212,175,55,0.3)]">
        <h2 className="font-display font-bold text-2xl text-white uppercase">
          READY TO ELEVATE YOUR CREATIVE PROCESS?
        </h2>
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => navigate('/explore')}
            className="px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-wider gold-btn"
          >
            EXPLORE THE LIBRARY
          </button>
          <button
            onClick={() => navigate('/contact')}
            className="px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-wider gold-btn-outline"
          >
            CONTACT OUR TEAM
          </button>
        </div>
      </div>
    </div>
  );
};
