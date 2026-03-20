import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit3, Activity, Filter, AlertTriangle } from 'lucide-react';
import { useMockData } from '../../context/MockDataContext';
import { useToast } from '../../context/ToastContext';
import WarehouseFormModal from '../../components/UI/WarehouseFormModal';
import { createPortal } from 'react-dom';

const TreatmentManagementPage = () => {
    const { treatments, addTreatment, updateTreatment, deleteTreatment } = useMockData();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTreatment, setEditingTreatment] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });

    const filteredTreatments = treatments.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = (data) => {
        if (editingTreatment) {
            updateTreatment(data);
            showToast('Treatment berhasil diperbarui', 'success');
        } else {
            addTreatment(data);
            showToast('Treatment berhasil ditambahkan', 'success');
        }
        setIsModalOpen(false);
        setEditingTreatment(null);
    };

    const handleDelete = () => {
        deleteTreatment(deleteConfirm.id);
        showToast('Treatment berhasil dihapus', 'success');
        setDeleteConfirm({ open: false, id: null, name: '' });
    };

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Manajemen Treatment</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm tracking-tight">Kelola jenis dan harga layanan treatment</p>
                </div>
                <button
                    onClick={() => { setEditingTreatment(null); setIsModalOpen(true); }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Treatment</span>
                </button>
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 p-4 md:p-8 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Cari treatment..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5">
                                <th className="px-8 py-6">Layanan Treatment</th>
                                <th className="px-8 py-6">Kategori</th>
                                <th className="px-8 py-6">Estimasi Harga</th>
                                <th className="px-8 py-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {filteredTreatments.map((t) => (
                                <tr key={t.id} className="group hover:bg-primary/5 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-secondary overflow-hidden border border-primary/5 shadow-sm">
                                                <img src={t.image} alt={t.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-primary tracking-tight">{t.name}</p>
                                                <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">{t.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1.5 rounded-xl bg-secondary border border-primary/5 text-[10px] font-black text-primary uppercase tracking-widest">
                                            {t.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 font-bold text-sm text-primary">
                                        Rp {t.price.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => { setEditingTreatment(t); setIsModalOpen(true); }}
                                                className="p-2 rounded-xl text-primary/40 hover:text-primary transition-all"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => setDeleteConfirm({ open: true, id: t.id, name: t.name })}
                                                className="p-2 rounded-xl text-red-400/60 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <WarehouseFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave} 
                initialData={editingTreatment}
                type="treatment"
            />

            {deleteConfirm.open && createPortal(
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })} />
                    <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl border border-primary/5 text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-primary tracking-tighter mb-2">Hapus Treatment?</h3>
                        <p className="text-sm text-primary/40 font-bold mb-8">Yakin ingin menghapus treatment <span className="text-primary">{deleteConfirm.name}</span>?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })} className="flex-1 py-4 rounded-2xl bg-secondary/40 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-secondary transition-all">Batal</button>
                            <button onClick={handleDelete} className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            , document.body)}
        </div>
    );
};

export default TreatmentManagementPage;
