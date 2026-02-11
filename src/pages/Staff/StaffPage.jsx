import React, { useState } from 'react';
import { Users, Search, Plus, Filter, MoreHorizontal, Mail, Phone, ShieldCheck, Trash2, Edit3, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const StaffPage = () => {
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingStaff, setEditingStaff] = useState(null);

    // Confirmation Modals State
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, staff: null });
    const [saveConfirm, setSaveConfirm] = useState({ open: false, data: null });

    const [staffList, setStaffList] = useState([
        { id: 'STF-001', name: 'Super Admin', role: 'Admin', email: 'admin@clinic.com', phone: '0812-3456-7890', status: 'Active' },
        { id: 'STF-002', name: 'Dr. Sarah Smith', role: 'Dokter', email: 'doctor@clinic.com', phone: '0812-9876-5432', status: 'Active' },
        { id: 'STF-003', name: 'Budi Santoso', role: 'Apoteker', email: 'pharmacist@clinic.com', phone: '0813-1122-3344', status: 'Active' },
        { id: 'STF-004', name: 'Linda Rahayu', role: 'HRD', email: 'hrd@clinic.com', phone: '0811-5566-7788', status: 'Active' },
        { id: 'STF-005', name: 'Andi Pratama', role: 'Manager', email: 'manager@clinic.com', phone: '0815-9900-1122', status: 'Active' },
    ]);

    const [formState, setFormState] = useState({
        name: '',
        role: 'Dokter',
        email: '',
        phone: '',
    });

    const handleOpenAdd = () => {
        setEditingStaff(null);
        setFormState({ name: '', role: 'Dokter', email: '', phone: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (staff) => {
        setEditingStaff(staff);
        setFormState({
            name: staff.name,
            role: staff.role,
            email: staff.email,
            phone: staff.phone,
        });
        setIsModalOpen(true);
    };

    const handleSubmitRequest = (e) => {
        e.preventDefault();
        setSaveConfirm({ open: true, data: formState });
    };

    const confirmSave = () => {
        if (editingStaff) {
            setStaffList(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...formState } : s));
            showToast('Data pegawai berhasil diperbarui', 'success');
        } else {
            const staff = {
                ...formState,
                id: `STF-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                status: 'Active'
            };
            setStaffList([...staffList, staff]);
            showToast('Pegawai baru berhasil ditambahkan', 'success');
        }
        setIsModalOpen(false);
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
        <div className="space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Manajemen Pegawai</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm tracking-tight">Kelola rincian dan akses seluruh staff klinik</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Pegawai</span>
                </button>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 p-4 md:p-8 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 bg-secondary/10">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Cari pegawai..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-primary/5 text-primary text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-secondary transition-all shadow-sm">
                    <Filter className="w-4 h-4" />
                    <span>Filter Role</span>
                </button>
            </div>

            {/* Staff Table */}
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5">
                                <th className="px-8 py-6">Pegawai</th>
                                <th className="px-8 py-6">Kontak</th>
                                <th className="px-8 py-6">Role</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {staffList.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((staff) => (
                                <tr key={staff.id} className="group hover:bg-secondary/20 transition-all duration-300">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-[11px] font-black text-secondary shadow-lg shadow-primary/20 border border-white/20">
                                                {staff.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-primary tracking-tight">{staff.name}</p>
                                                <p className="text-[9px] font-bold text-primary/30 uppercase tracking-widest">{staff.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-primary/60">
                                                <Mail className="w-3 h-3" />
                                                <span className="text-[10px] font-bold">{staff.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-primary/60">
                                                <Phone className="w-3 h-3" />
                                                <span className="text-[10px] font-bold">{staff.phone}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary border border-primary/5 w-fit">
                                            <ShieldCheck className="w-3.5 h-3.5 text-accent-gold" />
                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">{staff.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest">
                                            {staff.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenEdit(staff)}
                                                className="p-2 rounded-xl text-primary/20 hover:text-primary hover:bg-white transition-all shadow-sm"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenDelete(staff)}
                                                className="p-2 rounded-xl text-primary/20 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
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

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-primary/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-6 md:p-12 shadow-2xl border border-primary/5 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-primary tracking-tighter italic">
                                {editingStaff ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 rounded-2xl hover:bg-secondary/40 transition-all">
                                <X className="w-5 h-5 text-primary/30" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitRequest} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] block pl-1">Nama Lengkap</label>
                                <input
                                    required
                                    type="text"
                                    value={formState.name}
                                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                    className="w-full px-6 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-bold focus:ring-4 focus:ring-primary/5 transition-all"
                                    placeholder="Enter full name..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] block pl-1">Role Pegawai</label>
                                <select
                                    value={formState.role}
                                    onChange={(e) => setFormState({ ...formState, role: e.target.value })}
                                    className="w-full px-6 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-bold appearance-none cursor-pointer focus:ring-4 focus:ring-primary/5 transition-all"
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Dokter">Dokter</option>
                                    <option value="Apoteker">Apoteker</option>
                                    <option value="HRD">HRD</option>
                                    <option value="Manager">Manager</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] block pl-1">Email</label>
                                    <input
                                        required
                                        type="email"
                                        value={formState.email}
                                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-bold focus:ring-4 focus:ring-primary/5 transition-all"
                                        placeholder="email@clinic.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] block pl-1">No. Telp</label>
                                    <input
                                        required
                                        type="tel"
                                        value={formState.phone}
                                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-bold focus:ring-4 focus:ring-primary/5 transition-all"
                                        placeholder="08xx-xxxx-xxxx"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-primary text-secondary rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 mt-4"
                            >
                                {editingStaff ? 'Simpan Perubahan' : 'Simpan Data Pegawai'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Save Confirmation Modal */}
            {saveConfirm.open && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-primary/40 backdrop-blur-md" />
                    <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl border border-primary/5 text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-primary tracking-tighter mb-2">Konfirmasi Simpan</h3>
                        <p className="text-sm text-primary/40 font-bold mb-8">Apakah Anda yakin ingin menyimpan perubahan data pegawai ini?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSaveConfirm({ open: false, data: null })}
                                className="flex-1 py-4 rounded-2xl bg-secondary/40 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-secondary transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmSave}
                                className="flex-1 py-4 rounded-2xl bg-primary text-secondary font-black text-[10px] uppercase tracking-widest hover:shadow-lg transition-all"
                            >
                                Ya, Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm.open && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-primary/40 backdrop-blur-md" />
                    <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl border border-primary/5 text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-primary tracking-tighter mb-2">Konfirmasi Hapus</h3>
                        <p className="text-sm text-primary/40 font-bold mb-8">
                            Tindakan ini permanen. Yakin ingin menghapus data <span className="text-primary">{deleteConfirm.staff.name}</span>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm({ open: false, staff: null })}
                                className="flex-1 py-4 rounded-2xl bg-secondary/40 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-secondary transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:shadow-lg transition-all"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffPage;
