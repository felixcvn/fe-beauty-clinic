import React, { createContext, useContext, useState } from 'react';

const MockDataContext = createContext();

export const MockDataProvider = ({ children }) => {
    const [patients, setPatients] = useState([
        {
            id: 'P-10024',
            name: 'Emma Watson',
            age: 24,
            lastVisit: 'Oct 24, 2023',
            condition: 'Acne Treatment',
            status: 'Active',
            allergies: 'Penicillin, Latex',
            history: [
                {
                    id: 1,
                    date: 'Oct 24, 2023',
                    treatment: 'Acne Treatment',
                    specialist: 'Dr. Sarah Smith',
                    notes: 'Patient responded well to the chemical peel. Redness subsided after 2 hours.',
                    beforeImage: 'https://images.unsplash.com/photo-1548810756-12a9792182c4?auto=format&fit=crop',
                    afterImage: 'https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop'
                }
            ]
        },
        { id: 'P-10025', name: 'John Doe', age: 32, lastVisit: 'Oct 22, 2023', condition: 'Laser Therapy', status: 'Completed', allergies: 'None', history: [] },
        { id: 'P-10026', name: 'Sarah Parker', age: 29, lastVisit: 'Oct 20, 2023', condition: 'Skin Rejuvenation', status: 'Active', allergies: 'Peanuts', history: [] },
    ]);

    const addPatient = (patient) => {
        const newPatient = {
            ...patient,
            id: `P-${10024 + patients.length}`,
            lastVisit: 'New',
            condition: 'None',
            status: 'Active',
            history: []
        };
        setPatients([...patients, newPatient]);
    };

    const addRecord = (patientId, newRecord) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                return {
                    ...p,
                    lastVisit: newRecord.date,
                    condition: newRecord.treatment,
                    history: [newRecord, ...p.history]
                };
            }
            return p;
        }));
    };

    const getPatient = (id) => patients.find(p => p.id === id);

    return (
        <MockDataContext.Provider value={{ patients, addPatient, addRecord, getPatient }}>
            {children}
        </MockDataContext.Provider>
    );
};

export const useMockData = () => {
    const context = useContext(MockDataContext);
    if (!context) throw new Error('useMockData must be used within a MockDataProvider');
    return context;
};
