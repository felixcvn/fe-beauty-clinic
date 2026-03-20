import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../context/MockDataContext';
import { useToast } from '../../context/ToastContext';
import { User, Calendar, Hash, CreditCard, MapPin, Mail, Phone } from 'lucide-react';

const PatientForm = () => {
    const { addPatient } = useMockData();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        noMember: '',
        noRM: '',
        namaLengkap: '',
        noIdentitas: '',
        tempatLahir: '',
        tanggalLahir: '',
        jenisKelamin: 'Laki-laki', // Default value
        alamat: '',
        email: '',
        noTelepon: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Kamu bisa menyesuaikan mapping data ini dengan format database/backend-mu
        addPatient(formData);
        showToast('Pasien berhasil didaftarkan!', 'success');
        navigate('/patients');
    };

    // Style seragam untuk input agar kode lebih rapi
    const inputWrapperClass = "relative group";
    const inputClass = "w-full px-6 py-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-primary";
    const inputWithIconClass = "w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-primary";
    const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30 group-focus-within:text-primary transition-colors";
    const labelClass = "text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] ml-1 mb-3 block";

    return (
        <div className="w-full mx-auto pb-12">
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/10 shadow-2xl shadow-primary/5 overflow-hidden animate-fade-in">
                <div className="p-8 md:p-12 border-b border-primary/5 bg-primary/5 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Registrasi Pasien</h2>
                        <p className="text-primary/40 mt-3 font-bold text-sm tracking-tight">Masukkan 10 data diri lengkap pasien baru</p>
                    </div>
                </div>

                <form className="p-8 md:p-12 space-y-8" onSubmit={handleSubmit}>
                    
                    {/* Baris 1: No Member & No RM */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className={labelClass}>1. No. Member</label>
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
                            <label className={labelClass}>2. No. RM (Rekam Medis)</label>
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

                    {/* Baris 2: Nama Lengkap & No Identitas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className={labelClass}>3. Nama Lengkap</label>
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
                            <label className={labelClass}>4. No. Identitas (KTP/Passport)</label>
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

                    {/* Baris 3: Tempat & Tanggal Lahir */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className={labelClass}>5. Tempat Lahir</label>
                            <div className={inputWrapperClass}>
                                <MapPin className={iconClass} />
                                <input
                                    required
                                    type="text"
                                    placeholder="Kota/Kabupaten Tempat Lahir"
                                    className={inputWithIconClass}
                                    value={formData.tempatLahir}
                                    onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>6. Tanggal Lahir</label>
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

                    {/* Baris 4: Jenis Kelamin & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className={labelClass}>7. Jenis Kelamin</label>
                            <select
                                required
                                className={inputClass}
                                value={formData.jenisKelamin}
                                onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                            >
                                <option value="Laki-laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>8. Email</label>
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

                    {/* Baris 5: Telepon (Full width di mobile, half di md) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className={labelClass}>9. No. Telepon / WhatsApp</label>
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

                    {/* Baris 6: Alamat (Full Width) */}
                    <div>
                        <label className={labelClass}>9. Alamat Lengkap</label>
                        <textarea
                            required
                            rows="3"
                            placeholder="Detail alamat domisili pasien..."
                            className={`${inputClass} resize-none`}
                            value={formData.alamat}
                            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                        />
                    </div>

                    {/* Tombol Aksi */}
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