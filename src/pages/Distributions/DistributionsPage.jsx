import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon as Search, PlusIcon as Plus, TruckIcon as Truck, PencilIcon as Edit3, TrashIcon as Trash2, MapPinIcon as MapPin, CubeIcon as Box, CheckCircleIcon as CheckCircle2, ClockIcon as Clock } from '@heroicons/react/24/outline';
import { useToast } from '../../context/ToastContext';
import CustomSelect from '../../components/UI/CustomSelect';

const initialDistributions = [
    { id: 1, code: 'DST-001', date: '2026-06-05', itemName: 'Serum Anti Aging 30ml', quantity: 50, destination: 'Cabang Utama', status: 'Selesai', notes: 'Pengiriman reguler' },
    { id: 2, code: 'DST-002', date: '2026-06-06', itemName: 'Krim Malam Pencerah', quantity: 20, destination: 'Cabang Bekasi', status: 'Proses', notes: 'Urgent stok habis' },
    { id: 3, code: 'DST-003', date: '2026-06-07', itemName: 'Facial Wash Acne', quantity: 100, destination: 'Gudang Pusat', status: 'Menunggu', notes: 'Restock bulanan' },
];

const DistributionsPage = () => {
    const { showToast } = useToast();
    const [distributions, setDistributions] = useState(initialDistributions);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [formData, setFormData] = useState({
        code: '', date: '', itemName: '', quantity: '', destination: '', status: 'Menunggu', notes: ''
    });

    const filteredData = distributions.filter(item => {
        const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              item.destination.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'Semua Status' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleOpenModal = (data = null) => {
        if (data) {
            setEditingData(data);
            setFormData(data);
        } else {
            setEditingData(null);
            setFormData({
                code: `DST-00${distributions.length + 1}`, date: new Date().toISOString().split('T')[0], 
                itemName: '', quantity: '', destination: '', status: 'Menunggu', notes: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingData(null);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (editingData) {
            setDistributions(prev => prev.map(d => d.id === editingData.id ? { ...d, ...formData } : d));
            showToast('Data distribusi berhasil diperbarui', 'success');
        } else {
            setDistributions(prev => [{ ...formData, id: Date.now() }, ...prev]);
            showToast('Data distribusi baru berhasil ditambahkan', 'success');
        }
        handleCloseModal();
    };

    const handleDelete = (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data distribusi ini?')) {
            setDistributions(prev => prev.filter(d => d.id !== id));
            showToast('Data distribusi dihapus', 'success');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Selesai': return 'bg-green-100 text-green-600 border-green-200';
            case 'Proses': return 'bg-blue-100 text-blue-600 border-blue-200';
            case 'Menunggu': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
            default: return 'bg-gray-100 text-gray-500 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Selesai': return <CheckCircle2 className="w-3 h-3" />;
            case 'Proses': return <Truck className="w-3 h-3" />;
            case 'Menunggu': return <Clock className="w-3 h-3" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Distribusi Produk</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm">Kelola pengiriman dan distribusi produk antar cabang</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Distribusi</span>
                </button>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-card md:rounded-[1rem] border border-primary/5 elevation-2 overflow-hidden">
                {/* Filter & Search */}
                <div className="p-4 md:p-8 border-b border-primary/5 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 bg-primary/5">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari kode, nama produk, atau tujuan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                        />
                    </div>
                    <div className="w-full sm:w-48 relative z-50">
                        <CustomSelect
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: 'Semua Status', label: 'Semua Status' },
                                { value: 'Menunggu', label: 'Menunggu' },
                                { value: 'Proses', label: 'Proses' },
                                { value: 'Selesai', label: 'Selesai' }
                            ]}
                        />
                    </div>
                </div>

                {/* Table View */}
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] border-b border-primary/5 bg-gray-50/30">
                                <th className="px-6 py-4 text-primary/80">Kode & Produk</th>
                                <th className="px-6 py-4 text-primary/80">Tujuan & Tanggal</th>
                                <th className="px-6 py-4 text-center text-primary/80">Kuantitas</th>
                                <th className="px-6 py-4 text-center text-primary/80">Status</th>
                                <th className="px-6 py-4 text-right text-primary/80">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {filteredData.map((item) => (
                                <tr key={item.id} className="border-b border-primary/5 last:border-0 hover:bg-primary/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                                                <Box className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-black text-blue-600 text-[10px] uppercase tracking-[0.2em] mb-1">{item.code}</div>
                                                <div className="font-bold text-primary text-sm">{item.itemName}</div>
                                                <div className="text-xs text-primary/40 mt-1">{item.notes}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-sm font-bold text-primary">
                                                <MapPin className="w-4 h-4 text-primary/40" />
                                                {item.destination}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-medium text-primary/60 ml-6">
                                                {item.date}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-black text-primary text-lg bg-primary/5 px-4 py-1.5 rounded-xl border border-primary/10">
                                            {item.quantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 font-bold text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm border ${getStatusStyle(item.status)}`}>
                                            {getStatusIcon(item.status)}
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleOpenModal(item)} className="p-2.5 rounded-xl bg-white border border-primary/10 text-primary/50 hover:text-primary hover:border-primary/20 hover:shadow-md transition-all active:scale-95" title="Edit">
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-400 hover:text-red-500 hover:bg-red-100 hover:shadow-md transition-all active:scale-95" title="Hapus">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-primary/30 font-black uppercase tracking-widest text-xs">
                                        Tidak ada data distribusi ditemukan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-5 border-b border-primary/5 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-black text-primary text-xl tracking-tight">
                                {editingData ? 'Edit Distribusi' : 'Tambah Distribusi Baru'}
                            </h3>
                            <button onClick={handleCloseModal} className="p-2 text-primary/40 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                                <Search className="w-5 h-5 rotate-45" /> {/* Using Search rotated as an X, ideally use XIcon */}
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <form id="distribution-form" onSubmit={handleSave} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/40">Kode Distribusi</label>
                                        <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-gray-50/50 text-primary font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Contoh: DST-001" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/40">Tanggal</label>
                                        <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-gray-50/50 text-primary font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40">Nama Produk / Item</label>
                                    <input required type="text" value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-gray-50/50 text-primary font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Masukkan nama produk..." />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/40">Kuantitas</label>
                                        <input required type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-gray-50/50 text-primary font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="0" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/40">Status</label>
                                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-gray-50/50 text-primary font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                                            <option value="Menunggu">Menunggu</option>
                                            <option value="Proses">Proses</option>
                                            <option value="Selesai">Selesai</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40">Cabang Tujuan</label>
                                    <input required type="text" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-gray-50/50 text-primary font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Tujuan pengiriman..." />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40">Catatan</label>
                                    <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows="3" className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-gray-50/50 text-primary font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none" placeholder="Catatan opsional..."></textarea>
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-5 border-t border-primary/5 bg-gray-50 flex justify-end gap-3 shrink-0">
                            <button onClick={handleCloseModal} className="px-6 py-3 rounded-xl font-bold text-sm text-primary/60 hover:bg-primary/5 transition-colors">
                                Batal
                            </button>
                            <button type="submit" form="distribution-form" className="px-8 py-3 rounded-xl font-black text-sm text-secondary bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DistributionsPage;
