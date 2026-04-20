import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, Filter, Phone, Trash2, Edit3, AlertTriangle, CheckCircle2, Building2, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useMockData } from '../../context/MockDataContext';
import StaffFormModal from '../../components/UI/StaffFormModal';
import StaffDetailModal from '../../components/UI/StaffDetailModal';
import TableSkeleton from '../../components/UI/TableSkeleton';

/* ─────────────────────────────────────────────────────────────
   Reusable Confirm Dialog — sepenuhnya dikontrol via state
───────────────────────────────────────────────────────────── */
const ConfirmModal = ({ config, onClose }) => {
    if (!config) return null;

    const {
        icon,          // 'delete' | 'save'
        header,
        message,
        acceptLabel,
        rejectLabel = 'Batal',
        onAccept,
    } = config;

    const isDelete = icon === 'delete';

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Card */}
            <div
                className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl text-center"
                style={{ animation: 'confirmPop 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
            >
                {/* Icon bubble */}
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 ${isDelete ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                    {isDelete
                        ? <AlertTriangle className="w-8 h-8" />
                        : <CheckCircle2 className="w-8 h-8" />
                    }
                </div>

                {/* Header */}
                <h3 className="text-xl font-black text-[#154734] tracking-tighter mb-2">
                    {header}
                </h3>

                {/* Body */}
                <p className="text-sm text-[#154734]/50 font-medium mb-8 leading-relaxed">
                    {message}
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-2xl bg-gray-100 text-[#154734] font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                    >
                        {rejectLabel}
                    </button>
                    <button
                        onClick={() => { onAccept(); onClose(); }}
                        className={`flex-1 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
                            isDelete
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-[#154734] text-[#F5F5DC] hover:bg-[#1a3c34]'
                        }`}
                    >
                        {acceptLabel}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes confirmPop {
                    from { opacity: 0; transform: scale(0.9) translateY(12px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>,
        document.body
    );
};

/* ─────────────────────────────────────────────────────────────
   StaffPage
───────────────────────────────────────────────────────────── */
const StaffPage = () => {
    const { user } = useAuth();
    const { staff: staffList, addStaff, updateStaff, deleteStaff } = useMockData();
    const isReadOnly = ['Owner', 'Komisaris'].includes(user?.role);
    const { showToast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    // Modal State
    const [editingStaff, setEditingStaff] = useState(null);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [detailStaff, setDetailStaff] = useState(null);

    // Confirm Dialog State
    const [confirmConfig, setConfirmConfig] = useState(null);
    const pendingSaveRef = useRef(null);

    const filteredStaff = staffList.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.divisi && s.divisi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.posisi && s.posisi.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const indexOfLastItem  = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStaff     = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages       = Math.ceil(filteredStaff.length / itemsPerPage);

    /* ── Handlers ── */
    const handleOpenAdd  = () => { setEditingStaff(null);  setIsStaffModalOpen(true); };
    const handleOpenEdit = (s) => { setEditingStaff(s);    setIsStaffModalOpen(true); };

    // Dipanggil dari StaffFormModal saat klik Simpan
    const handleRequestSave = (formData) => {
        pendingSaveRef.current = formData;
        const isEdit = !!editingStaff;

        setConfirmConfig({
            icon:        'save',
            header:      isEdit ? 'Konfirmasi Simpan' : 'Konfirmasi Tambah',
            message:     isEdit ? 'Simpan perubahan data karyawan ini?' : 'Tambahkan data karyawan baru ini?',
            acceptLabel: isEdit ? 'Ya, Simpan' : 'Ya, Tambahkan',
            onAccept: () => {
                if (isEdit) {
                    updateStaff({ ...editingStaff, ...pendingSaveRef.current });
                    showToast('Data karyawan berhasil diperbarui', 'success');
                } else {
                    addStaff(pendingSaveRef.current);
                    showToast('Karyawan baru berhasil ditambahkan', 'success');
                }
                setIsStaffModalOpen(false);
                pendingSaveRef.current = null;
            },
        });
    };

    const handleOpenDelete = (staff) => {
        setConfirmConfig({
            icon:        'delete',
            header:      'Konfirmasi Hapus',
            message:     <>Hapus data <strong>{staff.name}</strong>?</>,
            acceptLabel: 'Ya, Hapus',
            onAccept: () => {
                deleteStaff(staff.id);
                showToast(`Data ${staff.name} telah dihapus`, 'success');
            },
        });
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">

            {/* Confirm Dialog */}
            <ConfirmModal
                config={confirmConfig}
                onClose={() => setConfirmConfig(null)}
            />

            {/* Modals */}
            <StaffFormModal
                isOpen={isStaffModalOpen}
                onClose={() => setIsStaffModalOpen(false)}
                onSave={handleRequestSave}
                initialData={editingStaff}
                existingStaff={staffList}
            />
            <StaffDetailModal
                isOpen={!!detailStaff}
                onClose={() => setDetailStaff(null)}
                staff={detailStaff}
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">
                        {isReadOnly ? 'Data Karyawan' : 'Manajemen Karyawan'}
                    </h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm">Kelola rincian dan akses seluruh karyawan klinik</p>
                </div>
                {!isReadOnly && (
                    <button
                        onClick={handleOpenAdd}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Karyawan</span>
                    </button>
                )}
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 p-4 md:p-6 flex flex-col md:flex-row items-stretch md:items-center gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Cari karyawan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-gray-50/50 border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-primary/5 text-primary text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-secondary transition-all shadow-sm active:scale-95">
                    <Filter className="w-4 h-4" />
                    <span>Filter Jabatan</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">

                {isLoading ? (
                    <TableSkeleton rows={itemsPerPage} columns={isReadOnly ? 5 : 6} />
                ) : (
                    <>
                        {/* Desktop */}
                        <div className="hidden md:block overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left border-collapse" style={{ minWidth: '860px' }}>
                        <thead>
                            <tr className="border-b border-primary/5 bg-gray-50/30">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-primary/50">Nama Karyawan</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-primary/50">No. Telpon</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-primary/50">Email</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-primary/50">Jabatan</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-primary/50">Cabang</th>
                                {!isReadOnly && (
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-primary/50 text-right">Aksi</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {currentStaff.map((staff) => (
                                <tr
                                    key={staff.id}
                                    className="hover:bg-primary/[0.02] transition-colors cursor-pointer"
                                    onClick={() => setDetailStaff(staff)}
                                >
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-[11px] font-black text-secondary shadow-md shadow-primary/20 flex-shrink-0">
                                                {staff.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                            </div>
                                            <span className="text-sm font-semibold text-primary tracking-tight">{staff.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className="text-sm font-medium text-primary/70">{staff.phone}</span>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className="text-sm font-medium text-primary/70">{staff.email}</span>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className="text-sm font-medium text-primary/80">
                                            {['HRD', 'Owner', 'Komisaris'].includes(staff.divisi)
                                                ? staff.divisi
                                                : `${staff.posisi} - ${staff.divisi}`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className="text-sm font-medium text-primary/70">{staff.cabang}</span>
                                    </td>
                                    {!isReadOnly && (
                                        <td className="px-6 py-3.5 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenEdit(staff); }}
                                                    className="p-2 rounded-xl text-primary/30 hover:bg-gray-100 hover:text-primary transition-all active:scale-90"
                                                    title="Edit"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenDelete(staff); }}
                                                    className="p-2 rounded-xl text-red-300 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {currentStaff.length === 0 && (
                                <tr>
                                    <td colSpan={isReadOnly ? 5 : 6} className="px-6 py-16 text-center text-sm text-primary/30 font-bold">
                                        Tidak ada data karyawan yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-primary/5">
                    {currentStaff.map((staff) => (
                        <div key={staff.id} className="p-6 space-y-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setDetailStaff(staff)}>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-xs font-black text-secondary shadow-lg shadow-primary/20">
                                        {staff.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-primary tracking-tight">{staff.name}</h4>
                                        <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">{staff.id}</p>
                                    </div>
                                </div>
                                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest">
                                    <Building2 className="w-3 h-3" />
                                    {staff.cabang}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-2 bg-gray-50/50 p-4 rounded-2xl border border-primary/5">
                                <div className="flex items-center gap-3 text-primary/60">
                                    <ShieldCheck className="w-4 h-4 text-accent-gold" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {['HRD', 'Owner', 'Komisaris'].includes(staff.divisi) ? staff.divisi : `${staff.posisi} - ${staff.divisi}`}
                                    </span>
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

                            {!isReadOnly && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(staff); }}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-primary/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all active:scale-95 shadow-sm"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleOpenDelete(staff); }}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-sm"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                    </>
                )}

                {/* Pagination Footer */}
                <div className="p-6 md:p-8 bg-gray-50/30 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40">
                    <span>
                        Menampilkan {filteredStaff.length === 0 ? 0 : indexOfFirstItem + 1} hingga {Math.min(indexOfLastItem, filteredStaff.length)} dari {filteredStaff.length} data
                    </span>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setCurrentPage(p => p - 1)}
                            disabled={currentPage === 1}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-primary/10 bg-white hover:bg-gray-50 text-primary transition-all disabled:opacity-30 active:scale-95 shadow-sm"
                        >
                            Sebelumnya
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => p + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-primary text-secondary hover:bg-primary/90 transition-all disabled:opacity-30 active:scale-95 shadow-sm"
                        >
                            Selanjutnya
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffPage;
