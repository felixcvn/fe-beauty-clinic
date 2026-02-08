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
        <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 animate-fade-in overflow-hidden pb-12">
            <div className="p-10 border-b border-primary/5 bg-primary/5">
                <h2 className="text-3xl font-black text-primary tracking-tighter leading-none">New Treatment Record</h2>
                <p className="text-primary/40 mt-3 font-bold text-sm tracking-tight">Enter detailed consultation and treatment record for the patient</p>
            </div>

            <form className="p-10 space-y-12" onSubmit={handleSubmit}>

                {/* Patient & Date Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">Patient Name</label>
                        <CustomSelect
                            options={patientOptions}
                            value={selectedPatientId}
                            onChange={(val) => setSelectedPatientId(val)}
                            placeholder="Select Patient..."
                            searchable={true}
                            required
                            icon={User}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">Date of Visit</label>
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
                <div className="space-y-8 bg-secondary/20 p-8 rounded-[2rem] border border-primary/5">
                    <h3 className="text-lg font-black text-primary tracking-tight flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary/20" /> Treatment Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">Treatment Type</label>
                            <CustomSelect
                                options={treatmentOptions}
                                value={treatmentType}
                                onChange={(val) => setTreatmentType(val)}
                                placeholder="Select Treatment..."
                                icon={Activity}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">Attending Specialist</label>
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
                        <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">Diagnosis / Observation</label>
                        <textarea
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            className="w-full p-6 rounded-[1.5rem] bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all h-32 resize-none text-sm font-medium text-primary placeholder:text-primary/20"
                            placeholder="Enter detailed observations..."
                        ></textarea>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">Treatment Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-6 rounded-[1.5rem] bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all h-32 resize-none text-sm font-medium text-primary placeholder:text-primary/20"
                            placeholder="Procedures performed, customer feedback, etc..."
                        ></textarea>
                    </div>
                </div>

                {/* Before & After Photos */}
                <div className="space-y-8">
                    <h3 className="text-lg font-black text-primary tracking-tight">Treatment Photos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <ImageUpload label="Before Treatment" onImageChange={setBeforeImage} />
                        <ImageUpload label="After Treatment" onImageChange={setAfterImage} />
                    </div>
                </div>

                {/* Prescriptions */}
                <div className="space-y-8">
                    <div className="flex justify-between items-center border-b border-primary/5 pb-4">
                        <h3 className="text-lg font-black text-primary tracking-tight">Prescriptions / Products</h3>
                        <button type="button" onClick={addPrescription} className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:bg-primary/5 px-4 py-2 rounded-full transition-all">
                            <Plus className="w-4 h-4" /> Add Item
                        </button>
                    </div>

                    <div className="space-y-6">
                        {prescriptions.map((item, index) => (
                            <div key={item.id} className="flex gap-6 items-center animate-fade-in group">
                                <span className="text-[10px] font-black text-primary/20 w-8">{index + 1}.</span>
                                <input
                                    type="text"
                                    placeholder="Product Name"
                                    value={item.name}
                                    onChange={(e) => handlePrescriptionChange(item.id, 'name', e.target.value)}
                                    className="flex-1 px-6 py-4 rounded-2xl bg-primary/5 border border-primary/5 outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-primary"
                                />
                                <input
                                    type="text"
                                    placeholder="Dosage / Instructions"
                                    value={item.dosage}
                                    onChange={(e) => handlePrescriptionChange(item.id, 'dosage', e.target.value)}
                                    className="flex-1 px-6 py-4 rounded-2xl bg-primary/5 border border-primary/5 outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-primary"
                                />
                                <button type="button" onClick={() => removePrescription(item.id)} className="p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-90 opacity-0 group-hover:opacity-100">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-6 pt-10 border-t border-primary/5">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary/40 hover:bg-primary/5 transition-all duration-300 active:scale-95"
                    >
                        Cancel
                    </button>
                    <button type="submit" className="bg-primary text-secondary px-10 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
                        Save Complete Record
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RecordForm;
