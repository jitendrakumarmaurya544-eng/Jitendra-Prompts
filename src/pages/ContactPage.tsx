import React, { useState } from 'react';
import { useToast } from '../components/Toast.tsx';
import { Mail, Send, Sparkles, MessageSquare, CheckCircle2 } from 'lucide-react';

interface ContactPageProps {
  navigate: (route: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ navigate }) => {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
        showToast('Message sent successfully!');
      } else {
        showToast(data.error || 'Failed to send message', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18140B] border border-[#D4AF37]/30 text-[#F5D77A] text-[11px] font-bold uppercase tracking-widest mb-3">
          <Mail className="w-3.5 h-3.5" />
          <span>DIRECT INQUIRIES</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl uppercase text-white tracking-tight">
          GET IN <span className="gold-text-gradient">TOUCH</span>
        </h1>
        <p className="mt-3 text-sm text-[#A5A5A5]">
          Have questions regarding prompt licensing, enterprise API access, or creator partnerships? Our team is at your disposal.
        </p>
      </div>

      <div className="rounded-3xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.25)] shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-6 sm:p-10">
        {sent ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-[#F5D77A] mx-auto mb-4" />
            <h2 className="font-display font-bold text-2xl text-white uppercase">
              Message Received
            </h2>
            <p className="text-xs text-[#A5A5A5] mt-2 max-w-sm mx-auto">
              Thank you for contacting JITENDRA PROMPTS. Our executive liaison team will review your message and reply promptly.
            </p>
            <button
              onClick={() => {
                setSent(false);
                setName('');
                setEmail('');
                setSubject('');
                setMessage('');
              }}
              className="mt-6 px-6 py-2.5 rounded-xl text-xs font-bold uppercase gold-btn"
            >
              SEND ANOTHER MESSAGE
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jitendra Maurya"
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F5D77A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F5D77A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
                Subject *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enterprise Partnership / Prompt Curation Request"
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F5D77A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
                Your Message *
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                className="w-full bg-[#141414] border border-white/10 rounded-xl p-4 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F5D77A]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest gold-btn flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'SENDING...' : 'SEND MESSAGE'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
