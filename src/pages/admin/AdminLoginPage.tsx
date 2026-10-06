import React, { useState } from 'react';
import { JPLogo } from '../../components/JPLogo.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/Toast.tsx';
import { Shield, Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';

interface AdminLoginPageProps {
  navigate: (route: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ navigate }) => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('admin@jitendraprompts.com');
  const [password, setPassword] = useState('AdminPassword2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      showToast('Admin authentication verified.');
      navigate('/admin/dashboard');
    } else {
      setError(res.error || 'Admin login failed');
      showToast(res.error || 'Access denied', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cinematic dark gold backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Centered Glass Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-[#0A0A0A]/95 border-2 border-[rgba(212,175,55,0.4)] shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(212,175,55,0.25)] p-8 sm:p-10 backdrop-blur-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <JPLogo size="xl" withText={false} />
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18140B] border border-[#D4AF37]/40 text-[#F5D77A] text-[10px] font-black uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5" />
            <span>ROLE-BASED AUTHORIZATION</span>
          </div>
          <h1 className="font-display font-black text-2xl text-white uppercase tracking-tight mt-3">
            JITENDRA PROMPTS <span className="gold-text-gradient">ADMIN</span>
          </h1>
          <p className="text-xs text-[#A5A5A5] mt-1">
            Restricted access portal for editorial and platform management.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-1.5">
              Admin Email
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-[#A5A5A5] absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5D77A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-1.5">
              Admin Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-[#A5A5A5] absolute left-3.5 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5D77A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest gold-btn mt-4 flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(212,175,55,0.4)]"
          >
            {loading ? (
              <span className="animate-pulse">AUTHENTICATING...</span>
            ) : (
              <>
                <span>LOGIN TO ADMIN</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-[#A5A5A5] hover:text-[#F5D77A] transition-colors"
          >
            ← Return to JITENDRA PROMPTS Public Site
          </button>
        </div>
      </div>
    </div>
  );
};
