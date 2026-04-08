import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Activity, Stethoscope, FileText, Package, FlaskConical, Pill, User } from 'lucide-react';
import CustomSelect from './CustomSelect';
import CustomMultiSelect from './CustomMultiSelect';
import CustomDatePicker from './CustomDatePicker';
import ImageUpload from './ImageUpload';
import { useMockData } from '../../context/MockDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const MedicalRecordFormModal = ({ isOpen, onClose, patientId = null, patientName = null }) => {
    const { patients, products, racikans, treatments, staff, addRecord } = useMockData();
    const { user } = useAuth();
    const { showToast } = useToast();

    // Form State
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [selectedTreatments, setSelectedTreatments] = useState([]);
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedRacikans, setSelectedRacikans] = useState([]);
    const [beforeImage, setBeforeImage] = useState(null);
    const [afterImage, setAfterImage] = useState(null);
    const [errors, setErrors] = useState({});

    // Options mapping
    const doctorOptions = staff
        .filter(s => s.divisi === 'Dokter')
        .map(s => ({ value: s.id, label: s.name }));
    
    const patientOptions = patients.map(p => ({ value: p.id, label: `${p.name} (${p.id})` }));
    const treatmentOptions = treatments.map(t => ({ value: t.id, label: t.name }));
    const productOptions = products.map(p => ({ value: p.id, label: `${p.name} (${p.category})` }));
    const racikanOptions = racikans.map(r => ({ value: r.id, label: r.name }));

    // Reset and auto-fill logic
    useEffect(() => {
        if (isOpen) {
            setSelectedPatientId(patientId || '');
            setDate(new Date().toISOString().split('T')[0]);
            
            // Auto-fill doctor if current user is a doctor
            if (user?.role === 'Dokter') {
                const doc = staff.find(s => s.name === user.name || s.username === user.username);
                setSelectedDoctorId(doc?.id || '');
            } else {
                setSelectedDoctorId('');
            }

            setSelectedTreatments([]);
            setDiagnosis('');
            setNotes('');
            setSelectedProducts([]);
            setSelectedRacikans([]);
            setBeforeImage(null);
            setAfterImage(null);
            setErrors({});
        }
    }, [isOpen, patientId, user, staff]);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors = {};
        if (!patientId && !selectedPatientId) newErrors.patient = 'Pilih pasien terlebih dahulu';
        if (!selectedDoctorId) newErrors.doctor = 'Pilih dokter terlebih dahulu';
        if (selectedTreatments.length === 0) newErrors.treatments = 'Pilih minimal satu tipe perawatan';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const doctor = staff.find(s => s.id === selectedDoctorId);
        const treatmentLabels = selectedTreatments
            .map(id => treatments.find(t => t.id === id)?.name)
            .filter(Boolean);

        const prescriptions = [
            ...selectedProducts.map(id => {
                const p = products.find(x => x.id === id);
                return p ? { name: p.name, dosage: 'Sesuai anjuran' } : null;
            }).filter(Boolean),
            ...selectedRacikans.map(id => {
                const r = racikans.find(x => x.id === id);
                return r ? { name: r.name, dosage: 'Racikan — sesuai anjuran' } : null;
            }).filter(Boolean),
        ];

        const newRecord = {
            id: Date.now(),
            date,
            treatment: treatmentLabels.join(', '),
            specialist: doctor?.name || 'Unknown',
            diagnosis,
            notes,
            prescriptions,
            beforeImage: beforeImage ? URL.createObjectURL(beforeImage) : null,
            afterImage: afterImage ? URL.createObjectURL(afterImage) : null,
        };

        addRecord(patientId || selectedPatientId, newRecord);
        showToast('Rekam medis berhasil ditambahkan!', 'success');
        onClose();
    };

    const labelClass = "text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1 block mb-2";

    return createPortal(
        <div 
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/30"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
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
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                                Tambah Rekam Medis
                            </h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-1.5">
                                {patientName || 'Formulir Catatan Medis Baru'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-6 md:p-8 max-h-[72vh] overflow-y-auto scrollbar-hide">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Patient Selector (if no patientId) */}
                        {!patientId && (
                            <div>
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

                        {/* Tanggal & Dokter */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                        {/* Tipe Perawatan */}
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

                        {/* Diagnosis & Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Diagnosa / Observasi</label>
                                <textarea
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                    placeholder="Hasil observasi detail..."
                                    className="w-full p-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all h-28 resize-none text-sm font-medium text-primary placeholder:text-primary/20 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Catatan Tindakan</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Prosedur, feedback pasien, dll..."
                                    className="w-full p-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all h-28 resize-none text-sm font-medium text-primary placeholder:text-primary/20 shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Resep / Produk */}
                        <div className="bg-secondary/30 rounded-2xl p-5 space-y-4 border border-primary/5">
                            <div className="flex items-center gap-2 mb-1">
                                <Pill className="w-4 h-4 text-primary/40" />
                                <span className="text-xs font-black text-primary uppercase tracking-widest">Resep / Produk</span>
                            </div>
                            
                            <CustomMultiSelect
                                label="Produk (Obat / Skincare)"
                                placeholder="Cari & pilih produk..."
                                values={selectedProducts}
                                onChange={setSelectedProducts}
                                options={productOptions}
                                searchable={true}
                                icon={Package}
                            />

                            <CustomMultiSelect
                                label="Racikan"
                                placeholder="Cari & pilih racikan..."
                                values={selectedRacikans}
                                onChange={setSelectedRacikans}
                                options={racikanOptions}
                                searchable={true}
                                icon={FlaskConical}
                            />
                        </div>

                        {/* Foto */}
                        <div>
                            <label className={labelClass}>Foto Perawatan (Opsional)</label>
                            <div className="grid grid-cols-2 gap-4">
                                <ImageUpload label="Sebelum Perawatan" onImageChange={setBeforeImage} />
                                <ImageUpload label="Sesudah Perawatan" onImageChange={setAfterImage} />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary/50 border border-primary/10 bg-white hover:bg-primary/5 transition-all duration-300 active:scale-95"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="flex-1 flex items-center justify-center gap-2 bg-primary text-secondary py-3.5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Simpan Rekam Medis
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default MedicalRecordFormModal;
