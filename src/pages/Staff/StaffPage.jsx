import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, Filter, Mail, Phone, ShieldCheck, Trash2, Edit3, X, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import StaffFormModal from '../../components/UI/StaffFormModal';

const StaffPage = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal Edit State
    const [editingStaff, setEditingStaff] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Confirmation Modals State
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, staff: null });
    const [saveConfirm, setSaveConfirm] = useState({ open: false, data: null });

    const [staffList, setStaffList] = useState([
        { id: 'STF-001', name: 'Super Admin', role: 'Admin', email: 'admin@clinic.com', phone: '0812-3456-7890', status: 'Active' },
        { id: 'STF-002', name: 'Dr. Sarah Smith', role: 'Dokter', email: 'sarah.smith@clinic.com', phone: '0812-9876-5432', status: 'Active' },
        { id: 'STF-003', name: 'Dr. Andi Pratama', role: 'Dokter', email: 'andi.p@clinic.com', phone: '0813-1122-3344', status: 'Active' },
        { id: 'STF-004', name: 'Dr. Linda Kusuma', role: 'Dokter', email: 'linda.k@clinic.com', phone: '0811-5566-7788', status: 'Cuti' },
        { id: 'STF-005', name: 'Budi Santoso', role: 'Customer Service', email: 'budi.cs@clinic.com', phone: '0815-9900-1122', status: 'Active' },
        { id: 'STF-006', name: 'Ayu Lestari', role: 'Customer Service', email: 'ayu.cs@clinic.com', phone: '0812-3344-5566', status: 'Active' },
        { id: 'STF-007', name: 'Dewi Rahmawati', role: 'HRD', email: 'dewi.hrd@clinic.com', phone: '0813-7788-9900', status: 'Active' },
        { id: 'STF-008', name: 'Fajar Nugroho', role: 'Manager', email: 'fajar.m@clinic.com', phone: '0811-2233-4455', status: 'Active' },
        { id: 'STF-009', name: 'Rina Kartika', role: 'Perawat', email: 'rina.p@clinic.com', phone: '0815-6677-8899', status: 'Active' },
        { id: 'STF-010', name: 'Agus Setiawan', role: 'Perawat', email: 'agus.p@clinic.com', phone: '0812-4455-6677', status: 'Active' },
        { id: 'STF-011', name: 'Siti Aminah', role: 'Perawat', email: 'siti.p@clinic.com', phone: '0813-9988-7766', status: 'Resigned' },
        { id: 'STF-012', name: 'Hendra Saputra', role: 'Staff Gudang', email: 'hendra.g@clinic.com', phone: '0811-1122-3344', status: 'Active' },
        { id: 'STF-013', name: 'Maya Indah', role: 'Staff Gudang', email: 'maya.g@clinic.com', phone: '0815-4455-6677', status: 'Active' },
        { id: 'STF-014', name: 'Reza Pahlevi', role: 'Kasir', email: 'reza.k@clinic.com', phone: '0812-7788-9900', status: 'Active' },
        { id: 'STF-015', name: 'Nina Wulandari', role: 'Kasir', email: 'nina.k@clinic.com', phone: '0813-2233-4455', status: 'Cuti' },
    ]);

    const filteredStaff = staffList.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handlers
    const handleOpenEdit = (staff) => {
        setEditingStaff(staff);
        setIsEditModalOpen(true);
    };

    const handleRequestSave = (formData) => {
        setSaveConfirm({ open: true, data: formData });
    };

    const confirmSave = () => {
        setStaffList(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...saveConfirm.data } : s));
        showToast('Data pegawai berhasil diperbarui', 'success');
        setIsEditModalOpen(false);
        setSaveConfirm({ open: false, data: null });
    };

    const handleOpenDelete = (staff) => {
        setDeleteConfirm({ open: true, staff });
    };

    const confirmDelete = () => {
        setStaffList(prev => prev.filter(s => s.id !== deleteConfirm.staff.id));
        showToast(`Data ${deleteConfirm.staff.name} telah dihapus`, 'success');
        setDeleteConfirm({ open: false, staff: null });
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            
            {/* Modals tetap menggunakan Portal agar tidak terpengaruh layout */}
            <StaffFormModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                onSave={handleRequestSave} 
                initialData={editingStaff} 
            />

            {/* Modal Konfirmasi Simpan & Hapus (Code disederhanakan untuk keterbacaan) */}
            {saveConfirm.open && createPortal(
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSaveConfirm({ open: false, data: null })} />
                    <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl border border-primary/5 text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-8 h-8" /></div>
                        <h3 className="text-xl font-black text-primary tracking-tighter mb-2">Konfirmasi Simpan</h3>
                        <p className="text-sm text-primary/40 font-bold mb-8">Simpan perubahan data pegawai ini?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setSaveConfirm({ open: false, data: null })} className="flex-1 py-4 rounded-2xl bg-secondary/40 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-secondary transition-all">Batal</button>
                            <button onClick={confirmSave} className="flex-1 py-4 rounded-2xl bg-primary text-secondary font-black text-[10px] uppercase tracking-widest">Ya, Simpan</button>
                        </div>
                    </div>
                </div>
            , document.body)}

            {deleteConfirm.open && createPortal(
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm({ open: false, staff: null })} />
                    <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl border border-primary/5 text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6"><AlertTriangle className="w-8 h-8" /></div>
                        <h3 className="text-xl font-black text-primary tracking-tighter mb-2">Konfirmasi Hapus</h3>
                        <p className="text-sm text-primary/40 font-bold mb-8">Hapus data <span className="text-primary">{deleteConfirm.staff.name}</span>?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm({ open: false, staff: null })} className="flex-1 py-4 rounded-2xl bg-secondary/40 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-secondary transition-all">Batal</button>
                            <button onClick={confirmDelete} className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            , document.body)}

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Manajemen Pegawai</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm">Kelola rincian dan akses seluruh staff klinik</p>
                </div>
                <button
                    onClick={() => navigate('/staff/new')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Pegawai</span>
                </button>
            </div>

            {/* Controls (Search & Filter) */}
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 p-4 md:p-6 flex flex-col md:flex-row items-stretch md:items-center gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Cari pegawai..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-gray-50/50 border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-primary/5 text-primary text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-secondary transition-all shadow-sm active:scale-95">
                    <Filter className="w-4 h-4" />
                    <span>Filter Role</span>
                </button>
            </div>

            {/* Main Table / Card View Container */}
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                
                {/* Desktop Table View (Hidden on mobile) */}
                <div className="hidden md:block overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5 bg-gray-50/30">
                                <th className="px-8 py-6">Pegawai</th>
                                <th className="px-8 py-6">Kontak</th>
                                <th className="px-8 py-6">Role</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {filteredStaff.map((staff) => (
                                <tr key={staff.id} className="hover:bg-primary/[0.02] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-[11px] font-black text-secondary shadow-lg shadow-primary/20 border border-white/20">
                                                {staff.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-primary tracking-tight">{staff.name}</p>
                                                <p className="text-[9px] font-bold text-primary/30 uppercase tracking-widest">{staff.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-primary/60"><Mail className="w-3 h-3" /><span className="text-[10px] font-bold">{staff.email}</span></div>
                                            <div className="flex items-center gap-2 text-primary/60"><Phone className="w-3 h-3" /><span className="text-[10px] font-bold">{staff.phone}</span></div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary border border-primary/5 w-fit">
                                            <ShieldCheck className="w-3.5 h-3.5 text-accent-gold" />
                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">{staff.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest">{staff.status}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleOpenEdit(staff)} className="p-2 rounded-xl text-primary/40 hover:bg-white hover:text-primary hover:shadow-lg transition-all active:scale-90"><Edit3 className="w-4 h-4" /></button>
                                            <button onClick={() => handleOpenDelete(staff)} className="p-2 rounded-xl text-red-400 hover:bg-white hover:text-red-600 hover:shadow-lg transition-all active:scale-90"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View (Show only on mobile) */}
                <div className="md:hidden divide-y divide-primary/5">
                    {filteredStaff.map((staff) => (
                        <div key={staff.id} className="p-6 space-y-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-xs font-black text-secondary shadow-lg shadow-primary/20">
                                        {staff.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-primary tracking-tight">{staff.name}</h4>
                                        <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">{staff.id}</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[8px] font-black uppercase tracking-widest">
                                    {staff.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-2 bg-gray-50/50 p-4 rounded-2xl border border-primary/5">
                                <div className="flex items-center gap-3 text-primary/60">
                                    <ShieldCheck className="w-4 h-4 text-accent-gold" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{staff.role}</span>
                                </div>
                                <div className="flex items-center gap-3 text-primary/60">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-[11px] font-bold">{staff.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-primary/60">
                                    <Phone className="w-4 h-4" />
                                    <span className="text-[11px] font-bold">{staff.phone}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => handleOpenEdit(staff)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-primary/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all active:scale-95 shadow-sm"
                                >
                                    <Edit3 className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button 
                                    onClick={() => handleOpenDelete(staff)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-sm"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info Footer Mobile */}
                <div className="p-6 md:p-8 bg-gray-50/30 border-t border-primary/5 flex justify-between items-center">
                    <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">
                        Total {filteredStaff.length} Pegawai
                    </p>
                    <div className="flex gap-2">
                         <button className="p-2 rounded-lg border border-primary/5 bg-white text-primary/40 hover:text-primary transition-all"><ChevronRight className="w-4 h-4 rotate-180" /></button>
                         <button className="p-2 rounded-lg border border-primary/5 bg-white text-primary/40 hover:text-primary transition-all"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffPage;