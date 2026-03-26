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
        username: '',
        password: '',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            if (initialData) {
                setFormState({
                    name: initialData.name || '',
                    nik: initialData.nik || '',
                    tanggal_lahir: initialData.tanggal_lahir || '',
                    role: initialData.role || 'Dokter',
                    cabang: initialData.cabang || 'Jember',
                    email: initialData.email || '',
                    phone: initialData.phone || '',
                    username: initialData.username || '',
                    password: initialData.password || '',
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
                    username: '',
                    password: '',
                });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const validateForm = () => {
        let newErrors = {};
        if (!formState.name.trim()) newErrors.name = "Nama lengkap wajib diisi";
        
        if (!formState.nik.trim()) newErrors.nik = "NIK wajib diisi";
        else if (!/^\d+$/.test(formState.nik)) newErrors.nik = "NIK hanya boleh berisi angka (tidak boleh ada huruf/simbol)";
        else if (formState.nik.length < 16) newErrors.nik = "NIK minimal 16 angka";

        if (!formState.tanggal_lahir) newErrors.tanggal_lahir = "Tanggal lahir wajib diisi";

        if (!formState.phone.trim()) newErrors.phone = "Nomor telepon wajib diisi";
        else if (!/^\d+$/.test(formState.phone)) newErrors.phone = "Nomor telepon hanya boleh berisi angka";

        if (!formState.email.trim()) newErrors.email = "Email wajib diisi";
        else if (!/\S+@\S+\.\S+/.test(formState.email)) newErrors.email = "Format email tidak valid";

        if (!formState.username.trim()) newErrors.username = "Username wajib diisi";
        else if (/\s/.test(formState.username)) newErrors.username = "Username tidak boleh mengandung spasi";

        if (!formState.password) newErrors.password = "Password wajib diisi";
        else if (formState.password.length < 6) newErrors.password = "Password minimal 6 karakter";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSave(formState);
        }
    };

    const handleChange = (field, value) => {
        setFormState(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 transition-opacity"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]"
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
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Data Personal */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40 border-b border-primary/5 pb-2">Informasi Personal</h4>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Nama Lengkap</label>
                                <input 
                                    type="text" 
                                    value={formState.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="Masukkan nama lengkap pegawai"
                                    className={`w-full px-5 py-3.5 rounded-2xl bg-white border ${errors.name ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/10 focus:ring-primary/10'} outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm placeholder:text-primary/20`} 
                                />
                                {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">NIK</label>
                                    <input 
                                        type="text" 
                                        value={formState.nik}
                                        onChange={(e) => handleChange('nik', e.target.value)}
                                        placeholder="Nomor Induk Kependudukan"
                                        className={`w-full px-5 py-3.5 rounded-2xl bg-white border ${errors.nik ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/10 focus:ring-primary/10'} outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm placeholder:text-primary/20`} 
                                    />
                                    {errors.nik && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 animate-pulse">{errors.nik}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Tanggal Lahir</label>
                                    <input 
                                        type="date" 
                                        value={formState.tanggal_lahir}
                                        onChange={(e) => handleChange('tanggal_lahir', e.target.value)}
                                        className={`w-full px-5 py-3.5 rounded-2xl bg-white border ${errors.tanggal_lahir ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/10 focus:ring-primary/10'} outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm`} 
                                    />
                                    {errors.tanggal_lahir && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.tanggal_lahir}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Posisi & Penempatan */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40 border-b border-primary/5 pb-2">Posisi & Penempatan</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Role Pegawai</label>
                                    <CustomSelect 
                                        value={formState.role} 
                                        onChange={(value) => handleChange('role', value)}
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
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Cabang Penempatan</label>
                                    <CustomSelect 
                                        value={formState.cabang} 
                                        onChange={(value) => handleChange('cabang', value)}
                                        options={[
                                            { value: 'Jember', label: 'Klinik Cabang Jember' },
                                            { value: 'Lumajang', label: 'Klinik Cabang Lumajang' },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Informasi Kontak */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40 border-b border-primary/5 pb-2">Informasi Kontak</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Email</label>
                                    <input 
                                        type="text" 
                                        value={formState.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        placeholder="email@contoh.com"
                                        className={`w-full px-5 py-3.5 rounded-2xl bg-white border ${errors.email ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/10 focus:ring-primary/10'} outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm placeholder:text-primary/20`} 
                                    />
                                    {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.email}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">No. Telp</label>
                                    <input 
                                        type="tel" 
                                        value={formState.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder="08xx-xxxx-xxxx"
                                        className={`w-full px-5 py-3.5 rounded-2xl bg-white border ${errors.phone ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/10 focus:ring-primary/10'} outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm placeholder:text-primary/20`} 
                                    />
                                    {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 animate-pulse">{errors.phone}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Akun & Keamanan */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40 border-b border-primary/5 pb-2">Akun Sistem & Keamanan</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Username Login</label>
                                    <input 
                                        type="text" 
                                        value={formState.username}
                                        onChange={(e) => handleChange('username', e.target.value)}
                                        placeholder="Contoh: sarah123"
                                        className={`w-full px-5 py-3.5 rounded-2xl bg-white border ${errors.username ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/10 focus:ring-primary/10'} outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm placeholder:text-primary/20`} 
                                    />
                                    {errors.username && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.username}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Password</label>
                                    <input 
                                        type="text" 
                                        value={formState.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        placeholder="********"
                                        className={`w-full px-5 py-3.5 rounded-2xl bg-white border ${errors.password ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/10 focus:ring-primary/10'} outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm placeholder:text-primary/20`} 
                                    />
                                    {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.password}</p>}
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-primary/5">
                            <button 
                                type="submit" 
                                className="w-full flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-2xl hover:bg-primary-dark active:scale-[0.98] transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                {isEdit ? 'Simpan Perubahan' : 'Tambahkan Pegawai'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default StaffFormModal;