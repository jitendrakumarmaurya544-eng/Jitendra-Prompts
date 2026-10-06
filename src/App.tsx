import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider } from './components/Toast.tsx';
import { BackgroundParticles } from './components/BackgroundParticles.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { SearchModal } from './components/SearchModal.tsx';

// Public Pages
import { HomePage } from './pages/HomePage.tsx';
import { ExplorePage } from './pages/ExplorePage.tsx';
import { PromptDetailPage } from './pages/PromptDetailPage.tsx';
import { CategoriesPage } from './pages/CategoriesPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';

// User Dashboard Pages
import { DashboardPage } from './pages/DashboardPage.tsx';
import { FavoritesPage } from './pages/FavoritesPage.tsx';
import { SavedPromptsPage } from './pages/SavedPromptsPage.tsx';
import { CreatePromptPage } from './pages/CreatePromptPage.tsx';
import { MyPromptsPage } from './pages/MyPromptsPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';

// Admin Pages
import { AdminPortal } from './pages/admin/AdminPortal.tsx';
import { AdminLoginPage } from './pages/admin/AdminLoginPage.tsx';

// 404
import { ArrowRight, Sparkles } from 'lucide-react';

function AppContent() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setSearchParams(new URLSearchParams(window.location.search));
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    const [pathname, search] = path.split('?');
    window.history.pushState({}, '', path);
    setCurrentPath(pathname || '/');
    setSearchParams(new URLSearchParams(search || ''));
    window.scrollTo(0, 0);
  };

  const isAdminRoute = currentPath.startsWith('/admin') && currentPath !== '/admin/login';
  const isAdminLogin = currentPath === '/admin/login';

  // Routing renderer
  const renderPage = () => {
    // 1. Home
    if (currentPath === '/' || currentPath === '') {
      return <HomePage navigate={navigate} />;
    }

    // 2. Explore
    if (currentPath === '/explore') {
      const q = searchParams.get('search') || '';
      const cat = searchParams.get('category') || '';
      return <ExplorePage navigate={navigate} initialQuery={q} initialCategory={cat} />;
    }

    // 3. Trending
    if (currentPath === '/trending') {
      return <ExplorePage navigate={navigate} />;
    }

    // 4. Prompt Details: /prompt/:idOrSlug
    if (currentPath.startsWith('/prompt/')) {
      const idOrSlug = currentPath.replace('/prompt/', '');
      return <PromptDetailPage idOrSlug={idOrSlug} navigate={navigate} />;
    }

    // 5. Categories
    if (currentPath === '/categories') {
      return <CategoriesPage navigate={navigate} />;
    }

    // 6. Auth
    if (currentPath === '/login') {
      return <LoginPage navigate={navigate} />;
    }
    if (currentPath === '/register') {
      return <RegisterPage navigate={navigate} />;
    }
    if (currentPath === '/forgot-password') {
      return (
        <div className="max-w-md mx-auto my-28 p-8 rounded-3xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.3)] text-center">
          <h2 className="font-display font-bold text-xl text-white">Reset Password</h2>
          <p className="text-xs text-[#A5A5A5] mt-2 mb-6">
            Enter your email to receive password reset instructions.
          </p>
          <input
            type="email"
            placeholder="your@email.com"
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs text-white mb-4 focus:outline-none"
          />
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 rounded-xl text-xs font-bold uppercase gold-btn"
          >
            Send Reset Link
          </button>
        </div>
      );
    }

    // 7. User Dashboard
    if (currentPath === '/dashboard') {
      return <DashboardPage navigate={navigate} />;
    }
    if (currentPath === '/favorites') {
      return <FavoritesPage navigate={navigate} />;
    }
    if (currentPath === '/saved') {
      return <SavedPromptsPage navigate={navigate} />;
    }
    if (currentPath === '/create-prompt') {
      return <CreatePromptPage navigate={navigate} />;
    }
    if (currentPath === '/my-prompts') {
      return <MyPromptsPage navigate={navigate} />;
    }
    if (currentPath === '/profile') {
      return <ProfilePage navigate={navigate} />;
    }

    // 8. Info
    if (currentPath === '/about') {
      return <AboutPage navigate={navigate} />;
    }
    if (currentPath === '/contact') {
      return <ContactPage navigate={navigate} />;
    }

    // 9. Admin Portal
    if (currentPath === '/admin/login') {
      return <AdminLoginPage navigate={navigate} />;
    }
    if (currentPath.startsWith('/admin')) {
      const tab = currentPath.replace('/admin/', '').replace('/admin', '') || 'dashboard';
      return <AdminPortal navigate={navigate} initialTab={tab} />;
    }

    // 10. 404 Empty State
    return (
      <div className="max-w-lg mx-auto py-28 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#18140B] border border-[#D4AF37]/40 flex items-center justify-center mx-auto mb-4 text-[#F5D77A]">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="font-display font-black text-2xl text-white uppercase tracking-tight">
          THIS PROMPT DOESN’T EXIST.
        </h1>
        <p className="text-xs text-[#A5A5A5] mt-2 mb-6">
          The requested page or prompt archive could not be located.
        </p>
        <button
          onClick={() => navigate('/explore')}
          className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider gold-btn inline-flex items-center gap-2"
        >
          <span>BACK TO EXPLORE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative selection:bg-[#D4AF37] selection:text-black">
      {/* Background Particles */}
      <BackgroundParticles />

      {/* Global Navbar (hidden on admin pages) */}
      {!isAdminRoute && !isAdminLogin && (
        <Navbar
          currentRoute={currentPath}
          navigate={navigate}
          onOpenSearch={() => setSearchModalOpen(true)}
        />
      )}

      {/* Page Content */}
      <div className="flex-1 relative z-10">{renderPage()}</div>

      {/* Global Footer (hidden on admin pages) */}
      {!isAdminRoute && !isAdminLogin && <Footer navigate={navigate} />}

      {/* Mobile Bottom Navigation (hidden on admin pages) */}
      {!isAdminRoute && !isAdminLogin && (
        <MobileBottomNav currentRoute={currentPath} navigate={navigate} />
      )}

      {/* Quick Search Modal (Command+K) */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectPrompt={(slugOrId) => navigate(`/prompt/${slugOrId}`)}
        onExploreFilter={(term) => navigate(`/explore?search=${encodeURIComponent(term)}`)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
