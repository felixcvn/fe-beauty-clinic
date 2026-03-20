import React, { useState } from 'react';
import { createPortal } from 'react-dom'; // Untuk modal konfirmasi
import { Search, Plus, Tag, CheckCircle2, XCircle, Edit3, Trash2, AlertTriangle } from 'lucide-react';
import CustomSelect from '../../components/UI/CustomSelect';
import { useToast } from '../../context/ToastContext';
import PromoFormModal from '../../components/UI/PromoFormModal';

const PromoManagementPage = () => {
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);

    // Confirmation Modal State (Untuk Hapus Promo)
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, promo: null });

    // Mock Data Promo
    const [promos, setPromos] = useState([
        { id: 'PRM-001', code: 'RAMADHAN50', name: 'Diskon Spesial Ramadhan', type: 'Persen', value: 50, startDate: '2026-03-01', endDate: '2026-03-30', quota: 100, used: 45, status: 'Aktif' },
        { id: 'PRM-002', code: 'NEWGLOW', name: 'Potongan Treatment Glow Up', type: 'Nominal', value: 150000, startDate: '2026-03-15', endDate: '2026-04-15', quota: 50, used: 12, status: 'Aktif' },
        { id: 'PRM-003', code: 'VALENTINE20', name: 'Kasih Sayang Diskon', type: 'Persen', value: 20, startDate: '2026-02-10', endDate: '2026-02-20', quota: 200, used: 200, status: 'Berakhir' },
        { id: 'PRM-004', code: 'MEMBERBARU', name: 'Welcome New Member', type: 'Nominal', value: 50000, startDate: '2026-01-01', endDate: '2026-12-31', quota: 999, used: 120, status: 'Aktif' },
    ]);

    const filteredPromos = promos.filter(promo => {
        const matchesSearch = promo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              promo.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'Semua Status' || promo.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Aktif': return 'bg-green-100 text-green-600';
            case 'Draf': return 'bg-yellow-100 text-yellow-600';
            case 'Berakhir': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    // Handler Simpan (Triggered dari form modal eksternal)
    const handleSavePromo = (formData) => {
        // Simulasi Update / Create Data
        if (editingPromo) {
            setPromos(prev => prev.map(p => p.id === editingPromo.id ? { ...p, ...formData } : p));
        } else {
            const newPromo = { 
                id: `PRM-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`, 
                ...formData, 
                used: 0, 
                status: 'Aktif' 
            };
            setPromos([newPromo, ...promos]);
        }
        
        showToast(editingPromo ? 'Promo berhasil diperbarui!' : 'Promo baru berhasil ditambahkan!', 'success');
        setIsModalOpen(false);
        setEditingPromo(null);
    };

    // Handler Hapus (Triggered dari tombol tong sampah)
    const handleOpenDelete = (promo) => {
        setDeleteConfirm({ open: true, promo });
    };

    const confirmDelete = () => {
        setPromos(prev => prev.filter(p => p.id !== deleteConfirm.promo.id));
        showToast(`Promo ${deleteConfirm.promo.code} telah dihapus.`, 'success');
        setDeleteConfirm({ open: false, promo: null });
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            
            {/* Modal Form Tambah/Edit Eksternal */}
            <PromoFormModal 
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingPromo(null);
                }}
                onSave={handleSavePromo}
                initialData={editingPromo}
            />

            {/* Modal Konfirmasi Hapus */}
            {deleteConfirm.open && createPortal(
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm({ open: false, promo: null })} />
                    <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl border border-primary/5 text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-primary tracking-tighter mb-2">Hapus Promo</h3>
                        <p className="text-sm text-primary/40 font-bold mb-8">
                            Tindakan ini permanen. Yakin ingin menghapus promo <span className="text-primary">{deleteConfirm.promo?.code}</span>?
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm({ open: false, promo: null })} className="flex-1 py-4 rounded-2xl bg-secondary/40 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-secondary transition-all">Batal</button>
                            <button onClick={confirmDelete} className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:shadow-lg transition-all">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            , document.body)}

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Manajemen Promo</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm">Kelola diskon, voucher, dan penawaran spesial klinik</p>
                </div>
                <button 
                    onClick={() => { setEditingPromo(null); setIsModalOpen(true); }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Buat Promo Baru</span>
                </button>
            </div>

            {/* Statistik Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                {[
                    { label: 'Promo Aktif', value: promos.filter(p => p.status === 'Aktif').length, icon: Tag, color: 'text-accent-gold', bg: 'bg-accent-gold/10' },
                    { label: 'Total Digunakan', value: promos.reduce((acc, curr) => acc + curr.used, 0), icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
                    { label: 'Promo Berakhir', value: promos.filter(p => p.status === 'Berakhir').length, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-6 border border-primary/5 shadow-xl shadow-primary/5 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
                        <div className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">{stat.label}</h4>
                            <span className="text-3xl font-black text-primary">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                {/* Filter & Search */}
                <div className="p-4 md:p-8 border-b border-primary/5 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 bg-primary/5">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari nama atau kode promo..."
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
                                { value: 'Aktif', label: 'Aktif' },
                                { value: 'Draf', label: 'Draf' },
                                { value: 'Berakhir', label: 'Berakhir' }
                            ]}
                        />
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] border-b border-primary/5 bg-gray-50/50">
                                <th className="px-8 py-5 rounded-tl-xl">Kode & Nama Promo</th>
                                <th className="px-8 py-5 text-center">Nilai Diskon</th>
                                <th className="px-8 py-5 text-center">Masa Berlaku</th>
                                <th className="px-8 py-5 text-center">Kuota (Terpakai)</th>
                                <th className="px-8 py-5 text-center">Status</th>
                                <th className="px-8 py-5 text-right rounded-tr-xl">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {filteredPromos.map((promo) => (
                                <tr key={promo.id} className="border-b border-primary/5 last:border-0 hover:bg-primary/[0.02] transition-colors">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center text-accent-gold border border-accent-gold/20 shrink-0">
                                                <Tag className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-blue-500 text-sm tracking-tight">{promo.code}</div>
                                                <div className="font-black text-primary text-xs mt-0.5">{promo.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <span className="font-bold text-primary text-sm">
                                            {promo.type === 'Persen' ? `${promo.value}%` : `Rp ${Number(promo.value).toLocaleString('id-ID')}`}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <p className="text-xs font-bold text-primary/60">{promo.startDate}</p>
                                        <p className="text-[9px] font-black text-primary/30 uppercase tracking-widest mt-0.5">S/D</p>
                                        <p className="text-xs font-bold text-primary/60">{promo.endDate}</p>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <div className="w-full bg-primary/5 rounded-full h-1.5 mb-1.5">
                                            <div className="bg-accent-gold h-1.5 rounded-full" style={{ width: `${(promo.used / promo.quota) * 100}%` }}></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-primary/60">{promo.used} / {promo.quota}</span>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <span className={`font-black text-[9px] tracking-widest uppercase px-3 py-1.5 rounded-full ${getStatusStyle(promo.status)}`}>
                                            {promo.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => { setEditingPromo(promo); setIsModalOpen(true); }} className="p-2 rounded-xl text-primary/40 hover:bg-white hover:text-accent-gold hover:shadow-sm transition-all" title="Edit">
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleOpenDelete(promo)} className="p-2 rounded-xl text-primary/40 hover:bg-white hover:text-red-500 hover:shadow-sm transition-all" title="Hapus">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 md:p-8 border-t border-primary/5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-primary/40 bg-primary/5">
                    <span>Showing {filteredPromos.length} of {promos.length} records</span>
                </div>
            </div>
        </div>
    );
};

export default PromoManagementPage;