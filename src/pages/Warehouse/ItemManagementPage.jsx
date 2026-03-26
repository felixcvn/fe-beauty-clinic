import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit3, AlertTriangle, Package, Activity, Inbox } from 'lucide-react';
import { useMockData } from '../../context/MockDataContext';
import { useToast } from '../../context/ToastContext';
import WarehouseFormModal from '../../components/UI/WarehouseFormModal';
import { createPortal } from 'react-dom';

const ItemManagementPage = () => {
    const { products, addProduct, updateProduct, deleteProduct, treatments, addTreatment, updateTreatment, deleteTreatment } = useMockData();
    const { showToast } = useToast();
    
    // Filter state: 'all', 'product', 'treatment'
    const [activeFilter, setActiveFilter] = useState('all');
    
    // UI states
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalType, setModalType] = useState('product'); // to determine which form to show
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '', type: '' });

    // Combine data
    const allItems = [
        ...products.map(p => ({ ...p, _type: 'product' })),
        ...treatments.map(t => ({ ...t, _type: 'treatment' }))
    ];

    // Apply filters
    const currentData = activeFilter === 'all' ? allItems : allItems.filter(item => item._type === activeFilter);
    const filteredData = currentData.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        if (modalType === 'product') {
            if (editingItem) {
                updateProduct(data);
                showToast('Produk berhasil diperbarui', 'success');
            } else {
                addProduct(data);
                showToast('Produk berhasil ditambahkan', 'success');
            }
        } else {
            if (editingItem) {
                updateTreatment(data);
                showToast('Treatment berhasil diperbarui', 'success');
            } else {
                addTreatment(data);
                showToast('Treatment berhasil ditambahkan', 'success');
            }
        }
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleDelete = () => {
        if (deleteConfirm.type === 'product') {
            deleteProduct(deleteConfirm.id);
            showToast('Produk berhasil dihapus', 'success');
        } else {
            deleteTreatment(deleteConfirm.id);
            showToast('Treatment berhasil dihapus', 'success');
        }
        setDeleteConfirm({ open: false, id: null, name: '', type: '' });
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
        setDeleteConfirm({ open: true, id: item.id, name: item.name, type: item._type });
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12 px-4 md:px-0">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div className="w-full lg:w-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Manajemen Gudang</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm tracking-tight">Kelola stok produk dan layanan treatment klinik</p>
                </div>
                
                <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => openAddModal('product')}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Produk</span>
                    </button>
                    <button
                        onClick={() => openAddModal('treatment')}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Treatment</span>
                    </button>
                </div>
            </div>

            {/* Controls (Filters & Search) */}
            <div className="bg-white rounded-[2rem] border border-primary/5 shadow-2xl shadow-primary/5 p-4 md:p-6 flex flex-col items-stretch gap-6">
                
                {/* Pill Filters */}
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
                        <span className="text-xs font-black uppercase tracking-widest">Produk</span>
                    </button>

                    <button
                        onClick={() => toggleFilter('treatment')}
                        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 ${activeFilter === 'treatment' ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20 scale-105' : 'bg-green-50/50 border-green-100 text-green-600 hover:bg-green-50'}`}
                    >
                        <Activity className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Treatment</span>
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
                        className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-gray-50 border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                </div>
            </div>

            {/* Data Table / List */}
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5 bg-gray-50/30">
                                <th className="px-8 py-6">Item</th>
                                <th className="px-8 py-6">Kategori</th>
                                <th className="px-8 py-6">Harga</th>
                                <th className="px-8 py-6">Stok (Produk)</th>
                                <th className="px-8 py-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {currentItems.map((item) => (
                                <tr key={`${item._type}-${item.id}`} className="group hover:bg-primary/[0.02] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-secondary overflow-hidden border border-primary/5 flex-shrink-0 relative">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-primary tracking-tight">{item.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${item._type === 'product' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                                        {item._type === 'product' ? 'Produk' : 'Treatment'}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">{item.id}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold text-primary/60">{item.category}</span>
                                    </td>
                                    <td className="px-8 py-6 font-bold text-sm text-primary">Rp {item.price.toLocaleString('id-ID')}</td>
                                    <td className="px-8 py-6">
                                        {item._type === 'product' ? (
                                            <div className="flex items-center gap-2">
                                                <span className={`font-black text-sm ${item.stock <= (item.minStock || 5) ? 'text-red-500' : 'text-primary'}`}>{item.stock}</span>
                                                {item.stock <= (item.minStock || 5) && (
                                                    <span className="flex items-center gap-1 text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-md uppercase tracking-widest">
                                                        <AlertTriangle className="w-3 h-3" /> Low
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="font-bold text-xl text-primary/20">-</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEditModal(item)} className="p-2 rounded-xl text-primary/40 hover:bg-white hover:text-primary transition-all"><Edit3 className="w-4 h-4" /></button>
                                            <button onClick={() => openDeleteConfirm(item)} className="p-2 rounded-xl text-red-400 hover:bg-white hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Inbox className="w-12 h-12 text-primary/10" />
                                            <p className="text-primary/40 font-bold text-sm">Tidak ada data yang ditemukan.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-primary/5">
                    {currentItems.map((item) => (
                        <div key={`${item._type}-${item.id}`} className="p-6 space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-20 h-20 rounded-2xl bg-secondary overflow-hidden border border-primary/5 shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${item._type === 'product' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                            {item._type === 'product' ? 'Produk' : 'Treatment'}
                                        </span>
                                        <span className="text-[10px] font-black text-primary/30 uppercase tracking-widest">{item.id}</span>
                                    </div>
                                    <h4 className="text-base font-black text-primary tracking-tight leading-tight mb-2">{item.name}</h4>
                                    <span className="text-xs font-bold text-primary/60 block">{item.category}</span>
                                </div>
                            </div>
                            
                            {item._type === 'product' ? (
                                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-primary/5">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest">Harga</p>
                                        <p className="text-xs font-black text-primary tracking-tight">Rp {item.price.toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest">Stok</p>
                                        <div className="flex items-center gap-2">
                                            <p className={`text-xs font-black tracking-tight ${item.stock <= (item.minStock || 5) ? 'text-red-500' : 'text-primary'}`}>{item.stock} Unit</p>
                                            {item.stock <= (item.minStock || 5) && (
                                                <AlertTriangle className="w-3 h-3 text-red-500" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-primary/5">
                                    <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Harga</span>
                                    <span className="text-sm font-black text-primary tracking-tight">Rp {item.price.toLocaleString('id-ID')}</span>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => openEditModal(item)}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border border-primary/10 rounded-2xl text-xs font-black uppercase tracking-widest text-primary shadow-sm active:scale-95 transition-all"
                                >
                                    <Edit3 className="w-4 h-4" /> Edit
                                </button>
                                <button 
                                    onClick={() => openDeleteConfirm(item)}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-black uppercase tracking-widest text-red-500 shadow-sm active:scale-95 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" /> Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredData.length === 0 && (
                        <div className="p-12 text-center flex flex-col items-center gap-3">
                            <Inbox className="w-12 h-12 text-primary/10" />
                            <p className="text-primary/40 font-bold text-sm">Tidak ada data yang ditemukan.</p>
                        </div>
                    )}
                </div>

                <div className="p-6 md:p-8 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40 bg-primary/5">
                    <span>Menampilkan {filteredData.length === 0 ? 0 : indexOfFirstItem + 1} hingga {Math.min(indexOfLastItem, filteredData.length)} dari {filteredData.length} data</span>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button 
                            onClick={handlePrevPage} 
                            disabled={currentPage === 1}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-primary/10 bg-white hover:bg-gray-50 text-primary transition-all duration-300 disabled:opacity-30 active:scale-95 shadow-sm"
                        >
                            Sebelumnya
                        </button>
                        <button 
                            onClick={handleNextPage} 
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-primary text-secondary hover:bg-primary/90 transition-all duration-300 disabled:opacity-30 active:scale-95 shadow-sm"
                        >Selanjutnya</button>
                    </div>
                </div>
            </div>

            <WarehouseFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave} 
                initialData={editingItem} 
                type={modalType} 
            />

            {/* Portal Delete Confirm */}
            {deleteConfirm.open && createPortal(
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm({ open: false, id: null, name: '', type: '' })} />
                    <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl border border-primary/5 text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6"><AlertTriangle className="w-8 h-8" /></div>
                        <h3 className="text-xl font-black text-primary tracking-tighter mb-2">Hapus Item?</h3>
                        <p className="text-sm text-primary/40 font-bold mb-8">Yakin ingin menghapus <span className="text-primary">{deleteConfirm.name}</span>?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm({ open: false, id: null, name: '', type: '' })} className="flex-1 py-4 rounded-2xl bg-secondary/40 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-secondary transition-all">Batal</button>
                            <button onClick={handleDelete} className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            , document.body)}
        </div>
    );
};

export default ItemManagementPage;
