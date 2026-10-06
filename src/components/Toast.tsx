import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-3"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 18, 12, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%)',
              border: '1px solid rgba(245, 215, 122, 0.4)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(212, 175, 55, 0.25)',
            }}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' && (
                <CheckCircle2 className="w-5 h-5 text-[#F5D77A] shrink-0" />
              )}
              {toast.type === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              {toast.type === 'info' && (
                <Info className="w-5 h-5 text-[#D4AF37] shrink-0" />
              )}
              <span className="text-sm font-medium text-white tracking-wide">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#A5A5A5] hover:text-[#F5D77A] transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
