import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { User, Mail, Phone, ShieldCheck } from 'lucide-react';
import CustomSelect from '../../components/UI/CustomSelect';

const StaffForm = ({ onAdd }) => {
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [formState, setFormState] = useState({
        name: '',
        role: 'Dokter',
        email: '',
        phone: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onAdd) {
            onAdd({
                ...formState,
                id: `STF-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                status: 'Active',
            });
        }
        showToast('Pegawai baru berhasil ditambahkan', 'success');
        navigate('/staff');
    };

    return (
        <div className="max-w-3xl mx-auto pb-12">
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/10 shadow-2xl shadow-primary/5 overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="p-8 md:p-12 border-b border-primary/5 bg-primary/5 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Tambah Pegawai</h2>
                        <p className="text-primary/40 mt-3 font-bold text-sm tracking-tight">Masukkan data lengkap pegawai baru</p>
                    </div>
                </div>

                {/* Form */}
                <form className="p-8 md:p-12 space-y-8" onSubmit={handleSubmit}>
                    {/* Nama */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30 group-focus-within:text-primary transition-colors" />
                            <input
                                required
                                type="text"
                                placeholder="Nama lengkap pegawai"
                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-primary"
                                value={formState.name}
                                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Role */}
                    <div className="space-y-3 relative z-50">
                        <label className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] ml-1">Role Pegawai</label>
                        <CustomSelect 
                            value={formState.role} 
                            onChange={(value) => setFormState({ ...formState, role: value })}
                            icon={ShieldCheck}
                            options={[
                                { value: 'Admin', label: 'Admin' },
                                { value: 'Dokter', label: 'Dokter' },
                                { value: 'Customer Service', label: 'Customer Service' },
                                { value: 'HRD', label: 'HRD' },
                                { value: 'Manager', label: 'Manager' }
                            ]}
                        />
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30 group-focus-within:text-primary transition-colors" />
                                <input
                                    required
                                    type="email"
                                    placeholder="email@clinic.com"
                                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-primary"
                                    value={formState.email}
                                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] ml-1">No. Telp</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30 group-focus-within:text-primary transition-colors" />
                                <input
                                    required
                                    type="tel"
                                    placeholder="08xx-xxxx-xxxx"
                                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-primary"
                                    value={formState.phone}
                                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4 sm:gap-6 pt-8 border-t border-primary/5">
                        <button
                            type="button"
                            onClick={() => navigate('/staff')}
                            className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary/40 hover:bg-primary/5 transition-all duration-300 active:scale-95 text-center order-2 sm:order-1"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="bg-primary text-secondary px-10 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 order-1 sm:order-2"
                        >
                            Simpan Pegawai
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StaffForm;
