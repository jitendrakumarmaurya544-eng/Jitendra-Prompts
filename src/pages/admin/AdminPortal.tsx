import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/Toast.tsx';
import { AdminLayout } from './AdminLayout.tsx';
import {
  Users,
  FileText,
  Layers,
  Bot,
  Sparkles,
  BarChart3,
  Settings,
  Eye,
  Copy,
  Heart,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit,
  Plus,
  Flame,
  Crown,
  Search,
  Filter,
  ArrowUpRight,
  Shield,
  Save,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';

interface AdminPortalProps {
  navigate: (route: string) => void;
  initialTab?: string;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  navigate,
  initialTab = 'dashboard',
}) => {
  const { user, token } = useAuth();
  const { showToast } = useToast();

  const [currentTab, setCurrentTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);

  // Dashboard Data
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Prompts Data
  const [promptsList, setPromptsList] = useState<any[]>([]);
  const [promptFilterStatus, setPromptFilterStatus] = useState('all');
  const [promptSearch, setPromptSearch] = useState('');
  const [selectedPromptIds, setSelectedPromptIds] = useState<number[]>([]);

  // Categories Data
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Sparkles');

  // Users Data
  const [usersList, setUsersList] = useState<any[]>([]);

  // Models Data
  const [modelsList, setModelsList] = useState<any[]>([]);
  const [newModelName, setNewModelName] = useState('');
  const [newModelDesc, setNewModelDesc] = useState('');
  const [newModelWebsite, setNewModelWebsite] = useState('');

  // Settings Data
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({});

  // Reports & Messages
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [messagesList, setMessagesList] = useState<any[]>([]);

  const fetchDashboard = () => {
    if (!token) return;
    fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setDashboardData(d))
      .catch((e) => console.error(e));
  };

  const fetchPrompts = () => {
    if (!token) return;
    const url = `/api/admin/prompts?status=${promptFilterStatus}&search=${encodeURIComponent(promptSearch)}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setPromptsList(Array.isArray(d) ? d : []))
      .catch((e) => console.error(e));
  };

  const fetchCategories = () => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategoriesList(Array.isArray(d) ? d : []))
      .catch((e) => console.error(e));
  };

  const fetchUsers = () => {
    if (!token) return;
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setUsersList(Array.isArray(d) ? d : []))
      .catch((e) => console.error(e));
  };

  const fetchModels = () => {
    fetch('/api/models')
      .then((r) => r.json())
      .then((d) => setModelsList(Array.isArray(d) ? d : []))
      .catch((e) => console.error(e));
  };

  const fetchSettings = () => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => setSettingsForm(d))
      .catch((e) => console.error(e));
  };

  const fetchReports = () => {
    if (!token) return;
    fetch('/api/admin/reports', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setReportsList(Array.isArray(d) ? d : []))
      .catch((e) => console.error(e));
  };

  const fetchMessages = () => {
    if (!token) return;
    fetch('/api/admin/messages', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setMessagesList(Array.isArray(d) ? d : []))
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    if (currentTab === 'dashboard') fetchDashboard();
    else if (currentTab === 'prompts') fetchPrompts();
    else if (currentTab === 'categories') fetchCategories();
    else if (currentTab === 'users') fetchUsers();
    else if (currentTab === 'models') fetchModels();
    else if (currentTab === 'settings') fetchSettings();
    else if (currentTab === 'reports') fetchReports();
    else if (currentTab === 'messages') fetchMessages();
  }, [currentTab, token, promptFilterStatus, promptSearch]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#0D0D0D] border border-red-500/30 text-center shadow-2xl">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="font-display font-black text-xl text-white uppercase">
            RESTRICTED ADMIN ACCESS
          </h2>
          <p className="text-xs text-[#A5A5A5] mt-2 mb-6">
            You must be authenticated as an Administrator to access this portal.
          </p>
          <button
            onClick={() => navigate('/admin/login')}
            className="px-6 py-3 rounded-xl text-xs font-bold uppercase gold-btn"
          >
            SIGN IN TO ADMIN
          </button>
        </div>
      </div>
    );
  }

  // --- Handlers ---
  const handlePromptStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/prompts/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(`Prompt marked as ${status}`);
        fetchPrompts();
      }
    } catch {
      showToast('Action failed', 'error');
    }
  };

  const handleTogglePromptFeature = async (id: number, current: boolean) => {
    try {
      await fetch(`/api/admin/prompts/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isFeatured: !current }),
      });
      showToast(!current ? 'Prompt Featured!' : 'Unfeatured');
      fetchPrompts();
    } catch {
      showToast('Action failed', 'error');
    }
  };

  const handleTogglePromptTrending = async (id: number, current: boolean) => {
    try {
      await fetch(`/api/admin/prompts/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isTrending: !current }),
      });
      showToast(!current ? 'Marked Trending!' : 'Removed from Trending');
      fetchPrompts();
    } catch {
      showToast('Action failed', 'error');
    }
  };

  const handleDeletePrompt = async (id: number) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    try {
      await fetch(`/api/admin/prompts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('Prompt deleted');
      fetchPrompts();
    } catch {
      showToast('Action failed', 'error');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedPromptIds.length === 0) return;
    try {
      await fetch('/api/admin/prompts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: selectedPromptIds, action }),
      });
      showToast(`Bulk ${action} completed on ${selectedPromptIds.length} items`);
      setSelectedPromptIds([]);
      fetchPrompts();
    } catch {
      showToast('Bulk action failed', 'error');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCatName, description: newCatDesc, icon: newCatIcon }),
      });
      showToast('Category created!');
      setNewCatName('');
      setNewCatDesc('');
      fetchCategories();
    } catch {
      showToast('Failed to create category', 'error');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Delete this category?')) return;
    try {
      await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('Category deleted');
      fetchCategories();
    } catch {
      showToast('Failed to delete category', 'error');
    }
  };

  const handleUserRoleChange = async (userId: number, role: string) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role }),
      });
      showToast(`User role updated to ${role}`);
      fetchUsers();
    } catch {
      showToast('Action failed', 'error');
    }
  };

  const handleUserStatusToggle = async (userId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus }),
      });
      showToast(`User ${nextStatus}`);
      fetchUsers();
    } catch {
      showToast('Action failed', 'error');
    }
  };

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelName) return;
    try {
      await fetch('/api/admin/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newModelName,
          description: newModelDesc,
          website: newModelWebsite,
        }),
      });
      showToast('AI Model added!');
      setNewModelName('');
      setNewModelDesc('');
      setNewModelWebsite('');
      fetchModels();
    } catch {
      showToast('Failed to add model', 'error');
    }
  };

  const handleDeleteModel = async (id: number) => {
    if (!confirm('Delete this AI model?')) return;
    try {
      await fetch(`/api/admin/models/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('Model deleted');
      fetchModels();
    } catch {
      showToast('Failed to delete model', 'error');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settingsForm),
      });
      showToast('Site settings updated live!');
    } catch {
      showToast('Failed to save settings', 'error');
    }
  };

  return (
    <AdminLayout
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      navigate={navigate}
    >
      {/* ====================================================
          TAB 1: ADMIN DASHBOARD OVERVIEW
         ==================================================== */}
      {currentTab === 'dashboard' && (
        <div className="space-y-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
              EXECUTIVE TELEMETRY
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
              ADMIN <span className="gold-text-gradient">OVERVIEW</span>
            </h1>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.25)]">
              <span className="text-xs text-[#A5A5A5] block">Total Users</span>
              <span className="font-display font-black text-2xl text-white mt-1 block">
                {dashboardData?.metrics?.totalUsers ?? '...'}
              </span>
              <span className="text-[10px] text-emerald-400">
                {dashboardData?.metrics?.activeUsers ?? 0} active
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.25)]">
              <span className="text-xs text-[#A5A5A5] block">Total Prompts</span>
              <span className="font-display font-black text-2xl text-white mt-1 block">
                {dashboardData?.metrics?.totalPrompts ?? '...'}
              </span>
              <span className="text-[10px] text-[#F5D77A]">
                {dashboardData?.metrics?.publishedPrompts ?? 0} published
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.25)]">
              <span className="text-xs text-[#A5A5A5] block">Pending Review</span>
              <span className="font-display font-black text-2xl text-amber-400 mt-1 block">
                {dashboardData?.metrics?.pendingPrompts ?? 0}
              </span>
              <span className="text-[10px] text-zinc-400">awaiting approval</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.25)]">
              <span className="text-xs text-[#A5A5A5] block">Prompt Views</span>
              <span className="font-display font-black text-2xl text-white mt-1 block">
                {dashboardData?.metrics?.totalViews?.toLocaleString() ?? '...'}
              </span>
              <span className="text-[10px] text-[#F5D77A]">impressions</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.25)]">
              <span className="text-xs text-[#A5A5A5] block">Copies & Copies</span>
              <span className="font-display font-black text-2xl text-white mt-1 block">
                {dashboardData?.metrics?.totalCopies?.toLocaleString() ?? '...'}
              </span>
              <span className="text-[10px] text-emerald-400">clipboard triggers</span>
            </div>
          </div>

          {/* User & Prompt Growth Visual Bar */}
          <div className="p-6 rounded-3xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)]">
            <h3 className="font-heading font-bold text-base text-white uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Platform Traffic & Prompt Adoption</span>
              <span className="text-xs text-[#F5D77A]">Last 6 Months</span>
            </h3>

            <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-44 pt-6">
              {dashboardData?.growthChart?.map((item: any, idx: number) => {
                const heightPercent = Math.min(100, Math.max(20, (item.views / 90000) * 100));
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                    <div className="text-[10px] text-[#F5D77A] font-bold">
                      {item.views > 1000 ? `${(item.views / 1000).toFixed(0)}k` : item.views}
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-[#B88E1B] to-[#F5D77A] shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all"
                    />
                    <span className="text-[11px] text-[#A5A5A5] font-semibold">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Prompts and Users Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Prompts */}
            <div className="p-6 rounded-3xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-base text-white uppercase">
                  Recent Prompts
                </h3>
                <button
                  onClick={() => setCurrentTab('prompts')}
                  className="text-xs font-bold text-[#F5D77A] hover:underline"
                >
                  Manage all
                </button>
              </div>

              <div className="space-y-3">
                {dashboardData?.recentPrompts?.map((rp: any) => (
                  <div
                    key={rp.id}
                    className="p-3 rounded-xl bg-[#141414] border border-white/5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{rp.title}</h4>
                      <p className="text-[11px] text-[#A5A5A5]">
                        by {rp.author?.fullName || 'Creator'} • {rp.views} views
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                        rp.status === 'published'
                          ? 'bg-emerald-950/60 text-emerald-400'
                          : rp.status === 'pending'
                          ? 'bg-amber-950/60 text-amber-300'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {rp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Users */}
            <div className="p-6 rounded-3xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-base text-white uppercase">
                  Recent Creators
                </h3>
                <button
                  onClick={() => setCurrentTab('users')}
                  className="text-xs font-bold text-[#F5D77A] hover:underline"
                >
                  View all
                </button>
              </div>

              <div className="space-y-3">
                {dashboardData?.recentUsers?.map((u: any) => (
                  <div
                    key={u.id}
                    className="p-3 rounded-xl bg-[#141414] border border-white/5 flex items-center justify-between gap-2"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{u.fullName}</h4>
                      <p className="text-[11px] text-[#A5A5A5]">@{u.username} • {u.email}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-[#D4AF37]/20 text-[#F5D77A]">
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 2: PROMPT MANAGEMENT TABLE
         ==================================================== */}
      {currentTab === 'prompts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                EDITORIAL REPOSITORY
              </span>
              <h1 className="font-display font-black text-2xl text-white uppercase tracking-tight">
                PROMPT <span className="gold-text-gradient">MANAGEMENT</span>
              </h1>
            </div>

            <button
              onClick={() => navigate('/create-prompt')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase gold-btn flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Prompt</span>
            </button>
          </div>

          {/* Filter and Bulk Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)]">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search prompt title..."
                value={promptSearch}
                onChange={(e) => setPromptSearch(e.target.value)}
                className="bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 w-full sm:w-64 focus:outline-none"
              />

              <select
                value={promptFilterStatus}
                onChange={(e) => setPromptFilterStatus(e.target.value)}
                className="bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Bulk actions */}
            {selectedPromptIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#A5A5A5]">
                  {selectedPromptIds.length} selected
                </span>
                <button
                  onClick={() => handleBulkAction('publish')}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
                >
                  Publish
                </button>
                <button
                  onClick={() => handleBulkAction('feature')}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40"
                >
                  Feature
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-red-950/60 text-red-400 border border-red-500/40"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="rounded-3xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141414] text-[#D4AF37] uppercase tracking-wider font-bold border-b border-white/10">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) setSelectedPromptIds(promptsList.map((p) => p.id));
                        else setSelectedPromptIds([]);
                      }}
                      checked={
                        promptsList.length > 0 &&
                        selectedPromptIds.length === promptsList.length
                      }
                      className="rounded border-white/20 bg-black text-[#D4AF37]"
                    />
                  </th>
                  <th className="p-4">Preview</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Model</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Views</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {promptsList.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedPromptIds.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedPromptIds([...selectedPromptIds, p.id]);
                          else setSelectedPromptIds(selectedPromptIds.filter((id) => id !== p.id));
                        }}
                        className="rounded border-white/20 bg-black text-[#D4AF37]"
                      />
                    </td>
                    <td className="p-4">
                      <img
                        src={p.previewImage}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover border border-[#D4AF37]/30"
                      />
                    </td>
                    <td className="p-4 font-semibold text-white max-w-xs truncate">
                      <div className="flex items-center gap-1.5">
                        {p.isFeatured && (
                          <span title="Featured" className="text-[#F5D77A]">★</span>
                        )}
                        {p.isTrending && (
                          <span title="Trending" className="text-amber-400">🔥</span>
                        )}
                        <span>{p.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[#A5A5A5]">{p.category?.name}</td>
                    <td className="p-4 text-[#A5A5A5]">@{p.author?.username}</td>
                    <td className="p-4 text-[#F5D77A] font-medium">{p.model?.name}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.status === 'published'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                            : p.status === 'pending'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-[#A5A5A5]">{p.views}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.status !== 'published' && (
                          <button
                            onClick={() => handlePromptStatus(p.id, 'published')}
                            title="Approve & Publish"
                            className="p-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {p.status === 'published' && (
                          <button
                            onClick={() => handlePromptStatus(p.id, 'draft')}
                            title="Unpublish"
                            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleTogglePromptFeature(p.id, p.isFeatured)}
                          title="Toggle Featured"
                          className={`p-1.5 rounded-lg ${
                            p.isFeatured
                              ? 'bg-[#D4AF37]/30 text-[#F5D77A]'
                              : 'bg-white/5 text-[#A5A5A5] hover:text-white'
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleTogglePromptTrending(p.id, p.isTrending)}
                          title="Toggle Trending"
                          className={`p-1.5 rounded-lg ${
                            p.isTrending
                              ? 'bg-red-950/60 text-amber-300'
                              : 'bg-white/5 text-[#A5A5A5] hover:text-white'
                          }`}
                        >
                          <Flame className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/prompt/${p.slug || p.id}`)}
                          title="Open View"
                          className="p-1.5 rounded-lg bg-white/5 text-[#A5A5A5] hover:text-white"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(p.id)}
                          title="Delete Prompt"
                          className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-950"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 3: CATEGORIES MANAGEMENT
         ==================================================== */}
      {currentTab === 'categories' && (
        <div className="space-y-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
              TAXONOMY ENGINE
            </span>
            <h1 className="font-display font-black text-2xl text-white uppercase tracking-tight">
              CATEGORY <span className="gold-text-gradient">MANAGEMENT</span>
            </h1>
          </div>

          {/* Add Category Form */}
          <form
            onSubmit={handleCreateCategory}
            className="p-6 rounded-3xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.25)] space-y-4"
          >
            <h3 className="font-heading font-bold text-sm text-white uppercase">Add New Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                required
                placeholder="Category Name (e.g. Cyberpunk)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Description"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold uppercase gold-btn"
              >
                Create Category
              </button>
            </div>
          </form>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {categoriesList.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-[#0D0D0D] border border-white/10 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-white">{c.name}</h4>
                  <p className="text-[11px] text-[#A5A5A5] line-clamp-1">{c.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteCategory(c.id)}
                  className="p-2 text-red-400 hover:bg-red-950/30 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 4: USER DIRECTORY
         ==================================================== */}
      {currentTab === 'users' && (
        <div className="space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
              CREATOR COMMUNITY
            </span>
            <h1 className="font-display font-black text-2xl text-white uppercase tracking-tight">
              USER <span className="gold-text-gradient">DIRECTORY</span>
            </h1>
          </div>

          <div className="rounded-3xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141414] text-[#D4AF37] uppercase tracking-wider font-bold border-b border-white/10">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Prompts</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-bold text-white">{u.fullName}</td>
                    <td className="p-4 text-[#A5A5A5]">@{u.username}</td>
                    <td className="p-4 text-[#A5A5A5]">{u.email}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                        className="bg-[#181818] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-[#F5D77A] font-bold uppercase"
                      >
                        <option value="user">User</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.status === 'active'
                            ? 'bg-emerald-950/60 text-emerald-400'
                            : 'bg-red-950/60 text-red-400'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white">{u.promptCount || 0}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleUserStatusToggle(u.id, u.status)}
                        className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase bg-white/5 text-[#A5A5A5] hover:text-white"
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 5: AI MODELS MANAGEMENT
         ==================================================== */}
      {currentTab === 'models' && (
        <div className="space-y-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
              DIFFUSION & VIDEO TOOLS
            </span>
            <h1 className="font-display font-black text-2xl text-white uppercase tracking-tight">
              AI <span className="gold-text-gradient">MODELS</span>
            </h1>
          </div>

          <form
            onSubmit={handleCreateModel}
            className="p-6 rounded-3xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.25)] space-y-4"
          >
            <h3 className="font-heading font-bold text-sm text-white uppercase">Add New AI Model</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                required
                placeholder="Model Name (e.g. Sora, Kling 1.5)"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                className="bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Description"
                value={newModelDesc}
                onChange={(e) => setNewModelDesc(e.target.value)}
                className="bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold uppercase gold-btn"
              >
                Add AI Model
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {modelsList.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-[#0D0D0D] border border-white/10 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-[#F5D77A]">{m.name}</h4>
                  <p className="text-[11px] text-[#A5A5A5] mt-1 line-clamp-2">{m.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteModel(m.id)}
                  className="p-2 text-red-400 hover:bg-red-950/30 rounded-lg ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 6: ANALYTICS & GROWTH
         ==================================================== */}
      {currentTab === 'analytics' && (
        <div className="space-y-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
              GROWTH METRICS
            </span>
            <h1 className="font-display font-black text-2xl text-white uppercase tracking-tight">
              PLATFORM <span className="gold-text-gradient">ANALYTICS</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.25)]">
              <Eye className="w-6 h-6 text-[#F5D77A] mb-2" />
              <span className="text-xs text-[#A5A5A5] uppercase font-bold tracking-wider">
                Total Views
              </span>
              <span className="font-display font-black text-3xl text-white mt-1 block">
                {dashboardData?.metrics?.totalViews?.toLocaleString() || 85000}
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.25)]">
              <Copy className="w-6 h-6 text-[#F5D77A] mb-2" />
              <span className="text-xs text-[#A5A5A5] uppercase font-bold tracking-wider">
                Prompt Copies
              </span>
              <span className="font-display font-black text-3xl text-white mt-1 block">
                {dashboardData?.metrics?.totalCopies?.toLocaleString() || 24800}
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.25)]">
              <Heart className="w-6 h-6 text-red-400 mb-2" />
              <span className="text-xs text-[#A5A5A5] uppercase font-bold tracking-wider">
                Total Favorites
              </span>
              <span className="font-display font-black text-3xl text-white mt-1 block">
                {dashboardData?.metrics?.totalFavorites?.toLocaleString() || 14200}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 7: FEATURED & HERO POD SELECTOR
         ==================================================== */}
      {currentTab === 'featured' && (
        <div className="space-y-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
              CURATION DESK
            </span>
            <h1 className="font-display font-black text-2xl text-white uppercase tracking-tight">
              FEATURED & <span className="gold-text-gradient">PROMPT OF THE DAY</span>
            </h1>
          </div>

          <div className="p-6 rounded-3xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.25)] space-y-4">
            <h3 className="font-heading font-bold text-sm text-white uppercase">
              Set Prompt of the Day (ID)
            </h3>
            <p className="text-xs text-[#A5A5A5]">
              Enter the prompt ID to showcase in the prominent 3D Hero card on the home page.
            </p>
            <div className="flex gap-4 max-w-md">
              <input
                type="number"
                value={settingsForm.prompt_of_the_day_id || '1'}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, prompt_of_the_day_id: e.target.value })
                }
                className="bg-[#141414] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
              />
              <button
                onClick={handleSaveSettings}
                className="px-6 py-2 rounded-xl text-xs font-bold uppercase gold-btn"
              >
                Update POD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 8: REPORTS & MODERATION
         ==================================================== */}
      {currentTab === 'reports' && (
        <div className="space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">
              SAFETY & COMPLIANCE
            </span>
            <h1 className="font-display font-black text-2xl text-white uppercase tracking-tight">
              REPORTED <span className="gold-text-gradient">CONTENT</span>
            </h1>
          </div>

          {reportsList.length > 0 ? (
            <div className="space-y-3">
              {reportsList.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-2xl bg-[#0D0D0D] border border-red-500/20 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-sm text-white">{rep.prompt?.title}</h4>
                    <p className="text-xs text-red-300 font-semibold mt-0.5">Reason: {rep.reason}</p>
                    <p className="text-[11px] text-[#A5A5A5] mt-1">{rep.message}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/prompt/${rep.prompt?.slug || rep.prompt?.id}`)}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold gold-btn-outline"
                  >
                    Inspect
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-[#0D0D0D] border border-white/5">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-white font-bold">No active reports</p>
              <p className="text-xs text-[#A5A5A5]">All content is currently compliant.</p>
            </div>
          )}
        </div>
      )}

      {/* ====================================================
          TAB 9: CONTACT MESSAGES
         ==================================================== */}
      {currentTab === 'messages' && (
        <div className="space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
              INBOX
            </span>
            <h1 className="font-display font-black text-2xl text-white uppercase tracking-tight">
              CONTACT <span className="gold-text-gradient">MESSAGES</span>
            </h1>
          </div>

          {messagesList.length > 0 ? (
            <div className="space-y-4">
              {messagesList.map((m) => (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl bg-[#0D0D0D] border border-white/10 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#F5D77A]">{m.name}</span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-white font-semibold">Subject: {m.subject}</p>
                  <p className="text-xs text-[#A5A5A5] leading-relaxed">{m.message}</p>
                  <p className="text-[11px] text-zinc-500 pt-1">Email: {m.email}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-[#0D0D0D] border border-white/5">
              <MessageSquare className="w-10 h-10 text-[#A5A5A5] mx-auto mb-2" />
              <p className="text-sm text-white font-bold">No inquiries yet</p>
            </div>
          )}
        </div>
      )}

      {/* ====================================================
          TAB 10: SETTINGS (Editable Hero & Stats)
         ==================================================== */}
      {currentTab === 'settings' && (
        <div className="space-y-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
              GLOBAL CONFIGURATION
            </span>
            <h1 className="font-display font-black text-2xl text-white uppercase tracking-tight">
              PLATFORM <span className="gold-text-gradient">SETTINGS</span>
            </h1>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.25)] space-y-4">
              <h3 className="font-heading font-bold text-base text-white uppercase">
                Home Hero & Branding
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#D4AF37] mb-1">
                    Hero Badge
                  </label>
                  <input
                    type="text"
                    value={settingsForm.hero_badge || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, hero_badge: e.target.value })
                    }
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#D4AF37] mb-1">
                    Hero Highlight
                  </label>
                  <input
                    type="text"
                    value={settingsForm.hero_highlight || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, hero_highlight: e.target.value })
                    }
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#D4AF37] mb-1">
                  Hero Description
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.hero_description || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, hero_description: e.target.value })
                  }
                  className="w-full bg-[#141414] border border-white/10 rounded-xl p-3 text-xs text-white"
                />
              </div>
            </div>

            {/* Statistics Counters */}
            <div className="p-6 rounded-3xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.25)] space-y-4">
              <h3 className="font-heading font-bold text-base text-white uppercase">
                Platform Statistics Counters
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#D4AF37] mb-1">
                    Prompts Count
                  </label>
                  <input
                    type="text"
                    value={settingsForm.stat_prompts || '10K+'}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, stat_prompts: e.target.value })
                    }
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#D4AF37] mb-1">
                    Categories Count
                  </label>
                  <input
                    type="text"
                    value={settingsForm.stat_categories || '50+'}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, stat_categories: e.target.value })
                    }
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#D4AF37] mb-1">
                    Tools Count
                  </label>
                  <input
                    type="text"
                    value={settingsForm.stat_tools || '20+'}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, stat_tools: e.target.value })
                    }
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#D4AF37] mb-1">
                    Creators Count
                  </label>
                  <input
                    type="text"
                    value={settingsForm.stat_creators || '25K+'}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, stat_creators: e.target.value })
                    }
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest gold-btn flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>SAVE PLATFORM SETTINGS</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
};
