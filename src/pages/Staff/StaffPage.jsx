import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, Filter, Mail, Phone, ShieldCheck, Trash2, Edit3, X, AlertTriangle, CheckCircle2, ChevronRight, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import StaffFormModal from '../../components/UI/StaffFormModal';
import StaffDetailModal from '../../components/UI/StaffDetailModal';

const StaffPage = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [editingStaff, setEditingStaff] = useState(null);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [detailStaff, setDetailStaff] = useState(null);

    // Confirmation Modals State
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, staff: null });
    const [saveConfirm, setSaveConfirm] = useState({ open: false, data: null });

    const [staffList, setStaffList] = useState([
        { id: 'STF-001', name: 'Super Admin', role: 'Admin', email: 'admin@clinic.com', phone: '0812-3456-7890', username: 'admin', password: 'password123', status: 'Aktif', nik: '3171011202900001', tanggal_lahir: '1990-02-12', alamat: 'Jl. Merdeka No. 1, Jakarta Selatan', tanggal_bergabung: '2023-01-15', cabang: 'Jember' },
        { id: 'STF-002', name: 'Dr. Sarah Smith', role: 'Dokter', email: 'sarah.smith@clinic.com', phone: '0812-9876-5432', username: 'doctor', password: 'password123', status: 'Aktif', nik: '3172021504920002', tanggal_lahir: '1992-04-15', alamat: 'Apartemen Sudirman Tower A/12', tanggal_bergabung: '2023-03-01', cabang: 'Jember' },
        { id: 'STF-003', name: 'Dr. Andi Pratama', role: 'Dokter', email: 'andi.p@clinic.com', phone: '0813-1122-3344', username: 'andi.p', password: 'password123', status: 'Aktif', nik: '3201012308850003', tanggal_lahir: '1985-08-23', alamat: 'Komp. Pesona Indah Blok B4', tanggal_bergabung: '2022-11-10', cabang: 'Lumajang' },
        { id: 'STF-004', name: 'Dr. Linda Kusuma', role: 'Dokter', email: 'linda.k@clinic.com', phone: '0811-5566-7788', username: 'linda.k', password: 'password123', status: 'Cuti', nik: '3374021110890004', tanggal_lahir: '1989-10-11', alamat: 'Jl. Melati Raya No. 45, Bintaro', tanggal_bergabung: '2023-05-20', cabang: 'Jember' },
        { id: 'STF-005', name: 'Budi Santoso', role: 'Customer Service', email: 'budi.cs@clinic.com', phone: '0815-9900-1122', username: 'cs', password: 'password123', status: 'Aktif', nik: '3578010506950005', tanggal_lahir: '1995-06-05', alamat: 'Jl. Pahlawan Karya 12A', tanggal_bergabung: '2024-01-05', cabang: 'Lumajang' },
        { id: 'STF-006', name: 'Ayu Lestari', role: 'Customer Service', email: 'ayu.cs@clinic.com', phone: '0812-3344-5566', username: 'ayu.cs', password: 'password123', status: 'Aktif', nik: '3173022512960006', tanggal_lahir: '1996-12-25', alamat: 'Jl. Teratai Indah Blok C1/2', tanggal_bergabung: '2024-02-14', cabang: 'Jember' },
        { id: 'STF-007', name: 'Dewi Rahmawati', role: 'HRD', email: 'dewi.hrd@clinic.com', phone: '0813-7788-9900', username: 'hrd', password: 'password123', status: 'Aktif', nik: '3271011402880007', tanggal_lahir: '1988-02-14', alamat: 'Komp. Graha Raya Kav. 88', tanggal_bergabung: '2022-09-01', cabang: 'Lumajang' },
        { id: 'STF-008', name: 'Fajar Nugroho', role: 'Manager', email: 'fajar.m@clinic.com', phone: '0811-2233-4455', username: 'manager', password: 'password123', status: 'Aktif', nik: '3174022005840008', tanggal_lahir: '1984-05-20', alamat: 'Townhouse Pondok Indah Unit 3', tanggal_bergabung: '2021-12-01', cabang: 'Jember' },
        { id: 'STF-009', name: 'Rina Kartika', role: 'Perawat', email: 'rina.p@clinic.com', phone: '0815-6677-8899', username: 'rina.p', password: 'password123', status: 'Aktif', nik: '3573010707940009', tanggal_lahir: '1994-07-07', alamat: 'Jl. Anggrek Selatan No. 22', tanggal_bergabung: '2023-08-15', cabang: 'Lumajang' },
        { id: 'STF-010', name: 'Agus Setiawan', role: 'Perawat', email: 'agus.p@clinic.com', phone: '0812-4455-6677', username: 'agus.p', password: 'password123', status: 'Aktif', nik: '3273012211930010', tanggal_lahir: '1993-11-22', alamat: 'Jl. Pemuda No. 109', tanggal_bergabung: '2023-06-10', cabang: 'Jember' },
        { id: 'STF-011', name: 'Siti Aminah', role: 'Perawat', email: 'siti.p@clinic.com', phone: '0813-9988-7766', username: 'siti.p', password: 'password123', status: 'Nonaktif', nik: '3175021803960011', tanggal_lahir: '1996-03-18', alamat: 'Jl. Kebon Jeruk VI No. 8', tanggal_bergabung: '2022-10-15', cabang: 'Lumajang' },
        { id: 'STF-012', name: 'Hendra Saputra', role: 'Staff Gudang', email: 'hendra.g@clinic.com', phone: '0811-1122-3344', username: 'gudang', password: 'password123', status: 'Aktif', nik: '3372010109900012', tanggal_lahir: '1990-09-01', alamat: 'Komp. Meruya Ilir Blok A/5', tanggal_bergabung: '2023-02-28', cabang: 'Jember' },
        { id: 'STF-013', name: 'Maya Indah', role: 'Staff Gudang', email: 'maya.g@clinic.com', phone: '0815-4455-6677', username: 'maya.g', password: 'password123', status: 'Aktif', nik: '3274021404970013', tanggal_lahir: '1997-04-14', alamat: 'Jl. Raden Saleh Gg. 2 No. 14', tanggal_bergabung: '2024-03-01', cabang: 'Lumajang' },
        { id: 'STF-014', name: 'Reza Pahlevi', role: 'Kasir', email: 'reza.k@clinic.com', phone: '0812-7788-9900', username: 'reza.k', password: 'password123', status: 'Aktif', nik: '3171012901980014', tanggal_lahir: '1998-01-29', alamat: 'Jl. Karet Pedurenan No. 71', tanggal_bergabung: '2024-01-15', cabang: 'Jember' },
        { id: 'STF-015', name: 'Nina Wulandari', role: 'Kasir', email: 'nina.k@clinic.com', phone: '0813-2233-4455', username: 'nina.k', password: 'password123', status: 'Cuti', nik: '3276020508950015', tanggal_lahir: '1995-08-05', alamat: 'Jl. Cempaka Putih Tengah Blok B', tanggal_bergabung: '2023-07-25', cabang: 'Lumajang' },
    ]);

    const filteredStaff = staffList.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    // Handlers
    const handleOpenAdd = () => {
        setEditingStaff(null);
        setIsStaffModalOpen(true);
    };

    const handleOpenEdit = (staff) => {
        setEditingStaff(staff);
        setIsStaffModalOpen(true);
    };

    const handleRequestSave = (formData) => {
        setSaveConfirm({ open: true, data: formData });
    };

    const confirmSave = () => {
        if (editingStaff) {
            setStaffList(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...saveConfirm.data } : s));
            showToast('Data pegawai berhasil diperbarui', 'success');
        } else {
            const newStaff = {
                ...saveConfirm.data,
                id: `STF-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                status: 'Aktif'
            };
            setStaffList(prev => [newStaff, ...prev]);
            showToast('Pegawai baru berhasil ditambahkan', 'success');
        }
        setIsStaffModalOpen(false);
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
                isOpen={isStaffModalOpen} 
                onClose={() => setIsStaffModalOpen(false)} 
                onSave={handleRequestSave} 
                initialData={editingStaff} 
            />
            <StaffDetailModal 
                isOpen={!!detailStaff} 
                onClose={() => setDetailStaff(null)} 
                staff={detailStaff} 
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
                    onClick={handleOpenAdd}
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
                                <th className="px-8 py-6">Role & Cabang</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {currentStaff.map((staff) => (
                                <tr key={staff.id} className="hover:bg-primary/[0.02] transition-colors cursor-pointer" onClick={() => setDetailStaff(staff)}>
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
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary border border-primary/5 w-fit">
                                                <ShieldCheck className="w-3.5 h-3.5 text-accent-gold" />
                                                <span className="text-[9px] font-black text-primary uppercase tracking-widest">{staff.role}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-primary/60 px-3">
                                                <Building2 className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold tracking-tight">Cabang {staff.cabang}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest">{staff.status}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(staff); }} className="p-2 rounded-xl text-primary/40 hover:bg-white hover:text-primary hover:shadow-lg transition-all active:scale-90"><Edit3 className="w-4 h-4" /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleOpenDelete(staff); }} className="p-2 rounded-xl text-red-400 hover:bg-white hover:text-red-600 hover:shadow-lg transition-all active:scale-90"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View (Show only on mobile) */}
                <div className="md:hidden divide-y divide-primary/5">
                    {currentStaff.map((staff) => (
                        <div key={staff.id} className="p-6 space-y-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setDetailStaff(staff)}>
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
                                            <Building2 className="w-4 h-4" />
                                            <span className="text-[10px] font-black tracking-tight">{staff.cabang}</span>
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
                        </div>
                    ))}
                </div>

                {/* Info Footer */}
                <div className="p-6 md:p-8 bg-gray-50/30 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40">
                    <span>Menampilkan {filteredStaff.length === 0 ? 0 : indexOfFirstItem + 1} hingga {Math.min(indexOfLastItem, filteredStaff.length)} dari {filteredStaff.length} data</span>
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
        </div>
    );
};

export default StaffPage;