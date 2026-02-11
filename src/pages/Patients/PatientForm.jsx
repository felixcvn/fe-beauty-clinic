import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../context/MockDataContext';
import { useToast } from '../../context/ToastContext';
import { User, Calendar } from 'lucide-react';

const PatientForm = () => {
    const { addPatient } = useMockData();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        allergies: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addPatient(formData);
        showToast('Pasien berhasil didaftarkan!', 'success');
        navigate('/patients');
    };

    return (
        <div className="max-w-3xl mx-auto pb-12">
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/10 shadow-2xl shadow-primary/5 overflow-hidden animate-fade-in">
                <div className="p-8 md:p-12 border-b border-primary/5 bg-primary/5 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Registrasi Pasien</h2>
                        <p className="text-primary/40 mt-3 font-bold text-sm tracking-tight">Masukkan data lengkap pasien baru</p>
                    </div>
                </div>

                <form className="p-8 md:p-12 space-y-8" onSubmit={handleSubmit}>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Nama Lengkap Pasien"
                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-primary"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] ml-1">Umur (Tahun)</label>
                            <input
                                type="number"
                                placeholder="Contoh: 25"
                                className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-primary"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] ml-1">Alergi (Opsional)</label>
                            <input
                                type="text"
                                placeholder="Contoh: Debu, Kacang"
                                className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-primary"
                                value={formData.allergies}
                                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4 sm:gap-6 pt-8 border-t border-primary/5">
                        <button
                            type="button"
                            onClick={() => navigate('/patients')}
                            className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary/40 hover:bg-primary/5 transition-all duration-300 active:scale-95 text-center order-2 sm:order-1"
                        >
                            Batal
                        </button>
                        <button type="submit" className="bg-primary text-secondary px-10 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 order-1 sm:order-2">
                            Daftarkan Pasien
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientForm;
