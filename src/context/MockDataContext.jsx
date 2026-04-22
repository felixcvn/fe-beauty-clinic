import React, { createContext, useContext, useState } from 'react';

const MockDataContext = createContext();

export const MockDataProvider = ({ children }) => {
    const [patients, setPatients] = useState([
        {
            id: 'P-10024', name: 'Emma Watson', namaLengkap: 'Emma Watson', age: 24, lastVisit: 'Okt 24, 2025', condition: 'Acne Treatment', status: 'Aktif', allergies: 'Penicillin',
            noMember: 'M-001', noRM: '00-00-01', noIdentitas: '3201010101010001', tempatLahir: 'Jakarta', tanggalLahir: '2000-01-01', jenisKelamin: 'Perempuan', alamat: 'Jl. Sudirman No 1', email: 'emma@email.com', noTelepon: '081234567890', tipeMember: 'GOLD',
            history: [
                { id: 1, date: 'Okt 24, 2025', treatment: 'Acne Treatment', specialist: 'Dr. Sarah Smith', notes: 'Respon baik terhadap facial.', beforeImage: 'https://images.unsplash.com/photo-1548810756-12a9792182c4', afterImage: 'https://images.unsplash.com/photo-1552693673-1bf958298935' }
            ]
        },
        { id: 'P-10025', name: 'Budi Santoso', namaLengkap: 'Budi Santoso', age: 32, lastVisit: 'Okt 22, 2025', condition: 'Laser Therapy', status: 'Selesai', allergies: 'Tidak ada', noMember: 'M-002', noRM: '00-00-02', tipeMember: 'PLATINUM', history: [] },
        { id: 'P-10026', name: 'Siti Rahma', namaLengkap: 'Siti Rahma', age: 29, lastVisit: 'Okt 20, 2025', condition: 'Skin Rejuvenation', status: 'Aktif', allergies: 'Kacang', noMember: 'M-003', noRM: '00-00-03', tipeMember: 'PLATINUM', history: [] },
        { id: 'P-10027', name: 'Arief Rahman', namaLengkap: 'Arief Rahman', age: 45, lastVisit: 'Okt 15, 2025', condition: 'Peeling', status: 'Aktif', allergies: 'Tidak ada', noMember: 'M-004', noRM: '00-00-04', tipeMember: 'GOLD', history: [] },
        { id: 'P-10028', name: 'Rina Wijaya', namaLengkap: 'Rina Wijaya', age: 21, lastVisit: 'Sep 30, 2025', condition: 'Facial Wash', status: 'Selesai', allergies: 'Debu', noMember: 'M-005', noRM: '00-00-05', tipeMember: 'GOLD', history: [] },
        { id: 'P-10029', name: 'Ahmad Dahlan', namaLengkap: 'Ahmad Dahlan', age: 38, lastVisit: 'Sep 25, 2025', condition: 'Botox', status: 'Aktif', allergies: 'Seafood', noMember: 'M-006', noRM: '00-00-06', tipeMember: 'PLATINUM', history: [] },
        { id: 'P-10030', name: 'Dewi Lestari', namaLengkap: 'Dewi Lestari', age: 27, lastVisit: 'Sep 20, 2025', condition: 'Acne Treatment', status: 'Selesai', allergies: 'Udang', noMember: 'M-007', noRM: '00-00-07', tipeMember: 'GOLD', history: [] },
        { id: 'P-10031', name: 'Hendra Saputra', namaLengkap: 'Hendra Saputra', age: 50, lastVisit: 'Agt 15, 2025', condition: 'Laser Therapy', status: 'Aktif', allergies: 'Paracetamol', noMember: 'M-008', noRM: '00-00-08', tipeMember: 'GOLD', history: [] },
        { id: 'P-10032', name: 'Maya Sari', namaLengkap: 'Maya Sari', age: 33, lastVisit: 'Agt 10, 2025', condition: 'Skin Rejuvenation', status: 'Aktif', allergies: 'Tidak ada', noMember: 'M-009', noRM: '00-00-09', tipeMember: 'PLATINUM', history: [] },
        { id: 'P-10033', name: 'Riko Pratama', namaLengkap: 'Riko Pratama', age: 26, lastVisit: 'Jul 05, 2025', condition: 'Peeling', status: 'Selesai', allergies: 'Coklat', noMember: 'M-010', noRM: '00-00-10', tipeMember: 'PLATINUM', history: [] },
        { id: 'P-10034', name: 'Putri Andriani', namaLengkap: 'Putri Andriani', age: 22, lastVisit: 'Sep 01, 2025', condition: 'Facial Acne', status: 'Aktif', allergies: 'Tidak ada', noMember: 'M-011', noRM: '00-00-11', tipeMember: 'GOLD', history: [] },
        { id: 'P-10035', name: 'Fajar Nugroho', namaLengkap: 'Fajar Nugroho', age: 41, lastVisit: 'Agt 01, 2025', condition: 'Pigmentation', status: 'Aktif', allergies: 'Debu', noMember: 'M-012', noRM: '00-00-12', tipeMember: 'PLATINUM', history: [] },
    ]);

    const [products, setProducts] = useState([
        { id: 'PRD-001', name: 'Acne Treatment Pack', category: 'Skincare', price: 450000, stock: 15, minStock: 20, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-004', name: 'Skin Glow Kit', category: 'Skincare', price: 850000, stock: 12, minStock: 10, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-005', name: 'Sunscreen Gel SPF 50', category: 'Skincare', price: 150000, stock: 25, minStock: 20, image: 'https://images.unsplash.com/photo-1598440499033-547b19615c0a?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-006', name: 'Paracetamol 500mg', category: 'Obat', price: 15000, stock: 100, minStock: 50, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-007', name: 'Night Cream Retinol', category: 'Skincare', price: 250000, stock: 8, minStock: 15, image: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-008', name: 'Amoxicillin Syrup', category: 'Obat', price: 45000, stock: 20, minStock: 30, image: 'https://images.unsplash.com/photo-1471864190281-ad5f9f30d947?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-009', name: 'Vitamin C Serum', category: 'Skincare', price: 320000, stock: 45, minStock: 20, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-010', name: 'Moisturizer Ceramide', category: 'Skincare', price: 180000, stock: 30, minStock: 15, image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-011', name: 'Antibacterial Soap', category: 'Obat', price: 35000, stock: 80, minStock: 40, image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-012', name: 'Toner BHA/AHA', category: 'Skincare', price: 195000, stock: 22, minStock: 15, image: 'https://images.unsplash.com/photo-1615397323755-63b71f9cf714?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-013', name: 'Cough Syrup (Herbal)', category: 'Obat', price: 55000, stock: 50, minStock: 25, image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-014', name: 'Anti-aging Cream', category: 'Skincare', price: 550000, stock: 5, minStock: 10, image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=200&h=200&auto=format&fit=crop' },
    ]);

    const [treatments, setTreatments] = useState([
        { id: 'TRT-001', name: 'Laser Therapy Session', category: 'Treatment', price: 1200000, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=200&h=200&auto=format&fit=crop', isPackage: true, packageCount: 5 },
        { id: 'TRT-002', name: 'Chemical Peel', category: 'Treatment', price: 350000, image: 'https://images.unsplash.com/photo-1570172619991-8079603683a3?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'TRT-003', name: 'Acne Extraction', category: 'Treatment', price: 250000, image: 'https://images.unsplash.com/photo-1590424744257-fce752f9b1b4?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'TRT-004', name: 'Microdermabrasion', category: 'Treatment', price: 500000, image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=200&h=200&auto=format&fit=crop', isPackage: true, packageCount: 3 },
        { id: 'TRT-005', name: 'Botox Injection', category: 'Treatment', price: 2500000, image: 'https://images.unsplash.com/photo-1606902965551-dce093cda6e7?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'TRT-006', name: 'Skin Rejuvenation Therapy', category: 'Treatment', price: 800000, image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=200&h=200&auto=format&fit=crop', isPackage: true, packageCount: 4 },
        { id: 'TRT-007', name: 'Facial Whitening', category: 'Treatment', price: 400000, image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'TRT-008', name: 'Radio Frequency (RF) Set', category: 'Treatment', price: 650000, image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=200&h=200&auto=format&fit=crop', isPackage: true, packageCount: 6 },
    ]);

    const [racikans, setRacikans] = useState([
        { id: 'RCK-001', name: 'Racikan Pencerah Malam', category: 'Racikan', price: 125000, stock: 10, minStock: 5, image: 'https://images.unsplash.com/photo-1556228578-0d85b1af4d78?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'RCK-002', name: 'Cream Jerawat Racik', category: 'Racikan', price: 85000, stock: 15, minStock: 10, image: 'https://images.unsplash.com/photo-1594411133670-1f3fd3612502?q=80&w=200&h=200&auto=format&fit=crop' },
    ]);

    const [materials, setMaterials] = useState([
        { id: 'MAT-001', name: 'Kapas Medis', category: 'Bahan', price: 15000, stock: 50, minStock: 10, image: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'MAT-002', name: 'Alkohol Swab', category: 'Bahan', price: 2000, stock: 200, minStock: 50, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200&h=200&auto=format&fit=crop' },
    ]);

    const [medicals, setMedicals] = useState([
        { id: 'MED-001', name: 'Plester Anti Air', category: 'Alat Kesehatan', stock: 100, minStock: 50 },
    ]);

    const [infusions, setInfusions] = useState([
        { id: 'INF-001', name: 'Infus RL 500ml', category: 'Cairan Infus', stock: 50, minStock: 20 },
    ]);

    const [apotekItems, setApotekItems] = useState([
        { id: 'APT-001', name: 'Masker Medis', category: 'Habis Pakai', stock: 500, minStock: 100 },
    ]);

    const [staff, setStaff] = useState([
        { id: 'STF-001', name: 'Dr. John Doe', divisi: 'Dokter', posisi: 'Lead', email: 'john.doe@clinic.com', phone: '0812-1234-5678', username: 'admin', password: 'password123', status: 'Aktif', nik: '3171011205800001', tanggal_lahir: '1980-05-12', alamat: 'Jl. Sudirman No. 12', tanggal_bergabung: '2022-01-15', cabang: 'Jember' },
        { id: 'STF-002', name: 'Dr. Sarah Smith', divisi: 'Dokter', posisi: 'Anggota', email: 'sarah.smith@clinic.com', phone: '0812-9876-5432', username: 'doctor', password: 'password123', status: 'Aktif', nik: '3172021504920002', tanggal_lahir: '1992-04-15', alamat: 'Apartemen Sudirman Tower A/12', tanggal_bergabung: '2023-03-01', cabang: 'Jember' },
        { id: 'STF-003', name: 'Dr. Andi Pratama', divisi: 'Dokter', posisi: 'Anggota', email: 'andi.p@clinic.com', phone: '0813-1122-3344', username: 'andi.p', password: 'password123', status: 'Aktif', nik: '3201012308850003', tanggal_lahir: '1985-08-23', alamat: 'Komp. Pesona Indah Blok B4', tanggal_bergabung: '2022-11-10', cabang: 'Lumajang' },
        { id: 'STF-004', name: 'Budi Santoso', divisi: 'Customer Service', posisi: 'Lead', email: 'budi.cs@clinic.com', phone: '0815-9900-1122', username: 'budi.cs', password: 'password123', status: 'Aktif', nik: '3578010506950005', tanggal_lahir: '1995-06-05', alamat: 'Jl. Pahlawan Karya 12A', tanggal_bergabung: '2024-01-05', cabang: 'Lumajang' },
        { id: 'STF-005', name: 'Ayu Lestari', divisi: 'Customer Service', posisi: 'Anggota', email: 'ayu.cs@clinic.com', phone: '0812-3344-5566', username: 'ayu.cs', password: 'password123', status: 'Aktif', nik: '3173022512960006', tanggal_lahir: '1996-12-25', alamat: 'Jl. Teratai Indah Blok C1/2', tanggal_bergabung: '2024-02-14', cabang: 'Jember' },
        { id: 'STF-006', name: 'Dewi Rahmawati', divisi: 'HRD', posisi: 'HRD', email: 'dewi.hrd@clinic.com', phone: '0813-7788-9900', username: 'hrd', password: 'password123', status: 'Aktif', nik: '3271011402880007', tanggal_lahir: '1988-02-14', alamat: 'Komp. Graha Raya Kav. 88', tanggal_bergabung: '2022-09-01', cabang: 'Lumajang' },
        { id: 'STF-007', name: 'Fajar Nugroho', divisi: 'Supervisor Treatment', posisi: 'Lead', email: 'fajar.m@clinic.com', phone: '0811-2233-4455', username: 'spv_treatment', password: 'password123', status: 'Aktif', nik: '3174022005840008', tanggal_lahir: '1984-05-20', alamat: 'Townhouse Pondok Indah Unit 3', tanggal_bergabung: '2021-12-01', cabang: 'Jember' },
        { id: 'STF-015', name: 'Budi Santoso', divisi: 'Supervisor Produk', posisi: 'Lead', email: 'budi.spv@clinic.com', phone: '0811-3344-5566', username: 'spv_produk', password: 'password123', status: 'Aktif', nik: '3174022005840009', tanggal_lahir: '1985-06-15', alamat: 'Jl. Merdeka No 1', tanggal_bergabung: '2022-01-10', cabang: 'Jember' },
        { id: 'STF-008', name: 'Rina Kartika', divisi: 'Perawat', posisi: 'Lead', email: 'rina.p@clinic.com', phone: '0815-6677-8899', username: 'rina.p', password: 'password123', status: 'Aktif', nik: '3573010707940009', tanggal_lahir: '1994-07-07', alamat: 'Jl. Anggrek Selatan No. 22', tanggal_bergabung: '2023-08-15', cabang: 'Lumajang' },
        { id: 'STF-009', name: 'Siti Aminah', divisi: 'Perawat', posisi: 'Anggota', email: 'siti.p@clinic.com', phone: '0813-9988-7766', username: 'siti.p', password: 'password123', status: 'Nonaktif', nik: '3175021803960011', tanggal_lahir: '1996-03-18', alamat: 'Jl. Kebon Jeruk VI No. 8', tanggal_bergabung: '2022-10-15', cabang: 'Lumajang' },
        { id: 'STF-010', name: 'Hendra Saputra', divisi: 'Staff Gudang', posisi: 'Lead', email: 'hendra.g@clinic.com', phone: '0811-1122-3344', username: 'gudang', password: 'password123', status: 'Aktif', nik: '3372010109900012', tanggal_lahir: '1990-09-01', alamat: 'Komp. Meruya Ilir Blok A/5', tanggal_bergabung: '2023-02-28', cabang: 'Jember' },
        { id: 'STF-011', name: 'Maya Indah', divisi: 'Staff Gudang', posisi: 'Anggota', email: 'maya.g@clinic.com', phone: '0815-4455-6677', username: 'maya.g', password: 'password123', status: 'Aktif', nik: '3274021404970013', tanggal_lahir: '1997-04-14', alamat: 'Jl. Raden Saleh Gg. 2 No. 14', tanggal_bergabung: '2024-03-01', cabang: 'Lumajang' },
        { id: 'STF-012', name: 'Reza Pahlevi', divisi: 'Kasir', posisi: 'Lead', email: 'reza.k@clinic.com', phone: '0812-7788-9900', username: 'reza.k', password: 'password123', status: 'Aktif', nik: '3171012901980014', tanggal_lahir: '1998-01-29', alamat: 'Jl. Karet Pedurenan No. 71', tanggal_bergabung: '2024-01-15', cabang: 'Jember' },
        { id: 'STF-013', name: 'Bapak Komisaris', divisi: 'Komisaris', posisi: 'Komisaris', email: 'komisaris@clinic.com', phone: '0811-0000-0000', username: 'komisaris', password: 'password123', status: 'Aktif', nik: '3171000000000001', tanggal_lahir: '1970-01-01', alamat: 'Jl. Raya No. 1', tanggal_bergabung: '2020-01-01', cabang: 'Jember' },
        { id: 'STF-014', name: 'Ana Farhana', divisi: 'Apoteker', posisi: 'Apoteker', email: 'ana.apoteker@clinic.com', phone: '0812-3434-5656', username: 'apoteker', password: 'password123', status: 'Aktif', nik: '3171012101010001', tanggal_lahir: '1990-01-01', alamat: 'Jl. Apotek No. 1', tanggal_bergabung: '2023-01-01', cabang: 'Jember' }
    ]);

    const addPatient = (patient) => {
        const newPatient = {
            ...patient,
            id: `P-${10024 + patients.length}`,
            lastVisit: 'New',
            condition: 'None',
            status: 'Aktif',
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

    const updatePatient = (updatedPatient) => {
        setPatients(prev => prev.map(p => p.id === updatedPatient.id ? { ...p, ...updatedPatient } : p));
    };

    // Product Functions
    const addProduct = (product) => {
        const id = product.id || `PRD-${String(products.length + 1).padStart(3, '0')}`;
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
        const id = treatment.id || `TRT-${String(treatments.length + 1).padStart(3, '0')}`;
        setTreatments([...treatments, { ...treatment, id }]);
    };

    const updateTreatment = (updatedTreatment) => {
        setTreatments(prev => prev.map(t => t.id === updatedTreatment.id ? updatedTreatment : t));
    };

    const deleteTreatment = (id) => {
        setTreatments(prev => prev.filter(t => t.id !== id));
    };

    // Racikan Functions
    const addRacikan = (racikan) => {
        const id = racikan.id || `RCK-${String(racikans.length + 1).padStart(3, '0')}`;
        setRacikans([...racikans, { ...racikan, id }]);
    };

    const updateRacikan = (updatedRacikan) => {
        setRacikans(prev => prev.map(r => r.id === updatedRacikan.id ? updatedRacikan : r));
    };

    const deleteRacikan = (id) => {
        setRacikans(prev => prev.filter(r => r.id !== id));
    };

    // Material Functions
    const addMaterial = (material) => {
        const id = material.id || `MAT-${String(materials.length + 1).padStart(3, '0')}`;
        setMaterials([...materials, { ...material, id }]);
    };

    const updateMaterial = (updatedMaterial) => {
        setMaterials(prev => prev.map(m => m.id === updatedMaterial.id ? updatedMaterial : m));
    };

    const deleteMaterial = (id) => {
        setMaterials(prev => prev.filter(m => m.id !== id));
    };

    // Medical Functions
    const addMedical = (medical) => {
        const id = medical.id || `MED-${String(medicals.length + 1).padStart(3, '0')}`;
        setMedicals([...medicals, { ...medical, id }]);
    };

    const updateMedical = (updatedMedical) => {
        setMedicals(prev => prev.map(m => m.id === updatedMedical.id ? updatedMedical : m));
    };

    const deleteMedical = (id) => {
        setMedicals(prev => prev.filter(m => m.id !== id));
    };

    // Infusion Functions
    const addInfusion = (infusion) => {
        const id = infusion.id || `INF-${String(infusions.length + 1).padStart(3, '0')}`;
        setInfusions([...infusions, { ...infusion, id }]);
    };

    const updateInfusion = (updatedInfusion) => {
        setInfusions(prev => prev.map(i => i.id === updatedInfusion.id ? updatedInfusion : i));
    };

    const deleteInfusion = (id) => {
        setInfusions(prev => prev.filter(i => i.id !== id));
    };

    // ApotekItem Functions
    const addApotekItem = (item) => {
        const id = item.id || `APT-${String(apotekItems.length + 1).padStart(3, '0')}`;
        setApotekItems([...apotekItems, { ...item, id }]);
    };

    const updateApotekItem = (updatedItem) => {
        setApotekItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    };

    const deleteApotekItem = (id) => {
        setApotekItems(prev => prev.filter(i => i.id !== id));
    };

    // Staff Functions
    const addStaff = (staffData) => {
        const id = `STF-${String(staff.length + 1).padStart(3, '0')}`;
        setStaff([...staff, { ...staffData, id }]);
    };

    const updateStaff = (updatedStaff) => {
        setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
    };

    const deleteStaff = (id) => {
        setStaff(prev => prev.filter(s => s.id !== id));
    };

    const [bookings, setBookings] = useState([
        { id: 'BK-001', name: 'Emma Watson', treatment: 'Skin Care', time: '10:00', status: 'Dikonfirmasi', phone: '081234567890', broughtByStaff: 'Budi Santoso', notes: 'Routine checkup' },
        { id: 'BK-002', name: 'James Wilson', treatment: 'Dermatology', time: '11:15', status: 'Menunggu', phone: '081298765432', broughtByStaff: 'Ayu Lestari', notes: 'First visit' },
        { id: 'BK-003', name: 'Sarah Parker', treatment: 'Botox', time: '14:30', status: 'Dikonfirmasi', phone: '081311223344', broughtByStaff: 'Budi Santoso', notes: 'Top up' },
        { id: 'BK-004', name: 'Robert Fox', treatment: 'Consultation', time: '16:00', status: 'Menunggu', phone: '081599001122', broughtByStaff: 'Dewi Rahmawati', notes: 'New patient' }
    ]);

    const addBooking = (bookingData) => {
        const id = `BK-${String(bookings.length + 1).padStart(3, '0')}`;
        setBookings(prev => [{ ...bookingData, id, status: 'Menunggu' }, ...prev]);
    };

    const updateBooking = (updatedBooking) => {
        setBookings(prev => prev.map(b => b.id === updatedBooking.id ? { ...b, ...updatedBooking } : b));
    };

    const deleteBooking = (id) => {
        setBookings(prev => prev.filter(b => b.id !== id));
    };

    return (
        <MockDataContext.Provider value={{ 
            patients, addPatient, updatePatient, addRecord, getPatient,
            products, addProduct, updateProduct, deleteProduct,
            treatments, addTreatment, updateTreatment, deleteTreatment,
            racikans, addRacikan, updateRacikan, deleteRacikan,
            materials, addMaterial, updateMaterial, deleteMaterial,
            medicals, addMedical, updateMedical, deleteMedical,
            infusions, addInfusion, updateInfusion, deleteInfusion,
            apotekItems, addApotekItem, updateApotekItem, deleteApotekItem,
            staff, addStaff, updateStaff, deleteStaff,
            bookings, addBooking, updateBooking, deleteBooking
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
