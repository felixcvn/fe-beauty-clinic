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

    const [products, setProducts] = useState([
        { id: 'PRD-001', name: 'Acne Treatment Pack', category: 'Skincare', price: 450000, stock: 15, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-004', name: 'Skin Glow Kit', category: 'Skincare', price: 850000, stock: 12, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-005', name: 'Sunscreen SPF 50', category: 'Skincare', price: 150000, stock: 25, image: 'https://images.unsplash.com/photo-1598440499033-547b19615c0a?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-006', name: 'Paracetamol 500mg', category: 'Obat', price: 15000, stock: 100, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-007', name: 'Night Cream Retinol', category: 'Skincare', price: 250000, stock: 10, image: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-008', name: 'Amoxicillin Syrup', category: 'Obat', price: 45000, stock: 20, image: 'https://images.unsplash.com/photo-1471864190281-ad5f9f30d947?q=80&w=200&h=200&auto=format&fit=crop' },
    ]);

    const [treatments, setTreatments] = useState([
        { id: 'TRT-001', name: 'Laser Therapy Session', category: 'Treatment', price: 1200000, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'TRT-002', name: 'Chemical Peel', category: 'Treatment', price: 350000, image: 'https://images.unsplash.com/photo-1570172619991-8079603683a3?q=80&w=200&h=200&auto=format&fit=crop' },
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

    // Product Functions
    const addProduct = (product) => {
        const id = `PRD-${String(products.length + 1).padStart(3, '0')}`;
        setProducts([...products, { ...product, id }]);
    };

    const updateProduct = (updatedProduct) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    const deleteProduct = (id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    // Treatment Functions
    const addTreatment = (treatment) => {
        const id = `TRT-${String(treatments.length + 1).padStart(3, '0')}`;
        setTreatments([...treatments, { ...treatment, id }]);
    };

    const updateTreatment = (updatedTreatment) => {
        setTreatments(prev => prev.map(t => t.id === updatedTreatment.id ? updatedTreatment : t));
    };

    const deleteTreatment = (id) => {
        setTreatments(prev => prev.filter(t => t.id !== id));
    };

    return (
        <MockDataContext.Provider value={{ 
            patients, addPatient, addRecord, getPatient,
            products, addProduct, updateProduct, deleteProduct,
            treatments, addTreatment, updateTreatment, deleteTreatment
        }}>
            {children}
        </MockDataContext.Provider>
    );
};

export const useMockData = () => {
    const context = useContext(MockDataContext);
    if (!context) throw new Error('useMockData must be used within a MockDataProvider');
    return context;
};
