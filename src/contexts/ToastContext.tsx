import React, { createContext, useContext, useState } from 'react';
import { Check, XCircle } from 'lucide-react';

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ msg: message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-4 rounded-md shadow-xl text-white font-medium flex items-center gap-3 animate-in slide-in-from-bottom-5 z-[100] transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-700' : 
          toast.type === 'error' ? 'bg-red-700' : 'bg-slate-800'
        }`}>
          {toast.type === 'success' && <Check size={20} />}
          {toast.type === 'error' && <XCircle size={20} />}
          {toast.type === 'info' && <div className="w-2 h-2 bg-white rounded-full"></div>}
          {toast.msg}
        </div>
      )}
    </ToastContext.Provider>
  );
};