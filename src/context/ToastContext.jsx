import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon as X } from '@heroicons/react/24/outline';

const ToastContext = createContext();

const iconMap = {
    success: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 12l3 3 5-6"></path>
        </svg>
    ),
    error: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
    ),
    warning: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
    ),
    info: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
    )
};

const typeConfig = {
    success: {
        bg: 'bg-[#154734]/10',
        color: 'text-[#154734]',
        border: 'border-l-[#154734]',
        summary: 'BERHASIL'
    },
    error: {
        bg: 'bg-red-500/10',
        color: 'text-red-700',
        border: 'border-l-red-500',
        summary: 'GAGAL'
    },
    warning: {
        bg: 'bg-amber-500/10',
        color: 'text-amber-700',
        border: 'border-l-amber-500',
        summary: 'PERHATIAN'
    },
    info: {
        bg: 'bg-blue-500/10',
        color: 'text-blue-700',
        border: 'border-l-blue-500',
        summary: 'INFORMASI'
    }
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        const toastType = typeConfig[type] ? type : 'success';
        
        setToasts(prev => [...prev, { id, message, type: toastType }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {createPortal(
                <div className="fixed top-4 right-0 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-[100vw] sm:max-w-[400px] items-end px-4">
                    {toasts.map(toast => {
                        const config = typeConfig[toast.type];
                        return (
                            <div 
                                key={toast.id}
                                className={`pointer-events-auto bg-white border border-black/5 shadow-2xl rounded-2xl p-4 w-full flex items-center gap-4 animate-dropdown-in transition-all border-l-8 ${config.border}`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${config.bg} ${config.color}`}>
                                    {iconMap[toast.type]}
                                </div>
                                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                    <span className={`font-black text-[0.85rem] uppercase tracking-[0.02em] ${config.color}`}>
                                        {config.summary}
                                    </span>
                                    <span className={`text-[0.95rem] font-medium leading-[1.4] opacity-90 ${config.color === 'text-[#154734]' ? 'text-[#154734]' : 'text-gray-700'}`}>
                                        {toast.message}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => removeToast(toast.id)}
                                    className="w-8 h-8 rounded-xl bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors flex items-center justify-center shrink-0 self-center active:scale-95"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        );
                    })}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};
