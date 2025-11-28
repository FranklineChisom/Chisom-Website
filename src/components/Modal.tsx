'use client';

import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  type?: 'default' | 'danger' | 'success' | 'info';
  actions?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, type = 'default', actions }) => {
  const [show, setShow] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger': return <AlertTriangle className="text-red-500" size={24} />;
      case 'success': return <CheckCircle className="text-green-500" size={24} />;
      case 'info': return <Info className="text-blue-500" size={24} />;
      default: return null;
    }
  };

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {getIcon()}
              <h3 className="text-xl font-serif text-slate-800 font-semibold">{title}</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="text-slate-600 leading-relaxed">
            {children}
          </div>
        </div>

        {actions && (
          <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;