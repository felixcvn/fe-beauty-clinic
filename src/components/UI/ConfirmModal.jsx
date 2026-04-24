import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Save } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Reusable Confirm Dialog
───────────────────────────────────────────────────────────── */
const ConfirmModal = ({ config, onClose }) => {
    if (!config) return null;

    const {
        icon,          // 'delete' | 'save' | 'warning'
        header,
        message,
        acceptLabel,
        rejectLabel = 'Batal',
        onAccept,
    } = config;

    const isDelete = icon === 'delete';
    const isSave = icon === 'save';

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Card */}
            <div
                className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl text-center"
                style={{ animation: 'confirmPop 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
            >
                {/* Icon bubble */}
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 ${
                    isDelete ? 'bg-red-50 text-red-500' : 
                    isSave ? 'bg-blue-50 text-blue-600' :
                    'bg-emerald-50 text-emerald-600'
                }`}>
                    {isDelete ? <AlertTriangle className="w-8 h-8" /> : 
                     isSave ? <Save className="w-8 h-8" /> :
                     <CheckCircle2 className="w-8 h-8" />}
                </div>

                {/* Header */}
                <h3 className="text-xl font-black text-primary tracking-tighter mb-2 leading-tight">
                    {header}
                </h3>

                {/* Body */}
                <div className="text-sm text-primary/50 font-medium mb-8 leading-relaxed">
                    {message}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-2xl bg-gray-100 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                    >
                        {rejectLabel}
                    </button>
                    <button
                        onClick={() => { onAccept(); onClose(); }}
                        className={`flex-1 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
                            isDelete
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-primary text-secondary hover:bg-primary/90'
                        }`}
                    >
                        {acceptLabel}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes confirmPop {
                    from { opacity: 0; transform: scale(0.9) translateY(12px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.2s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>,
        document.body
    );
};

export default ConfirmModal;
