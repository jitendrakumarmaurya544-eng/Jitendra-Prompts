import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../components/Toast.tsx';
import { Prompt } from '../types/index.ts';
import {
  Sparkles,
  PlusSquare,
  Eye,
  Copy,
  Trash2,
  ExternalLink,
  Edit,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface MyPromptsPageProps {
  navigate: (route: string) => void;
}

export const MyPromptsPage: React.FC<MyPromptsPageProps> = ({ navigate }) => {
  const { user, token, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'pending' | 'draft' | 'rejected'>('all');

  const fetchPrompts = () => {
    if (!token) return;
    setLoading(true);
    fetch('/api/user/my-prompts', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setPrompts(Array.isArray(data) ? data : []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPrompts();
  }, [token]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    try {
      const res = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPrompts((prev) => prev.filter((p) => p.id !== id));
        showToast('Prompt deleted successfully');
        refreshUser();
      } else {
        showToast('Failed to delete prompt', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  const handleDuplicate = (prompt: Prompt) => {
    navigator.clipboard.writeText(prompt.content);
    showToast('Prompt content copied for duplication! Opening creation studio...');
    navigate('/create-prompt');
  };

  const filtered = prompts.filter((p) => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" />
            Published
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-950/60 text-amber-300 border border-amber-500/40">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
            <FileText className="w-3 h-3" />
            Draft
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-950/60 text-red-400 border border-red-500/40">
            <AlertCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 rounded-3xl bg-[#0F0F0F] border border-[rgba(212,175,55,0.3)] text-center">
        <h2 className="font-display font-bold text-xl text-white">Sign In Required</h2>
        <p className="text-xs text-[#A5A5A5] mt-2 mb-6">
          Sign in to view and manage your submitted prompts.
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-1">
            <Sparkles className="w-4 h-4" />
            <span>MY CREATIONS</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
            MY <span className="gold-text-gradient">PROMPTS</span>
          </h1>
        </div>

        <button
          onClick={() => navigate('/create-prompt')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider gold-btn flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusSquare className="w-4 h-4" />
          <span>Create New Prompt</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-white/10">
        {[
          { label: 'All', value: 'all', count: prompts.length },
          {
            label: 'Published',
            value: 'published',
            count: prompts.filter((p) => p.status === 'published').length,
          },
          {
            label: 'Pending',
            value: 'pending',
            count: prompts.filter((p) => p.status === 'pending').length,
          },
          {
            label: 'Drafts',
            value: 'draft',
            count: prompts.filter((p) => p.status === 'draft').length,
          },
          {
            label: 'Rejected',
            value: 'rejected',
            count: prompts.filter((p) => p.status === 'rejected').length,
          },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              statusFilter === tab.value
                ? 'gold-btn'
                : 'bg-[#121212] border border-white/10 text-[#A5A5A5] hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === tab.value ? 'bg-black text-[#F5D77A]' : 'bg-white/10 text-white'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Prompt Table/List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-[#121212] animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-[#0F0F0F] border border-[rgba(212,175,55,0.2)] hover:border-[rgba(245,215,122,0.4)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              {/* Left thumbnail & info */}
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={p.previewImage}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover border border-[#D4AF37]/30 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusBadge(p.status)}
                    <span className="text-[10px] uppercase font-bold text-[#D4AF37]">
                      {p.category?.name}
                    </span>
                    {p.model && (
                      <span className="text-[10px] text-[#A5A5A5]">
                        • {p.model.name}
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading font-bold text-sm text-white group-hover:text-[#F5D77A] truncate">
                    {p.title}
                  </h3>
                  <div className="flex items-center gap-4 text-[11px] text-[#A5A5A5] mt-1">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {p.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Copy className="w-3 h-3" />
                      {p.copyCount} copies
                    </span>
                    <span>Created: {new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => navigate(`/prompt/${p.slug || p.id}`)}
                  title="View Prompt"
                  className="p-2 rounded-xl bg-[#181818] border border-white/10 text-[#A5A5A5] hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDuplicate(p)}
                  title="Duplicate Prompt"
                  className="p-2 rounded-xl bg-[#181818] border border-white/10 text-[#A5A5A5] hover:text-[#F5D77A] transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(p.id)}
                  title="Delete Prompt"
                  className="p-2 rounded-xl bg-[#181818] border border-red-500/20 text-red-400 hover:bg-red-950/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 rounded-3xl bg-[#0E0E0E] border border-[rgba(212,175,55,0.2)] max-w-lg mx-auto">
          <FileText className="w-12 h-12 text-[#A5A5A5] mx-auto mb-3" />
          <h3 className="font-heading font-bold text-xl text-white">No Prompts Found</h3>
          <p className="text-xs text-[#A5A5A5] mt-1.5 mb-6">
            You don't have any prompts in the “{statusFilter}” status.
          </p>
          <button
            onClick={() => navigate('/create-prompt')}
            className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider gold-btn"
          >
            CREATE PROMPT NOW
          </button>
        </div>
      )}
    </div>
  );
};
