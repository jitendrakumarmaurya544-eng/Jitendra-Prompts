import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../components/Toast.tsx';
import { Category, AIModel } from '../types/index.ts';
import {
  Sparkles,
  ArrowRight,
  Upload,
  Crown,
  Save,
  Send,
  HelpCircle,
  Image as ImageIcon,
} from 'lucide-react';

interface CreatePromptPageProps {
  navigate: (route: string) => void;
}

export const CreatePromptPage: React.FC<CreatePromptPageProps> = ({ navigate }) => {
  const { user, token, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [modelId, setModelId] = useState('');
  const [style, setStyle] = useState('Cinematic');
  const [tagsInput, setTagsInput] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [promptType, setPromptType] = useState<'free' | 'premium'>('free');

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) setCategoryId(String(data[0].id));
        }
      })
      .catch((e) => console.error(e));

    fetch('/api/models')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setModels(data);
          if (data.length > 0) setModelId(String(data[0].id));
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const sampleImages = [
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
  ];

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!user || !token) {
      showToast('Please login to create a prompt', 'info');
      navigate('/login');
      return;
    }

    if (!title.trim() || !content.trim() || !categoryId || !modelId) {
      showToast('Title, content, category, and AI model are required.', 'error');
      return;
    }

    setLoading(true);
    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          content,
          categoryId: Number(categoryId),
          modelId: Number(modelId),
          style,
          previewImage:
            previewImage.trim() ||
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          promptType,
          tags: tagsArray,
          isDraft,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to create prompt', 'error');
        setLoading(false);
        return;
      }

      await refreshUser();
      showToast(
        isDraft
          ? 'Prompt saved as draft!'
          : user.role === 'admin'
          ? 'Prompt published live!'
          : 'Prompt submitted for admin review!'
      );
      navigate('/my-prompts');
    } catch (err: any) {
      showToast(err.message || 'Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18140B] border border-[#D4AF37]/30 text-[#F5D77A] text-[11px] font-bold uppercase tracking-widest mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CREATOR SUBMISSION STUDIO</span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
          CREATE <span className="gold-text-gradient">PROMPT</span>
        </h1>
        <p className="text-xs text-[#A5A5A5] mt-1.5">
          Share your highest-performing prompts with the JITENDRA PROMPTS creator community.
        </p>
      </div>

      {/* Main Form */}
      <div className="rounded-3xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.3)] shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-6 sm:p-10">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
              Prompt Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Millionaire Mode: Rooftop Empire at Sunset"
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5D77A]"
            />
          </div>

          {/* Category & AI Model Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F5D77A]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
                AI Model *
              </label>
              <select
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F5D77A]"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Style & Tier Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
                Visual Style
              </label>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="e.g. Cinematic 35mm, Hyperrealism, Octane 3D"
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5D77A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
                Prompt Tier
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPromptType('free')}
                  className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                    promptType === 'free'
                      ? 'bg-black text-[#F5D77A] border-[#D4AF37]'
                      : 'bg-[#141414] text-[#A5A5A5] border-white/10'
                  }`}
                >
                  Free Prompt
                </button>
                <button
                  type="button"
                  onClick={() => setPromptType('premium')}
                  className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider border flex items-center justify-center gap-1.5 transition-all ${
                    promptType === 'premium'
                      ? 'bg-[#18140B] text-[#F5D77A] border-[#F5D77A] shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                      : 'bg-[#141414] text-[#A5A5A5] border-white/10'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>Premium</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
              Tags (Comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Millionaire Mode, 8K Photorealism, Supercar, Editorial"
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5D77A]"
            />
          </div>

          {/* Prompt Content */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2 flex items-center justify-between">
              <span>Complete Prompt Content *</span>
              <span className="text-[10px] text-[#A5A5A5]">Include parameters (--ar 16:9, --v 6.1)</span>
            </label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your full AI prompt here..."
              className="w-full bg-[#141414] border border-white/10 rounded-xl p-4 font-mono text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5D77A] leading-relaxed"
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
              Short Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of lighting, camera, and scene mood..."
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5D77A]"
            />
          </div>

          {/* Preview Image URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
              Preview Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={previewImage}
                onChange={(e) => setPreviewImage(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5D77A]"
              />
            </div>

            {/* Quick sample image picker */}
            <div className="mt-3">
              <span className="text-[11px] text-[#A5A5A5] block mb-1.5">Or choose a cinematic preview:</span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {sampleImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt=""
                    onClick={() => setPreviewImage(img)}
                    className={`w-14 h-14 rounded-lg object-cover cursor-pointer border transition-all ${
                      previewImage === img ? 'border-[#F5D77A] scale-105' : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Notice */}
          <div className="p-4 rounded-xl bg-[#14120B] border border-[#D4AF37]/30 text-xs text-[#A5A5A5] flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#F5D77A] shrink-0" />
            <span>
              {user?.role === 'admin'
                ? 'As an Administrator, your prompt will be published live immediately.'
                : 'User-submitted prompts undergo swift admin curation before appearing on the public library.'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider gold-btn-outline flex items-center justify-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>SAVE DRAFT</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit(false)}
              className="w-full sm:w-auto px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest gold-btn flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{user?.role === 'admin' ? 'PUBLISH PROMPT' : 'SUBMIT FOR REVIEW'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
