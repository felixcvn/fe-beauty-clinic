import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, User } from 'lucide-react';
import CustomSelect from './CustomSelect';

const StaffFormModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formState, setFormState] = useState({
        name: '',
        role: 'Dokter',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (isOpen && initialData) {
            setFormState({
                name: initialData.name || '',
                role: initialData.role || 'Dokter',
                email: initialData.email || '',
                phone: initialData.phone || '',
            });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formState);
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Tombol Silang Luar (z-index tinggi) */}
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                    className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/40 hover:scale-105 active:scale-95 transition-all z-[60] shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header Modal */}
                <div className="relative p-8 pb-6 bg-primary overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10 z-0">
                        <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>

                    <div className="relative z-10 flex items-center gap-4 pr-12">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-secondary backdrop-blur-sm border border-white/10 shrink-0">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                                Edit Data Pegawai
                            </h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                Perbarui Informasi Staff
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Body Form */}
                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Nama Lengkap</label>
                            <input 
                                required 
                                type="text" 
                                value={formState.name}
                                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" 
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Role Pegawai</label>
                            <CustomSelect 
                                value={formState.role} 
                                onChange={(value) => setFormState({ ...formState, role: value })}
                                options={[
                                    { value: 'Admin', label: 'Admin' },
                                    { value: 'Dokter', label: 'Dokter' },
                                    { value: 'Customer Service', label: 'Customer Service' },
                                    { value: 'HRD', label: 'HRD' },
                                    { value: 'Manager', label: 'Manager' },
                                    { value: 'Gudang', label: 'Gudang' },
                                ]}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Email</label>
                                <input 
                                    required 
                                    type="email" 
                                    value={formState.email}
                                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">No. Telp</label>
                                <input 
                                    required 
                                    type="tel" 
                                    value={formState.phone}
                                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" 
                                />
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Lanjutkan Simpan
                        </button>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default StaffFormModal;