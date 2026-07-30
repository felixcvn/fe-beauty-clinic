import React, { useState, useEffect, useMemo } from 'react';
import { MagnifyingGlassIcon as Search, PlusIcon as Plus, TrashIcon as Trash2, PencilIcon as Edit3, ExclamationTriangleIcon as AlertTriangle, CubeIcon as Package, ChartBarIcon as Activity, InboxIcon as Inbox, ChevronDownIcon as ChevronDown, BeakerIcon as Beaker, ArrowDownTrayIcon as Download } from '@heroicons/react/24/outline';
import { useMockData } from '../../context/MockDataContext';
import { useToast } from '../../context/ToastContext';
import WarehouseFormModal from '../../components/UI/WarehouseFormModal';
import ApotekerFormModal from '../../components/UI/ApotekerFormModal';
import TableSkeleton from '../../components/UI/TableSkeleton';
import EmptyState from '../../components/UI/EmptyState';
import { createPortal } from 'react-dom';
import ConfirmModal from '../../components/UI/ConfirmModal';
import { stokProdukAPI, paketBundlingsAPI, bahanTreatmentAPI, bahanMedisAPI, bahanInfusAPI, barangApotekAPI } from '../../services/api';
import { exportToExcel } from '../../utils/excelExport';
import Pagination from '../../components/UI/Pagination';


const SuperAdminInventoryPage = () => {
    const {
        products, addProduct, updateProduct, deleteProduct,
        treatments, addTreatment, updateTreatment, deleteTreatment,
        racikans, addRacikan, updateRacikan, deleteRacikan,
        materials, addMaterial, updateMaterial, deleteMaterial,
        medicals, addMedical, updateMedical, deleteMedical,
        infusions, addInfusion, updateInfusion, deleteInfusion,
        apotekItems, addApotekItem, updateApotekItem, deleteApotekItem
    } = useMockData();
    const { showToast } = useToast();

    // Data produk dari backend
    const [productsFromAPI, setProductsFromAPI] = useState([]);
    const [materialsFromAPI, setMaterialsFromAPI] = useState([]);
    const [medicalsFromAPI, setMedicalsFromAPI] = useState([]);
    const [infusionsFromAPI, setInfusionsFromAPI] = useState([]);
    const [apotekItemsFromAPI, setApotekItemsFromAPI] = useState([]);

    // Filter state: 'all', 'product', 'treatment', 'racikan', 'material', 'medical', 'infusion', 'apotekItem'
    const [activeFilter, setActiveFilter] = useState('all');

    // UI states
    const [searchTerm, setSearchTerm] = useState('');
    const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
    const [isApotekModalOpen, setIsApotekModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [modalType, setModalType] = useState('product'); 
    const [confirmConfig, setConfirmConfig] = useState(null);

    const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
    const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

    /**
     * Mengambil daftar produk dan seluruh bahan dari server
     * dan memetakan datanya ke format yang digunakan di UI.
     */
    const fetchProducts = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        try {
            // Fetch dari seluruh endpoint secara paralel
            const [stokRes, bundleRes, materialsRes, medicalsRes, infusionsRes, apotekRes] = await Promise.all([
                stokProdukAPI.getAll(token),
                paketBundlingsAPI.getAll(token),
                bahanTreatmentAPI.getAll(token),
                bahanMedisAPI.getAll(token),
                bahanInfusAPI.getAll(token),
                barangApotekAPI.getAll(token)
            ]);

            let allProducts = [];

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

            // Map data paket-bundlings
            if (bundleRes.success) {
                const rawBundleData = bundleRes.data?.data || bundleRes.data || [];
                const mappedBundles = (Array.isArray(rawBundleData) ? rawBundleData : []).map(item => ({
                    uid: item.id,
                    id: item.Kode_paket,
                    name: item.Nama_paket,
                    category: 'Paket',
                    price: Number(item.Harga_paket || 0),
                    priceDistributor: Number(item.Harga_Distributor_paket || 0),
                    stock: 0, // Bundles don't have stock usually
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

            setProductsFromAPI(allProducts);

            // Map data bahan treatment
            if (materialsRes.success && Array.isArray(materialsRes.data)) {
                setMaterialsFromAPI(materialsRes.data.map(item => ({
                    uid: item.id,
                    id: String(item.Kode_Produk || item.Kode || item.kode || item.kodeProduk || item.id || ''),
                    name: item.Nama_produk || '',
                    category: item.Kategori || '',
                    price: Number(item.Harga || 0),
                    stock: Number(item.Stok || 0),
                    minStock: Number(item.Batas_minimal_stok || 0)
                })));
            }

            // Map data bahan medis
            if (medicalsRes.success && Array.isArray(medicalsRes.data)) {
                setMedicalsFromAPI(medicalsRes.data.map(item => ({
                    uid: item.id,
                    id: String(item.Kode_Produk || item.Kode || item.kode || item.kodeProduk || item.id || ''),
                    name: item.Nama_bahan_medis || '',
                    category: item.Kategori || '',
                    stock: Number(item.Stok || 0),
                    minStock: Number(item.Batas_minimal_stok || 0)
                })));
            }

            // Map data bahan infus
            if (infusionsRes.success && Array.isArray(infusionsRes.data)) {
                setInfusionsFromAPI(infusionsRes.data.map(item => ({
                    uid: item.id,
                    id: String(item.Kode_Produk || item.Kode || item.kode || item.kodeProduk || item.id || ''),
                    name: item.Nama_bahan_infus || '',
                    category: item.Kategori || '',
                    stock: Number(item.Stok || 0),
                    minStock: Number(item.Batas_minimal_stok || 0)
                })));
            }

            // Map data barang apotek
            if (apotekRes.success && Array.isArray(apotekRes.data)) {
                setApotekItemsFromAPI(apotekRes.data.map(item => ({
                    uid: item.id,
                    id: String(item.Kode_Produk || item.Kode || item.kode || item.kodeProduk || item.id || ''),
                    name: item.Nama_barang_apotek || '',
                    category: item.Kategori || '',
                    stock: Number(item.Stok || 0),
                    minStock: Number(item.Batas_minimal_stok || 0)
                })));
            }

            if (!stokRes.success && !bundleRes.success) {
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

    // Combine data
    const allItems = useMemo(() => [
        ...productsFromAPI.map(p => ({ ...p, _type: 'product' })),
        ...materialsFromAPI.map(m => ({ ...m, _type: 'material' })),
        ...medicalsFromAPI.map(m => ({ ...m, _type: 'medical' })),
        ...infusionsFromAPI.map(i => ({ ...i, _type: 'infusion' })),
        ...apotekItemsFromAPI.map(a => ({ ...a, _type: 'apotekItem' }))
    ], [productsFromAPI, materialsFromAPI, medicalsFromAPI, infusionsFromAPI, apotekItemsFromAPI]);

    // Apply filters
    const currentData = useMemo(() =>
        activeFilter === 'all' ? allItems : allItems.filter(item => item._type === activeFilter),
    [allItems, activeFilter]);

    const filteredData = useMemo(() =>
        currentData.filter(item =>
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [currentData, searchTerm]);

    const handleExport = async (exportType) => {
        const dataToExport = exportType === 'all' ? allItems : filteredData;
        const filename = exportType === 'all' ? 'semua_stok_superadmin' : `stok_superadmin_${activeFilter}`;
        
        let title = 'Laporan Stok Terfilter (SuperAdmin)';
        if (exportType === 'all') {
            title = 'Laporan Semua Stok (SuperAdmin)';
        } else if (activeFilter && activeFilter !== 'all') {
            const typeNames = {
                product: 'Produk',
                material: 'Bahan Treatment',
                medical: 'Bahan Medis',
                infusion: 'Bahan Infus',
                apotekItem: 'Barang Apotek'
            };
            title = `Laporan Stok ${typeNames[activeFilter] || 'Terfilter'} (SuperAdmin)`;
        }
        
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

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    const handleSave = (data) => {
        const isEdit = !!editingItem;
        
        setConfirmConfig({
            icon: 'save',
            header: isEdit ? 'Konfirmasi Simpan' : 'Konfirmasi Tambah',
            message: isEdit ? 
                `Simpan perubahan untuk ${data.name}?` : 
                `Tambahkan ${data.name} ke daftar stok?`,
            acceptLabel: isEdit ? 'Ya, Simpan' : 'Ya, Tambahkan',
            onAccept: async () => {
                const token = localStorage.getItem('token');
                
                if (modalType === 'product') {
                    if (isEdit) {
                        const res = await stokProdukAPI.update(token, data.uid, data);
                        if (res.success) {
                            showToast('Stok berhasil diperbarui', 'success');
                            fetchProducts();
                        } else {
                            showToast(res.message || 'Gagal memperbarui stok', 'error');
                        }
                    } else {
                        const res = await stokProdukAPI.create(token, data);
                        if (res.success) {
                            showToast('Stok berhasil ditambahkan', 'success');
                            fetchProducts();
                        } else {
                            showToast(res.message || 'Gagal menambah stok', 'error');
                        }
                    }
                } else if (modalType === 'treatment') {
                    if (editingItem) updateTreatment(data);
                    else addTreatment(data);
                    showToast('Data berhasil disimpan', 'success');
                } else if (modalType === 'racikan') {
                    if (editingItem) updateRacikan(data);
                    else addRacikan(data);
                    showToast('Data berhasil disimpan', 'success');
                } else if (modalType === 'material') {
                    const res = isEdit ? await bahanTreatmentAPI.update(token, editingItem.uid, data) : await bahanTreatmentAPI.create(token, data);
                    if (res.success) {
                        showToast(`Bahan treatment berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}`, 'success');
                        fetchProducts();
                    } else {
                        showToast(res.message || 'Gagal menyimpan bahan treatment', 'error');
                    }
                } else if (modalType === 'medical') {
                    const res = isEdit ? await bahanMedisAPI.update(token, editingItem.uid, data) : await bahanMedisAPI.create(token, data);
                    if (res.success) {
                        showToast(`Bahan medis berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}`, 'success');
                        fetchProducts();
                    } else {
                        showToast(res.message || 'Gagal menyimpan bahan medis', 'error');
                    }
                } else if (modalType === 'infusion') {
                    const res = isEdit ? await bahanInfusAPI.update(token, editingItem.uid, data) : await bahanInfusAPI.create(token, data);
                    if (res.success) {
                        showToast(`Bahan infus berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}`, 'success');
                        fetchProducts();
                    } else {
                        showToast(res.message || 'Gagal menyimpan bahan infus', 'error');
                    }
                } else if (modalType === 'apotekItem') {
                    const res = isEdit ? await barangApotekAPI.update(token, editingItem.uid, data) : await barangApotekAPI.create(token, data);
                    if (res.success) {
                        showToast(`Barang apotek berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}`, 'success');
                        fetchProducts();
                    } else {
                        showToast(res.message || 'Gagal menyimpan barang apotek', 'error');
                    }
                }
                
                setIsWarehouseModalOpen(false);
                setIsApotekModalOpen(false);
                setEditingItem(null);
            }
        });
    };

    const handleDelete = (item) => {
        setConfirmConfig({
            icon: 'delete',
            header: 'Hapus Item?',
            message: `Yakin ingin menghapus ${item.name}?`,
            acceptLabel: 'Ya, Hapus',
            onAccept: async () => {
                const token = localStorage.getItem('token');
                if (item._type === 'product') {
                    const res = await stokProdukAPI.delete(token, item.uid, item.isPackage);
                    if (res.success) {
                        showToast('Stok berhasil dihapus', 'success');
                        fetchProducts();
                    } else {
                        showToast(res.message || 'Gagal menghapus stok', 'error');
                    }
                }
                else if (item._type === 'treatment') { deleteTreatment(item.id); showToast('Data berhasil dihapus', 'success'); }
                else if (item._type === 'racikan') { deleteRacikan(item.id); showToast('Data berhasil dihapus', 'success'); }
                else if (item._type === 'material') {
                    const res = await bahanTreatmentAPI.delete(token, item.uid);
                    if (res.success) {
                        showToast('Bahan treatment berhasil dihapus', 'success');
                        fetchProducts();
                    } else {
                        showToast(res.message || 'Gagal menghapus bahan treatment', 'error');
                    }
                }
                else if (item._type === 'medical') {
                    const res = await bahanMedisAPI.delete(token, item.uid);
                    if (res.success) {
                        showToast('Bahan medis berhasil dihapus', 'success');
                        fetchProducts();
                    } else {
                        showToast(res.message || 'Gagal menghapus bahan medis', 'error');
                    }
                }
                else if (item._type === 'infusion') {
                    const res = await bahanInfusAPI.delete(token, item.uid);
                    if (res.success) {
                        showToast('Bahan infus berhasil dihapus', 'success');
                        fetchProducts();
                    } else {
                        showToast(res.message || 'Gagal menghapus bahan infus', 'error');
                    }
                }
                else if (item._type === 'apotekItem') {
                    const res = await barangApotekAPI.delete(token, item.uid);
                    if (res.success) {
                        showToast('Barang apotek berhasil dihapus', 'success');
                        fetchProducts();
                    } else {
                        showToast(res.message || 'Gagal menghapus barang apotek', 'error');
                    }
                }
            }
        });
    };


    const openAddModal = (type) => {
        setModalType(type);
        setEditingItem(null);
        if (['product', 'treatment', 'racikan'].includes(type)) {
            setIsWarehouseModalOpen(true);
        } else {
            // material, medical, infusion, apotekItem
            setIsApotekModalOpen(true);
        }
    };

    const openEditModal = (item) => {
        setModalType(item._type);
        setEditingItem(item);
        if (['product', 'treatment', 'racikan'].includes(item._type)) {
            setIsWarehouseModalOpen(true);
        } else {
            setIsApotekModalOpen(true);
        }
    };

    const openDeleteConfirm = (item) => {
        handleDelete(item);
    };


    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12 px-4 md:px-0">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div className="w-full lg:w-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Stok Klinik</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm tracking-tight">Kelola seluruh stok Apotek dan Gudang</p>
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
                        <div className="absolute top-full right-0 mt-3 w-full sm:w-80 bg-white rounded-3xl shadow-2xl border border-primary/5 py-3 z-[80] animate-fade-in-up origin-top-right overflow-hidden flex flex-row">
                            <div className="flex-1 border-r border-gray-100">
                                <div className="px-6 py-2">
                                    <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Gudang</p>
                                </div>
                                <button onClick={() => { openAddModal('product'); setIsAddDropdownOpen(false); }} className="w-full flex items-center gap-3 px-6 py-3 hover:bg-primary/[0.04] transition-colors text-left group">
                                    <Package className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs font-black text-primary uppercase tracking-widest">Produk</span>
                                </button>
                            </div>
                            <div className="flex-1">
                                <div className="px-6 py-2">
                                    <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Apotek</p>
                                </div>
                                <button onClick={() => { openAddModal('material'); setIsAddDropdownOpen(false); }} className="w-full flex items-center gap-3 px-6 py-3 hover:bg-primary/[0.04] transition-colors text-left group">
                                    <Beaker className="w-4 h-4 text-orange-500" />
                                    <span className="text-xs font-black text-primary uppercase tracking-widest">Bahan Treatment</span>
                                </button>
                                <button onClick={() => { openAddModal('medical'); setIsAddDropdownOpen(false); }} className="w-full flex items-center gap-3 px-6 py-3 hover:bg-primary/[0.04] transition-colors text-left group">
                                    <Beaker className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs font-black text-primary uppercase tracking-widest">Medis</span>
                                </button>
                                <button onClick={() => { openAddModal('infusion'); setIsAddDropdownOpen(false); }} className="w-full flex items-center gap-3 px-6 py-3 hover:bg-primary/[0.04] transition-colors text-left group">
                                    <Beaker className="w-4 h-4 text-purple-500" />
                                    <span className="text-xs font-black text-primary uppercase tracking-widest">Infus</span>
                                </button>
                                <button onClick={() => { openAddModal('apotekItem'); setIsAddDropdownOpen(false); }} className="w-full flex items-center gap-3 px-6 py-3 hover:bg-primary/[0.04] transition-colors text-left group">
                                    <Package className="w-4 h-4 text-green-500" />
                                    <span className="text-xs font-black text-primary uppercase tracking-widest">Apotek</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {isAddDropdownOpen && (
                        <div
                            className="fixed inset-0 z-[75]"
                            onClick={() => setIsAddDropdownOpen(false)}
                        />
                    )}
                </div>
            </div>

            {/* Controls (Filters & Search) */}
            <div className="bg-white rounded-card border border-primary/5 elevation-2 p-4 md:p-6 flex flex-col items-stretch gap-6">
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => setActiveFilter('all')} className={`flex items-center justify-center px-4 py-2 rounded-full border transition-all duration-300 ${activeFilter === 'all' ? 'bg-primary border-primary text-secondary shadow-lg shadow-primary/20 scale-105' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest">Semua</span>
                    </button>
                    <button onClick={() => toggleFilter('product')} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${activeFilter === 'product' ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105' : 'bg-blue-50/50 border-blue-100 text-blue-600 hover:bg-blue-50'}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest">Produk</span>
                    </button>
                    <button onClick={() => toggleFilter('material')} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${activeFilter === 'material' ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20 scale-105' : 'bg-orange-50/50 border-orange-100 text-orange-600 hover:bg-orange-50'}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest">Bhn Treatment</span>
                    </button>
                    <button onClick={() => toggleFilter('medical')} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${activeFilter === 'medical' ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105' : 'bg-blue-50/50 border-blue-100 text-blue-600 hover:bg-blue-50'}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest">Bhn Medis</span>
                    </button>
                    <button onClick={() => toggleFilter('infusion')} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${activeFilter === 'infusion' ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/20 scale-105' : 'bg-purple-50/50 border-purple-100 text-purple-600 hover:bg-purple-50'}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest">Bhn Infus</span>
                    </button>
                    <button onClick={() => toggleFilter('apotekItem')} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${activeFilter === 'apotekItem' ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20 scale-105' : 'bg-green-50/50 border-green-100 text-green-600 hover:bg-green-50'}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest">Brg Apotek</span>
                    </button>
                </div>

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
            <div className="bg-white rounded-card md:rounded-[1rem] border border-primary/5 elevation-2 overflow-hidden">
                {isLoading ? (
                    <TableSkeleton rows={8} columns={6} />
                ) : (
                    <>
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5 bg-gray-50/30">
                                        <th className="px-4 py-3 text-primary/80">Kode</th>
                                        {activeFilter === 'product' ? (
                                            <>
                                                <th className="px-4 py-3 text-primary/80">Nama</th>
                                                <th className="px-4 py-3 text-primary/80">Kategori</th>
                                                <th className="px-4 py-3 text-primary/80">Tipe</th>
                                                <th className="px-4 py-3 text-primary/80">Harga Normal</th>
                                                <th className="px-4 py-3 text-primary/80">Harga Distributor</th>
                                            </>
                                        ) : (
                                            <>
                                                {/* Hapus Tipe untuk bahan medis, infus, treatment, dan barang apotek */}
                                                {!['material', 'medical', 'infusion', 'apotekItem'].includes(activeFilter) && (
                                                    <th className="px-4 py-3 text-primary/80">Tipe</th>
                                                )}
                                                <th className="px-4 py-3 text-primary/80">Nama</th>
                                                {!['material', 'medical', 'infusion', 'apotekItem'].includes(activeFilter) && (
                                                    <th className="px-4 py-3 text-primary/80">Harga</th>
                                                )}
                                            </>
                                        )}
                                        <th className="px-4 py-3 text-primary/80">Stok</th>
                                        <th className="px-4 py-3 text-right text-primary/80">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5">
                                    {currentItems.map((item) => (
                                        <tr key={`${item._type}-${item.id}`} className="group hover:bg-primary/[0.02] transition-colors">
                                            <td className="px-4 py-2 font-medium text-xs text-primary/80">{item.id}</td>
                                            
                                            {activeFilter === 'product' ? (
                                                <>
                                                    <td className="px-4 py-2 text-sm font-medium text-primary tracking-tight">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span>{item.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 text-sm font-medium text-primary/80">{item.category}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                                                            item.isPackage ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50'
                                                        }`}>
                                                            {item.isPackage ? 'paket' : 'produk'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-sm font-medium text-primary/80">
                                                        {item.price ? `Rp ${item.price.toLocaleString('id-ID')}` : '-'}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm font-medium text-primary/80">
                                                        {item.priceDistributor ? `Rp ${item.priceDistributor.toLocaleString('id-ID')}` : '-'}
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    {!['material', 'medical', 'infusion', 'apotekItem'].includes(activeFilter) && (
                                                        <td className="px-4 py-2">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/40 bg-primary/5 px-2 py-1 rounded-md">
                                                                {item._type === 'product' ? 'produk' : 
                                                                item._type === 'material' ? 'bhn treatment' :
                                                                item._type === 'medical' ? 'bhn medis' :
                                                                item._type === 'infusion' ? 'bhn infus' :
                                                                item._type === 'apotekItem' ? 'brg apotek' : item._type}
                                                            </span>
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-2 text-sm font-medium text-primary tracking-tight">{item.name}</td>
                                                    {!['material', 'medical', 'infusion', 'apotekItem'].includes(activeFilter) && (
                                                        <td className="px-4 py-2 text-sm font-medium text-primary/80">
                                                            {item.price ? `Rp ${item.price.toLocaleString('id-ID')}` : '-'}
                                                        </td>
                                                    )}
                                                </>
                                            )}

                                            <td className="px-4 py-2">
                                                {item._type === 'treatment' ? (
                                                    <span className="font-medium text-xl text-primary/20">-</span>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm font-bold ${(!item.isPackage && item.stock <= (item.minStock || 5)) ? 'text-red-600' : 'text-primary'}`}>
                                                            {item.isPackage ? '-' : item.stock}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openEditModal(item)} className="p-2.5 rounded-xl bg-white border border-primary/10 text-primary/50 hover:text-primary hover:border-primary/20 hover:shadow-md transition-all active:scale-95" title="Edit"><Edit3 className="w-4 h-4" /></button>
                                                    <button onClick={() => openDeleteConfirm(item)} className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-400 hover:text-red-500 hover:bg-red-100 hover:shadow-md transition-all active:scale-95" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredData.length === 0 && (
                                        <tr>
                                            <td colSpan={6}>
                                                <EmptyState 
                                                    type="data"
                                                    title={`Data Tidak Ditemukan`}
                                                    description={`Sistem tidak menemukan data yang sesuai dengan kriteria pencarian Anda.`}
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden divide-y divide-primary/5">
                            {currentItems.map((item) => (
                                <div key={`${item._type}-${item.id}`} className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors">
                                    <div>
                                        <h4 className="text-sm font-medium text-primary tracking-tight uppercase leading-tight mb-2">
                                            {item.name}
                                            {item.isPackage && (
                                                <span className="ml-2 text-[8px] font-bold text-blue-600 bg-blue-50 px-1 py-0.5 rounded uppercase tracking-tighter">
                                                    Paket
                                                </span>
                                            )}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-md">{item.id}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                                                {item._type === 'product' ? 'produk' : 
                                                 item._type === 'material' ? 'bhn treatment' :
                                                 item._type === 'medical' ? 'bhn medis' :
                                                 item._type === 'infusion' ? 'bhn infus' :
                                                 item._type === 'apotekItem' ? 'brg apotek' : item._type}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex bg-white rounded-xl border border-gray-100 divide-x divide-gray-100 overflow-hidden shadow-sm">
                                        {activeFilter === 'product' && (
                                            <div className="flex-1 p-3">
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Kategori</p>
                                                <p className="text-xs font-medium text-gray-700">{item.category}</p>
                                            </div>
                                        )}
                                        {!['material', 'medical', 'infusion', 'apotekItem'].includes(activeFilter) && (
                                            <div className="flex-1 p-3">
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                                    {activeFilter === 'product' ? 'Hrg Normal' : 'Harga'}
                                                </p>
                                                <p className="text-xs font-medium text-gray-700">{item.price ? `Rp ${item.price.toLocaleString('id-ID')}` : '-'}</p>
                                            </div>
                                        )}
                                        {activeFilter === 'product' && (
                                            <div className="flex-1 p-3">
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Harga Dist.</p>
                                                <p className="text-xs font-medium text-gray-700">{item.priceDistributor ? `Rp ${item.priceDistributor.toLocaleString('id-ID')}` : '-'}</p>
                                            </div>
                                        )}
                                        <div className="flex-1 p-3">
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Stok</p>
                                            <div className="flex items-center gap-2">
                                                <p className={`text-xs font-medium ${item.stock <= (item.minStock || 5) ? 'text-red-500' : 'text-gray-700'}`}>{item.stock}</p>
                                                {item.stock <= (item.minStock || 5) && (
                                                    <AlertTriangle className="w-3 h-3 text-red-500" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-1 border-t border-primary/5 mt-3 pt-3">
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-primary active:scale-95 transition-all"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button
                                            onClick={() => openDeleteConfirm(item)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50/50 border border-red-100 rounded-xl text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 active:scale-95 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredData.length === 0 && (
                                <EmptyState 
                                    type="data"
                                    title={`Data Tidak Ditemukan`}
                                    description={`Sistem tidak menemukan data yang sesuai dengan kriteria pencarian Anda.`}
                                />
                            )}
                        </div>
                    </>
                )}

                <div className="p-6 md:p-8 bg-secondary/5 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40">
                    <span>Menampilkan {filteredData.length === 0 ? 0 : indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filteredData.length)} dari {filteredData.length} data</span>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            </div>

            <WarehouseFormModal
                isOpen={isWarehouseModalOpen}
                onClose={() => setIsWarehouseModalOpen(false)}
                onSave={handleSave}
                initialData={editingItem}
                type={modalType}
                products={productsFromAPI}
            />

            <ApotekerFormModal
                isOpen={isApotekModalOpen}
                onClose={() => setIsApotekModalOpen(false)}
                onSave={handleSave}
                initialData={editingItem}
                type={modalType}
            />

            <ConfirmModal
                config={confirmConfig}
                onClose={() => setConfirmConfig(null)}
            />

        </div>
    );
};

export default SuperAdminInventoryPage;
