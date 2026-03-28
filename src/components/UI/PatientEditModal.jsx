import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, User, UserPlus, Hash, CreditCard, MapPin, Calendar, Mail, Phone } from 'lucide-react';
import CustomSelect from './CustomSelect';

const PatientEditModal = ({ isOpen, onClose, onSave, initialData }) => {
    const isEdit = !!initialData;

    const [formData, setFormData] = useState({
        noMember: '',
        noRM: '',
        namaLengkap: '',
        noIdentitas: '',
        tempatLahir: '',
        tanggalLahir: '',
        jenisKelamin: 'Laki-laki',
        alamat: '',
        email: '',
        noTelepon: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    id: initialData.id,
                    noMember: initialData.noMember || '',
                    noRM: initialData.noRM || '',
                    namaLengkap: initialData.namaLengkap || initialData.name || '',
                    noIdentitas: initialData.noIdentitas || '',
                    tempatLahir: initialData.tempatLahir || '',
                    tanggalLahir: initialData.tanggalLahir || '',
                    jenisKelamin: initialData.jenisKelamin || 'Laki-laki',
                    alamat: initialData.alamat || '',
                    email: initialData.email || '',
                    noTelepon: initialData.noTelepon || initialData.phone || ''
                });
            } else {
                setFormData({
                    noMember: '',
                    noRM: '',
                    namaLengkap: '',
                    noIdentitas: '',
                    tempatLahir: '',
                    tanggalLahir: '',
                    jenisKelamin: 'Laki-laki',
                    alamat: '',
                    email: '',
                    noTelepon: ''
                });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const inputWrapperClass = "relative group";
    const inputClass = "w-full px-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-primary shadow-sm";
    const inputWithIconClass = "w-full pl-12 pr-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-primary shadow-sm";
    const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors";
    const labelClass = "text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1 block mb-2";

    return createPortal(
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
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
                                {isEdit ? 'Edit Data Pasien' : 'Tambah Pasien Baru'}
                            </h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                {isEdit ? 'Perbarui Informasi Pasien Tercatat' : 'Lengkapi Formulir Pendaftaran Pasien'}
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Body Form */}
                <div className="p-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>No. Member</label>
                                <div className={inputWrapperClass}>
                                    <Hash className={iconClass} />
                                    <input
                                        type="text"
                                        placeholder="Nomor Member"
                                        className={inputWithIconClass}
                                        value={formData.noMember}
                                        onChange={(e) => setFormData({ ...formData, noMember: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>No. RM (Rekam Medis)</label>
                                <div className={inputWrapperClass}>
                                    <Hash className={iconClass} />
                                    <input
                                        type="text"
                                        placeholder="Nomor Rekam Medis"
                                        className={inputWithIconClass}
                                        value={formData.noRM}
                                        onChange={(e) => setFormData({ ...formData, noRM: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Nama Lengkap</label>
                                <div className={inputWrapperClass}>
                                    <User className={iconClass} />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Nama Lengkap Pasien"
                                        className={inputWithIconClass}
                                        value={formData.namaLengkap}
                                        onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>No. Identitas (KTP/Passport)</label>
                                <div className={inputWrapperClass}>
                                    <CreditCard className={iconClass} />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Nomor Identitas Diri"
                                        className={inputWithIconClass}
                                        value={formData.noIdentitas}
                                        onChange={(e) => setFormData({ ...formData, noIdentitas: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Tempat Lahir</label>
                                <div className={inputWrapperClass}>
                                    <MapPin className={iconClass} />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Kota Tempat Lahir"
                                        className={inputWithIconClass}
                                        value={formData.tempatLahir}
                                        onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Tanggal Lahir</label>
                                <div className={inputWrapperClass}>
                                    <Calendar className={iconClass} />
                                    <input
                                        required
                                        type="date"
                                        className={inputWithIconClass}
                                        value={formData.tanggalLahir}
                                        onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Jenis Kelamin</label>
                                <CustomSelect 
                                    value={formData.jenisKelamin} 
                                    onChange={(value) => setFormData({ ...formData, jenisKelamin: value })}
                                    options={[
                                        { value: 'Laki-laki', label: 'Laki-laki' },
                                        { value: 'Perempuan', label: 'Perempuan' }
                                    ]}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Email</label>
                                <div className={inputWrapperClass}>
                                    <Mail className={iconClass} />
                                    <input
                                        type="email"
                                        placeholder="alamat@email.com"
                                        className={inputWithIconClass}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>No. Telepon / WhatsApp</label>
                                <div className={inputWrapperClass}>
                                    <Phone className={iconClass} />
                                    <input
                                        required
                                        type="tel"
                                        placeholder="081234567890"
                                        className={inputWithIconClass}
                                        value={formData.noTelepon}
                                        onChange={(e) => setFormData({ ...formData, noTelepon: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Alamat Lengkap</label>
                            <textarea
                                required
                                rows="3"
                                placeholder="Detail alamat domisili pasien..."
                                className={`${inputClass} resize-none`}
                                value={formData.alamat}
                                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            {isEdit ? 'Simpan Perubahan' : 'Tambahkan Pasien'}
                        </button>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PatientEditModal;
