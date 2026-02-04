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
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-secondary-dark/20 animate-fade-in">
            <h2 className="text-2xl font-bold text-primary mb-6">New Treatment Record</h2>
            <form className="space-y-8" onSubmit={handleSubmit}>

                {/* Patient & Date Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-primary">Patient Name</label>
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
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-primary">Date of Visit</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                                <Calendar className="w-5 h-5 text-primary-light" />
                            </div>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-10 pr-3 py-3 rounded-xl border border-secondary-dark/20 outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-secondary-light/30 text-primary font-medium cursor-pointer hover:border-primary/30"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Treatment Details */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-primary border-b border-secondary-dark/10 pb-2">Treatment Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-primary">Treatment Type</label>
                            <CustomSelect
                                options={treatmentOptions}
                                value={treatmentType}
                                onChange={(val) => setTreatmentType(val)}
                                placeholder="Select Treatment..."
                                icon={Activity}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-primary">Attending Specialist</label>
                            <div className="relative">
                                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-light" />
                                <input
                                    type="text"
                                    value={specialist}
                                    onChange={(e) => setSpecialist(e.target.value)}
                                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-secondary-dark/20 outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-secondary-light/30"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-primary">Diagnosis / Observation</label>
                        <textarea
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            className="w-full p-3 rounded-xl border border-secondary-dark/20 outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-secondary-light/30 h-24 resize-none"
                            placeholder="Enter detailed observations..."
                        ></textarea>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-primary">Treatment Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-3 rounded-xl border border-secondary-dark/20 outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-secondary-light/30 h-24 resize-none"
                            placeholder="Procedures performed, customer feedback, etc..."
                        ></textarea>
                    </div>
                </div>

                {/* Before & After Photos */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-primary border-b border-secondary-dark/10 pb-2">Treatment Photos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ImageUpload label="Before Treatment" onImageChange={setBeforeImage} />
                        <ImageUpload label="After Treatment" onImageChange={setAfterImage} />
                    </div>
                </div>

                {/* Prescriptions */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-secondary-dark/10 pb-2">
                        <h3 className="text-lg font-bold text-primary">Prescriptions / Products</h3>
                        <button type="button" onClick={addPrescription} className="text-sm font-medium text-primary hover:text-primary-light flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Add Item
                        </button>
                    </div>

                    <div className="space-y-3">
                        {prescriptions.map((item, index) => (
                            <div key={item.id} className="flex gap-4 items-center animate-fade-in">
                                <span className="text-sm font-bold text-primary-light w-6">{index + 1}.</span>
                                <input
                                    type="text"
                                    placeholder="Product Name"
                                    value={item.name}
                                    onChange={(e) => handlePrescriptionChange(item.id, 'name', e.target.value)}
                                    className="flex-1 p-3 rounded-xl border border-secondary-dark/20 outline-none focus:ring-2 focus:ring-primary/20 bg-secondary-light/30"
                                />
                                <input
                                    type="text"
                                    placeholder="Dosage / Instructions"
                                    value={item.dosage}
                                    onChange={(e) => handlePrescriptionChange(item.id, 'dosage', e.target.value)}
                                    className="flex-1 p-3 rounded-xl border border-secondary-dark/20 outline-none focus:ring-2 focus:ring-primary/20 bg-secondary-light/30"
                                />
                                <button type="button" onClick={() => removePrescription(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-secondary-dark/10">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 rounded-xl text-primary font-medium hover:bg-secondary-dark/20 transition-colors"
                    >
                        Cancel
                    </button>
                    <button type="submit" className="bg-primary text-secondary px-8 py-3 rounded-xl hover:bg-primary-light transition-colors font-bold shadow-lg shadow-primary/20">
                        Save Complete Record
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RecordForm;
