import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../context/MockDataContext';
import { useToast } from '../../context/ToastContext';

const PatientForm = () => {
    const { addPatient } = useMockData();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        allergies: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addPatient(formData);
        showToast('Berhasil menambahkan pasien', 'success');
        navigate('/medical-records');
    };

    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-secondary-dark/20 animate-fade-in max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-primary mb-6">Register New Patient</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-primary">Full Name</label>
                    <input
                        type="text"
                        required
                        className="w-full p-3 rounded-xl border border-secondary-dark/20 outline-none focus:ring-2 focus:ring-primary/20 bg-secondary-light/30"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-primary">Age</label>
                    <input
                        type="number"
                        required
                        className="w-full p-3 rounded-xl border border-secondary-dark/20 outline-none focus:ring-2 focus:ring-primary/20 bg-secondary-light/30"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-primary">Allergies (Optional)</label>
                    <input
                        type="text"
                        placeholder="e.g. Penicillin, Peanuts"
                        className="w-full p-3 rounded-xl border border-secondary-dark/20 outline-none focus:ring-2 focus:ring-primary/20 bg-secondary-light/30"
                        value={formData.allergies}
                        onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 rounded-xl text-primary font-medium hover:bg-secondary-dark/20">Cancel</button>
                    <button type="submit" className="bg-primary text-secondary px-8 py-2 rounded-xl hover:bg-primary-light font-bold shadow-lg shadow-primary/20">Register Patient</button>
                </div>
            </form>
        </div>
    );
};

export default PatientForm;
