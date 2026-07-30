import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon as X, CheckCircleIcon as CheckCircle2, CheckIcon as Check, ChartBarIcon as Activity, SparklesIcon as Stethoscope, DocumentTextIcon as FileText, CubeIcon as Package, BeakerIcon as FlaskConical, SparklesIcon as Pill, UserIcon as User, ArrowRightIcon as ArrowRight, ArrowLeftIcon as ArrowLeft, HeartIcon as Heart, ClockIcon as History, ClipboardDocumentCheckIcon as ListChecks } from '@heroicons/react/24/outline';
import CustomSelect from './CustomSelect';
import CustomMultiSelect from './CustomMultiSelect';
import CustomDatePicker from './CustomDatePicker';
import ImageUpload from './ImageUpload';
import ConfirmModal from './ConfirmModal';

import { useMockData } from '../../context/MockDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { pasienAPI, karyawanAPI, rekamMedisAPI, treatmentAPI, stokProdukAPI, STORAGE_URL, paketTreatmentAPI } from '../../services/api';

const mapPatientFromAPI = (p) => ({
    id: p.id,
    name: p.Nama_pasien || p.nama_pasien || p.namaLengkap,
});

const mapStaffFromAPI = (k) => ({
    id: k.id,
    name: k.nama_lengkap || k.NamaLengkap_karyawan || k.nama || 'Tanpa Nama',
    divisi: k.divisi || k.Divisi || k.Jabatan || k.jabatan || k.posisi || '',
});

const mapTreatmentFromAPI = (t) => ({
    id: t.id,
    name: t.Nama_treatment || t.nama_treatment || t.name,
});

const mapProductFromAPI = (p) => ({
    id: p.id,
    name: p.Nama_produk || p.name,
    category: p.Kategori || p.category || 'Obat',
});

const getImageUrl = (url) => {
    if (!url) return null;
    let finalUrl = url.startsWith('http') || url.startsWith('/') ? url : `${STORAGE_URL}/${url}`;
    const separator = finalUrl.includes('?') ? '&' : '?';
    if (!finalUrl.includes('ngrok-skip-browser-warning')) {
        finalUrl += `${separator}ngrok-skip-browser-warning=1`;
    }
    return finalUrl;
};

const MedicalRecordFormModal = ({ isOpen, onClose, patientId = null, patientName = null, mode = 'add', initialData = null, onSuccess }) => {
    const { patients, products, racikans, treatments, staff } = useMockData();
    const { user } = useAuth();
    const { showToast } = useToast();

    // Form State
    const [step, setStep] = useState(1);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    
    // Assessment Step 1 fields
    const [perawatanSebelumnya, setPerawatanSebelumnya] = useState('');
    const [diinginkan, setDiinginkan] = useState([]);
    const [diinginkanLainnya, setDiinginkanLainnya] = useState('');
    const [tensi, setTensi] = useState('');
    const [keluhanPasien, setKeluhanPasien] = useState('');
    const [riwayatKesehatan, setRiwayatKesehatan] = useState('');

    // Procedure Step 2 fields
    const [selectedTreatments, setSelectedTreatments] = useState([]);
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [racikanText, setRacikanText] = useState('');
    const [beforeImage, setBeforeImage] = useState(null);
    const [afterImage, setAfterImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [confirmConfig, setConfirmConfig] = useState(null);
    const formRef = useRef(null);

    const [apiPatients, setApiPatients] = useState([]);
    const [apiStaff, setApiStaff] = useState([]);
    const [apiTreatments, setApiTreatments] = useState([]);
    const [apiProducts, setApiProducts] = useState([]);
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasFetchedData, setHasFetchedData] = useState(false);


    // Options mapping
    const activeStaff = hasFetchedData ? apiStaff : staff;
    const doctorOptions = activeStaff
        .filter(s => {
            const div = (s.divisi || '').toLowerCase();
            return div.includes('dokter') || div.includes('dr.');
        })
        .map(s => ({ value: s.id, label: s.name }));
    
    const activePatients = hasFetchedData ? apiPatients : patients;
    const patientOptions = activePatients.map(p => ({ value: p.id, label: p.name }));
    const activeTreatments = hasFetchedData ? apiTreatments : treatments;
    const treatmentOptions = activeTreatments.map(t => ({ value: t.id, label: t.name }));
    const activeProducts = hasFetchedData ? apiProducts : products;
    const productOptions = activeProducts.map(p => ({ value: p.id, label: `${p.name} (${p.category})` }));
    const racikanOptions = racikans.map(r => ({ value: r.id, label: r.name }));

    // Reset and auto-fill logic
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setErrors({});
            
            if (mode === 'edit' && initialData) {
                setSelectedPatientId(initialData.data_pasien_id || initialData.pasien_id || patientId || '');
                setDate(initialData.tanggal_kunjungan || initialData.tanggal || new Date().toISOString().split('T')[0]);
                setSelectedDoctorId(initialData.dokter_id || initialData.karyawan_id || '');
                
                setPerawatanSebelumnya(initialData.perawatan_diklinik_sebelumnya || initialData.perawatan_sebelumnya || '');
                setTensi(initialData.tekanan_darah || initialData.tensi || '');
                setKeluhanPasien(initialData.keluhan_pasien || '');
                
                const rawRiwayat = initialData.riwayat_penyakit || initialData.riwayat_kesehatan || '';
                if (Array.isArray(rawRiwayat)) {
                    setRiwayatKesehatan(rawRiwayat.join(', '));
                } else if (typeof rawRiwayat === 'string') {
                    if (rawRiwayat.startsWith('[')) {
                        try {
                            const parsed = JSON.parse(rawRiwayat);
                            setRiwayatKesehatan(Array.isArray(parsed) ? parsed.join(', ') : rawRiwayat);
                        } catch (e) {
                            setRiwayatKesehatan(rawRiwayat);
                        }
                    } else {
                        setRiwayatKesehatan(rawRiwayat);
                    }
                } else {
                    setRiwayatKesehatan(rawRiwayat || '');
                }

                setPerawatanSebelumnya(initialData.perawatan_diklinik_sebelumnya || initialData.perawatan_sebelumnya || '');
                
                const rawDiinginkan = initialData.perawatan_diinginkan || '';
                const predefinedDiinginkan = ['Laser / IPL', 'Dermaroller', 'PRP', 'Botox'];
                
                let parsedDiinginkan = [];
                if (typeof rawDiinginkan === 'string') {
                    parsedDiinginkan = rawDiinginkan.split(',').map(i => i.trim()).filter(Boolean);
                }

                const knownDiinginkan = parsedDiinginkan.filter(i => predefinedDiinginkan.includes(i));
                const unknownDiinginkan = parsedDiinginkan.filter(i => !predefinedDiinginkan.includes(i));

                if (unknownDiinginkan.length > 0) {
                    setDiinginkan([...knownDiinginkan, 'Lainnya']);
                    setDiinginkanLainnya(unknownDiinginkan.join(', '));
                } else {
                    setDiinginkan(knownDiinginkan);
                    setDiinginkanLainnya('');
                }
                
                const treatmentsArr = Array.isArray(initialData.treatments) ? initialData.treatments.map(t => t.id || t) : [];
                const paketTreatmentsArr = Array.isArray(initialData.paketTreatments) ? initialData.paketTreatments.map(t => `paket_${t.id || t}`) : [];
                setSelectedTreatments([...treatmentsArr, ...paketTreatmentsArr]);
                
                setDiagnosis(initialData.diagnosa || '');
                setNotes(initialData.catatan_tindakan || initialData.catatan || '');
                
                const produksArr = Array.isArray(initialData.reseps) ? initialData.reseps.map(p => p.id || p) : 
                                 (Array.isArray(initialData.produks) ? initialData.produks.map(p => p.id || p) : []);
                setSelectedProducts(produksArr);
                setRacikanText(initialData.racikan || '');
                
                setBeforeImage(null);
                setAfterImage(null);
            } else {
                setSelectedPatientId(patientId || '');
                setDate(new Date().toISOString().split('T')[0]);
                
                if (user?.role === 'Dokter') {
                    const doc = staff.find(s => s.name === user?.name || s.username === user?.username);
                    setSelectedDoctorId(doc?.id || '');
                } else {
                    setSelectedDoctorId('');
                }

                setPerawatanSebelumnya('');
                setDiinginkan([]);
                setDiinginkanLainnya('');
                setTensi('');
                setKeluhanPasien('');
                setRiwayatKesehatan('');

                setSelectedTreatments([]);
                setDiagnosis('');
                setNotes('');
                setSelectedProducts([]);
                setRacikanText('');
                setBeforeImage(null);
                setAfterImage(null);
            }

            // Fetch Data if user has token
            if (user?.token) {
                const fetchData = async () => {
                    setIsFetchingData(true);
                    setHasFetchedData(false);
                    try {
                        // Parallel fetch for speed
                        const [patientResult, staffResult, treatmentResult, productResult, paketResult] = await Promise.all([
                            pasienAPI.getAll(user.token, 1),
                            karyawanAPI.getAll(user.token, 1, 'per_page=100'),
                            treatmentAPI.getAll(user.token),
                            stokProdukAPI.getAll(user.token),
                            paketTreatmentAPI.getAll(user.token)
                        ]);

                        if (patientResult.success && patientResult.data) {
                            const responseData = patientResult.data.data || patientResult.data;
                            const patientArray = Array.isArray(responseData) ? responseData : (responseData.data || []);
                            setApiPatients(patientArray.map(mapPatientFromAPI));
                        }

                        if (staffResult.success && staffResult.data) {
                            const responseData = staffResult.data.data || staffResult.data;
                            const staffArray = Array.isArray(responseData) ? responseData : (responseData.data || []);
                            setApiStaff(staffArray.map(mapStaffFromAPI));
                        }

                        let treatmentsList = [];
                        if (treatmentResult.success && treatmentResult.data) {
                            const responseData = treatmentResult.data.data || treatmentResult.data;
                            const treatmentArray = Array.isArray(responseData) ? responseData : (responseData.data || []);
                            treatmentsList = [...treatmentsList, ...treatmentArray.map(mapTreatmentFromAPI)];
                        }

                        if (paketResult && paketResult.success && paketResult.data) {
                            const responseData = paketResult.data.data || paketResult.data;
                            const paketArray = Array.isArray(responseData) ? responseData : (responseData.data || []);
                            const mappedPaket = paketArray.map(p => ({
                                id: `paket_${p.id}`,
                                name: `${p.Nama_paket || p.nama_paket || p.name} (Paket)`
                            }));
                            treatmentsList = [...treatmentsList, ...mappedPaket];
                        }
                        
                        setApiTreatments(treatmentsList);

                        if (productResult.success && productResult.data) {
                            const responseData = productResult.data.data || productResult.data;
                            const productArray = Array.isArray(responseData) ? responseData : (responseData.data || []);
                            setApiProducts(productArray.map(mapProductFromAPI));
                        }
                    } catch (error) {
                        console.error('Error fetching data for MR:', error);
                    } finally {
                        setIsFetchingData(false);
                        setHasFetchedData(true);
                    }
                };
                fetchData();
            }

        }
    }, [isOpen, patientId, user, staff, mode, initialData]);

    if (!isOpen) return null;

    const validateStep1 = () => {
        const newErrors = {};
        if (!patientId && !selectedPatientId) newErrors.patient = 'Pilih pasien terlebih dahulu';
        if (!selectedDoctorId) newErrors.doctor = 'Pilih dokter terlebih dahulu';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            setTimeout(() => {
                const firstErrorEl = formRef.current?.querySelector('.text-red-500');
                if (firstErrorEl) {
                    firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 50);
        }
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (selectedTreatments.length === 0) newErrors.treatments = 'Pilih minimal satu tipe perawatan';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            setTimeout(() => {
                const firstErrorEl = formRef.current?.querySelector('.text-red-500');
                if (firstErrorEl) {
                    firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 50);
        }
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2);
            setTimeout(() => {
                if (formRef.current && formRef.current.parentElement) {
                    formRef.current.parentElement.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 50);
        }
    };

    const handleBack = () => {
        setStep(1);
        setTimeout(() => {
            if (formRef.current && formRef.current.parentElement) {
                formRef.current.parentElement.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 50);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateStep2()) return;

        setConfirmConfig({
            icon: 'save',
            header: mode === 'edit' ? 'Update Rekam Medis' : 'Simpan Rekam Medis',
            message: mode === 'edit' 
                ? `Update data rekam medis untuk pasien ini?` 
                : `Simpan data rekam medis untuk ${patientName || 'pasien'}?`,
            acceptLabel: 'Ya, Simpan',
            onAccept: async () => {
                setIsSubmitting(true);
                
                try {
                    const formData = new FormData();
                    formData.append('data_pasien_id', patientId || selectedPatientId || '');
                    formData.append('dokter_id', selectedDoctorId || '');
                    formData.append('tanggal_kunjungan', date || '');
                    formData.append('tekanan_darah', tensi || '-');
                    
                    formData.append('riwayat_penyakit', riwayatKesehatan || '');
                    
                    formData.append('keluhan_pasien', keluhanPasien || '-');
                    
                    formData.append('perawatan_diklinik_sebelumnya', perawatanSebelumnya || '');

                    const combinedDiinginkan = diinginkan.includes('Lainnya')
                        ? [...diinginkan.filter(i => i !== 'Lainnya'), diinginkanLainnya].filter(Boolean).join(', ')
                        : diinginkan.join(', ');
                    formData.append('perawatan_diinginkan', combinedDiinginkan || '');
                    formData.append('diagnosa', diagnosis || '');
                    formData.append('catatan_tindakan', notes || '');

                    if (racikanText) {
                        formData.append('racikan', racikanText);
                    }

                    const normalTreatments = selectedTreatments.filter(id => !String(id).startsWith('paket_'));
                    const paketTreatments = selectedTreatments.filter(id => String(id).startsWith('paket_')).map(id => String(id).replace('paket_', ''));

                    normalTreatments.forEach((id, idx) => {
                        formData.append(`treatments[${idx}]`, id);
                    });
                    
                    paketTreatments.forEach((id, idx) => {
                        formData.append(`paket_treatments[${idx}]`, id);
                    });

                    selectedProducts.forEach((id, idx) => {
                        formData.append(`reseps[${idx}][stok_produk_id]`, id);
                        formData.append(`reseps[${idx}][jumlah]`, 1); // Default to 1
                    });

                    if (beforeImage) formData.append('gambar_sebelum', beforeImage);
                    if (afterImage) formData.append('gambar_sesudah', afterImage);

                    let result;
                    if (mode === 'edit' && initialData?.id) {
                        result = await rekamMedisAPI.update(user.token, initialData.id, formData);
                    } else {
                        result = await rekamMedisAPI.create(user.token, formData);
                    }

                    if (result.success) {
                        showToast(`Rekam medis berhasil di${mode === 'edit' ? 'update' : 'tambahkan'}!`, 'success');
                        if (onSuccess) onSuccess(result.data);
                        onClose();
                    } else {
                        showToast(result.message || 'Terjadi kesalahan.', 'error');
                    }
                } catch (error) {
                    showToast('Gagal terhubung ke server.', 'error');
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
    };


    const toggleItem = (list, setList, item) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const labelClass = "text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1 block mb-2";

    const handleRequestClose = () => {
        setConfirmConfig({
            icon: 'warning',
            header: 'Tutup Form?',
            message: 'Apakah Anda yakin ingin menutup form ini? Data yang belum disimpan akan hilang.',
            acceptLabel: 'Ya, Tutup',
            rejectLabel: 'Tidak',
            onAccept: onClose
        });
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/30"
            onClick={handleRequestClose}
        >
            <div 
                className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={handleRequestClose}
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
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                                Rekam Medis
                            </h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                Langkah {step} dari 2 • {step === 1 ? 'Asesmen & Riwayat' : 'Diagnosis & Tindakan'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    {/* Progress Bar */}
                    <div className="px-8 pt-8 pb-2 flex gap-2 shrink-0">
                        <div className="h-1.5 flex-1 rounded-full bg-primary/10 overflow-hidden">
                            <div className={`h-full bg-primary transition-all duration-500 ${step >= 1 ? 'w-full' : 'w-0'}`} />
                        </div>
                        <div className="h-1.5 flex-1 rounded-full bg-primary/10 overflow-hidden">
                            <div className={`h-full bg-primary transition-all duration-500 ${step >= 2 ? 'w-full' : 'w-0'}`} />
                        </div>
                    </div>

                    <div className="p-8 overflow-y-auto scrollbar-hide flex-1">
                        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8 min-h-full flex flex-col">
                            
                            {step === 1 && (
                                <div className="space-y-8 animate-fade-in flex flex-col flex-1">
                                    {/* Patient Info */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 border-b border-primary/5 pb-2">
                                            <User className="w-4 h-4 text-primary/30" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Informasi Kunjungan</h4>
                                        </div>

                                        {!patientId && (
                                            <div className="relative group">
                                                <CustomSelect
                                                    label="Nama Pasien"
                                                    options={patientOptions}
                                                    value={selectedPatientId}
                                                    onChange={setSelectedPatientId}
                                                    placeholder="Pilih pasien..."
                                                    searchable={true}
                                                    icon={User}
                                                />
                                                {errors.patient && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.patient}</p>}
                                            </div>
                                        )}
                                    
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <CustomDatePicker
                                                label="Tanggal Kunjungan"
                                                value={date}
                                                onChange={setDate}
                                                required
                                            />
                                            <div>
                                                <CustomSelect
                                                    label="Dokter / Spesialis"
                                                    options={doctorOptions}
                                                    value={selectedDoctorId}
                                                    onChange={setSelectedDoctorId}
                                                    placeholder="Pilih dokter..."
                                                    searchable={true}
                                                    icon={Stethoscope}
                                                />
                                                {errors.doctor && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.doctor}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Riwayat Kesehatan Image 3 */}
                                    <div className="space-y-6 pt-2">
                                        <div className="flex items-center gap-3 border-b border-primary/5 pb-2">
                                            <Heart className="w-4 h-4 text-primary/30" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Riwayat Kesehatan & Kontra Indikasi</h4>
                                        </div>

                                        {/* Blood Pressure */}
                                        <div>
                                            <label className={labelClass}>Tekanan Darah</label>
                                            <input
                                                type="text"
                                                value={tensi}
                                                onChange={(e) => setTensi(e.target.value)}
                                                placeholder="Masukan tekanan darah..."
                                                className="w-full px-5 py-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium text-primary shadow-sm placeholder:text-primary/20"
                                            />
                                        </div>

                                        {/* Riwayat Penyakit Input */}
                                        <div>
                                            <label className={labelClass}>Riwayat Penyakit</label>
                                            <input
                                                type="text"
                                                value={riwayatKesehatan}
                                                onChange={(e) => setRiwayatKesehatan(e.target.value)}
                                                placeholder="Contoh: Keloid, Asma, Diabetes, Alergi Parasetamol, dsb..."
                                                className="w-full px-5 py-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium text-primary shadow-sm placeholder:text-primary/20"
                                            />
                                        </div>

                                        {/* Keluhan Pasien */}
                                        <div>
                                            <label className={labelClass}>Keluhan Pasien</label>
                                            <textarea
                                                value={keluhanPasien}
                                                onChange={(e) => setKeluhanPasien(e.target.value)}
                                                placeholder="Tuliskan keluhan pasien..."
                                                className="w-full p-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all h-24 resize-none text-sm font-medium text-primary shadow-sm placeholder:text-primary/20"
                                            />
                                        </div>
                                    </div>

                                    {/* Perawatan Image 1 & 2 */}
                                    <div className="space-y-6 pt-2">
                                        <div className="flex items-center gap-3 border-b border-primary/5 pb-2">
                                            <History className="w-4 h-4 text-primary/30" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Riwayat & Tujuan Perawatan</h4>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Perawatan di Klinik Sebelumnya?</label>
                                            <input
                                                type="text"
                                                value={perawatanSebelumnya}
                                                onChange={(e) => setPerawatanSebelumnya(e.target.value)}
                                                placeholder="Contoh: Belum pernah / New Customer..."
                                                className="w-full px-5 py-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium text-primary shadow-sm placeholder:text-primary/20"
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}>Perawatan yang Diinginkan</label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
                                                {['Laser / IPL', 'Dermaroller', 'PRP', 'Botox', 'Lainnya'].map((item) => (
                                                    <button
                                                        key={item}
                                                        type="button"
                                                        onClick={() => toggleItem(diinginkan, setDiinginkan, item)}
                                                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${diinginkan.includes(item) ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-primary/5 bg-white hover:border-primary/20'}`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${diinginkan.includes(item) ? 'bg-primary border-primary' : 'border-primary/10'}`}>
                                                            {diinginkan.includes(item) && <CheckCircle2 className="w-3 h-3 text-secondary" />}
                                                        </div>
                                                        <span className={`text-[10px] font-black uppercase tracking-tighter ${diinginkan.includes(item) ? 'text-primary' : 'text-primary/40'}`}>
                                                            {item}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                            {diinginkan.includes('Lainnya') && (
                                                <input
                                                    type="text"
                                                    value={diinginkanLainnya}
                                                    onChange={(e) => setDiinginkanLainnya(e.target.value)}
                                                    placeholder="Sebutkan perawatan lainnya..."
                                                    className="w-full px-5 py-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-primary shadow-sm placeholder:text-primary/20 mt-4 animate-fade-in"
                                                />
                                            )}
                                        </div>

                                        {/* Step 1 Actions */}
                                        <div className="pt-6 mt-auto">
                                            <button
                                                type="button"
                                                onClick={handleNext}
                                                className="w-full flex items-center justify-center gap-3 bg-primary text-secondary py-4 rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                                            >
                                                Lanjut ke Diagnosis
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                                {step === 2 && (
                                    <div className="space-y-8 animate-fade-in flex flex-col flex-1">
                                        {/* Tipe Perawatan */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-b border-primary/5 pb-2">
                                                <ListChecks className="w-4 h-4 text-primary/30" />
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Tindakan Medis</h4>
                                            </div>

                                            <div>
                                                <CustomMultiSelect
                                                    label="Tipe Perawatan"
                                                    placeholder="Cari & pilih perawatan..."
                                                    values={selectedTreatments}
                                                    onChange={setSelectedTreatments}
                                                    options={treatmentOptions}
                                                    searchable={true}
                                                    icon={Activity}
                                                />
                                                {errors.treatments && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.treatments}</p>}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className={labelClass}>Diagnosa / Observasi</label>
                                                    <textarea
                                                        value={diagnosis}
                                                        onChange={(e) => setDiagnosis(e.target.value)}
                                                        placeholder="Hasil observasi detail..."
                                                        className="w-full p-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all h-32 resize-none text-sm font-medium text-primary placeholder:text-primary/20 shadow-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Catatan Tindakan</label>
                                                    <textarea
                                                        value={notes}
                                                        onChange={(e) => setNotes(e.target.value)}
                                                        placeholder="Prosedur, feedback pasien, dll..."
                                                        className="w-full p-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all h-32 resize-none text-sm font-medium text-primary placeholder:text-primary/20 shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Resep / Stok */}
                                        <div className="bg-secondary/30 rounded-card p-6 space-y-6 border border-primary/5">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Pill className="w-4 h-4 text-primary/40" />
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Resep / Stok Mandiri</span>
                                            </div>
                                            
                                            <CustomMultiSelect
                                                label="Stok (Obat / Skincare)"
                                                placeholder="Cari & pilih stok..."
                                                values={selectedProducts}
                                                onChange={setSelectedProducts}
                                                options={productOptions}
                                                searchable={true}
                                                icon={Package}
                                            />

                                            <div>
                                                <label className={labelClass}>Racikan</label>
                                                <textarea
                                                    value={racikanText}
                                                    onChange={(e) => setRacikanText(e.target.value)}
                                                    placeholder="Tulis detail racikan obat jika ada..."
                                                    className="w-full p-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all h-24 resize-none text-sm font-medium text-primary shadow-sm placeholder:text-primary/20"
                                                />
                                            </div>
                                        </div>

                                        {/* Foto */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-b border-primary/5 pb-2">
                                                <Activity className="w-4 h-4 text-primary/30" />
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Dokumentasi Foto</h4>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <ImageUpload 
                                                    label="Sebelum" 
                                                    onImageChange={setBeforeImage} 
                                                    initialPreview={getImageUrl(initialData?.gambar_sebelum_url || initialData?.gambar_sebelum)}
                                                />
                                                <ImageUpload 
                                                    label="Sesudah" 
                                                    onImageChange={setAfterImage} 
                                                    initialPreview={getImageUrl(initialData?.gambar_sesudah_url || initialData?.gambar_sesudah)}
                                                />
                                            </div>
                                        </div>

                                        {/* Step 2 Actions */}
                                        <div className="flex gap-4 pt-8 mt-auto">
                                            <button
                                                type="button"
                                                onClick={handleBack}
                                                className="flex-1 flex items-center justify-center gap-2 bg-secondary text-primary py-4 rounded-2xl hover:bg-white active:scale-[0.98] transition-all duration-300 font-black text-xs uppercase tracking-widest border border-primary/5 shadow-sm"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Kembali
                                            </button>
                                            <button
                                                 type="submit"
                                                 disabled={isSubmitting}
                                                 className="flex-[2] flex items-center justify-center gap-0 sm:gap-2 bg-primary text-secondary py-4 rounded-2xl hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all duration-300 font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                             >
                                                 <CheckCircle2 className="hidden sm:block w-4 h-4" />
                                                 {isSubmitting ? 'Menyimpan...' : (mode === 'edit' ? 'Update Rekam Medis' : 'Simpan Rekam Medis')}
                                             </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
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


export default MedicalRecordFormModal;
