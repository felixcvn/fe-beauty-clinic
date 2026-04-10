import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Clock, User, Phone, UserCheck, FileText } from 'lucide-react';
import { useMockData } from '../../context/MockDataContext';
import CustomSelect from './CustomSelect';

const BookingFormModal = ({ isOpen, onClose, onSave }) => {
    const { staff } = useMockData();
    
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        time: '',
        broughtByStaff: '',
        notes: '',
        treatment: 'Consultation' // Default treatment
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '',
                phone: '',
                time: '',
                broughtByStaff: '',
                notes: '',
                treatment: 'Consultation'
            });
            setErrors({});
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const validateForm = () => {
        let newErrors = {};

        if (!formData.name.trim()) newErrors.name = "Nama customer wajib diisi";
        if (!formData.phone.trim()) newErrors.phone = "Nomor telepon wajib diisi";
        else if (!/^\d+$/.test(formData.phone)) newErrors.phone = "Nomor telepon hanya boleh berisi angka";
        
        if (!formData.time) newErrors.time = "Jam booking wajib diisi";
        if (!formData.broughtByStaff) newErrors.broughtByStaff = "Karyawan wajib dipilih";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSave(formData);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const staffOptions = staff.map(s => ({
        value: s.name,
        label: `${s.name} (${s.divisi})`
    }));

    const inputWrapperClass = "relative group";
    const getInputWithIconClass = (hasError) => `w-full pl-12 pr-5 py-4 rounded-2xl bg-secondary/20 border ${hasError ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/5 focus:ring-primary/5'} outline-none focus:ring-4 transition-all text-sm font-bold text-primary shadow-sm`;
    const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors";
    const labelClass = "text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1 block mb-2";

    return createPortal(
        <div 
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 animate-fade-in duration-300"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
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
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                                Booking Treatment
                            </h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                Lengkap Formulir Reservasi Pasien
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Body Form */}
                <div className="p-8 max-h-[75vh] overflow-y-auto scrollbar-hide">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        <div>
                            <label className={labelClass}>Nama Customer</label>
                            <div className={inputWrapperClass}>
                                <User className={iconClass} />
                                <input
                                    type="text"
                                    placeholder="Nama Lengkap Customer"
                                    className={getInputWithIconClass(errors.name)}
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                />
                            </div>
                            {errors.name && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Nomor Telepon</label>
                                <div className={inputWrapperClass}>
                                    <Phone className={iconClass} />
                                    <input
                                        type="tel"
                                        placeholder="081234..."
                                        className={getInputWithIconClass(errors.phone)}
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                    />
                                </div>
                                {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1">{errors.phone}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Jam Booking</label>
                                <div className={inputWrapperClass}>
                                    <Clock className={iconClass} />
                                    <input
                                        type="time"
                                        className={getInputWithIconClass(errors.time)}
                                        value={formData.time}
                                        onChange={(e) => handleChange('time', e.target.value)}
                                    />
                                </div>
                                {errors.time && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1">{errors.time}</p>}
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Karyawan yang Membawa</label>
                            <div className="relative z-50">
                                <CustomSelect 
                                    value={formData.broughtByStaff} 
                                    onChange={(value) => handleChange('broughtByStaff', value)}
                                    options={staffOptions}
                                    placeholder="Pilih Karyawan"
                                    searchable={true}
                                />
                            </div>
                            {errors.broughtByStaff && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1">{errors.broughtByStaff}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Keterangan Tambahan</label>
                            <div className={inputWrapperClass}>
                                <FileText className="absolute left-4 top-4 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                                <textarea
                                    rows="3"
                                    placeholder="Catatan pendaftaran, keluhan awal, dll..."
                                    className="w-full pl-12 pr-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-primary shadow-sm resize-none"
                                    value={formData.notes}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="w-full mt-4 flex items-center justify-center gap-3 bg-primary text-secondary py-5 rounded-[2rem] hover:scale-[1.02] active:scale-95 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            Simpan Reservasi
                        </button>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default BookingFormModal;
