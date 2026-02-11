import React, { useState } from 'react';
import { Plus, Trash2, User, Calendar, Activity, Stethoscope } from 'lucide-react';
import ImageUpload from '../../components/UI/ImageUpload';
import CustomSelect from '../../components/UI/CustomSelect';
import { useMockData } from '../../context/MockDataContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const RecordForm = () => {
    const { patients, addRecord } = useMockData();
    const { showToast } = useToast();
    const navigate = useNavigate();

    // Form State
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [treatmentType, setTreatmentType] = useState('');
    const [specialist, setSpecialist] = useState('Dr. Sarah Smith');
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [beforeImage, setBeforeImage] = useState(null);
    const [afterImage, setAfterImage] = useState(null);
    const [prescriptions, setPrescriptions] = useState([{ id: 1, name: '', dosage: '' }]);

    const addPrescription = () => {
        setPrescriptions([...prescriptions, { id: Date.now(), name: '', dosage: '' }]);
    };

    const removePrescription = (id) => {
        setPrescriptions(prescriptions.filter(p => p.id !== id));
    };

    const handlePrescriptionChange = (id, field, value) => {
        setPrescriptions(prescriptions.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedPatientId) {
            alert('Please select a patient.');
            return;
        }

        const newRecord = {
            id: Date.now(),
            date: date,
            treatment: treatmentType || 'General Consultation',
            specialist: specialist,
            notes: notes,
            beforeImage: beforeImage ? URL.createObjectURL(beforeImage) : null,
            afterImage: afterImage ? URL.createObjectURL(afterImage) : null,
            diagnosis: diagnosis,
            prescriptions: prescriptions
        };

        addRecord(selectedPatientId, newRecord);
        showToast('Berhasil menambahkan rekam medis', 'success');
        navigate(`/medical-records/${selectedPatientId}`);
    };

    // Prepare options for CustomSelect
    const patientOptions = patients.map(p => ({ value: p.id, label: `${p.name} (ID: ${p.id})` }));
    const treatmentOptions = [
        { value: 'Acne Treatment', label: 'Acne Treatment' },
        { value: 'Laser Therapy', label: 'Laser Therapy' },
        { value: 'Chemical Peel', label: 'Chemical Peel' },
        { value: 'Microdermabrasion', label: 'Microdermabrasion' },
        { value: 'Botox / Fillers', label: 'Botox / Fillers' }
    ];

    return (
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/10 shadow-2xl shadow-primary/5 animate-fade-in overflow-hidden pb-12 w-full">
            <div className="p-6 md:p-12 border-b border-primary/5 bg-primary/5 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Rekam Medis Baru</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm tracking-tight">Masukkan detail konsultasi dan perawatan pasien</p>
                </div>
            </div>

            <form className="p-6 md:p-12 space-y-10 md:space-y-16" onSubmit={handleSubmit}>

                {/* Patient & Date Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] ml-1">Nama Pasien</label>
                        <CustomSelect
                            options={patientOptions}
                            value={selectedPatientId}
                            onChange={(val) => setSelectedPatientId(val)}
                            placeholder="Pilih Pasien..."
                            searchable={true}
                            required
                            icon={User}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] ml-1">Tanggal Kunjungan</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 transition-colors group-focus-within:text-primary text-primary/30">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-primary cursor-pointer"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Treatment Details */}
                <div className="space-y-8 md:space-y-10 bg-secondary/10 p-6 md:p-10 rounded-[2rem] border border-primary/5">
                    <h3 className="text-xl md:text-2xl font-black text-primary tracking-tighter flex items-center gap-3">
                        <Activity className="w-6 h-6 text-primary/20" /> Detail Perawatan
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] ml-1">Tipe Perawatan</label>
                            <CustomSelect
                                options={treatmentOptions}
                                value={treatmentType}
                                onChange={(val) => setTreatmentType(val)}
                                placeholder="Pilih Perawatan..."
                                icon={Activity}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] ml-1">Dokter / Spesialis</label>
                            <div className="relative group">
                                <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={specialist}
                                    onChange={(e) => setSpecialist(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] ml-1">Diagnosa / Observasi</label>
                        <textarea
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            className="w-full p-6 sm:p-8 rounded-[1.5rem] bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all h-36 resize-none text-sm md:text-base font-medium text-primary placeholder:text-primary/20"
                            placeholder="Masukkan hasil observasi detail..."
                        ></textarea>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] ml-1">Catatan Tindakan</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-6 sm:p-8 rounded-[1.5rem] bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all h-36 resize-none text-sm md:text-base font-medium text-primary placeholder:text-primary/20"
                            placeholder="Prosedur yang dilakukan, feedback pasien, dll..."
                        ></textarea>
                    </div>
                </div>

                {/* Before & After Photos */}
                <div className="space-y-8 md:space-y-10">
                    <h3 className="text-xl md:text-2xl font-black text-primary tracking-tighter">Foto Hasil Perawatan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        <ImageUpload label="Sebelum Perawatan" onImageChange={setBeforeImage} />
                        <ImageUpload label="Sesudah Perawatan" onImageChange={setAfterImage} />
                    </div>
                </div>

                {/* Prescriptions */}
                <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-primary/5 pb-6 gap-4">
                        <h3 className="text-xl md:text-2xl font-black text-primary tracking-tighter">Resep / Produk</h3>
                        <button type="button" onClick={addPrescription} className="w-full sm:w-auto text-[10px] font-black text-primary uppercase tracking-widest flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary hover:text-secondary px-6 py-3 rounded-2xl transition-all duration-500 border border-primary/5">
                            <Plus className="w-5 h-5" /> Tambah Item
                        </button>
                    </div>

                    <div className="space-y-8 sm:space-y-6">
                        {prescriptions.map((item, index) => (
                            <div key={item.id} className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center animate-fade-in group relative bg-secondary/10 sm:bg-transparent p-6 sm:p-0 rounded-3xl sm:rounded-none border border-primary/5 sm:border-transparent">
                                <span className="hidden sm:block text-[10px] font-black text-primary/20 sm:w-8">{index + 1}.</span>
                                <div className="flex-1 space-y-4 sm:space-y-0 sm:flex sm:gap-6">
                                    <div className="flex-1 space-y-2">
                                        <label className="sm:hidden text-[9px] font-black text-primary/30 uppercase tracking-widest ml-1">Nama Produk</label>
                                        <input
                                            type="text"
                                            placeholder="Nama Produk"
                                            value={item.name}
                                            onChange={(e) => handlePrescriptionChange(item.id, 'name', e.target.value)}
                                            className="w-full px-6 py-4 rounded-2xl bg-white sm:bg-primary/5 border border-primary/5 outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-primary"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <label className="sm:hidden text-[9px] font-black text-primary/30 uppercase tracking-widest ml-1">Dosis / Instruksi</label>
                                        <input
                                            type="text"
                                            placeholder="Dosis / Instruksi"
                                            value={item.dosage}
                                            onChange={(e) => handlePrescriptionChange(item.id, 'dosage', e.target.value)}
                                            className="w-full px-6 py-4 rounded-2xl bg-white sm:bg-primary/5 border border-primary/5 outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-primary"
                                        />
                                    </div>
                                </div>
                                <button type="button" onClick={() => removePrescription(item.id)} className="absolute top-4 right-4 sm:static p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-90 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4 sm:gap-6 pt-10 border-t border-primary/5">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary/40 hover:bg-primary/5 transition-all duration-300 active:scale-95 text-center order-2 sm:order-1"
                    >
                        Batal
                    </button>
                    <button type="submit" className="bg-primary text-secondary px-10 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 order-1 sm:order-2">
                        Simpan Rekam Medis
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RecordForm;
