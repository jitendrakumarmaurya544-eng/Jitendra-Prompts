import React from 'react';
import { Home, Compass, PlusSquare, Heart, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface MobileBottomNavProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentRoute,
  navigate,
}) => {
  const { user, stats } = useAuth();

  const tabs = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Create', path: '/create-prompt', icon: PlusSquare, isAccent: true },
    { label: 'Favorites', path: '/favorites', icon: Heart, count: stats.favorites },
    { label: 'Profile', path: user ? '/dashboard' : '/login', icon: UserIcon },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#080808]/90 backdrop-blur-2xl border-t border-[rgba(212,175,55,0.25)] px-3 py-2 shadow-2xl">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive =
            currentRoute === tab.path ||
            (tab.path === '/dashboard' && currentRoute.startsWith('/dashboard'));

          if (tab.isAccent) {
            return (
              <button
                key={tab.label}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full gold-btn flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.5)] border-2 border-black">
                  <tab.icon className="w-5 h-5 text-black" />
                </div>
                <span className="text-[10px] font-bold text-[#F5D77A] mt-1">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center py-1 px-3 relative transition-colors ${
                isActive ? 'text-[#F5D77A]' : 'text-[#A5A5A5] hover:text-white'
              }`}
            >
              <div className="relative">
                <tab.icon className="w-5 h-5" />
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[#D4AF37] text-black text-[8px] font-black flex items-center justify-center">
                    {tab.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium tracking-wide mt-1">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-3 h-0.5 bg-[#F5D77A] rounded-full mt-0.5 shadow-[0_0_6px_#F5D77A]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
