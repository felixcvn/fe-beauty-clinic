import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, User, Phone, Clock, FileText, CheckCircle2, Edit3, Package, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { pasienAPI, karyawanAPI, treatmentAPI, paketBundlingsAPI, reservasiAPI } from '../../services/api';
import CustomSelect from './CustomSelect';
import CustomMultiSelect from './CustomMultiSelect';
import ConfirmModal from './ConfirmModal';
import CustomDatePicker from './CustomDatePicker';

const getTodayString = () => {
    const d = new Date();
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
};


const DEFAULT_SLOTS = [
    { time: '08:00', active: true },
    { time: '08:30', active: true },
    { time: '09:00', active: true },
    { time: '09:30', active: true },
    { time: '10:00', active: true },
    { time: '10:30', active: true },
    { time: '11:00', active: true },
    { time: '11:30', active: true },
    { time: '12:00', active: true },
    { time: '12:30', active: true },
    { time: '13:00', active: true },
    { time: '13:30', active: true },
    { time: '14:00', active: true },
    { time: '14:30', active: true },
    { time: '15:00', active: true },
    { time: '15:30', active: true },
    { time: '16:00', active: true },
    { time: '16:30', active: true },
    { time: '17:00', active: true }
];

const ReservationFormModal = ({ isOpen, onClose, initialData, bookings = [], onSuccess }) => {
    const { user } = useAuth();
    const { showToast } = useToast();

    const isEditMode = !!initialData;
    const todayStr = getTodayString();

    const [availableSlots, setAvailableSlots] = useState([]);

    useEffect(() => {
        if (!isOpen) return;
        const saved = localStorage.getItem('clinic_available_slots');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    const filtered = parsed.filter(slot => slot.time <= '17:00');
                    if (filtered.length !== DEFAULT_SLOTS.length) {
                        const merged = DEFAULT_SLOTS.map(defSlot => {
                            const found = filtered.find(s => s.time === defSlot.time);
                            return found ? { ...defSlot, active: found.active } : defSlot;
                        });
                        setAvailableSlots(merged);
                    } else {
                        setAvailableSlots(filtered);
                    }
                } else {
                    setAvailableSlots(DEFAULT_SLOTS);
                }
            } catch (e) {
                console.error("Failed to parse saved slots", e);
                setAvailableSlots(DEFAULT_SLOTS);
            }
        } else {
            setAvailableSlots(DEFAULT_SLOTS);
        }
    }, [isOpen]);

    const [formData, setFormData] = useState({
        Tanggal_reservasi: new Date().toISOString().split('T')[0],
        Jam_reservasi: '',
        pasien_id: '',
        Nama_pasien: '',
        No_Telp: '',
        karyawan_id: '',
        treatment_ids: [],
        paket_treatment_ids: [],
        Keterangan: ''
    });

    // Kapasitas maks per slot
    const MAX_SLOT_CAPACITY = 3;

    // Hitung jumlah booking per jam untuk tanggal yang dipilih
    const bookingCountByTime = React.useMemo(() => {
        if (!bookings || !formData.Tanggal_reservasi) return {};
        const counts = {};
        bookings
            .filter(b => b
                && b.Tanggal_reservasi === formData.Tanggal_reservasi
                && String(b.id) !== String(initialData?.id)
                && b.status !== 'Batal'  // exclude cancelled
            )
            .forEach(b => {
                const time = b.Jam_reservasi ? String(b.Jam_reservasi).substring(0, 5) : '';
                if (time) counts[time] = (counts[time] || 0) + 1;
            });
        return counts;
    }, [bookings, formData.Tanggal_reservasi, initialData]);

    // Cek apakah slot sudah lewat dari waktu sekarang (hanya berlaku jika tanggal = hari ini)
    const isSlotPast = React.useCallback((slotTime) => {
        const today = new Date().toISOString().split('T')[0];
        if (formData.Tanggal_reservasi !== today) return false;
        const now = new Date();
        const [slotHour, slotMin] = slotTime.split(':').map(Number);
        const slotDate = new Date();
        slotDate.setHours(slotHour, slotMin, 0, 0);
        return now >= slotDate;
    }, [formData.Tanggal_reservasi]);

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
                            label: String(p.Nama_pasien || p.nama_pasien || p.namaLengkap || `Pasien ${p.id}`) + (p.kec && p.kec.name ? ` - ${p.kec.name}` : ''),
                            name: p.Nama_pasien || p.nama_pasien || p.namaLengkap || '',
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
                            .filter(s => {
                                if (!s) return false;
                                const status = String(s.status || s.Status_karyawan || s.Status || '').toLowerCase();
                                return !status || status === 'aktif';
                            })
                            .map(s => {
                                const idVal = s.id || s.id_karyawan || s.id_user || s.ID;
                                return { 
                                    value: idVal ? String(idVal) : '', 
                                    label: String(s.NamaLengkap_karyawan || s.nama_lengkap || s.NamaLengkap || s.name || `Karyawan ${idVal || ''}`) 
                                };
                            })
                            .filter(opt => opt.value !== '' && opt.value !== 'undefined')
                    }));
                }

                if (tRes.success && tRes.data) {
                    const responseData = tRes.data.data || tRes.data;
                    const tData = Array.isArray(responseData) ? responseData : (responseData.data || []);
                    setOptions(prev => ({ 
                        ...prev, 
                        treatments: tData.filter(t => t).map(t => ({ 
                            value: `T-${t.id}`, 
                            label: `[Satuan] ${t.Nama_treatment || t.nama_treatment || `Treatment ${t.id}`}` 
                        })) 
                    }));
                }

                if (ptRes.success && ptRes.data) {
                    const responseData = ptRes.data.data || ptRes.data;
                    const ptData = Array.isArray(responseData) ? responseData : (responseData.data || []);
                    setOptions(prev => ({ 
                        ...prev, 
                        paketTreatments: ptData.filter(pt => pt).map(pt => ({ 
                            value: `PT-${pt.id}`, 
                            label: `[Paket] ${pt.Nama_paket || pt.nama_paket || `Paket ${pt.id}`}` 
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
            // Extract treatment_ids robustly
            let initialTreatmentIds = [];
            if (Array.isArray(initialData.treatment_ids)) {
                initialTreatmentIds = initialData.treatment_ids.map(String);
            } else if (Array.isArray(initialData.treatments)) {
                initialTreatmentIds = initialData.treatments.map(t => String(t.id || t.treatment_id));
            } else if (initialData.treatment_id) {
                initialTreatmentIds = [String(initialData.treatment_id)];
            }

            // Extract paket_treatment_ids robustly
            let initialPaketTreatmentIds = [];
            if (Array.isArray(initialData.paket_treatment_ids)) {
                initialPaketTreatmentIds = initialData.paket_treatment_ids.map(String);
            } else if (Array.isArray(initialData.paket_treatments)) {
                initialPaketTreatmentIds = initialData.paket_treatments.map(p => String(p.id || p.paket_treatment_id));
            } else if (initialData.paket_treatment_id) {
                initialPaketTreatmentIds = [String(initialData.paket_treatment_id)];
            }

            // Extract pasien_id robustly
            let initialPasienId = '';
            if (initialData.pasien_id) {
                initialPasienId = String(initialData.pasien_id);
            } else if (initialData.pasien && (initialData.pasien.id || initialData.pasien.id_pasien)) {
                initialPasienId = String(initialData.pasien.id || initialData.pasien.id_pasien);
            } else if (initialData.id_pasien) {
                initialPasienId = String(initialData.id_pasien);
            }

            // Extract karyawan_id robustly
            let initialKaryawanId = '';
            if (initialData.karyawan_id) {
                initialKaryawanId = String(initialData.karyawan_id);
            } else if (initialData.karyawan && (initialData.karyawan.id || initialData.karyawan.id_karyawan)) {
                initialKaryawanId = String(initialData.karyawan.id || initialData.karyawan.id_karyawan);
            } else if (initialData.id_karyawan) {
                initialKaryawanId = String(initialData.id_karyawan);
            } else if (initialData.dokter_id) {
                initialKaryawanId = String(initialData.dokter_id);
            }

            setFormData({
                Tanggal_reservasi: initialData.Tanggal_reservasi || '',
                Jam_reservasi: initialData.Jam_reservasi ? String(initialData.Jam_reservasi).substring(0, 5) : '',
                pasien_id: initialPasienId,
                Nama_pasien: initialData.Nama_pasien || '',
                No_Telp: initialData.No_Telp || '',
                karyawan_id: initialKaryawanId,
                treatment_ids: initialTreatmentIds,
                paket_treatment_ids: initialPaketTreatmentIds,
                Keterangan: initialData.Keterangan || ''
            });
            setIsNewPatient(!initialPasienId);
        } else {
            setFormData({
                Tanggal_reservasi: new Date().toISOString().split('T')[0],
                Jam_reservasi: '',
                pasien_id: '',
                Nama_pasien: '',
                No_Telp: '',
                karyawan_id: '',
                treatment_ids: [],
                paket_treatment_ids: [],
                Keterangan: ''
            });
            setIsNewPatient(false);
        }
        setErrors({});
    }, [isOpen, user, isEditMode, initialData]);

    const isInvalidId = (val) => {
        if (val === undefined || val === null) return true;
        const sVal = String(val).trim().toLowerCase();
        return sVal === '' || sVal === 'undefined' || sVal === 'null' || sVal === 'nan';
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.Tanggal_reservasi) newErrors.Tanggal_reservasi = 'Tanggal wajib diisi';
        if (!formData.Jam_reservasi) newErrors.Jam_reservasi = 'Jam wajib diisi';
        
        if (formData.Jam_reservasi && (bookingCountByTime[formData.Jam_reservasi.substring(0, 5)] || 0) >= MAX_SLOT_CAPACITY) {
            newErrors.Jam_reservasi = 'Jam tersebut sudah penuh untuk tanggal terpilih';
        }
        
        if (isNewPatient) {
            if (!formData.Nama_pasien?.trim()) newErrors.Nama_pasien = 'Nama pasien wajib diisi';
        } else {
            if (isInvalidId(formData.pasien_id)) {
                newErrors.pasien_id = 'Pilih pasien terlebih dahulu';
            }
        }

        if (!formData.No_Telp?.trim()) newErrors.No_Telp = 'Nomor telepon wajib diisi';
        
        if (isInvalidId(formData.karyawan_id)) {
            newErrors.karyawan_id = 'Pilih pegawai terlebih dahulu';
        }
        if ((!formData.treatment_ids || formData.treatment_ids.length === 0) && (!formData.paket_treatment_ids || formData.paket_treatment_ids.length === 0)) {
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
            Nama_pasien: selected ? selected.name : '',
            No_Telp: selected ? selected.phone : formData.No_Telp 
        });
    };

    const handleFormSubmitAttempt = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showToast("Harap lengkapi semua field yang wajib diisi", "error");
            
            // Auto scroll container smoothly to the first error element
            setTimeout(() => {
                const errorEl = document.querySelector('.text-red-500');
                if (errorEl) {
                    errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            return;
        }
        setConfirmConfig({
            icon: 'save',
            header: isEditMode ? 'Simpan Perubahan' : 'Konfirmasi Reservasi',
            message: `Yakin ingin menyimpan reservasi ini?`,
            acceptLabel: 'SIMPAN',
            onAccept: handleSubmit
        });
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(prev => ({ ...prev, submit: true }));
        try {
            // Build integers and strings formats for both treatment and paket
            const treatmentIdsInt = (formData.treatment_ids || []).map(Number).filter(n => !isNaN(n) && n > 0);
            const treatmentIdsStr = (formData.treatment_ids || []).map(String);
            
            const paketTreatmentIdsInt = (formData.paket_treatment_ids || []).map(Number).filter(n => !isNaN(n) && n > 0);
            const paketTreatmentIdsStr = (formData.paket_treatment_ids || []).map(String);

            // Single ID fallback (first element)
            const singleTreatmentId = treatmentIdsInt[0] || null;
            const singlePaketTreatmentId = paketTreatmentIdsInt[0] || null;

            // Extract employee and patient IDs (support both numeric IDs and UUID strings)
            const parseId = (val) => {
                if (isInvalidId(val)) return null;
                const num = Number(val);
                return isNaN(num) ? String(val) : num;
            };

            const selectedKaryawanId = parseId(formData.karyawan_id);
            const selectedPasienId = isNewPatient ? null : parseId(formData.pasien_id);

            // Find selected staff details for Pendaftar_pasien string field fallback
            const staffObj = options.staff.find(s => String(s.value) === String(formData.karyawan_id));
            const staffName = staffObj ? staffObj.label : (formData.NamaLengkap_karyawan || '');

            const payload = { 
                ...formData,
                pasien_id: selectedPasienId,
                karyawan_id: selectedKaryawanId,
                
                // Naming conventions fallbacks for Employee
                id_karyawan: selectedKaryawanId,
                dokter_id: selectedKaryawanId,
                Pendaftar_pasien: staffName,
                pendaftar_pasien: staffName,

                // Naming conventions fallbacks for Patient
                id_pasien: selectedPasienId,
                
                // Fallbacks (Legacy / Singular DB columns)
                treatment_id: singleTreatmentId,
                paket_treatment_id: singlePaketTreatmentId,
                
                // Array format with integers (Laravel standard many-to-many sync)
                treatment_ids: treatmentIdsInt,
                paket_treatment_ids: paketTreatmentIdsInt,
                
                // Array format with strings (Fallback)
                treatment_ids_string: treatmentIdsStr,
                paket_treatment_ids_string: paketTreatmentIdsStr,
                
                // Direct array of IDs under relationship keys (standard sync expects this if the relation is used directly)
                treatments: treatmentIdsInt, 
                paket_treatments: paketTreatmentIdsInt,
                
                // Relationship pivot structures (objects array)
                treatment: treatmentIdsInt.map(id => ({ treatment_id: id })),
                paket_treatment: paketTreatmentIdsInt.map(id => ({ paket_treatment_id: id })),
                
                // Double pivot structure with both types
                treatments_pivot: treatmentIdsInt.map(id => ({ treatment_id: id })),
                paket_treatments_pivot: paketTreatmentIdsInt.map(id => ({ paket_treatment_id: id })),

                // Comma-separated strings (Laravel casting / JSON fallback)
                treatment_ids_csv: treatmentIdsStr.join(','),
                paket_treatment_ids_csv: paketTreatmentIdsStr.join(','),
            };

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

    const handleCloseAttempt = () => {
        setConfirmConfig({
            icon: 'warning',
            header: 'Tutup Form?',
            message: 'Apakah Anda yakin ingin menutup form ini? Data yang belum disimpan akan hilang.',
            acceptLabel: 'Ya, Tutup',
            rejectLabel: 'Tidak',
            onAccept: onClose
        });
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/30 transition-opacity" onClick={handleCloseAttempt}>
            <div
                className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCloseAttempt(); }}
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
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30">
                    <form onSubmit={handleFormSubmitAttempt} className="space-y-8">
                        
                        {/* Jadwal Reservasi */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-primary/5 pb-2">
                                <Clock className="w-4 h-4 text-primary/30" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Waktu Kunjungan</h4>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <CustomDatePicker
                                        label="Tanggal Reservasi"
                                        value={formData.Tanggal_reservasi}
                                        onChange={(val) => setFormData({ ...formData, Tanggal_reservasi: val })}
                                        minDate={todayStr}
                                    />
                                    {errors.Tanggal_reservasi && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.Tanggal_reservasi}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClass}>Pilih Jam Reservasi</label>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 bg-white p-5 rounded-[2rem] border border-primary/5 shadow-sm">
                                        {availableSlots.map((slot) => {
                                            const isSelected = formData.Jam_reservasi && formData.Jam_reservasi.substring(0, 5) === slot.time;
                                            const slotCount = bookingCountByTime[slot.time] || 0;
                                            const isFull = slotCount >= MAX_SLOT_CAPACITY;
                                            const isPartial = slotCount > 0 && slotCount < MAX_SLOT_CAPACITY;
                                            const isPast = !isSelected && isSlotPast(slot.time);
                                            const isActive = (slot.active && !isFull && !isPast) || isSelected;
                                            
                                            return (
                                                <button
                                                    key={slot.time}
                                                    type="button"
                                                    disabled={!isActive}
                                                    onClick={() => setFormData({ ...formData, Jam_reservasi: slot.time })}
                                                    className={`py-3 px-2 rounded-xl font-black text-xs tracking-tight transition-all duration-200 text-center border active:scale-95 flex flex-col items-center justify-center gap-1 ${
                                                        isSelected
                                                            ? 'bg-primary text-secondary border-primary shadow-lg shadow-primary/20 hover:scale-[1.02]'
                                                            : isFull
                                                                ? 'bg-rose-50/30 text-rose-500/80 border-rose-100/30 cursor-not-allowed opacity-70'
                                                                : isPast
                                                                    ? 'bg-gray-50/80 text-gray-300 border-gray-100 cursor-not-allowed opacity-50'
                                                                    : isPartial
                                                                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:scale-[1.02]'
                                                                        : isActive
                                                                            ? 'bg-white text-primary border-primary/5 hover:bg-primary/[0.02] hover:border-primary/20 hover:scale-[1.02]'
                                                                            : 'bg-gray-50 text-gray-300 border-gray-100/50 cursor-not-allowed opacity-40'
                                                    }`}
                                                >
                                                    <span className="text-xs font-black tracking-tight">{slot.time}</span>
                                                    <span className={`text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                                        isSelected
                                                            ? 'bg-secondary text-primary'
                                                            : isFull
                                                                ? 'bg-rose-50 text-rose-600'
                                                                : isPast
                                                                    ? 'bg-gray-100 text-gray-400'
                                                                    : isPartial
                                                                        ? 'bg-amber-100 text-amber-700'
                                                                        : isActive
                                                                            ? 'bg-emerald-50 text-emerald-700'
                                                                            : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                        {isSelected
                                                            ? 'Pilih'
                                                            : isFull
                                                                ? 'Penuh'
                                                                : isPast
                                                                    ? 'Lewat'
                                                                    : isPartial
                                                                        ? `${slotCount}/${MAX_SLOT_CAPACITY}`
                                                                        : isActive
                                                                            ? 'Buka'
                                                                            : 'Tutup'}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
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
                                <label className={labelClass}>Pegawai</label>
                                <CustomSelect
                                    options={options.staff}
                                    value={formData.karyawan_id}
                                    onChange={(val) => setFormData({ ...formData, karyawan_id: val })}
                                    placeholder="Pilih Pegawai..."
                                    searchable={true}
                                />
                                {errors.karyawan_id && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.karyawan_id}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className={labelClass}><Sparkles className="w-3 h-3 inline mr-1 opacity-50" /> Pilihan Layanan (Satuan / Paket)</label>
                                <CustomMultiSelect
                                    options={[...options.treatments, ...options.paketTreatments]}
                                    values={[
                                        ...(formData.treatment_ids || []).map(id => `T-${id}`),
                                        ...(formData.paket_treatment_ids || []).map(id => `PT-${id}`)
                                    ]}
                                    onChange={(vals) => {
                                        const treatmentIds = [];
                                        const paketTreatmentIds = [];
                                        
                                        (vals || []).forEach(val => {
                                            if (val.startsWith('T-')) {
                                                treatmentIds.push(val.replace('T-', ''));
                                            } else if (val.startsWith('PT-')) {
                                                paketTreatmentIds.push(val.replace('PT-', ''));
                                            }
                                        });
                                        
                                        setFormData({
                                            ...formData,
                                            treatment_ids: treatmentIds,
                                            paket_treatment_ids: paketTreatmentIds
                                        });
                                    }}
                                    placeholder="Cari Layanan Satuan atau Paket..."
                                    searchable={true}
                                />
                                {errors.treatment && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.treatment}</p>}
                            </div>
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
                                onClick={handleCloseAttempt}
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
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(21, 71, 52, 0.15);
                    border-radius: 9999px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(21, 71, 52, 0.3);
                }
            `}</style>
        </div>,
        document.body
    );
};

export default ReservationFormModal;
