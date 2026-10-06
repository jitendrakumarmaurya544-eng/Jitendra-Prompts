import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, ArrowRight, CornerDownLeft, Eye, Copy } from 'lucide-react';
import { Prompt } from '../types/index.ts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (slugOrId: string | number) => void;
  onExploreFilter: (term: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
  onExploreFilter,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const popularSearches = [
    'Millionaire Mode',
    'Cinematic 35mm',
    'Solopreneur Workspace',
    'Hypercar',
    'Luxury Watch',
    'Fashion Editorial',
    'Liquid Gold 3D',
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else inputRef.current?.focus();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/prompts?search=${encodeURIComponent(query)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-[#0C0C0C] border border-[rgba(212,175,55,0.35)] shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(212,175,55,0.2)] overflow-hidden z-10 animate-in fade-in zoom-in-95"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[rgba(212,175,55,0.2)] bg-[#121212]">
          <Search className="w-5 h-5 text-[#F5D77A] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search image, cinematic, portrait, 3D prompts..."
            className="w-full bg-transparent text-white placeholder-[#A5A5A5] text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#A5A5A5] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 px-2 py-1 rounded text-[11px] bg-white/5 border border-white/10 text-[#A5A5A5] hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Results or Suggestions */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="py-8 text-center text-xs text-[#D4AF37] animate-pulse">
              Searching premium prompts...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-white font-medium">No prompts found for “{query}”</p>
              <p className="text-xs text-[#A5A5A5] mt-1">Try searching for styles, cameras, or categories.</p>
              <button
                onClick={() => {
                  onExploreFilter(query);
                  onClose();
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold gold-btn inline-flex items-center gap-1.5"
              >
                <span>Search in Explore Library</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] mb-2 px-1">
                Top Matches ({results.length})
              </p>
              {results.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectPrompt(p.slug || p.id);
                    onClose();
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-[#141414] hover:bg-[#1a1813] border border-white/5 hover:border-[#D4AF37]/40 cursor-pointer transition-all group"
                >
                  <img
                    src={p.previewImage}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#F5D77A] font-semibold uppercase">
                        {p.category?.name}
                      </span>
                      {p.model && (
                        <span className="text-[10px] text-[#A5A5A5]">
                          • {p.model.name}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#F5D77A] truncate">
                      {p.title}
                    </h4>
                    <p className="text-[11px] text-[#A5A5A5] truncate mt-0.5">
                      {p.description || p.content}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 text-[10px] text-[#A5A5A5]">
                    <span className="flex items-center gap-0.5">
                      <Eye className="w-3 h-3" />
                      {p.views}
                    </span>
                    <CornerDownLeft className="w-3.5 h-3.5 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Popular Searches when no query */}
          {!query && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A5A5A5] mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs bg-[#161616] hover:bg-[#201d14] border border-white/10 hover:border-[#D4AF37]/50 text-white hover:text-[#F5D77A] transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
