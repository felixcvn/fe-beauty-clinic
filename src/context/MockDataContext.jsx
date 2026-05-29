import React, { createContext, useContext, useState, useEffect } from 'react';
import { stokRacikanAPI, antreanRacikanAPI } from '../services/api';

const MockDataContext = createContext();

export const MockDataProvider = ({ children }) => {
    // Activity Logs State
    const [activityLogs, setActivityLogs] = useState(() => {
        const saved = localStorage.getItem('clinic_activity_logs');
        return saved ? JSON.parse(saved) : [];
    });

    const [patients, setPatients] = useState([]);

    const [promos, setPromos] = useState([
        { id: 'PRM-001', code: 'RAMADHAN50', name: 'Diskon Spesial Ramadhan', type: 'Persen', value: 50, startDate: '2026-03-01', endDate: '2026-03-30', quota: 100, used: 85, status: 'Aktif', category: 'Treatment', targetItems: ['Laser Therapy Session', 'Chemical Peel'] },
        { id: 'PRM-002', code: 'NEWGLOW', name: 'Potongan Treatment Glow Up', type: 'Nominal', value: 150000, startDate: '2026-03-15', endDate: '2026-04-15', quota: 50, used: 12, status: 'Aktif', category: 'Treatment', targetItems: ['Skin Rejuvenation Therapy'] },
        { id: 'PRM-003', code: 'VALENTINE20', name: 'Kasih Sayang Diskon', type: 'Persen', value: 20, startDate: '2026-02-10', endDate: '2026-02-20', quota: 200, used: 200, status: 'Berakhir', category: 'Produk', targetItems: ['Acne Treatment Pack', 'Skin Glow Kit'] },
        { id: 'PRM-004', code: 'MEMBERBARU', name: 'Welcome New Member', type: 'Nominal', value: 50000, startDate: '2026-01-01', endDate: '2026-12-31', quota: 999, used: 320, status: 'Aktif', category: 'Produk', targetItems: ['Sunscreen Gel SPF 50', 'Moisturizer Ceramide'] },
        { id: 'PRM-005', code: 'LEBARANCERIA', name: 'Promo Lebaran', type: 'Persen', value: 30, startDate: '2026-04-01', endDate: '2026-04-15', quota: 150, used: 0, status: 'Draf', category: 'Treatment', targetItems: ['Facial Whitening'] },
    ]);

    const [products, setProducts] = useState([]);

    const [treatments, setTreatments] = useState([
        { id: 'TRT-001', name: 'Laser Therapy Session', category: 'Treatment', price: 1200000, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=200&h=200&auto=format&fit=crop', isPackage: true, packageCount: 5, package_treatment_ids: ['TRT-001'] },
        { id: 'TRT-002', name: 'Chemical Peel', category: 'Treatment', price: 350000, image: 'https://images.unsplash.com/photo-1570172619991-8079603683a3?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'TRT-003', name: 'Acne Extraction', category: 'Treatment', price: 250000, image: 'https://images.unsplash.com/photo-1590424744257-fce752f9b1b4?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'TRT-004', name: 'Microdermabrasion', category: 'Treatment', price: 500000, image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=200&h=200&auto=format&fit=crop', isPackage: true, packageCount: 3, package_treatment_ids: ['TRT-004'] },
        { id: 'TRT-005', name: 'Botox Injection', category: 'Treatment', price: 2500000, image: 'https://images.unsplash.com/photo-1606902965551-dce093cda6e7?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'TRT-006', name: 'Skin Rejuvenation Therapy', category: 'Treatment', price: 800000, image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=200&h=200&auto=format&fit=crop', isPackage: true, packageCount: 4, package_treatment_ids: ['TRT-006'] },
        { id: 'TRT-007', name: 'Facial Whitening', category: 'Treatment', price: 400000, image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'TRT-008', name: 'Radio Frequency (RF) Set', category: 'Treatment', price: 650000, image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=200&h=200&auto=format&fit=crop', isPackage: true, packageCount: 6, package_treatment_ids: ['TRT-008'] },
    ]);

    const [racikans, setRacikans] = useState([
        { id: 'RCK-001', name: 'Racikan Pencerah Malam', category: 'Racikan', price: 125000, stock: 10, minStock: 5, image: 'https://images.unsplash.com/photo-1556228578-0d85b1af4d78?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'RCK-002', name: 'Cream Jerawat Racik', category: 'Racikan', price: 85000, stock: 15, minStock: 10, image: 'https://images.unsplash.com/photo-1594411133670-1f3fd3612502?q=80&w=200&h=200&auto=format&fit=crop' },
    ]);

    // Efek untuk memuat data racikan riil dari backend Laravel
    useEffect(() => {
        const loadRealRacikans = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await stokRacikanAPI.getAll(token);
                if (res.success && Array.isArray(res.data)) {
                    setRacikans(res.data.map(r => ({
                        id: String(r.id),
                        name: r.nama_obat_racik || 'Racikan Tanpa Nama',
                        category: 'Racikan',
                        price: Number(r.harga || 0),
                        stock: 10, // Kuantitas virtual default di POS
                        minStock: 5,
                        image: 'https://images.unsplash.com/photo-1556228578-0d85b1af4d78?q=80&w=200&h=200&auto=format&fit=crop'
                    })));
                }
            } catch (error) {
                console.error('[MockDataContext] Error fetching real racikans:', error);
            }
        };
        loadRealRacikans();
    }, []);

    // Efek untuk memuat data antrean racikan riil dari backend Laravel
    useEffect(() => {
        const loadRealAntrean = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await antreanRacikanAPI.getAll(token);
                if (res.success && Array.isArray(res.data)) {
                    const formatted = res.data.map(item => ({
                        id: String(item.id),
                        patientId: String(item.patient_id),
                        patientName: item.patient_name,
                        dokterName: item.dokter_name || 'Dokter Umum',
                        racikanText: item.racikan_text,
                        date: (item.created_at || new Date().toISOString()).split('T')[0],
                        status: item.status || 'Pending'
                    }));
                    setAntreanRacikan(formatted);
                    localStorage.setItem('antrean_racikan', JSON.stringify(formatted));
                }
            } catch (error) {
                console.error('[MockDataContext] Error fetching real antrean_racikan:', error);
            }
        };
        loadRealAntrean();
    }, []);

    // Sinkronisasi otomatis antar tab browser (Multi-Tab Sync)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'antrean_racikan') {
                try {
                    setAntreanRacikan(e.newValue ? JSON.parse(e.newValue) : []);
                } catch (err) {
                    console.error('[MockDataContext] Error parsing synced antrean_racikan:', err);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // State antrean permintaan racikan (terintegrasi dengan LocalStorage)
    const [antreanRacikan, setAntreanRacikan] = useState(() => {
        const saved = localStorage.getItem('antrean_racikan');
        return saved ? JSON.parse(saved) : [];
    });

    const saveAntrean = (newAntrean) => {
        setAntreanRacikan(newAntrean);
        localStorage.setItem('antrean_racikan', JSON.stringify(newAntrean));
    };

    const addAntreanRacikan = async (patientId, patientName, dokterName, racikanText) => {
        const token = localStorage.getItem('token');
        const newRequest = {
            id: `REQ-${String(antreanRacikan.length + 1).padStart(3, '0')}`,
            patientId,
            patientName,
            dokterName: dokterName || 'Dokter Umum',
            racikanText,
            date: new Date().toISOString().split('T')[0],
            status: 'Pending'
        };

        if (token) {
            try {
                const res = await antreanRacikanAPI.create(token, {
                    patientId,
                    patientName,
                    dokterName,
                    racikanText
                });
                if (res.success && res.data) {
                    newRequest.id = String(res.data.id || res.data.data?.id || newRequest.id);
                }
            } catch (error) {
                console.error('[MockDataContext] Error creating backend antrean_racikan:', error);
            }
        }

        const updated = [newRequest, ...antreanRacikan];
        saveAntrean(updated);
    };

    const resetAntreanRacikan = (patientId) => {
        const updated = antreanRacikan.filter(req => !(String(req.patientId) === String(patientId) && req.status === 'Pending'));
        saveAntrean(updated);
    };

    const completeAntreanRacikan = async (reqId, customProduct) => {
        const token = localStorage.getItem('token');
        
        // 1. Simpan ke database backend secara riil
        if (token) {
            try {
                // Update status antrean di backend menjadi 'Selesai'
                await antreanRacikanAPI.updateStatus(token, reqId, 'Selesai');

                // Buat item stok racik baru di database backend
                const res = await stokRacikanAPI.create(token, {
                    name: customProduct.name,
                    description: customProduct.description || 'Dibuat dari antrean rekam medis',
                    price: Number(customProduct.price)
                });
                if (res.success && res.data) {
                    const newProduct = {
                        id: String(res.data.id || `RCK-${String(racikans.length + 1).padStart(3, '0')}`),
                        name: customProduct.name,
                        category: 'Racikan',
                        price: Number(customProduct.price),
                        stock: Number(customProduct.stock || 1),
                        minStock: 5,
                        image: 'https://images.unsplash.com/photo-1556228578-0d85b1af4d78?q=80&w=200&h=200&auto=format&fit=crop'
                    };
                    setRacikans(prev => [...prev, newProduct]);
                } else {
                    console.error('[MockDataContext] Gagal menyimpan ke backend:', res.message);
                    const newProduct = {
                        id: `RCK-${String(racikans.length + 1).padStart(3, '0')}`,
                        name: customProduct.name,
                        category: 'Racikan',
                        price: Number(customProduct.price),
                        stock: Number(customProduct.stock || 1),
                        minStock: 5,
                        image: 'https://images.unsplash.com/photo-1556228578-0d85b1af4d78?q=80&w=200&h=200&auto=format&fit=crop'
                    };
                    setRacikans(prev => [...prev, newProduct]);
                }
            } catch (error) {
                console.error('[MockDataContext] Error creating real racikan:', error);
            }
        } else {
            // Local state fallback
            const newProduct = {
                id: `RCK-${String(racikans.length + 1).padStart(3, '0')}`,
                name: customProduct.name,
                category: 'Racikan',
                price: Number(customProduct.price),
                stock: Number(customProduct.stock || 1),
                minStock: 5,
                image: 'https://images.unsplash.com/photo-1556228578-0d85b1af4d78?q=80&w=200&h=200&auto=format&fit=crop'
            };
            setRacikans(prev => [...prev, newProduct]);
        }

        // 2. Ubah status antrean menjadi 'Selesai' di local state
        const updated = antreanRacikan.map(req => 
            String(req.id) === String(reqId) ? { ...req, status: 'Selesai' } : req
        );
        saveAntrean(updated);
    };

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

    const [staff, setStaff] = useState([]);
    
    const [leaveRequests, setLeaveRequests] = useState([
        { id: 'LR-001', staffName: 'Dr. Sarah Smith', role: 'Dokter', type: 'Cuti Tahunan', startDate: '2026-03-25', endDate: '2026-03-27', reason: 'Liburan keluarga', status: 'Menunggu HRD' },
        { id: 'LR-002', staffName: 'Budi Santoso', role: 'Customer Service', type: 'Sakit', startDate: '2026-03-20', endDate: '2026-03-21', reason: 'Demam tinggi', status: 'Disetujui', attachment: 'surat_sakit_budi.jpg' },
        { id: 'LR-003', staffName: 'Maya Sari', role: 'Perawat', type: 'Izin Lainnya', startDate: '2026-03-22', endDate: '2026-03-22', reason: 'Urusan keluarga mendadak', status: 'Ditolak' },
        { id: 'LR-004', staffName: 'Dewi Rahmawati', role: 'HRD', type: 'Cuti Tahunan', startDate: '2026-04-10', endDate: '2026-04-15', reason: 'Libur lebaran', status: 'Menunggu HRD' },
        { id: 'LR-005', staffName: 'Nina Lestari', role: 'ASS SPV TREATMENT', type: 'Cuti Tahunan', startDate: '2026-04-05', endDate: '2026-04-08', reason: 'Acara keluarga di luar kota', status: 'Menunggu Lead' },
        { id: 'LR-006', staffName: 'Agus Setiawan', role: 'Perawat', type: 'Sakit', startDate: '2026-03-24', endDate: '2026-03-26', reason: 'Gejala tifus', status: 'Disetujui', attachment: 'surat_keterangan_dokter_agus.png' },
    ]);

    const [overtimeRequests, setOvertimeRequests] = useState([
        {
            id: 'OT-001', staffName: 'Andi Pratama', role: 'Customer Service', shift: 'pelayanan_pagi',
            primaryType: 'Terlambat', anomalyTypes: ['Terlambat'],
            scheduledTime: '08:45', detectedTime: '09:15', diffMinutes: 30,
            notes: 'Motor mogok di tengah jalan, terpaksa menunggu tukang tambal ban hampir 30 menit.',
            date: '2026-04-18', status: 'Menunggu HRD', hrdNote: ''
        },
        {
            id: 'OT-002', staffName: 'Dr. Sarah Smith', role: 'Dokter', shift: 'pelayanan_pagi',
            primaryType: 'Lembur', anomalyTypes: ['Lembur'],
            scheduledTime: '17:00', detectedTime: '18:30', diffMinutes: 90,
            notes: 'Pasien emergency masuk pukul 16:45. Harus ditangani sampai selesai karena kondisi kritis.',
            date: '2026-04-17', status: 'Disetujui', hrdNote: ''
        },
        {
            id: 'OT-003', staffName: 'Fajar Nugroho', role: 'Supervisor Treatment', shift: 'umum_normal',
            primaryType: 'Terlambat', anomalyTypes: ['Terlambat', 'Luar Kantor'],
            scheduledTime: '08:00', detectedTime: '09:30', diffMinutes: 90,
            notes: 'Menghadiri rapat dengan mitra bisnis di luar kantor yang dijadwalkan mendadak oleh atasan.',
            date: '2026-04-18', status: 'Menunggu HRD', hrdNote: ''
        },
        {
            id: 'OT-003B', staffName: 'Dedi Supriadi', role: 'ASS FINANCE', shift: 'umum_normal',
            primaryType: 'Lembur', anomalyTypes: ['Lembur'],
            scheduledTime: '17:00', detectedTime: '18:10', diffMinutes: 70,
            notes: 'Menyelesaikan laporan keuangan akhir bulan yang diminta dadakan oleh Pak Lead Finance.',
            date: '2026-04-18', status: 'Menunggu HRD', hrdNote: ''
        },
        {
            id: 'OT-004', staffName: 'Bambang Heru', role: 'OB', shift: 'ob_normal',
            primaryType: 'Lembur', anomalyTypes: ['Lembur'],
            scheduledTime: '17:00', detectedTime: '19:10', diffMinutes: 130,
            notes: 'Diminta Bapak Supervisor untuk membersihkan ruang rapat setelah acara client selesai.',
            date: '2026-04-16', status: 'Ditolak', hrdNote: 'Harus konfirmasi terlebih dahulu ke HRD sebelum melakukan lembur.'
        },
        {
            id: 'OT-005', staffName: 'Hendra Saputra', role: 'Satpam', shift: 'satpam_pagi',
            primaryType: 'Lembur', anomalyTypes: ['Lembur'],
            scheduledTime: '20:00', detectedTime: '21:30', diffMinutes: 90,
            notes: 'Terjadi insiden kendaraan di area parkir, harus menunggu proses dokumentasi selesai.',
            date: '2026-04-15', status: 'Disetujui', hrdNote: ''
        }

    ]);

    const [slotAvailability, setSlotAvailability] = useState([
        { time: '08:00', available: true },
        { time: '09:00', available: true },
        { time: '10:00', available: true },
        { time: '11:00', available: true },
        { time: '12:00', available: true },
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

    const updateSlotAvailability = (time, available) => {
        setSlotAvailability(prev => prev.map(slot => slot.time === time ? { ...slot, available } : slot));
    };

    const updateLeaveStatus = (id, status) => {
        setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
    };

    const updateOvertimeStatus = (id, status, hrdNote) => {
        setOvertimeRequests(prev => prev.map(req => req.id === id ? { ...req, status, hrdNote } : req));
    };

    const addLeaveRequest = (req) => setLeaveRequests(prev => [req, ...prev]);
    const addOvertimeRequest = (req) => setOvertimeRequests(prev => [req, ...prev]);



    // Promo Functions
    const addPromo = (promo) => {
        const id = `PRM-${String(promos.length + 1).padStart(3, '0')}`;
        setPromos(prev => [{ ...promo, id, used: 0, status: 'Aktif' }, ...prev]);
    };

    const updatePromo = (updatedPromo) => {
        setPromos(prev => prev.map(p => p.id === updatedPromo.id ? updatedPromo : p));
    };

    const deletePromo = (id) => {
        setPromos(prev => prev.filter(p => p.id !== id));
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
            bookings, addBooking, updateBooking, deleteBooking,
            promos, addPromo, updatePromo, deletePromo,
            slotAvailability, updateSlotAvailability,
            leaveRequests, updateLeaveStatus, addLeaveRequest,
            overtimeRequests, updateOvertimeStatus, addOvertimeRequest,
            antreanRacikan, addAntreanRacikan, completeAntreanRacikan, resetAntreanRacikan,
            activityLogs
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
