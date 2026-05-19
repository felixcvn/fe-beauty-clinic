import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, User, Phone, Clock, FileText, CheckCircle2, Edit3, Package, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { pasienAPI, karyawanAPI, treatmentAPI, paketBundlingsAPI, reservasiAPI } from '../../services/api';
import CustomSelect from './CustomSelect';
import ConfirmModal from './ConfirmModal';

const ReservationFormModal = ({ isOpen, onClose, initialData, onSuccess }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const isEditMode = !!initialData;

    const [formData, setFormData] = useState({
        Tanggal_reservasi: new Date().toISOString().split('T')[0],
        Jam_reservasi: '',
        pasien_id: '',
        Nama_pasien: '',
        No_Telp: '',
        karyawan_id: '',
        treatment_id: '',
        paket_treatment_id: '',
        Keterangan: ''
    });

    const [loading, setLoading] = useState({
        patients: false,
        staff: false,
        treatments: false,
        paketTreatments: false,
        submit: false
    });

    const [options, setOptions] = useState({
        patients: [],
        staff: [],
        treatments: [],
        paketTreatments: []
    });

    const [isNewPatient, setIsNewPatient] = useState(false);
    const [errors, setErrors] = useState({});
    const [confirmConfig, setConfirmConfig] = useState(null);

    // Fetch all required data
    useEffect(() => {
        if (!isOpen || !user?.token) return;

        const fetchData = async () => {
            setLoading(prev => ({ ...prev, patients: true, staff: true, treatments: true, paketTreatments: true }));
            try {
                const [pRes, sRes, tRes, ptRes] = await Promise.all([
                    pasienAPI.getAll(user.token, 1, 'per_page=100'),
                    karyawanAPI.getAll(user.token, 1, 'per_page=100'),
                    treatmentAPI.getAll(user.token),
                    paketBundlingsAPI.getAll(user.token)
                ]);

                if (pRes.success && pRes.data) {
                    const responseData = pRes.data.data || pRes.data;
                    const pData = Array.isArray(responseData) ? responseData : (responseData.data || []);
                    
                    setOptions(prev => ({ 
                        ...prev, 
                        patients: pData.filter(p => p).map(p => ({ 
                            value: String(p.id), 
                            label: String(p.Nama_pasien || p.nama_pasien || p.namaLengkap || `Pasien ${p.id}`) + ` (${p.no_RM || 'No RM -'})`,
                            phone: p.no_Telp || p.no_telp || ''
                        })) 
                    }));
                } else {
                    console.error("Failed to fetch patients:", pRes.message);
                }

                if (sRes.success && sRes.data) {
                    const responseData = sRes.data.data || sRes.data;
                    const sData = Array.isArray(responseData) ? responseData : (responseData.data || []);
                    
                    setOptions(prev => ({ 
                        ...prev, 
                        staff: sData
                            .filter(s => s && (s.status === 'Aktif' || s.Status_karyawan === 'Aktif' || s.Status === 'Aktif'))
                            .map(s => ({ 
                                value: String(s.id), 
                                label: String(s.NamaLengkap_karyawan || s.nama_lengkap || s.NamaLengkap || `Karyawan ${s.id}`) 
                            })) 
                    }));
                }

                if (tRes.success && tRes.data) {
                    const responseData = tRes.data.data || tRes.data;
                    const tData = Array.isArray(responseData) ? responseData : (responseData.data || []);
                    setOptions(prev => ({ 
                        ...prev, 
                        treatments: tData.filter(t => t).map(t => ({ 
                            value: String(t.id), 
                            label: String(t.Nama_treatment || t.nama_treatment || `Treatment ${t.id}`) 
                        })) 
                    }));
                }

                if (ptRes.success && ptRes.data) {
                    const responseData = ptRes.data.data || ptRes.data;
                    const ptData = Array.isArray(responseData) ? responseData : (responseData.data || []);
                    setOptions(prev => ({ 
                        ...prev, 
                        paketTreatments: ptData.filter(pt => pt).map(pt => ({ 
                            value: String(pt.id), 
                            label: String(pt.Nama_paket || pt.nama_paket || `Paket ${pt.id}`) 
                        })) 
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch form options", err);
                showToast("Gagal memuat daftar pilihan", "error");
            } finally {
                setLoading(prev => ({ ...prev, patients: false, staff: false, treatments: false, paketTreatments: false }));
            }
        };

        fetchData();

        if (isEditMode && initialData) {
            setFormData({
                Tanggal_reservasi: initialData.Tanggal_reservasi || '',
                Jam_reservasi: initialData.Jam_reservasi ? String(initialData.Jam_reservasi).substring(0, 5) : '',
                pasien_id: initialData.pasien_id ? String(initialData.pasien_id) : '',
                Nama_pasien: initialData.Nama_pasien || '',
                No_Telp: initialData.No_Telp || '',
                karyawan_id: initialData.karyawan_id ? String(initialData.karyawan_id) : '',
                treatment_id: initialData.treatment_id ? String(initialData.treatment_id) : '',
                paket_treatment_id: initialData.paket_treatment_id ? String(initialData.paket_treatment_id) : '',
                Keterangan: initialData.Keterangan || ''
            });
            setIsNewPatient(!initialData.pasien_id);
        } else {
            setFormData({
                Tanggal_reservasi: new Date().toISOString().split('T')[0],
                Jam_reservasi: '',
                pasien_id: '',
                Nama_pasien: '',
                No_Telp: '',
                karyawan_id: '',
                treatment_id: '',
                paket_treatment_id: '',
                Keterangan: ''
            });
            setIsNewPatient(false);
        }
        setErrors({});
    }, [isOpen, user, isEditMode, initialData]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.Tanggal_reservasi) newErrors.Tanggal_reservasi = 'Tanggal wajib diisi';
        if (!formData.Jam_reservasi) newErrors.Jam_reservasi = 'Jam wajib diisi';
        
        if (isNewPatient) {
            if (!formData.Nama_pasien?.trim()) newErrors.Nama_pasien = 'Nama pasien wajib diisi';
        } else {
            if (!formData.pasien_id) newErrors.pasien_id = 'Pilih pasien terlebih dahulu';
        }

        if (!formData.No_Telp?.trim()) newErrors.No_Telp = 'Nomor telepon wajib diisi';
        if (!formData.karyawan_id) newErrors.karyawan_id = 'Pilih karyawan pengampu';
        if (!formData.treatment_id && !formData.paket_treatment_id) {
            newErrors.treatment = 'Pilih salah satu antara Treatment atau Paket';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePatientChange = (val) => {
        const selected = options.patients.find(p => p.value === val);
        setFormData({ 
            ...formData, 
            pasien_id: val, 
            No_Telp: selected ? selected.phone : formData.No_Telp 
        });
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(prev => ({ ...prev, submit: true }));
        try {
            const payload = { ...formData };
            payload.pasien_id = isNewPatient ? null : (payload.pasien_id || null);
            payload.treatment_id = payload.treatment_id || null;
            payload.paket_treatment_id = payload.paket_treatment_id || null;
            
            if (isNewPatient) {
                delete payload.pasien_id;
            } else {
                delete payload.Nama_pasien;
            }

            let result;
            if (isEditMode) {
                result = await reservasiAPI.update(user.token, initialData.id, payload);
            } else {
                result = await reservasiAPI.create(user.token, payload);
            }

            if (result.success) {
                showToast(`Reservasi berhasil ${isEditMode ? 'diperbarui' : 'dibuat'}`, 'success');
                if (onSuccess) onSuccess();
                onClose();
            } else {
                showToast(result.message, 'error');
            }
        } catch (err) {
            showToast('Terjadi kesalahan pada server', 'error');
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    const labelClass = "text-[10px] font-black uppercase tracking-widest text-primary/40 block mb-2 px-1";
    const inputClass = "w-full px-5 py-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium text-primary shadow-sm placeholder:text-primary/20 placeholder:font-medium";

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/30 transition-opacity" onClick={onClose}>
            <div
                className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/40 hover:scale-105 active:scale-95 transition-all z-[60] shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="relative p-8 pb-6 bg-primary overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>
                    <div className="relative z-10 flex items-center gap-4 pr-12">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-secondary backdrop-blur-sm border border-white/10">
                            {isEditMode ? <Edit3 className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                                {isEditMode ? 'Edit Reservasi' : 'Reservasi Baru'}
                            </h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                {isEditMode ? `Mengubah data — ID: ${initialData?.id}` : 'Daftarkan Jadwal Kunjungan Customer'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-8 overflow-y-auto scrollbar-hide flex-1 bg-gray-50/30">
                    <form onSubmit={(e) => { e.preventDefault(); setConfirmConfig({
                        icon: 'save',
                        header: isEditMode ? 'Simpan Perubahan' : 'Konfirmasi Reservasi',
                        message: `Yakin ingin menyimpan reservasi ini?`,
                        acceptLabel: 'SIMPAN',
                        onAccept: handleSubmit
                    })}} className="space-y-8">
                        
                        {/* Jadwal Reservasi */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-primary/5 pb-2">
                                <Clock className="w-4 h-4 text-primary/30" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Waktu Kunjungan</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className={labelClass}>Tanggal Reservasi</label>
                                    <input
                                        type="date"
                                        className={`${inputClass} ${errors.Tanggal_reservasi ? 'border-red-400' : ''}`}
                                        value={formData.Tanggal_reservasi}
                                        onChange={(e) => setFormData({ ...formData, Tanggal_reservasi: e.target.value })}
                                    />
                                    {errors.Tanggal_reservasi && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.Tanggal_reservasi}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClass}>Jam Reservasi</label>
                                    <input
                                        type="time"
                                        className={`${inputClass} ${errors.Jam_reservasi ? 'border-red-400' : ''}`}
                                        value={formData.Jam_reservasi}
                                        onChange={(e) => setFormData({ ...formData, Jam_reservasi: e.target.value })}
                                    />
                                    {errors.Jam_reservasi && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.Jam_reservasi}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Detail Customer */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-primary/5 pb-2">
                                <div className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-primary/30" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Informasi Customer</h4>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsNewPatient(!isNewPatient);
                                        setFormData({ ...formData, pasien_id: '', Nama_pasien: '', No_Telp: '' });
                                    }}
                                    className="text-[9px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-colors bg-primary/5 px-3 py-1 rounded-full border border-primary/5"
                                >
                                    {isNewPatient ? 'Pilih Pasien Terdaftar' : '+ Pasien Baru'}
                                </button>
                            </div>

                            {!isNewPatient ? (
                                <div className="space-y-1">
                                    <label className={labelClass}>Cari Pasien</label>
                                    <CustomSelect
                                        options={options.patients}
                                        value={formData.pasien_id}
                                        onChange={handlePatientChange}
                                        placeholder={loading.patients ? "Loading patients..." : "Cari Nama / No RM..."}
                                        searchable={true}
                                    />
                                    {errors.pasien_id && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.pasien_id}</p>}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <label className={labelClass}>Nama Pasien Baru</label>
                                    <input
                                        type="text"
                                        placeholder="Ketik nama lengkap..."
                                        className={`${inputClass} ${errors.Nama_pasien ? 'border-red-400' : ''}`}
                                        value={formData.Nama_pasien}
                                        onChange={(e) => setFormData({ ...formData, Nama_pasien: e.target.value })}
                                    />
                                    {errors.Nama_pasien && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.Nama_pasien}</p>}
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className={labelClass}>Nomor Telepon</label>
                                <div className="relative group">
                                    <input
                                        type="tel"
                                        placeholder="08xxxxxxxxxx"
                                        className={`${inputClass} ${errors.No_Telp ? 'border-red-400 focus:ring-red-400/20' : ''}`}
                                        value={formData.No_Telp}
                                        onChange={(e) => setFormData({ ...formData, No_Telp: e.target.value })}
                                    />
                                    <Phone className="w-4 h-4 text-primary/20 absolute right-5 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                                </div>
                                {errors.No_Telp && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.No_Telp}</p>}
                            </div>
                        </div>

                        {/* Layanan & Karyawan */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-primary/5 pb-2">
                                <Sparkles className="w-4 h-4 text-primary/30" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Layanan &amp; Petugas</h4>
                            </div>

                            <div className="space-y-1">
                                <label className={labelClass}>Karyawan Pengampu</label>
                                <CustomSelect
                                    options={options.staff}
                                    value={formData.karyawan_id}
                                    onChange={(val) => setFormData({ ...formData, karyawan_id: val })}
                                    placeholder="Pilih Karyawan..."
                                    searchable={true}
                                />
                                {errors.karyawan_id && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.karyawan_id}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className={labelClass}><Sparkles className="w-3 h-3 inline mr-1 opacity-50" /> Treatment</label>
                                    <CustomSelect
                                        options={options.treatments}
                                        value={formData.treatment_id}
                                        onChange={(val) => setFormData({ ...formData, treatment_id: val, paket_treatment_id: val ? '' : formData.paket_treatment_id })}
                                        placeholder="Pilih Satuan..."
                                        searchable={true}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className={labelClass}><Package className="w-3 h-3 inline mr-1 opacity-50" /> Paket Treatment</label>
                                    <CustomSelect
                                        options={options.paketTreatments}
                                        value={formData.paket_treatment_id}
                                        onChange={(val) => setFormData({ ...formData, paket_treatment_id: val, treatment_id: val ? '' : formData.treatment_id })}
                                        placeholder="Pilih Paket..."
                                        searchable={true}
                                    />
                                </div>
                            </div>
                            {errors.treatment && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.treatment}</p>}
                        </div>

                        {/* Catatan */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-primary/5 pb-2">
                                <FileText className="w-4 h-4 text-primary/30" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Keterangan Tambahan</h4>
                            </div>
                            <div className="space-y-1">
                                <textarea
                                    placeholder="Keluhan pasien atau instruksi khusus..."
                                    className={`${inputClass} h-24 resize-none`}
                                    value={formData.Keterangan}
                                    onChange={(e) => setFormData({ ...formData, Keterangan: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-8 border-t border-primary/5 mt-auto flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-secondary/40 text-primary py-4 rounded-2xl hover:bg-secondary active:scale-[0.98] transition-all duration-300 font-black text-xs uppercase tracking-widest"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={loading.submit}
                                className="flex-[2] flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-2xl hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50"
                            >
                                {loading.submit ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        {isEditMode ? 'Simpan Perubahan' : 'Simpan Reservasi'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <ConfirmModal
                config={confirmConfig}
                onClose={() => setConfirmConfig(null)}
            />
        </div>,
        document.body
    );
};

export default ReservationFormModal;
