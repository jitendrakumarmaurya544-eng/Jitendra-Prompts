import React, { useState } from 'react';
import { JPLogo } from '../components/JPLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../components/Toast.tsx';
import { User, Mail, Lock, ArrowRight, Check } from 'lucide-react';

interface RegisterPageProps {
  navigate: (route: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ navigate }) => {
  const { register } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreedTerms) {
      setError('You must accept the terms of service');
      return;
    }

    setLoading(true);
    const res = await register(fullName, username, email, password);
    setLoading(false);

    if (res.success) {
      showToast('Account created successfully! Welcome to JITENDRA PROMPTS.');
      navigate('/dashboard');
    } else {
      setError(res.error || 'Registration failed');
      showToast(res.error || 'Registration failed', 'error');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl bg-[#0C0C0C]/90 border border-[rgba(212,175,55,0.3)] shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(212,175,55,0.2)] p-8 sm:p-10 backdrop-blur-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <JPLogo size="lg" withText={false} />
          <h1 className="font-display font-black text-2xl text-white uppercase tracking-tight mt-4">
            CREATE ACCOUNT
          </h1>
          <p className="text-xs text-[#A5A5A5] mt-1">
            Join the elite community of AI prompt engineers.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-1">
              Full Name
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-[#A5A5A5] absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Elena Vance"
                className="w-full bg-[#141414] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5D77A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-1">
              Username
            </label>
            <div className="relative flex items-center">
              <span className="text-[#A5A5A5] absolute left-3.5 text-xs font-bold">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="elena_creator"
                className="w-full bg-[#141414] border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5D77A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-[#A5A5A5] absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="elena@example.com"
                className="w-full bg-[#141414] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5D77A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-[#A5A5A5] absolute left-3.5 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#141414] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5D77A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-1">
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-[#A5A5A5] absolute left-3.5 pointer-events-none" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#141414] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5D77A]"
              />
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 cursor-pointer text-xs text-[#A5A5A5]">
              <input
                type="checkbox"
                required
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 rounded border-white/20 bg-black text-[#D4AF37] focus:ring-0"
              />
              <span className="text-[11px] leading-tight">
                I agree to the Terms of Service and Privacy Policy for JITENDRA PROMPTS.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest gold-btn mt-3 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">CREATING ACCOUNT...</span>
            ) : (
              <>
                <span>CREATE ACCOUNT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-[#A5A5A5]">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-bold text-[#F5D77A] hover:underline ml-1"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};
