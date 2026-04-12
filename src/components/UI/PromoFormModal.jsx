import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Tag } from 'lucide-react';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';

const PromoFormModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formState, setFormState] = useState({
        name: '',
        code: '',
        type: 'Persen',
        value: '',
        quota: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormState(initialData);
            } else {
                setFormState({
                    name: '',
                    code: '',
                    type: 'Persen',
                    value: '',
                    quota: '',
                    startDate: '',
                    endDate: ''
                });
            }
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
            onClick={onClose} // Klik background gelap untuk tutup
        >
            <div 
                className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal ikut menutup modal
            >
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClose();
                    }}
                    className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/40 hover:scale-105 active:scale-95 transition-all z-[60] shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header Modal */}
                <div className="relative p-8 pb-6 bg-primary overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10 z-0">
                        <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>

                    <div className="relative z-10 flex items-center gap-4 pr-12"> {/* pr-12 agar teks tidak menabrak tombol X */}
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-secondary backdrop-blur-sm border border-white/10 shrink-0">
                            <Tag className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                                {initialData ? 'Edit Promo' : 'Buat Promo Baru'}
                            </h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                Formulir Pengaturan Data Diskon
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Body / Form */}
                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Nama Promo</label>
                            <input 
                                required 
                                type="text" 
                                placeholder="Contoh: Diskon Ramadhan" 
                                value={formState.name}
                                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Kode Promo</label>
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="RAMADHAN50" 
                                    value={formState.code}
                                    onChange={(e) => setFormState({ ...formState, code: e.target.value.toUpperCase() })}
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all uppercase shadow-sm" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Tipe Diskon</label>
                                <CustomSelect 
                                    value={formState.type}
                                    onChange={(val) => setFormState({ ...formState, type: val })}
                                    options={[
                                        { value: 'Persen', label: 'Persentase (%)' },
                                        { value: 'Nominal', label: 'Nominal (Rp)' }
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Nilai Diskon</label>
                                <input 
                                    required 
                                    type="number" 
                                    placeholder={formState.type === 'Persen' ? 'Contoh: 50' : 'Contoh: 50000'}
                                    value={formState.value}
                                    onChange={(e) => setFormState({ ...formState, value: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Batas Kuota</label>
                                <input 
                                    required 
                                    type="number" 
                                    placeholder="Contoh: 100" 
                                    value={formState.quota}
                                    onChange={(e) => setFormState({ ...formState, quota: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <CustomDatePicker
                                label="Mulai Berlaku"
                                value={formState.startDate}
                                onChange={(val) => setFormState({ ...formState, startDate: val })}
                                className="w-full"
                            />
                            <CustomDatePicker
                                label="Berakhir"
                                value={formState.endDate}
                                onChange={(val) => setFormState({ ...formState, endDate: val })}
                                className="w-full"
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Simpan Promo
                        </button>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PromoFormModal;