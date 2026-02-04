import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const Toast = () => {
    const { toast, hideToast } = useToast();

    if (!toast.isVisible) return null;

    return (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-10 fade-in duration-300">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${toast.type === 'success'
                    ? 'bg-white border-green-200 text-green-700'
                    : 'bg-white border-red-200 text-red-700'
                }`}>
                <div className={`p-1 rounded-full ${toast.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                    {toast.type === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <XCircle className="w-5 h-5" />
                    )}
                </div>

                <p className="font-medium text-sm pr-2">{toast.message}</p>

                <button
                    onClick={hideToast}
                    className="p-1 hover:bg-black/5 rounded-lg transition-colors ml-2"
                >
                    <X className="w-4 h-4 opacity-50" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
