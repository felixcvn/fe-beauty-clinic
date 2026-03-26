import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, User, UserPlus } from 'lucide-react';
import CustomSelect from './CustomSelect';

const StaffFormModal = ({ isOpen, onClose, onSave, initialData }) => {
    const isEdit = !!initialData;

    const [formState, setFormState] = useState({
        name: '',
        nik: '',
        tanggal_lahir: '',
        role: 'Dokter',
        cabang: 'Jember',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormState({
                    name: initialData.name || '',
                    nik: initialData.nik || '',
                    tanggal_lahir: initialData.tanggal_lahir || '',
                    role: initialData.role || 'Dokter',
                    cabang: initialData.cabang || 'Jember',
                    email: initialData.email || '',
                    phone: initialData.phone || '',
                });
            } else {
                setFormState({
                    name: '',
                    nik: '',
                    tanggal_lahir: '',
                    role: 'Dokter',
                    cabang: 'Jember',
                    email: '',
                    phone: '',
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
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up"
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
                            {isEdit ? <User className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                                {isEdit ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
                            </h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                {isEdit ? 'Perbarui Informasi Staff' : 'Masukkan Rincian Staff Baru'}
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Body Form */}
                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Nama Lengkap</label>
                            <input 
                                required 
                                type="text" 
                                value={formState.name}
                                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                placeholder="Masukkan nama lengkap pegawai"
                                className="w-full px-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm placeholder:text-primary/20" 
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">NIK</label>
                                <input 
                                    required 
                                    type="text" 
                                    value={formState.nik}
                                    onChange={(e) => setFormState({ ...formState, nik: e.target.value })}
                                    placeholder="Nomor Induk Kependudukan"
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm placeholder:text-primary/20" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Tanggal Lahir</label>
                                <input 
                                    required 
                                    type="date" 
                                    value={formState.tanggal_lahir}
                                    onChange={(e) => setFormState({ ...formState, tanggal_lahir: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        { value: 'Perawat', label: 'Perawat' },
                                        { value: 'Staff Gudang', label: 'Staff Gudang' },
                                        { value: 'Kasir', label: 'Kasir' },
                                    ]}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Cabang Penempatan</label>
                                <CustomSelect 
                                    value={formState.cabang} 
                                    onChange={(value) => setFormState({ ...formState, cabang: value })}
                                    options={[
                                        { value: 'Jember', label: 'Klinik Cabang Jember' },
                                        { value: 'Lumajang', label: 'Klinik Cabang Lumajang' },
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Email</label>
                                <input 
                                    required 
                                    type="email" 
                                    value={formState.email}
                                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                    placeholder="email@contoh.com"
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm placeholder:text-primary/20" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">No. Telp</label>
                                <input 
                                    required 
                                    type="tel" 
                                    value={formState.phone}
                                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                                    placeholder="08xx-xxxx-xxxx"
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm placeholder:text-primary/20" 
                                />
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            {isEdit ? 'Simpan Perubahan' : 'Tambahkan Pegawai'}
                        </button>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default StaffFormModal;