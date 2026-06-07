import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, User, Edit3, Eye, Briefcase, X, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { distributorAPI } from '../../services/api';

const DistributorsPage = () => {
    const { showToast } = useToast();
    const { user } = useAuth();
    const [distributors, setDistributors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchDistributors = async () => {
        const res = await distributorAPI.getAll(user?.token);
        if (res.success) {
            setDistributors(res.data.data || res.data);
        } else {
            showToast(res.message || 'Gagal mengambil data', 'error');
        }
    };

    useEffect(() => {
        if (user?.token) {
            fetchDistributors();
        }
    }, [user?.token]);

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        Nama_Distributor: '', Tanggal_Lahir: '', Alamat: '', No_Telp: '', Email: '', Deposit_masuk: ''
    });
    const [formErrors, setFormErrors] = useState({});

    const filteredData = distributors.filter(item =>
        item.Nama_Distributor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.No_Telp.includes(searchTerm)
    );

    const handleOpenForm = (data = null) => {
        setFormErrors({});
        if (data) {
            setIsEditing(true);
            setSelectedData(data);
            setFormData({
                Nama_Distributor: data.Nama_Distributor,
                Tanggal_Lahir: data.Tanggal_Lahir,
                Alamat: data.Alamat,
                No_Telp: data.No_Telp,
                Email: data.Email,
                Deposit_masuk: data.Sisa_Deposit // Map Sisa_Deposit to Deposit_masuk for edit
            });
        } else {
            setIsEditing(false);
            setSelectedData(null);
            setFormData({
                Nama_Distributor: '', Tanggal_Lahir: '', Alamat: '', No_Telp: '', Email: '', Deposit_masuk: ''
            });
        }
        setIsFormModalOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormModalOpen(false);
        setFormErrors({});
    };

    const handleOpenDetail = (data) => {
        setSelectedData(data);
        setIsDetailModalOpen(true);
    };

    const validateForm = () => {
        let errors = {};
        let isValid = true;

        // Check required fields
        Object.keys(formData).forEach(key => {
            if (!formData[key]) {
                errors[key] = 'Data wajib diisi';
                isValid = false;
            }
        });

        // Check No_Telp validation if it exists
        if (formData.No_Telp) {
            const isNumeric = /^\d+$/.test(formData.No_Telp);
            if (!isNumeric) {
                errors.No_Telp = 'Nomor telepon hanya boleh berisi angka';
                isValid = false;
            } else if (formData.No_Telp.length < 10 || formData.No_Telp.length > 13) {
                errors.No_Telp = 'Nomor telepon harus terdiri dari 10-13 karakter';
                isValid = false;
            }
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (isEditing) {
            const res = await distributorAPI.update(user?.token, selectedData.id, formData);
            if (res.success) {
                showToast('Berhasil, Data Distributor berhasil diperbarui', 'success');
                fetchDistributors();
                handleCloseForm();
            } else {
                showToast(res.message || 'Gagal memperbarui', 'error');
            }
        } else {
            const res = await distributorAPI.create(user?.token, formData);
            if (res.success) {
                showToast('Berhasil, Data Distributor berhasil ditambahkan', 'success');
                fetchDistributors();
                handleCloseForm();
            } else {
                showToast(res.message || 'Gagal menambahkan', 'error');
            }
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Data Distributor</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm">Kelola data mitra distributor</p>
                </div>
                <button
                    onClick={() => handleOpenForm()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Distributor</span>
                </button>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2rem] md:rounded-[1rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                {/* Filter & Search */}
                <div className="p-4 md:p-8 border-b border-primary/5 bg-primary/5">
                    <div className="relative group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari nama distributor atau nomor telepon..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Table View */}
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                            <tr className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] border-b border-primary/5 bg-gray-50/30">
                                <th className="px-6 py-4 text-primary/80">Nama Distributor</th>
                                <th className="px-6 py-4 text-primary/80">Nomor Telepon</th>
                                <th className="px-6 py-4 text-right text-primary/80">Sisa Deposit</th>
                                <th className="px-6 py-4 text-right text-primary/80">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {filteredData.map((item) => (
                                <tr key={item.id} onClick={() => handleOpenDetail(item)} className="cursor-pointer border-b border-primary/5 last:border-0 hover:bg-primary/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                                                <Briefcase className="w-5 h-5" />
                                            </div>
                                            <div className="font-medium text-primary text-sm">{item.Nama_Distributor}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-primary/80">
                                        {item.No_Telp}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-black text-primary text-sm bg-primary/5 px-4 py-1.5 rounded-xl border border-primary/10">
                                            {formatCurrency(item.Sisa_Deposit)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); handleOpenForm(item); }} className="p-2.5 rounded-xl bg-white border border-primary/10 text-primary/50 hover:text-primary hover:border-primary/20 hover:shadow-md transition-all active:scale-95" title="Edit">
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-primary/30 font-black uppercase tracking-widest text-xs">
                                        Tidak ada data distributor ditemukan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Form Modal (Add / Edit) */}
            {isFormModalOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30" onClick={handleCloseForm}>
                    <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={handleCloseForm} className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/40 hover:scale-105 active:scale-95 transition-all z-[60] shadow-sm">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="relative p-8 pb-6 bg-primary overflow-hidden shrink-0">
                            <div className="absolute inset-0 opacity-10 z-0">
                                <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                            </div>

                            <div className="relative z-10 flex items-center gap-4 pr-12">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-secondary backdrop-blur-sm border border-white/10 shrink-0">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                                        {isEditing ? 'Edit Data Distributor' : 'Tambah Distributor'}
                                    </h3>
                                    <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                        Formulir Pengaturan Data Distributor
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 max-h-[70vh] overflow-y-auto">
                            <form id="distributor-form" onSubmit={handleSave} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Nama Distributor <span className="text-red-500">*</span></label>
                                    <input type="text" value={formData.Nama_Distributor} onChange={e => setFormData({ ...formData, Nama_Distributor: e.target.value })} className={`w-full px-5 py-4 rounded-2xl bg-secondary/20 border ${formErrors.Nama_Distributor ? 'border-red-400 focus:ring-red-200' : 'border-primary/5 focus:ring-primary/5'} outline-none text-primary font-medium text-sm focus:ring-4 transition-all shadow-sm`} placeholder="Masukkan nama distributor..." />
                                    {formErrors.Nama_Distributor && <p className="text-xs text-red-500 font-medium mt-1 ml-1">{formErrors.Nama_Distributor}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Tanggal Lahir <span className="text-red-500">*</span></label>
                                        <input type="date" value={formData.Tanggal_Lahir} onChange={e => setFormData({ ...formData, Tanggal_Lahir: e.target.value })} className={`w-full px-5 py-4 rounded-2xl bg-secondary/20 border ${formErrors.Tanggal_Lahir ? 'border-red-400 focus:ring-red-200' : 'border-primary/5 focus:ring-primary/5'} outline-none text-primary font-medium text-sm focus:ring-4 transition-all shadow-sm`} />
                                        {formErrors.Tanggal_Lahir && <p className="text-xs text-red-500 font-medium mt-1 ml-1">{formErrors.Tanggal_Lahir}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Nomor Telepon <span className="text-red-500">*</span></label>
                                        <input type="text" value={formData.No_Telp} onChange={e => setFormData({ ...formData, No_Telp: e.target.value })} className={`w-full px-5 py-4 rounded-2xl bg-secondary/20 border ${formErrors.No_Telp ? 'border-red-400 focus:ring-red-200' : 'border-primary/5 focus:ring-primary/5'} outline-none text-primary font-medium text-sm focus:ring-4 transition-all shadow-sm`} placeholder="Contoh: 081234567890" />
                                        {formErrors.No_Telp && <p className="text-xs text-red-500 font-medium mt-1 ml-1">{formErrors.No_Telp}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Email <span className="text-red-500">*</span></label>
                                    <input type="email" value={formData.Email} onChange={e => setFormData({ ...formData, Email: e.target.value })} className={`w-full px-5 py-4 rounded-2xl bg-secondary/20 border ${formErrors.Email ? 'border-red-400 focus:ring-red-200' : 'border-primary/5 focus:ring-primary/5'} outline-none text-primary font-medium text-sm focus:ring-4 transition-all shadow-sm`} placeholder="Masukkan alamat email..." />
                                    {formErrors.Email && <p className="text-xs text-red-500 font-medium mt-1 ml-1">{formErrors.Email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Alamat <span className="text-red-500">*</span></label>
                                    <textarea value={formData.Alamat} onChange={e => setFormData({ ...formData, Alamat: e.target.value })} rows="2" className={`w-full px-5 py-4 rounded-2xl bg-secondary/20 border ${formErrors.Alamat ? 'border-red-400 focus:ring-red-200' : 'border-primary/5 focus:ring-primary/5'} outline-none text-primary font-medium text-sm focus:ring-4 transition-all shadow-sm resize-none`} placeholder="Masukkan alamat lengkap..."></textarea>
                                    {formErrors.Alamat && <p className="text-xs text-red-500 font-medium mt-1 ml-1">{formErrors.Alamat}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Deposit Masuk <span className="text-red-500">*</span></label>
                                    <input type="number" value={formData.Deposit_masuk} onChange={e => setFormData({ ...formData, Deposit_masuk: e.target.value })} className={`w-full px-5 py-4 rounded-2xl bg-secondary/20 border ${formErrors.Deposit_masuk ? 'border-red-400 focus:ring-red-200' : 'border-primary/5 focus:ring-primary/5'} outline-none text-primary font-medium text-sm focus:ring-4 transition-all shadow-sm`} placeholder="0" />
                                    {formErrors.Deposit_masuk && <p className="text-xs text-red-500 font-medium mt-1 ml-1">{formErrors.Deposit_masuk}</p>}
                                </div>

                                <button type="submit" className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Simpan Data
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                , document.body)}

            {/* Detail Modal */}
            {isDetailModalOpen && selectedData && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30" onClick={() => setIsDetailModalOpen(false)}>
                    <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => setIsDetailModalOpen(false)} className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/40 hover:scale-105 active:scale-95 transition-all z-[60] shadow-sm">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="relative p-8 pb-6 bg-primary overflow-hidden shrink-0">
                            <div className="absolute inset-0 opacity-10 z-0">
                                <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                            </div>

                            <div className="relative z-10 flex items-center gap-4 pr-12">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-secondary backdrop-blur-sm border border-white/10 shrink-0">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                                        Detail Distributor
                                    </h3>
                                    <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                        Informasi Lengkap Mitra
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                                    <User className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-primary">{selectedData.Nama_Distributor}</h4>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-secondary/20 border border-primary/5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Nomor Telepon</p>
                                    <p className="text-sm font-bold text-primary">{selectedData.No_Telp}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-secondary/20 border border-primary/5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Tanggal Lahir</p>
                                    <p className="text-sm font-bold text-primary">{selectedData.Tanggal_Lahir}</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-secondary/20 border border-primary/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Email</p>
                                <p className="text-sm font-bold text-primary">{selectedData.Email}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-secondary/20 border border-primary/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Alamat Lengkap</p>
                                <p className="text-sm font-bold text-primary">{selectedData.Alamat}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex justify-between items-center">
                                <p className="text-xs font-black uppercase tracking-widest text-blue-500/70">Sisa Deposit</p>
                                <p className="text-lg font-black text-blue-600">{formatCurrency(selectedData.Sisa_Deposit)}</p>
                            </div>
                        </div>
                    </div>
                </div>
                , document.body)}
        </div>
    );
};

export default DistributorsPage;
