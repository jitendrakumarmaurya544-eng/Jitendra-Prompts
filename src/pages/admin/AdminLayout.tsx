import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { JPLogo } from '../../components/JPLogo.tsx';
import {
  LayoutDashboard,
  FileText,
  Layers,
  Users,
  Bot,
  BarChart3,
  Sparkles,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  Menu,
  X,
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  navigate: (route: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  setCurrentTab,
  navigate,
  children,
}) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'prompts', label: 'Prompt Management', icon: FileText },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'models', label: 'AI Models', icon: Bot },
    { id: 'analytics', label: 'Analytics & Growth', icon: BarChart3 },
    { id: 'featured', label: 'Featured & Hero POD', icon: Sparkles },
    { id: 'reports', label: 'Reports & Moderation', icon: AlertTriangle },
    { id: 'messages', label: 'Contact Messages', icon: MessageSquare },
    { id: 'settings', label: 'Platform Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0A0A0A] border-b border-[rgba(212,175,55,0.2)] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <JPLogo size="sm" withText={false} />
          <span className="font-display font-black text-sm uppercase gold-text-gradient">
            ADMIN PORTAL
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-[#141414] text-white border border-white/10"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-30 h-screen w-72 bg-[#090909] border-r border-[rgba(212,175,55,0.2)] p-5 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo */}
          <div className="pb-6 border-b border-white/10">
            <JPLogo size="md" />
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#18140B] border border-[#D4AF37]/40 text-[#F5D77A] text-[10px] font-black uppercase tracking-wider">
              <Shield className="w-3 h-3" />
              <span>COMMAND SYSTEM • ADMIN</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1">
            {menuItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-[#D4AF37]/25 to-[#D4AF37]/5 text-[#F5D77A] border border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                      : 'text-[#A5A5A5] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${active ? 'text-[#F5D77A]' : 'text-[#A5A5A5]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-[#F5D77A]" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User info & exit */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-[#A5A5A5] hover:text-white hover:bg-white/5 transition-colors"
          >
            <span>Exit to Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
