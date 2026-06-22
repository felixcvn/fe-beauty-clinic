import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit3, AlertTriangle, Package, Activity, Inbox, ChevronDown, Beaker, Tag, Download } from 'lucide-react';
import { useMockData } from '../../context/MockDataContext';
import { useToast } from '../../context/ToastContext';
import WarehouseFormModal from '../../components/UI/WarehouseFormModal';
import TableSkeleton from '../../components/UI/TableSkeleton';
import EmptyState from '../../components/UI/EmptyState';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rbac';
import ConfirmModal from '../../components/UI/ConfirmModal';
import { stokProdukAPI, paketBundlingsAPI, treatmentAPI, bahanTreatmentAPI, paketTreatmentAPI } from '../../services/api';
import { exportToExcel } from '../../utils/excelExport';
import Pagination from '../../components/UI/Pagination';


/**
 * Halaman utama untuk manajemen stok barang (produk), layanan treatment,
 * obat racikan, dan bahan medis. Mendukung pencarian, filter kategori, 
 * pagination, serta operasi CRUD (Tambah, Edit, Hapus).
 */
const ItemManagementPage = ({ fixedFilter, fixedTitle }) => {
    const { user } = useAuth();
    // Mengecek apakah user memiliki akses hanya baca (CS)
    const isViewOnly = user?.role === ROLES.CS;

    // Mengambil data mock untuk kategori selain produk yang belum terintegrasi API penuh
    const {
        treatments, addTreatment, updateTreatment, deleteTreatment,
        racikans, addRacikan, updateRacikan, deleteRacikan,
        materials, addMaterial, updateMaterial, deleteMaterial,
        promos
    } = useMockData();
    const { showToast } = useToast();

    // State untuk filter aktif: 'all', 'product', 'treatment', 'racikan', 'material'
    const [activeFilter, setActiveFilter] = useState(fixedFilter || (user?.role === ROLES.GUDANG_UMUM ? 'product' : 'all'));


    useEffect(() => {
        if (fixedFilter) {
            setActiveFilter(fixedFilter);
        } else if (user?.role === ROLES.GUDANG_UMUM) {
            setActiveFilter('product');
        }
    }, [fixedFilter, user?.role]);

    // UI states
    // State untuk kontrol UI dan manajemen data produk dari API
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [modalType, setModalType] = useState('product'); // Menentukan jenis form (produk, treatment, dll)
    const [confirmConfig, setConfirmConfig] = useState(null); // Konfigurasi untuk modal konfirmasi
    const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
    const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
    const [products, setProducts] = useState([]); // Data produk yang diambil dari backend
    const [apiTreatments, setApiTreatments] = useState([]); // Data treatment dari backend
    const [apiMaterials, setApiMaterials] = useState([]); // Data bahan dari backend

    /**
     * Mengambil daftar produk dan treatment dari server
     * dan memetakan datanya ke format yang digunakan di UI.
     */
    const fetchProducts = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        try {
            // Fetch dari kelima endpoint secara paralel
            const [stokRes, bundleRes, treatmentRes, paketRes, bahanRes] = await Promise.all([
                stokProdukAPI.getAll(token),
                paketBundlingsAPI.getAll(token),
                treatmentAPI.getAll(token),
                paketTreatmentAPI.getAll(token),
                bahanTreatmentAPI.getAll(token)
            ]);

            let allProducts = [];
            let allTreatments = [];
            let allMaterials = [];

            // Map data stok-produk
            if (stokRes.success) {
                const rawData = stokRes.data?.data || stokRes.data || [];
                const mappedStok = (Array.isArray(rawData) ? rawData : []).map(item => ({
                    uid: item.id,
                    id: item.Kode_Produk,
                    name: item.Nama_produk,
                    category: item.Kategori || 'Lainnya',
                    price: Number(item.Harga || item.harga || 0),
                    priceDistributor: Number(item.Harga_Distributor || item.harga_distributor || 0),
                    stock: Number(item.Stok || item.stok || 0),
                    minStock: Number(item.Batas_minimal_stok || item.batas_minimal_stok || 0),
                    isPackage: false,
                    description: item.Deskripsi || item.description || ''
                }));
                allProducts = [...allProducts, ...mappedStok];
            }

            // Map data paket-bundling
            if (bundleRes.success) {
                const rawBundleData = bundleRes.data?.data || bundleRes.data || [];
                const mappedBundles = (Array.isArray(rawBundleData) ? rawBundleData : []).map(item => ({
                    uid: item.id,
                    id: item.Kode_paket,
                    name: item.Nama_paket,
                    category: 'Paket',
                    price: Number(item.Harga_paket || 0),
                    priceDistributor: Number(item.Harga_Distributor_paket || 0),
                    stock: 0,
                    minStock: 0,
                    isPackage: true,
                    description: item.Deskripsi || '',
                    package_items: Array.isArray(item.produks) ? item.produks.map(p => ({
                        id: Number(p.stok_produk_id || p.id),
                        quantity: Number(p.pivot?.Jumlah || p.Jumlah || 0)
                    })) : []
                }));
                allProducts = [...allProducts, ...mappedBundles];
            }

            setProducts(allProducts);

            // Map data treatment
            if (treatmentRes.success) {
                const rawTreatmentData = treatmentRes.data?.data || treatmentRes.data || [];
                const mappedTreatments = (Array.isArray(rawTreatmentData) ? rawTreatmentData : []).map(item => ({
                    uid: item.id,
                    id: item.Kode_treatment || item.kode_treatment || item.id,
                    name: item.Nama_treatment || item.nama_treatment || item.name,
                    category: item.Kategori || item.kategori || item.category || 'Treatment',
                    price: Number(item.Harga || item.harga || item.price || 0),
                    isPackage: false,
                    packageCount: 0,
                    bahan_ids: item.bahan ? item.bahan.map(b => b.bahan_id) : (item.bahan_ids || []),
                    bahan_items: item.bahan ? item.bahan.map(b => ({ id: b.bahan_id, quantity: Number(b.Jumlah || 1) })) : [],
                    package_treatment_ids: []
                }));
                allTreatments = [...allTreatments, ...mappedTreatments];
            }

            // Map data paket treatment
            if (paketRes.success) {
                const rawPaketData = paketRes.data?.data || paketRes.data || [];
                const mappedPaket = (Array.isArray(rawPaketData) ? rawPaketData : []).map(item => ({
                    uid: item.id,
                    id: item.Kode_paket || item.id,
                    name: item.Nama_paket || '',
                    category: 'Treatment',
                    price: Number(item.Harga_paket || 0),
                    isPackage: true,
                    packageCount: Array.isArray(item.treatments) ? item.treatments.length : 0,
                    bahan_ids: [],
                    bahan_items: [],
                    package_treatment_ids: Array.isArray(item.treatments) ? item.treatments.map(t => t.id) : [],
                    description: item.Deskripsi || ''
                }));
                allTreatments = [...allTreatments, ...mappedPaket];
            }
            
            setApiTreatments(allTreatments);

            // Map data bahan
            if (bahanRes.success) {
                const rawBahanData = bahanRes.data?.data || bahanRes.data || [];
                const mappedBahan = (Array.isArray(rawBahanData) ? rawBahanData : []).map(item => ({
                    uid: item.id,
                    id: item.Kode_Produk || item.kode_bahan || item.id,
                    name: item.Nama_produk || item.nama_bahan || item.name,
                    category: item.Kategori || item.kategori || item.category || 'Bahan',
                    price: Number(item.Harga || item.harga || item.price || 0),
                    stock: Number(item.Stok || item.stok || item.stock || 0),
                    minStock: Number(item.Batas_minimal_stok || item.batas_minimal_stok || item.minStock || 0),
                    unit: item.satuan || ''
                }));
                allMaterials = mappedBahan;
            }
            
            setApiMaterials(allMaterials);

            if (!stokRes.success && !bundleRes.success && !treatmentRes.success && !paketRes.success && !bahanRes.success) {
                showToast('Gagal memuat data dari server', 'error');
            }
        } catch (error) {
            console.error('[Inventory] Fetch error:', error);
            showToast('Terjadi kesalahan saat memuat data', 'error');
        }
        
        setIsLoading(false);
    };


    useEffect(() => {
        fetchProducts();
    }, []);







    // Menggabungkan semua data dari berbagai kategori menjadi satu array untuk pencarian/filter global
    const allItems = [
        ...products.map(p => ({ ...p, _type: 'product' })),
        ...apiTreatments.map(t => ({ ...t, _type: 'treatment' })),
        ...racikans.map(r => ({ ...r, _type: 'racikan' })),
        ...apiMaterials.map(m => ({ ...m, _type: 'material' }))
    ];

    // Filter berdasarkan kategori (activeFilter) dan kata kunci pencarian (searchTerm)
    const currentData = activeFilter === 'all' ? allItems : allItems.filter(item => item._type === activeFilter);
    const filteredData = currentData.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = async (exportType) => {
        const dataToExport = exportType === 'all' ? allItems : filteredData;
        const filename = exportType === 'all' ? 'semua_stok' : 'stok_terfilter';
        const title = exportType === 'all' ? 'Laporan Semua Stok' : 'Laporan Stok Terfilter';
        
        setIsExportDropdownOpen(false);
        showToast('Menyiapkan file Excel...', 'info');
        
        try {
            await exportToExcel(dataToExport, title, filename);
            showToast('Data berhasil diekspor ke Excel', 'success');
        } catch (error) {
            console.error('Export error:', error);
            showToast('Gagal mengekspor data', 'error');
        }
    };


    // Logika Pagination untuk membagi data ke beberapa halaman
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reset ke halaman pertama jika filter atau kata kunci pencarian berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeFilter]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };


    const toggleFilter = (type) => {
        if (activeFilter === type) {
            setActiveFilter('all');
        } else {
            setActiveFilter(type);
        }
    };

    /**
     * Menangani proses penyimpanan data (Tambah baru atau Update)
     * Menampilkan modal konfirmasi sebelum melakukan aksi API/Global State.
     */
    const handleSave = (data) => {
        const isEdit = !!(editingItem && editingItem.uid);

        setConfirmConfig({
            icon: 'save',
            header: isEdit ? 'Konfirmasi Simpan' : 'Konfirmasi Tambah',
            message: isEdit ?
                `Simpan perubahan untuk ${data.name}?` :
                `Tambahkan ${data.name} ke daftar ${modalType === 'product' ? 'stok' : modalType}?`,
            acceptLabel: isEdit ? 'Ya, Simpan' : 'Ya, Tambahkan',
            onAccept: async () => {
                if (modalType === 'product') {
                    const token = localStorage.getItem('token');
                    if (isEdit) {
                        // Aksi update produk ke API
                        const res = await stokProdukAPI.update(token, data.uid, data);
                        if (res.success) {
                            showToast('Stok berhasil diperbarui', 'success');
                            fetchProducts();
                        } else {
                            showToast(res.message || 'Gagal memperbarui stok', 'error');
                        }
                    } else {
                        // Aksi tambah produk baru ke API
                        const res = await stokProdukAPI.create(token, data);
                        if (res.success) {
                            showToast('Stok berhasil ditambahkan', 'success');
                            fetchProducts();
                        } else {
                            showToast(res.message || 'Gagal menambah stok', 'error');
                        }
                    }
                } else if (modalType === 'treatment') {
                    const token = localStorage.getItem('token');
                    if (isEdit) {
                        const res = await treatmentAPI.update(token, data.uid, data);
                        if (res.success) {
                            showToast('Treatment berhasil diperbarui', 'success');
                            fetchProducts();
                        } else {
                            showToast(res.message || 'Gagal memperbarui treatment', 'error');
                        }
                    } else {
                        const res = await treatmentAPI.create(token, data);
                        if (res.success) {
                            showToast('Treatment berhasil ditambahkan', 'success');
                            fetchProducts();
                        } else {
                            showToast(res.message || 'Gagal menambah treatment', 'error');
                        }
                    }
                } else if (modalType === 'racikan') {
                    // Update atau Tambah Racikan di Mock Data
                    if (isEdit) {
                        updateRacikan(data);
                        showToast('Racikan berhasil diperbarui', 'success');
                    } else {
                        addRacikan(data);
                        showToast('Racikan berhasil ditambahkan', 'success');
                    }
                } else if (modalType === 'material') {
                    // Update atau Tambah Bahan Medis di Mock Data
                    if (isEdit) {
                        updateMaterial(data);
                        showToast('Bahan berhasil diperbarui', 'success');
                    } else {
                        addMaterial(data);
                        showToast('Bahan berhasil ditambahkan', 'success');
                    }
                }
                setIsModalOpen(false);
                setEditingItem(null);
            }
        });
    };


    /**
     * Menangani penghapusan item berdasarkan tipe (Product via API, lainnya via Mock)
     */
    const handleDelete = (item) => {
        setConfirmConfig({
            icon: 'delete',
            header: 'Hapus Item?',
            message: `Yakin ingin menghapus ${item.name}?`,
            acceptLabel: 'Ya, Hapus',
            onAccept: async () => {
                if (item._type === 'product') {
                    const token = localStorage.getItem('token');
                    const res = await stokProdukAPI.delete(token, item.uid, item.isPackage);
                    if (res.success) {
                        showToast('Stok berhasil dihapus', 'success');
                        fetchProducts();
                    } else {
                        showToast(res.message || 'Gagal menghapus stok', 'error');
                    }
                } else if (item._type === 'treatment') {
                    const token = localStorage.getItem('token');
                    const res = await treatmentAPI.delete(token, item.uid, item.isPackage);
                    if (res.success) {
                        showToast('Treatment berhasil dihapus', 'success');
                        fetchProducts();
                    } else {
                        showToast(res.message || 'Gagal menghapus treatment', 'error');
                    }
                } else if (item._type === 'racikan') {
                    deleteRacikan(item.id);
                    showToast('Racikan berhasil dihapus', 'success');
                } else if (item._type === 'material') {
                    deleteMaterial(item.id);
                    showToast('Bahan berhasil dihapus', 'success');
                }
            }
        });
    };



    const openAddModal = (type) => {
        setModalType(type);
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setModalType(item._type);
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const openDeleteConfirm = (item) => {
        handleDelete(item);
    };


    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12 px-4 md:px-0">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div className="w-full lg:w-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">{fixedTitle || "Stok"}</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm tracking-tight">{fixedTitle ? `Lihat daftar ${fixedTitle.toLowerCase()}` : "Kelola stok dan layanan treatment klinik"}</p>
                </div>

                <div className="w-full lg:w-auto relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Export Button */}
                    <div className="relative w-full sm:w-auto z-[85]">
                        <button
                            onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-primary/10 text-primary px-6 py-4 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isExportDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-full sm:w-56 bg-white rounded-2xl shadow-xl border border-primary/5 py-2 z-[90] animate-fade-in-up origin-top-right overflow-hidden">
                                <button
                                    onClick={() => handleExport('all')}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors text-left text-xs font-bold text-primary"
                                >
                                    <span>Semua Data</span>
                                </button>
                                <button
                                    onClick={() => handleExport('filtered')}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors text-left text-xs font-bold text-primary"
                                >
                                    <span>Data Terfilter</span>
                                </button>
                            </div>
                        )}
                        {isExportDropdownOpen && (
                            <div
                                className="fixed inset-0 z-[80]"
                                onClick={() => setIsExportDropdownOpen(false)}
                            />
                        )}
                    </div>

                    {!isViewOnly && user?.role !== ROLES.MANAJER_MARKETING_SALES && (
                        <>
                            {/* Gudang Umum: langsung buka modal tambah stok, tanpa dropdown */}
                            {user?.role === ROLES.GUDANG_UMUM ? (
                                <button
                                    onClick={() => openAddModal('product')}
                                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-secondary px-10 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah Stok</span>
                                </button>
                            ) : (user?.role === ROLES.SUPERVISOR_TREATMENT || user?.role === ROLES.SUPER_ADMIN) && fixedFilter === 'treatment' ? (
                                <button
                                    onClick={() => openAddModal('treatment')}
                                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-secondary px-10 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah Treatment</span>
                                </button>
                            ) : (
                                <>
                                    {/* Role lain: dropdown dengan semua pilihan */}
                                    <button
                                        onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
                                        className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-secondary px-10 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Tambah Item</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isAddDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isAddDropdownOpen && (
                                        <div className="absolute top-full right-0 mt-3 w-full sm:w-64 bg-white rounded-3xl shadow-2xl border border-primary/5 py-3 z-[80] animate-fade-in-up origin-top-right overflow-hidden">
                                            <button
                                                onClick={() => { openAddModal('product'); setIsAddDropdownOpen(false); }}
                                                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-primary/[0.04] transition-colors text-left group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-primary uppercase tracking-widest">Stok</p>
                                                    <p className="text-[10px] font-bold text-primary/40 leading-none mt-1">Skincare</p>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => { openAddModal('treatment'); setIsAddDropdownOpen(false); }}
                                                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-primary/[0.04] transition-colors text-left group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Activity className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-primary uppercase tracking-widest">Treatment</p>
                                                    <p className="text-[10px] font-bold text-primary/40 leading-none mt-1">Layanan Klinik</p>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => { openAddModal('racikan'); setIsAddDropdownOpen(false); }}
                                                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-primary/[0.04] transition-colors text-left group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Activity className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-primary uppercase tracking-widest">Racikan</p>
                                                    <p className="text-[10px] font-bold text-primary/40 leading-none mt-1">Obat Racikan</p>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => { openAddModal('material'); setIsAddDropdownOpen(false); }}
                                                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-primary/[0.04] transition-colors text-left group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Beaker className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-primary uppercase tracking-widest">Bahan</p>
                                                    <p className="text-[10px] font-bold text-primary/40 leading-none mt-1">Bahan Treatment</p>
                                                </div>
                                            </button>
                                        </div>
                                    )}

                                    {/* Backdrop for click away */}
                                    {isAddDropdownOpen && (
                                        <div
                                            className="fixed inset-0 z-[75]"
                                            onClick={() => setIsAddDropdownOpen(false)}
                                        />
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>

            </div>

            {/* Controls (Filters & Search) */}
            <div className="bg-white rounded-[2rem] border border-primary/5 shadow-2xl shadow-primary/5 p-4 md:p-6 flex flex-col items-stretch gap-6">

                {/* Pill Filters — hidden for Gudang Umum (only shows products) */}
                {!fixedFilter && user?.role !== ROLES.GUDANG_UMUM && (
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`flex items-center justify-center px-5 py-2.5 rounded-full border transition-all duration-300 ${activeFilter === 'all' ? 'bg-primary border-primary text-secondary shadow-lg shadow-primary/20 scale-105' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                        >
                            <span className="text-xs font-black uppercase tracking-widest">Semua Item</span>
                        </button>

                        <button
                            onClick={() => toggleFilter('product')}
                            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 ${activeFilter === 'product' ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105' : 'bg-blue-50/50 border-blue-100 text-blue-600 hover:bg-blue-50'}`}
                        >
                            <Package className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">Stok</span>
                        </button>

                        <button
                            onClick={() => toggleFilter('treatment')}
                            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 ${activeFilter === 'treatment' ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20 scale-105' : 'bg-green-50/50 border-green-100 text-green-600 hover:bg-green-50'}`}
                        >
                            <Activity className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">Treatment</span>
                        </button>
                        <button
                            onClick={() => toggleFilter('racikan')}
                            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 ${activeFilter === 'racikan' ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/20 scale-105' : 'bg-purple-50/50 border-purple-100 text-purple-600 hover:bg-purple-50'}`}
                        >
                            <Activity className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">Racikan</span>
                        </button>
                        <button
                            onClick={() => toggleFilter('material')}
                            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 ${activeFilter === 'material' ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20 scale-105' : 'bg-orange-50/50 border-orange-100 text-orange-600 hover:bg-orange-50'}`}
                        >
                            <Beaker className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">Bahan</span>
                        </button>
                    </div>
                )}

                {/* Search */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Cari item berdasarkan nama atau ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-gray-50 border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                </div>
            </div>

            {/* Data Table / List */}
            <div className="bg-white rounded-[2rem] md:rounded-[1rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                {isLoading ? (
                    <TableSkeleton rows={8} columns={(activeFilter === 'treatment' || fixedFilter === 'treatment') ? 6 : 6} />
                ) : (
                    <>
                        {/* Desktop View Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                {(activeFilter === 'treatment' || fixedFilter === 'treatment') ? (
                                    <>
                                        <thead>
                                            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5 bg-gray-50/30">
                                                <th className="px-4 py-2 text-primary/80">Kode</th>
                                                <th className="px-4 py-2 text-primary/80">Paket</th>
                                                <th className="px-4 py-2 text-primary/80">Nama</th>
                                                <th className="px-4 py-2 text-primary/80">Jml Paket</th>
                                                <th className="px-4 py-2 text-primary/80">Biaya</th>
                                                {!isViewOnly && <th className="px-4 py-2 text-right text-primary/80">Aksi</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-primary/5">
                                            {currentItems.map((item) => (
                                                <tr key={`${item._type}-${item.id}`} className="group hover:bg-primary/[0.02] transition-colors">
                                                    <td className="px-4 py-1 font-medium text-xs text-primary/80">{item.id}</td>
                                                    <td className="px-4 py-1">
                                                        {item.isPackage && (
                                                            <span className="flex items-center gap-1.5 text-green-600 font-bold text-[10px] uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-md w-max">
                                                                <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                                Paket
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-1 text-sm font-medium text-primary tracking-tight">
                                                        <div>{item.name}</div>
                                                        {item.isPackage && item.package_treatment_ids && (
                                                            <div className="text-[10px] text-primary/40 font-bold mt-1 flex flex-wrap gap-1">
                                                                {item.package_treatment_ids.map((tid, idx) => {
                                                                    const tName = apiTreatments.find(t => t.uid === tid)?.name || tid;
                                                                    return (
                                                                        <span key={tid} className="bg-primary/5 px-1.5 py-0.5 rounded">
                                                                            {tName}{idx < item.package_treatment_ids.length - 1 ? ',' : ''}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-1 text-sm font-medium text-primary">{item.packageCount || '-'} Sesi</td>
                                                    <td className="px-4 py-1">
                                                        <span className="text-primary font-medium text-sm">
                                                            {item.price ? `Rp ${item.price.toLocaleString('id-ID')}` : '-'}
                                                        </span>
                                                    </td>
                                                    {!isViewOnly && (
                                                        <td className="px-4 py-1 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => openEditModal(item)} className="p-2 rounded-xl bg-white border border-primary/10 text-primary/50 hover:text-primary hover:border-primary/20 hover:shadow-md transition-all active:scale-95" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                                                                {user?.role !== ROLES.GUDANG_UMUM && user?.role !== ROLES.MANAJER_MARKETING_SALES && (
                                                                    <button onClick={() => openDeleteConfirm(item)} className="p-2 rounded-xl bg-red-50 border border-red-100 text-red-400 hover:text-red-500 hover:bg-red-100 hover:shadow-md transition-all active:scale-95" title="Hapus"><Trash2 className="w-3.5 h-3.5" /></button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                            {filteredData.length === 0 && (
                                                <tr>
                                                    <td colSpan={10}>
                                                        <EmptyState
                                                            type="data"
                                                            title="Treatment Tidak Ditemukan"
                                                            description="Sistem tidak menemukan layanan treatment yang sesuai dengan pencarian Anda."
                                                        />
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </>
                                ) : (
                                    <>
                                        <thead>
                                            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5 bg-gray-50/30">
                                                <th className="px-4 py-2 text-primary/80">Kode</th>
                                                <th className="px-4 py-2 text-primary/80">Nama</th>
                                                <th className="px-4 py-2 text-primary/80">Kategori</th>
                                                <th className="px-4 py-2 text-primary/80">Tipe</th>
                                                {user?.role === ROLES.MANAJER_MARKETING_SALES ? (
                                                    <>
                                                        <th className="px-4 py-2 text-primary/80">Harga Normal</th>
                                                        <th className="px-4 py-2 text-primary/80">Harga Distributor</th>
                                                    </>
                                                ) : user?.role !== ROLES.GUDANG_UMUM && (
                                                    <th className="px-4 py-2 text-primary/80">Harga</th>
                                                )}
                                                <th className="px-4 py-2 text-primary/80">Stok</th>
                                                {!isViewOnly && <th className="px-4 py-2 text-right text-primary/80">Aksi</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-primary/5">
                                            {currentItems.map((item) => (
                                                <tr key={`${item._type}-${item.id}`} className="group hover:bg-primary/[0.02] transition-colors">
                                                    <td className="px-4 py-1 font-medium text-xs text-primary/80">{item.id}</td>
                                                     <td className="px-4 py-1 text-sm font-medium text-primary tracking-tight">
                                                         <div className="flex items-center gap-2 mb-1">
                                                             <span>{item.name}</span>
                                                         </div>
                                                     </td>
                                                    <td className="px-4 py-1 text-sm font-medium text-primary/80">{item.category}</td>
                                                    <td className="px-4 py-1">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest ${
                                                            item.isPackage 
                                                                ? 'text-blue-600 bg-blue-50' 
                                                                : 'text-green-600 bg-green-50'
                                                        }`}>
                                                            {item.isPackage ? 'Paket' : 'Produk'}
                                                        </span>
                                                    </td>
                                                    {user?.role === ROLES.MANAJER_MARKETING_SALES ? (
                                                        <>
                                                            <td className="px-4 py-1">
                                                                {item.price === 0 ? (
                                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md uppercase tracking-widest w-max italic">
                                                                        <Tag className="w-3 h-3" /> Produk Baru
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-primary font-medium text-sm">
                                                                        Rp {item.price.toLocaleString('id-ID')}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-1">
                                                                {item.priceDistributor === 0 ? (
                                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md uppercase tracking-widest w-max italic">
                                                                        <Tag className="w-3 h-3" /> Belum di Set
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-primary font-medium text-sm">
                                                                        Rp {item.priceDistributor.toLocaleString('id-ID')}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </>
                                                    ) : user?.role !== ROLES.GUDANG_UMUM && (
                                                        <td className="px-4 py-1">
                                                            <span className="text-primary font-medium text-sm">
                                                                Rp {item.price.toLocaleString('id-ID')}
                                                            </span>
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-1">
                                                        {item._type === 'product' || item._type === 'racikan' || item._type === 'material' ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className={`font-medium text-sm ${(!item.isPackage && item.stock <= (item.minStock || 5)) ? 'text-red-500' : 'text-primary'}`}>
                                                                    {item.isPackage ? '-' : item.stock}
                                                                </span>
                                                                {!item.isPackage && item.stock <= (item.minStock || 5) && (
                                                                    <span className="flex items-center gap-1 text-[10px] font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-md uppercase tracking-widest">
                                                                        <AlertTriangle className="w-3 h-3" /> Low
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="font-medium text-xl text-primary/20">-</span>
                                                        )}
                                                    </td>
                                                    {!isViewOnly && (
                                                        <td className="px-4 py-1 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => openEditModal(item)} className="p-2 rounded-xl bg-white border border-primary/10 text-primary/50 hover:text-primary hover:border-primary/20 hover:shadow-md transition-all active:scale-95" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                                                                {user?.role !== ROLES.GUDANG_UMUM && user?.role !== ROLES.MANAJER_MARKETING_SALES && (
                                                                    <button onClick={() => openDeleteConfirm(item)} className="p-2 rounded-xl bg-red-50 border border-red-100 text-red-400 hover:text-red-500 hover:bg-red-100 hover:shadow-md transition-all active:scale-95" title="Hapus"><Trash2 className="w-3.5 h-3.5" /></button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                            {filteredData.length === 0 && (
                                                <tr>
                                                    <td colSpan={10}>
                                                        <EmptyState
                                                            type="data"
                                                            title={`${fixedTitle || 'Data'} Tidak Ditemukan`}
                                                            description={`Sistem tidak menemukan ${fixedTitle?.toLowerCase() || 'data'} yang sesuai dengan kriteria pencarian Anda.`}
                                                        />
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </>
                                )}
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden divide-y divide-primary/5">
                            {currentItems.map((item) => (activeFilter === 'treatment' || fixedFilter === 'treatment') ? (
                                <div key={`${item._type}-${item.id}`} className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-sm font-black text-primary tracking-tight uppercase leading-tight mb-2">{item.name}</h4>
                                            {item.isPackage && item.package_treatment_ids && (
                                                <div className="text-[9px] text-primary/40 font-bold mb-3 flex flex-wrap gap-1">
                                                    {item.package_treatment_ids.map((tid) => {
                                                        const tName = apiTreatments.find(t => t.uid === tid)?.name || tid;
                                                        return <span key={tid} className="bg-primary/5 px-1 rounded">{tName}</span>;
                                                    })}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-md">{item.id}</span>
                                                {item.isPackage && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md">
                                                        <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                        Paket
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex bg-white rounded-xl border border-gray-100 divide-x divide-gray-100 overflow-hidden shadow-sm">
                                        <div className="flex-1 p-3">
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Jml Sesi</p>
                                            <p className="text-xs font-black text-gray-700">{item.packageCount || '-'} Sesi</p>
                                        </div>
                                        <div className="flex-1 p-3">
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Biaya</p>
                                            <p className="text-xs font-black text-gray-700">{item.price ? `Rp. ${item.price.toLocaleString('id-ID')}` : '-'}</p>
                                        </div>
                                    </div>

                                    {!isViewOnly && (
                                        <div className="flex gap-2 pt-1">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-primary active:scale-95 transition-all ${user?.role === ROLES.GUDANG_UMUM ? 'w-full' : ''}`}
                                            >
                                                <Edit3 className="w-3.5 h-3.5" /> Edit
                                            </button>
                                            {user?.role !== ROLES.GUDANG_UMUM && user?.role !== ROLES.MANAJER_MARKETING_SALES && (
                                                <button
                                                    onClick={() => openDeleteConfirm(item)}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50/50 border border-red-100 rounded-xl text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 active:scale-95 transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div key={`${item._type}-${item.id}`} className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-sm font-black text-primary tracking-tight uppercase leading-tight mb-2">{item.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-md">{item.id}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.category}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`flex bg-white rounded-xl border border-gray-100 divide-x divide-gray-100 overflow-hidden shadow-sm ${user?.role === ROLES.GUDANG_UMUM ? 'justify-end' : ''}`}>
                                        {user?.role === ROLES.MANAJER_MARKETING_SALES ? (
                                            <>
                                                <div className="flex-1 p-3">
                                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Harga Normal</p>
                                                    {item.price === 0 ? (
                                                        <span className="flex items-center gap-1 text-[8px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md uppercase tracking-widest w-max italic">
                                                            Produk Baru
                                                        </span>
                                                    ) : (
                                                        <p className="text-xs font-black text-gray-700">Rp {item.price.toLocaleString('id-ID')}</p>
                                                    )}
                                                </div>
                                                <div className="flex-1 p-3">
                                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Harga Distributor</p>
                                                    {item.priceDistributor === 0 ? (
                                                        <span className="flex items-center gap-1 text-[8px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md uppercase tracking-widest w-max italic">
                                                            Belum di Set
                                                        </span>
                                                    ) : (
                                                        <p className="text-xs font-black text-gray-700">Rp {item.priceDistributor.toLocaleString('id-ID')}</p>
                                                    )}
                                                </div>
                                            </>
                                        ) : user?.role !== ROLES.GUDANG_UMUM && (
                                            <div className="flex-1 p-3">
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Harga</p>
                                                <p className="text-xs font-black text-gray-700">Rp {item.price.toLocaleString('id-ID')}</p>
                                            </div>
                                        )}
                                        {(item._type === 'product' || item._type === 'racikan' || item._type === 'material') && (
                                            <div className="flex-1 p-3">
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Stok</p>
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-xs font-black ${item.stock <= (item.minStock || 5) ? 'text-red-500' : 'text-gray-700'}`}>{item.stock} Unit</p>
                                                    {item.stock <= (item.minStock || 5) && (
                                                        <AlertTriangle className="w-3 h-3 text-red-500" />
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {!isViewOnly && (
                                        <div className="flex gap-2 pt-1 border-t border-primary/5 mt-3 pt-3">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-primary active:scale-95 transition-all ${user?.role === ROLES.GUDANG_UMUM ? 'w-full' : ''}`}
                                            >
                                                <Edit3 className="w-3.5 h-3.5" /> Edit
                                            </button>
                                            {user?.role !== ROLES.GUDANG_UMUM && user?.role !== ROLES.MANAJER_MARKETING_SALES && (
                                                <button
                                                    onClick={() => openDeleteConfirm(item)}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50/50 border border-red-100 rounded-xl text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 active:scale-95 transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {filteredData.length === 0 && (
                                <EmptyState
                                    type="data"
                                    title={`${fixedTitle || 'Data'} Tidak Ditemukan`}
                                    description={`Sistem tidak menemukan ${fixedTitle?.toLowerCase() || 'data'} yang sesuai dengan kriteria pencarian Anda.`}
                                />
                            )}
                        </div>
                    </>
                )}

                <div className="p-6 md:p-8 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40 bg-secondary/5">
                    <span>Menampilkan {filteredData.length === 0 ? 0 : indexOfFirstItem + 1} hingga {Math.min(indexOfLastItem, filteredData.length)} dari {filteredData.length} data</span>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            </div>

            <WarehouseFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingItem}
                type={modalType}
                products={products}
                apiTreatments={apiTreatments}
                apiMaterials={apiMaterials}
            />

            <ConfirmModal
                config={confirmConfig}
                onClose={() => setConfirmConfig(null)}
            />

        </div>
    );
};

export default ItemManagementPage;
