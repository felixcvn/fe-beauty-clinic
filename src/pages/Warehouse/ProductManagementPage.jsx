import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit3, Package, Filter, AlertTriangle } from 'lucide-react';
import { useMockData } from '../../context/MockDataContext';
import { useToast } from '../../context/ToastContext';
import WarehouseFormModal from '../../components/UI/WarehouseFormModal';
import { createPortal } from 'react-dom';

const ProductManagementPage = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useMockData();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = (data) => {
        if (editingProduct) {
            updateProduct(data);
            showToast('Produk berhasil diperbarui', 'success');
        } else {
            addProduct(data);
            showToast('Produk berhasil ditambahkan', 'success');
        }
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleDelete = () => {
        deleteProduct(deleteConfirm.id);
        showToast('Produk berhasil dihapus', 'success');
        setDeleteConfirm({ open: false, id: null, name: '' });
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Manajemen Produk</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm tracking-tight">Kelola stok dan harga produk klinik</p>
                </div>
                <button
                    onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Produk</span>
                </button>
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 p-4 md:p-6 flex flex-col md:flex-row items-stretch md:items-center gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Cari produk..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-gray-50 border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5 bg-gray-50/30">
                                <th className="px-8 py-6">Produk</th>
                                <th className="px-8 py-6">Kategori</th>
                                <th className="px-8 py-6">Harga</th>
                                <th className="px-8 py-6">Stok</th>
                                <th className="px-8 py-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {filteredProducts.map((p) => (
                                <tr key={p.id} className="group hover:bg-primary/[0.02] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-secondary overflow-hidden border border-primary/5 shadow-sm">
                                                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-primary tracking-tight">{p.name}</p>
                                                <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">{p.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1.5 rounded-xl bg-secondary border border-primary/5 text-[10px] font-black text-primary uppercase tracking-widest">{p.category}</span>
                                    </td>
                                    <td className="px-8 py-6 font-bold text-sm text-primary">Rp {p.price.toLocaleString('id-ID')}</td>
                                    <td className="px-8 py-6">
                                        <span className={`font-black text-sm ${p.stock < 15 ? 'text-red-500' : 'text-primary'}`}>{p.stock}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 rounded-xl text-primary/40 hover:bg-white hover:text-primary hover:shadow-lg transition-all"><Edit3 className="w-4 h-4" /></button>
                                            <button onClick={() => setDeleteConfirm({ open: true, id: p.id, name: p.name })} className="p-2 rounded-xl text-red-400 hover:bg-white hover:text-red-500 hover:shadow-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View Cards */}
                <div className="md:hidden divide-y divide-primary/5">
                    {filteredProducts.map((p) => (
                        <div key={p.id} className="p-6 space-y-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-secondary overflow-hidden border border-primary/5 shadow-sm shrink-0">
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black text-primary truncate">{p.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded bg-secondary text-[8px] font-black text-primary uppercase">{p.category}</span>
                                        <span className={`text-[10px] font-black ${p.stock < 15 ? 'text-red-500' : 'text-primary'}`}>Stok: {p.stock}</span>
                                    </div>
                                    <p className="mt-1 text-xs font-bold text-primary/70">Rp {p.price.toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-primary/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary shadow-sm"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                                <button onClick={() => setDeleteConfirm({ open: true, id: p.id, name: p.name })} className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 shadow-sm"><Trash2 className="w-3.5 h-3.5" /> Hapus</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <WarehouseFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} initialData={editingProduct} type="product" />

            {deleteConfirm.open && createPortal(
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })} />
                    <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl border border-primary/5 text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6"><AlertTriangle className="w-8 h-8" /></div>
                        <h3 className="text-xl font-black text-primary tracking-tighter mb-2">Hapus Produk?</h3>
                        <p className="text-sm text-primary/40 font-bold mb-8">Yakin ingin menghapus <span className="text-primary">{deleteConfirm.name}</span>?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })} className="flex-1 py-4 rounded-2xl bg-secondary/40 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-secondary transition-all">Batal</button>
                            <button onClick={handleDelete} className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-600 shadow-lg transition-all">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            , document.body)}
        </div>
    );
};

export default ProductManagementPage;