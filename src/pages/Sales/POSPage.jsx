import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, CheckCircle2, Package, ArrowLeft, Filter, Tag, User, X, FileText, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import TableSkeleton from '../../components/UI/TableSkeleton';
import { useMockData } from '../../context/MockDataContext';
import { useAuth } from '../../context/AuthContext';
import { stokProdukAPI, pasienAPI, rekamMedisAPI, treatmentAPI, transaksiAPI, stokRacikanAPI, distributorAPI, paketTreatmentAPI } from '../../services/api';

const POSPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { user } = useAuth();
    const { racikans, addAntreanRacikan, antreanRacikan, resetAntreanRacikan } = useMockData();
    
    // States that were missing
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [apiProducts, setApiProducts] = useState([]);
    const [apiPatients, setApiPatients] = useState([]);
    const [apiTreatments, setApiTreatments] = useState([]);
    const [apiRacikans, setApiRacikans] = useState([]);
    const [cart, setCart] = useState([]);
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isFetchingRecord, setIsFetchingRecord] = useState(false);
    const [hasFetchedRecord, setHasFetchedRecord] = useState(false);
    const [detectedRacikan, setDetectedRacikan] = useState(null);
    const [racikanSent, setRacikanSent] = useState(false);

    // Fetch real patients, products, and treatments from API
    useEffect(() => {
        const loadRealData = async () => {
            if (!user?.token) {
                setIsLoading(false);
                return;
            }
            setIsFetchingData(true);
            try {
                const [resProducts, resPatients, resTreatments, resPakets, resRacikans, resDistributors] = await Promise.all([
                    stokProdukAPI.getAll(user.token),
                    pasienAPI.getAll(user.token, 1, 'per_page=100'),
                    treatmentAPI.getAll(user.token),
                    paketTreatmentAPI.getAll(user.token),
                    stokRacikanAPI.getAll(user.token),
                    distributorAPI.getAll(user.token)
                ]);

                if (resProducts.success && resProducts.data) {
                    const responseData = resProducts.data.data || resProducts.data;
                    const productArray = Array.isArray(responseData) ? responseData : (responseData.data || []);
                    setApiProducts(productArray.map(p => ({
                        id: p.id ? `PRD-${p.id}` : String(p.Kode_Produk || ''),
                        name: p.Nama_produk || p.Nama_Produk || p.nama_produk || p.name || 'Tanpa Nama',
                        category: p.Kategori || p.category || p.kategori || 'Skincare',
                        price: Number(p.Harga || p.harga || p.price || 0),
                        harga_distributor: Number(p.Harga_Distributor || p.harga_distributor || p.Harga || 0),
                        stock: Number(p.Stok || p.stok || p.stock || 0),
                        image: p.image || 'https://images.unsplash.com/photo-1556228578-0d85b1af4d78?q=80&w=200&h=200&auto=format&fit=crop'
                    })));
                }

                let customers = [];
                if (resPatients.success && resPatients.data) {
                    const responseData = resPatients.data.data || resPatients.data;
                    const patientArray = Array.isArray(responseData) ? responseData : (responseData.data || []);
                    customers = [...customers, ...patientArray.map(p => {
                        const kecName = p.kec?.name || '';
                        const formattedName = kecName 
                            ? `${p.Nama_pasien || p.nama_pasien || p.name || 'Unknown Patient'} - ${kecName}` 
                            : (p.Nama_pasien || p.nama_pasien || p.name || 'Unknown Patient');
                        return {
                            id: String(p.id),
                            name: formattedName,
                            phone: p.no_Telp || p.no_telp || p.phone || '-',
                            isDistributor: false,
                            needsMemberFee: !!p.needs_member_fee,
                            isMember: p.Tipe_member === 'Member' || p.Tipe_Member === 'Member'
                        };
                    })];
                }
                
                if (resDistributors && resDistributors.success && resDistributors.data) {
                    const responseData = resDistributors.data.data || resDistributors.data;
                    const distributorArray = Array.isArray(responseData) ? responseData : (responseData.data || []);
                    customers = [...customers, ...distributorArray.map(d => ({
                        id: `DIST-${d.id}`,
                        name: `${d.Nama_Distributor} - DISTRIBUTOR`,
                        phone: d.No_Telp || d.no_telp || '-',
                        isDistributor: true
                    }))];
                }
                setApiPatients(customers);

                let treatmentsList = [];
                if (resTreatments.success && resTreatments.data) {
                    const responseData = resTreatments.data.data || resTreatments.data;
                    const treatmentArray = Array.isArray(responseData) ? responseData : (responseData.data || []);
                    treatmentsList = [...treatmentsList, ...treatmentArray.map(t => ({
                        id: t.id ? `TRT-${t.id}` : String(t.kode_treatment || ''),
                        name: t.Nama_treatment || t.Nama_Treatment || t.nama_treatment || t.name || 'Treatment Tanpa Nama',
                        category: 'Treatment',
                        price: Number(t.Harga || t.harga || t.price || 0),
                        stock: t.status === 'Non Available' ? 0 : (t.max_stok !== undefined ? Number(t.max_stok) : 99),
                        image: 'https://images.unsplash.com/photo-1570172619991-8079603683a3?q=80&w=200&h=200&auto=format&fit=crop',
                        isPackage: false
                    }))];
                }

                if (resPakets && resPakets.success && resPakets.data) {
                    const responseData = resPakets.data.data || resPakets.data;
                    const paketArray = Array.isArray(responseData) ? responseData : (responseData.data || []);
                    treatmentsList = [...treatmentsList, ...paketArray.map(p => ({
                        id: p.id ? `PTR-${p.id}` : String(p.Kode_paket || ''),
                        name: p.Nama_paket || p.name || 'Paket Tanpa Nama',
                        category: 'Treatment',
                        price: Number(p.Harga_paket || p.harga || p.price || 0),
                        stock: p.status === 'Non Available' ? 0 : (p.max_stok !== undefined ? Number(p.max_stok) : 99),
                        image: 'https://images.unsplash.com/photo-1570172619991-8079603683a3?q=80&w=200&h=200&auto=format&fit=crop',
                        isPackage: true
                    }))];
                }
                setApiTreatments(treatmentsList);

                if (resRacikans && resRacikans.success && resRacikans.data) {
                    const responseData = resRacikans.data.data || resRacikans.data;
                    const racikanArray = Array.isArray(responseData) ? responseData : (responseData.data || []);
                    
                    let savedStocks = {};
                    try {
                        const raw = localStorage.getItem('racikan_stocks');
                        if (raw) savedStocks = JSON.parse(raw);
                    } catch (e) {}

                    setApiRacikans(racikanArray.map(r => {
                        const cleanId = String(r.id);
                        const prefId = `RCK-${r.id}`;
                        let stockValue = 10; // Default fallback
                        if (savedStocks[prefId] !== undefined) stockValue = savedStocks[prefId];
                        else if (savedStocks[cleanId] !== undefined) stockValue = savedStocks[cleanId];

                        return {
                            id: prefId,
                            name: r.nama_obat_racik || r.name || 'Racikan Tanpa Nama',
                            category: 'Racikan',
                            price: Number(r.harga || r.price || 0),
                            stock: stockValue,
                            image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=200&h=200&auto=format&fit=crop'
                        };
                    }));
                }
            } catch (error) {
                console.error('[POSPage] Error loading real data:', error);
                showToast('Gagal memuat beberapa data riil dari backend.', 'error');
            } finally {
                setIsFetchingData(false);
                setIsLoading(false);
            }
        };

        loadRealData();
    }, [user]);

    // Identitas Pelanggan & Promo
    const [isMember, setIsMember] = useState(false);
    const [promoInput, setPromoInput] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [isPromoDropdownOpen, setIsPromoDropdownOpen] = useState(false);

    const SYSTEM_PROMOS = [
        { code: 'RAMADHAN50', name: 'Diskon Spesial Ramadhan', type: 'Persen', value: 10, startDate: '2026-03-01', endDate: '2026-04-30', status: 'Aktif' },
        { code: 'NEWGLOW', name: 'Potongan Treatment Glow Up', type: 'Nominal', value: 150000, startDate: '2026-03-15', endDate: '2026-04-15', status: 'Aktif' },
        { code: 'VALENTINE20', name: 'Kasih Sayang Diskon', type: 'Persen', value: 20, startDate: '2026-02-10', endDate: '2026-02-20', status: 'Berakhir' },
        { code: 'MEMBERBARU', name: 'Welcome New Member', type: 'Nominal', value: 50000, startDate: '2026-01-01', endDate: '2026-12-31', status: 'Aktif' },
        { code: 'CANTIK100', name: 'Potongan Facial 100k', type: 'Nominal', value: 100000, startDate: '2026-03-10', endDate: '2026-05-10', status: 'Aktif' },
    ];

    const getActivePromos = () => {
        const today = new Date().toISOString().split('T')[0];
        return SYSTEM_PROMOS.filter(p => p.status === 'Aktif' && today >= p.startDate && today <= p.endDate);
    };

    // Customer Selection State
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

    const categories = ['Semua', 'Obat', 'Treatment', 'Skincare', 'Racikan'];

    const activeCustomers = useMemo(() => {
        return apiPatients;
    }, [apiPatients]);

    const filteredCustomers = activeCustomers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.id.toLowerCase().includes(customerSearch.toLowerCase())
    );

    const activeProductsList = useMemo(() => {
        return apiProducts;
    }, [apiProducts]);

    const activeTreatmentsList = useMemo(() => {
        return apiTreatments;
    }, [apiTreatments]);

    const allProducts = useMemo(() => {
        return [...activeProductsList, ...activeTreatmentsList, ...apiRacikans];
    }, [activeProductsList, activeTreatmentsList, apiRacikans]);

    const filteredProducts = allProducts.filter(p => {
        if (p.category === 'Racikan' && p.stock <= 0) {
            return false;
        }
        return (activeCategory === 'Semua' || p.category === activeCategory) &&
            p.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const getProductPrice = (item) => {
        if (selectedCustomer?.isDistributor && item.harga_distributor) {
            return item.harga_distributor;
        }
        return item.price;
    };

    const addToCart = (product) => {
        if (product.stock <= 0) {
            const emptyMsg = product.category === 'Treatment'
                ? 'Bahan untuk treatment ini sedang habis di gudang!'
                : 'Stok produk ini sedang kosong!';
            showToast(emptyMsg, 'error');
            return;
        }
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    const limitMsg = product.category === 'Treatment'
                        ? `Batas maksimal sesi treatment tercapai (${product.stock} sesi) berdasarkan sisa stok bahan!`
                        : `Stok tidak mencukupi! Batas maksimal pembelian produk ini adalah ${product.stock} pcs.`;
                    showToast(limitMsg, 'error');
                    return prev;
                }
                return prev.map(item => item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                if (newQty > item.stock) {
                    const limitMsg = item.category === 'Treatment'
                        ? `Batas maksimal sesi treatment tercapai (${item.stock} sesi) berdasarkan sisa stok bahan!`
                        : `Stok tidak mencukupi! Batas maksimal pembelian produk ini adalah ${item.stock} pcs.`;
                    showToast(limitMsg, 'error');
                    return item;
                }
                return { ...item, quantity: Math.max(1, newQty) };
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const cartTotal = useMemo(() =>
        cart.reduce((sum, item) => sum + (getProductPrice(item) * item.quantity), 0)
        , [cart, selectedCustomer]);

    // Kalkulasi Harga Akhir
    const memberDiscount = selectedCustomer?.isMember ? (cartTotal * 0.05) : 0;

    const calculatePromoDiscount = () => {
        if (!appliedPromo) return 0;
        if (appliedPromo.type === 'Persen') {
            return (cartTotal - memberDiscount) * (appliedPromo.value / 100);
        }
        return appliedPromo.value;
    };
    const promoDiscount = calculatePromoDiscount();

    const tax = 0;
    const finalTotal = Math.max(0, (cartTotal - memberDiscount - promoDiscount)) + (selectedCustomer?.needsMemberFee ? 50000 : 0);

    const handleApplyPromo = (codeToApply = promoInput) => {
        if (!codeToApply.trim()) {
            setAppliedPromo(null);
            return;
        }

        const validPromos = getActivePromos();
        const found = validPromos.find(p => p.code.toUpperCase() === codeToApply.toUpperCase());

        if (found) {
            setAppliedPromo(found);
            setPromoInput(found.code);
            showToast('Promo berhasil diterapkan!', 'success');
        } else {
            showToast('Kode promo tidak valid atau belum aktif/sudah kadaluarsa', 'error');
            setAppliedPromo(null);
        }
        setIsPromoDropdownOpen(false);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            showToast('Keranjang masih kosong!', 'error');
            return;
        }
        if (!selectedCustomer) {
            showToast('Pilih customer terlebih dahulu!', 'error');
            return;
        }
        setIsProcessing(true);

        const isOnlyTreatments = cart.every(item => item.category === 'Treatment');

        const payload = {
            data_pasien_id: (selectedCustomer && !selectedCustomer.isDistributor && !String(selectedCustomer.id).startsWith('PAS-')) ? selectedCustomer.id : null,
            distributor_id: (selectedCustomer && selectedCustomer.isDistributor) ? String(selectedCustomer.id).replace('DIST-', '') : null,
            nama_pasien_distributor: selectedCustomer.name,
            is_distributor: selectedCustomer?.isDistributor || false,
            tanggal_transaksi: new Date().toISOString().split('T')[0],
            catatan_pesanan: '',
            status: isOnlyTreatments ? 'Selesai' : 'Pending',
            metode_pembayaran: paymentMethod,
            details: cart.map(item => ({
                item_type: item.category === 'Treatment' ? (item.isPackage ? 'PaketTreatment' : 'Treatment') : (item.category === 'Racikan' ? 'StokRacikan' : 'StokProduk'),
                item_id: String(item.id).replace(/[^0-9]/g, '') || 1, // Jika ID mock seperti PRD-001, ambil angkanya saja
                qty: item.quantity
            }))
        };

        const res = await transaksiAPI.create(user?.token, payload);
        
        if (res.success) {
            showToast('Transaksi Berhasil Disimpan!', 'success');
            
            // Decrement racikan stocks in localStorage
            let savedStocks = {};
            try {
                const raw = localStorage.getItem('racikan_stocks');
                if (raw) savedStocks = JSON.parse(raw);
            } catch (e) {}
            
            cart.forEach(item => {
                if (item.category === 'Racikan') {
                    const cleanId = String(item.id).replace('RCK-', '');
                    const currentStock = savedStocks[cleanId] !== undefined ? savedStocks[cleanId] : 10;
                    savedStocks[cleanId] = Math.max(0, currentStock - item.quantity);
                    savedStocks[`RCK-${cleanId}`] = savedStocks[cleanId];
                }
            });
            localStorage.setItem('racikan_stocks', JSON.stringify(savedStocks));

            setCart([]);
            setSelectedCustomer(null);
            setHasFetchedRecord(false);
            setDetectedRacikan(null);
            setRacikanSent(false);
            navigate('/sales');
        } else {
            showToast(res.message || 'Gagal menyimpan transaksi', 'error');
        }
        setIsProcessing(false);
    };

    const handleFetchMedicalRecord = async () => {
        if (!selectedCustomer) return;
        setIsFetchingRecord(true);

        try {
            if (user?.token) {
                const res = await rekamMedisAPI.getAll(user.token);
                if (res.success && res.data) {
                    const responseData = res.data.data || res.data;
                    const recordsArray = Array.isArray(responseData) ? responseData : (responseData.data || []);

                    // Filter records belonging to selected patient
                    const patientRecords = recordsArray
                        .filter(r => String(r.data_pasien_id || r.pasien_id) === String(selectedCustomer.id))
                        .sort((a, b) => {
                            const dateA = new Date(a.tanggal_kunjungan || a.tanggal || a.created_at || 0);
                            const dateB = new Date(b.tanggal_kunjungan || b.tanggal || b.created_at || 0);
                            return dateB - dateA;
                        });

                    if (patientRecords.length > 0) {
                        const latestRecord = patientRecords[0];

                        // 1. Deteksi resep racikan manual
                        const racText = latestRecord.racikan || '';
                        const isAlreadySent = antreanRacikan?.some(r => String(r.patientId) === String(selectedCustomer.id) && r.racikanText === racText && r.status === 'Pending');
                        const isProcessed = antreanRacikan?.some(r => String(r.patientId) === String(selectedCustomer.id) && r.racikanText === racText && r.status === 'Selesai');

                        if (isProcessed) {
                            // Jika sudah berstatus 'Selesai' (telah diberi harga oleh apoteker), jangan munculkan banner resep racikan lagi
                            setDetectedRacikan(null);
                            setRacikanSent(false);
                        } else if (racText.trim() !== '') {
                            setDetectedRacikan(racText);
                            setRacikanSent(isAlreadySent);
                        } else {
                            setDetectedRacikan(null);
                            setRacikanSent(false);
                        }

                        // Buat array baru untuk mengisi keranjang belanja agar sama persis dengan rekam medis
                        let newCartItems = [];

                        // 2. Tarik resep produk riil ke keranjang belanja
                        const reseps = Array.isArray(latestRecord.reseps) ? latestRecord.reseps :
                            (Array.isArray(latestRecord.produks) ? latestRecord.produks : []);

                        if (reseps.length > 0) {
                            reseps.forEach(resItem => {
                                const prodId = String(resItem.stok_produk_id || resItem.pivot?.stok_produk_id || resItem.id || resItem.Kode_Produk || resItem);
                                const matchingProd = activeProductsList.find(p => p.id === `PRD-${prodId}` || String(p.id) === prodId || String(p.Kode_Produk) === prodId);
                                if (matchingProd) {
                                    const qty = Number(resItem.jumlah || resItem.quantity || 1);
                                    const existing = newCartItems.find(item => String(item.id) === String(matchingProd.id));
                                    if (existing) {
                                        existing.quantity += qty;
                                    } else {
                                        newCartItems.push({ ...matchingProd, quantity: qty });
                                    }
                                }
                            });
                        }

                        // 3. Tarik data treatment dari rekam medis ke keranjang belanja
                        const recordTreatments = Array.isArray(latestRecord.treatments) ? latestRecord.treatments : [];

                        if (recordTreatments.length > 0) {
                            recordTreatments.forEach(trtItem => {
                                const trtId = String(trtItem.treatment_id || trtItem.pivot?.treatment_id || trtItem.id || trtItem.kode_treatment || trtItem);
                                const matchingTrt = activeTreatmentsList.find(t => t.id === `TRT-${trtId}` || String(t.id) === trtId || String(t.kode_treatment) === trtId);
                                if (matchingTrt) {
                                    const qty = Number(trtItem.jumlah || trtItem.quantity || 1);
                                    const existing = newCartItems.find(item => String(item.id) === String(matchingTrt.id));
                                    if (existing) {
                                        existing.quantity += qty;
                                    } else {
                                        newCartItems.push({ ...matchingTrt, quantity: qty });
                                    }
                                }
                            });
                        }

                        setCart(newCartItems);

                        showToast('Data Rekam Medis & Resep berhasil ditarik', 'success');
                        setHasFetchedRecord(true);
                    } else {
                        runSimulatedRecordFetch();
                    }
                } else {
                    runSimulatedRecordFetch();
                }
            } else {
                runSimulatedRecordFetch();
            }
        } catch (error) {
            console.error('[POSPage] Error fetching real medical record:', error);
            runSimulatedRecordFetch();
        } finally {
            setIsFetchingRecord(false);
        }
    };

    const runSimulatedRecordFetch = () => {
        // Mendukung pencocokan ID produk & treatment baik di mode database riil (ID integer 1, 2, 3...) maupun data mock ('PRD-001', 'TRT-001'...)
        const recordProds = activeProductsList.filter(p => p.id === 'PRD-001' || p.id === 'PRD-007' || p.id === 'PRD-1' || p.id === 'PRD-2' || p.id === 'PRD-3' || p.id === 'PRD-4');
        const recordTrts = activeTreatmentsList.filter(t => t.id === 'TRT-001' || t.id === 'TRT-002' || t.id === 'TRT-1' || t.id === 'TRT-2' || t.id === 'TRT-3' || t.id === 'TRT-4');
        const recordItems = [...recordProds, ...recordTrts];

        const newCartItems = [];
        recordItems.forEach(item => {
            const existing = newCartItems.find(c => c.id === item.id);
            if (existing) {
                existing.quantity += 1;
            } else {
                newCartItems.push({ ...item, quantity: 1 });
            }
        });
        setCart(newCartItems);

        const simRacText = "Cream Malam Retinol 0.1% + Moisturizer Oat";
        const isAlreadySent = antreanRacikan?.some(r => String(r.patientId) === String(selectedCustomer?.id) && r.racikanText === simRacText && r.status === 'Pending');
        const isProcessed = antreanRacikan?.some(r => String(r.patientId) === String(selectedCustomer?.id) && r.racikanText === simRacText && r.status === 'Selesai');

        if (isProcessed) {
            // Jika sudah diproses apoteker, banner tidak dimunculkan lagi
            setDetectedRacikan(null);
            setRacikanSent(false);
        } else {
            setDetectedRacikan(simRacText);
            setRacikanSent(isAlreadySent);
        }

        setHasFetchedRecord(true);
        showToast('Data Rekam Medis & Resep berhasil ditarik (Mode Simulasi)', 'success');
    };

    const handleSendRacikanToApotek = () => {
        if (!selectedCustomer || !detectedRacikan) return;
        addAntreanRacikan(
            selectedCustomer.id,
            selectedCustomer.name,
            'Dr. Sarah Smith',
            detectedRacikan
        );
        setRacikanSent(true);
        showToast('Berhasil mengirim resep racikan ke Apotek!', 'success');
    };

    const handleResetRacikan = () => {
        if (!selectedCustomer) return;
        resetAntreanRacikan(selectedCustomer.id);
        setRacikanSent(false);
        showToast('Antrean resep direset! Anda bisa mengirim ulang sekarang.', 'info');
    };

    return (
        <div className="flex flex-col xl:flex-row min-h-[calc(100vh-150px)] xl:h-[calc(100vh-150px)] gap-6 animate-fade-in relative z-10 pb-24 xl:pb-0">
            {/* Left Side: Stok Selection */}
            <div className="flex-1 flex flex-col bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/10 shadow-2xl shadow-primary/5 overflow-hidden min-h-0">
                <div className="p-5 md:p-8 bg-secondary/10 border-b border-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            onClick={() => navigate('/sales')}
                            className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-white text-primary/40 hover:text-primary transition-all shadow-sm hover:scale-105 active:scale-95 border border-primary/5"
                        >
                            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-primary tracking-tighter">Sistem Kasir</h2>
                            <p className="hidden sm:block text-[9px] md:text-[10px] font-bold text-primary/60 uppercase tracking-widest mt-1">Pilih Stok atau Layanan</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 md:space-y-8 scrollbar-hide bg-slate-50/50">
                    {/* Search & Categories */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Cari nama stok..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-3.5 md:py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-bold focus:ring-4 focus:ring-primary/5 transition-all text-xs md:text-sm shadow-sm"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-primary text-secondary shadow-lg shadow-primary/20 scale-105' : 'bg-white border border-primary/5 text-primary/40 hover:bg-secondary/50 hover:text-primary'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isLoading ? (
                        <TableSkeleton mode="card" rows={8} />
                    ) : (
                        /* Product Grid */
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-6">
                            {filteredProducts.map(product => {
                                const isOutOfStock = product.stock <= 0;
                                const price = getProductPrice(product);
                                const isPriceNotSet = !price || price <= 0;
                                const isUnavailable = isOutOfStock || isPriceNotSet;
                                
                                return (
                                    <button
                                        key={product.id}
                                        onClick={() => addToCart(product)}
                                        disabled={isUnavailable}
                                        className={`p-4 rounded-[2rem] bg-white border-2 border-primary/10 shadow-lg shadow-primary/10 transition-all duration-300 text-left group flex flex-col justify-between h-full ${
                                            isUnavailable 
                                                ? 'opacity-50 cursor-not-allowed border-gray-200' 
                                                : 'hover:bg-primary/5 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1'
                                        }`}
                                    >
                                        <div className="w-full">
                                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-secondary/20 flex items-center justify-center mb-4 shadow-sm relative mx-auto overflow-hidden">
                                                <span className="text-2xl md:text-3xl font-semibold text-primary tracking-tighter group-hover:scale-110 transition-transform duration-500">
                                                    {product.name.split(' ').filter(n => n).slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                                                </span>
                                                {product.category !== 'Treatment' && (
                                                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg border text-[9px] md:text-[10px] font-semibold uppercase tracking-tighter shadow-sm ${
                                                        isOutOfStock
                                                            ? 'bg-red-50 text-red-500 border-red-200'
                                                            : 'bg-white/90 text-primary border-primary/5'
                                                    }`}>
                                                        {product.stock}
                                                    </div>
                                                )}
                                            </div>
                                            <h4 className="text-sm md:text-[15px] font-semibold text-primary leading-tight mb-1 line-clamp-2 text-center">{product.name}</h4>
                                            <p className="text-[9px] md:text-[10px] font-bold text-primary/40 uppercase tracking-widest mb-3 text-center">{product.category}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-primary/5 w-full">
                                            {isPriceNotSet ? (
                                                <span className="text-[10px] md:text-[11px] font-black text-red-500 tracking-tighter leading-tight">Harga Belum Diset</span>
                                            ) : (
                                                <span className="text-xs md:text-sm font-black text-primary tracking-tighter">Rp {price.toLocaleString('id-ID')}</span>
                                            )}
                                            
                                            {isUnavailable ? (
                                                <span className="text-[8px] md:text-[9px] font-black text-red-500 uppercase tracking-widest px-2 py-1 bg-red-50 rounded-lg border border-red-100">
                                                    {isPriceNotSet ? 'Tidak Tersedia' : (product.category === 'Treatment' ? 'Tidak Tersedia' : 'Kosong')}
                                                </span>
                                            ) : (
                                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-primary flex items-center justify-center text-secondary group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                                                    <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Unified Cart & Summary (E-commerce Style) */}
            <div id="cart-section" className="w-full xl:w-[540px] bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/10 shadow-2xl shadow-primary/5 flex flex-col overflow-hidden h-fit xl:h-full">

                {/* 1. Transaction Info Section (Top - Fixed) */}
                <div className="p-4 md:p-5 bg-secondary/10 border-b border-primary/5 space-y-3.5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary relative">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-primary tracking-tighter">Ringkasan Pesanan</h3>
                    </div>

                    {/* Customer Selection */}
                    <div className="relative">
                        {selectedCustomer ? (
                            <div className="flex flex-col gap-2.5 animate-fade-in">
                                <div className="p-2.5 px-4 rounded-2xl bg-white border border-primary/10 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary text-secondary flex items-center justify-center font-black text-[9px] shrink-0">
                                            {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-primary tracking-tight leading-tight">{selectedCustomer.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setSelectedCustomer(null); setIsMember(false); setHasFetchedRecord(false); setDetectedRacikan(null); setRacikanSent(false); setCart([]); }}
                                        className="p-1.5 text-primary/20 hover:text-red-500 transition-all rounded-lg hover:bg-red-50"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {!hasFetchedRecord && !selectedCustomer.isDistributor && (
                                    <button
                                        onClick={handleFetchMedicalRecord}
                                        disabled={isFetchingRecord}
                                        className="w-full py-2.5 px-4 flex items-center justify-center gap-2 bg-secondary/10 text-primary border border-primary/10 border-dashed rounded-xl hover:bg-primary/5 hover:border-primary/20 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isFetchingRecord ? (
                                            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                                        ) : (
                                            <FileText className="w-3.5 h-3.5 text-primary/40 group-hover:text-primary transition-colors" />
                                        )}
                                        <span className="text-[8px] font-black uppercase tracking-widest">
                                            {isFetchingRecord ? 'Menarik Data...' : 'Tarik Data Rekam Medis (Opsional)'}
                                        </span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Cari customer..."
                                    value={customerSearch}
                                    onChange={(e) => { setCustomerSearch(e.target.value); setIsCustomerDropdownOpen(true); }}
                                    onFocus={() => setIsCustomerDropdownOpen(true)}
                                    className="w-full pl-11 pr-6 py-3.5 rounded-xl bg-white border border-primary/10 outline-none text-sm font-bold text-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm placeholder:text-sm placeholder:text-primary/40"
                                />
                                {isCustomerDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-primary/5 shadow-2xl z-50 overflow-hidden max-h-[160px] overflow-y-auto scrollbar-hide animate-fade-in">
                                        {filteredCustomers.length > 0 ? (
                                            filteredCustomers.map(customer => (
                                                <button
                                                    key={customer.id}
                                                    onClick={() => { setSelectedCustomer(customer); setIsCustomerDropdownOpen(false); setCustomerSearch(''); setHasFetchedRecord(false); setDetectedRacikan(null); setRacikanSent(false); }}
                                                    className="w-full p-3 text-left hover:bg-secondary/20 transition-all border-b border-primary/5 last:border-0 group"
                                                >
                                                    <p className="text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform py-1">{customer.name}</p>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-primary/30 text-[9px] font-black uppercase tracking-widest">Tidak ditemukan</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Metode Pembayaran (Sleek Segmented Inline Card) */}
                    <div className="flex items-center justify-between bg-white border border-primary/10 rounded-2xl p-1.5 shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-2.5">Metode</span>
                        <div className="flex bg-secondary/35 rounded-xl p-0.5 shrink-0">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('Tunai')}
                                className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                    paymentMethod === 'Tunai'
                                        ? 'bg-primary text-secondary shadow-sm'
                                        : 'text-primary/60 hover:text-primary'
                                }`}
                            >
                                <Banknote className="w-3.5 h-3.5" />
                                Tunai
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('Non Tunai')}
                                className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                    paymentMethod === 'Non Tunai'
                                        ? 'bg-primary text-secondary shadow-sm'
                                        : 'text-primary/60 hover:text-primary'
                                }`}
                            >
                                <CreditCard className="w-3.5 h-3.5" />
                                Non Tunai
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Cart Items (Middle - Scrollable) */}
                <div className="flex-1 overflow-y-auto min-h-0 p-5 space-y-4 scrollbar-hide bg-secondary/5 shadow-inner">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-[9px] font-black text-primary/30 uppercase tracking-[0.2em]">Item Terpilih ({cart.length})</p>
                        {cart.length > 0 && (
                            <button onClick={() => setCart([])} className="text-[8px] font-black text-primary/30 hover:text-red-500 uppercase tracking-widest transition-all">Kosongkan</button>
                        )}
                    </div>
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-12">
                            <Package className="w-12 h-12 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Keranjang Kosong</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="p-3.5 rounded-3xl bg-white border border-primary/5 shadow-sm animate-fade-in flex flex-col gap-2 group hover:border-primary/20 transition-all">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-[10px] font-semibold text-primary tracking-tight leading-tight uppercase flex-1 line-clamp-1">{item.name}</h4>
                                    <button onClick={() => removeFromCart(item.id)} className="p-1 text-primary/20 hover:text-red-500 transition-all">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2.5 bg-secondary/30 rounded-xl px-2 py-0.5">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-0.5 hover:bg-white rounded transition-all"><Minus className="w-2.5 h-2.5 text-primary/40" /></button>
                                        <span className="text-[9px] font-black text-primary">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-0.5 hover:bg-white rounded transition-all"><Plus className="w-2.5 h-2.5 text-primary/40" /></button>
                                    </div>
                                    <span className="text-[11px] font-black text-primary tracking-tighter">Rp {(getProductPrice(item) * item.quantity).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 3. Totals & Checkout (Bottom - Fixed) */}
                <div className="p-4 md:p-5 bg-white border-t border-primary/5 space-y-4 shrink-0">
                    <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-primary/40 font-bold text-[9px] uppercase tracking-widest px-1">
                            <span>Subtotal</span>
                            <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                        </div>
                        {selectedCustomer?.needsMemberFee && (
                            <div className="flex justify-between text-primary/40 font-bold text-[9px] uppercase tracking-widest px-1">
                                <span>Biaya Pendaftaran Member</span>
                                <span>Rp 50.000</span>
                            </div>
                        )}
                        {memberDiscount > 0 && (
                            <div className="flex justify-between text-green-500 font-bold text-[9px] uppercase tracking-widest px-1">
                                <span>Diskon Member (5%)</span>
                                <span>- Rp {memberDiscount.toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        {appliedPromo && (
                            <div className="flex justify-between text-green-500 font-bold text-[9px] uppercase tracking-widest px-1">
                                <span>Promo ({appliedPromo.code})</span>
                                <span>- Rp {promoDiscount.toLocaleString('id-ID')}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-3 border-t border-primary/5 mt-2">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Total Tagihan</span>
                            <span className="text-2xl font-black text-primary tracking-tighter">Rp {finalTotal.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <button
                        disabled={cart.length === 0 || isProcessing}
                        onClick={handleCheckout}
                        className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 relative overflow-hidden group ${cart.length === 0 ? 'bg-primary/5 text-primary/10 pointer-events-none' : 'bg-primary text-secondary hover:scale-[1.02] active:scale-95 shadow-primary/20 hover:shadow-primary/40'}`}
                    >
                        <div className="relative z-10 flex items-center justify-center gap-3">
                            {isProcessing ? (
                                <div className="w-5 h-5 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>Proses Transaksi</span>
                                </>
                            )}
                        </div>
                        <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-full transition-all duration-1000" />
                    </button>
                </div>
            </div>

            {/* Modal Popup: Notifikasi Resep Racikan (Fullscreen Portal) */}
            {hasFetchedRecord && detectedRacikan && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
                    {/* Exact Backdrop Match with ConfirmModal */}
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                        onClick={() => setDetectedRacikan(null)}
                    />
                    
                    <div className="bg-white rounded-[2rem] w-full max-w-sm flex flex-col overflow-hidden shadow-2xl animate-scale-up relative z-10">
                        {/* Header: Dark Green */}
                        <div className="bg-[#0A2E1F] pt-12 pb-10 flex justify-center items-center relative">
                            {/* Circle with Icon */}
                            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border-4 border-[#0A2E1F] relative z-10">
                                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-7 h-7 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Content: White */}
                        <div className="px-6 py-8 flex flex-col items-center text-center">
                            <h3 className="text-xl font-bold text-[#0A2E1F] tracking-tight mb-2">Resep Racikan Ditemukan</h3>
                            <p className="text-[13px] text-gray-500 font-medium mb-8">"{detectedRacikan}"</p>
                            
                            {racikanSent ? (
                                <div className="flex flex-col w-full gap-3">
                                    <div className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#27AE60] bg-[#E8F8F5] border border-[#A9DFBF] text-center">
                                        Terkirim ke Apotek ✔
                                    </div>
                                    <div className="flex w-full gap-3 mt-1">
                                        <button 
                                            onClick={() => setDetectedRacikan(null)}
                                            className="flex-1 py-3.5 bg-gray-50 text-[#0A2E1F] font-bold rounded-2xl hover:bg-gray-100 transition-colors text-xs"
                                        >
                                            TUTUP
                                        </button>
                                        <button 
                                            onClick={handleResetRacikan}
                                            className="flex-1 py-3.5 border border-red-100 text-red-500 font-bold rounded-2xl hover:bg-red-50 transition-colors text-xs"
                                        >
                                            RESET
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex w-full gap-3">
                                    <button 
                                        onClick={() => setDetectedRacikan(null)}
                                        className="flex-1 py-3.5 bg-gray-50 text-[#0A2E1F] font-bold rounded-2xl hover:bg-gray-100 transition-colors text-xs"
                                    >
                                        BATAL
                                    </button>
                                    <button 
                                        onClick={handleSendRacikanToApotek}
                                        className="flex-1 py-3.5 bg-[#0A2E1F] text-white font-bold rounded-2xl hover:bg-[#061c13] transition-colors text-xs shadow-lg shadow-[#0A2E1F]/20"
                                    >
                                        KIRIM APOTEK
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Floating Cart Button for Mobile */}
            {createPortal(
                <div className="fixed bottom-6 right-6 xl:hidden z-[9000]">
                    <button
                        onClick={() => {
                            const cartSection = document.getElementById('cart-section');
                            if (cartSection) {
                                cartSection.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                        className="w-14 h-14 bg-primary text-secondary rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-105 active:scale-95 transition-all relative"
                    >
                        <ShoppingCart className="w-6 h-6" />
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                {cart.length}
                            </span>
                        )}
                    </button>
                </div>,
                document.body
            )}
        </div>
    );
};

export default POSPage;
