import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, User, Edit3, Briefcase, X, CheckCircle2, PlusCircle, Wallet } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { distributorAPI } from '../../services/api';
import CustomSelect from '../../components/UI/CustomSelect';

const DistributorsPage = () => {
    const { showToast } = useToast();
    const { user } = useAuth();
    const [distributors, setDistributors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Deteksi role
    const role = user?.role?.toLowerCase().trim();
    const isLeadFinance = role === 'lead finance' || role === 'super admin';
    const isManajerMarketing = role === 'manajer marketing of sales' || role === 'super admin';

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

    // ── Modal states ─────────────────────────────────────────────────────────────
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // ── Form states ──────────────────────────────────────────────────────────────
    // Form data diri (untuk Add baru & Edit)
    const [formData, setFormData] = useState({
        Nama_Distributor: '', Tanggal_Lahir: '', Alamat: '', No_Telp: '', Email: ''
    });
    const [formErrors, setFormErrors] = useState({});

    // Form deposit (khusus Lead Finance)
    const [depositAmount, setDepositAmount] = useState('');
    const [depositError, setDepositError] = useState('');
    const [selectedDistributorId, setSelectedDistributorId] = useState('');

    const filteredData = distributors.filter(item =>
        item.Nama_Distributor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.No_Telp?.includes(searchTerm)
    );

    // ── Handlers: Form Modal (data diri) ─────────────────────────────────────────
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
            });
        } else {
            setIsEditing(false);
            setSelectedData(null);
            setFormData({ Nama_Distributor: '', Tanggal_Lahir: '', Alamat: '', No_Telp: '', Email: '' });
        }
        setIsFormModalOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormModalOpen(false);
        setFormErrors({});
    };

    // ── Handlers: Detail Modal ────────────────────────────────────────────────────
    const handleOpenDetail = (data) => {
        setSelectedData(data);
        setIsDetailModalOpen(true);
    };

    // ── Handlers: Deposit Modal (Lead Finance only) ───────────────────────────────
    const handleOpenDeposit = (data, e) => {
        if (e) e.stopPropagation();
        setSelectedData(data);
        setDepositAmount('');
        setDepositError('');
        setIsDepositModalOpen(true);
    };

    const handleOpenTopDeposit = () => {
        setSelectedData(null);
        setSelectedDistributorId('');
        setDepositAmount('');
        setDepositError('');
        setIsDepositModalOpen(true);
    };

    const handleCloseDeposit = () => {
        setIsDepositModalOpen(false);
        setDepositError('');
        setDepositAmount('');
        setSelectedDistributorId('');
    };

    // ── Validation ────────────────────────────────────────────────────────────────
    const validateForm = () => {
        let errors = {};
        let isValid = true;

        Object.keys(formData).forEach(key => {
            if (!formData[key]) {
                errors[key] = 'Data wajib diisi';
                isValid = false;
            }
        });

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

    // ── Save: data diri ────────────────────────────────────────────────────────────
    const handleSave = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (isEditing) {
            // Manajer Marketing of Sales & Lead Finance: update data diri saja
            const res = await distributorAPI.updateProfile(user?.token, selectedData.id, formData);
            if (res.success) {
                showToast('Berhasil, Data Distributor berhasil diperbarui', 'success');
                fetchDistributors();
                handleCloseForm();
            } else {
                showToast(res.message || 'Gagal memperbarui', 'error');
            }
        } else {
            // Tambah distributor baru (hanya Lead Finance, dengan deposit_masuk = 0 dulu)
            const res = await distributorAPI.create(user?.token, { ...formData, Deposit_masuk: 0 });
            if (res.success) {
                showToast('Berhasil, Data Distributor berhasil ditambahkan', 'success');
                fetchDistributors();
                handleCloseForm();
            } else {
                showToast(res.message || 'Gagal menambahkan', 'error');
            }
        }
    };

    // ── Save: tambah deposit (Lead Finance only) ───────────────────────────────────
    const handleSaveDeposit = async (e) => {
        e.preventDefault();
        
        const targetDistributor = selectedData || distributors.find(d => String(d.id) === String(selectedDistributorId));
        if (!targetDistributor) {
            setDepositError('Silakan pilih distributor terlebih dahulu');
            return;
        }

        if (!depositAmount || isNaN(depositAmount) || Number(depositAmount) <= 0) {
            setDepositError('Masukkan nominal deposit yang valid (lebih dari 0)');
            return;
        }
        const res = await distributorAPI.addDeposit(user?.token, targetDistributor.id, Number(depositAmount));
        if (res.success) {
            showToast('Berhasil, Deposit berhasil ditambahkan', 'success');
            fetchDistributors();
            handleCloseDeposit();
        } else {
            showToast(res.message || 'Gagal menambah deposit', 'error');
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount || 0);

    // ── Input style helper ────────────────────────────────────────────────────────
    const inputClass = (err) =>
        `w-full px-5 py-4 rounded-2xl bg-secondary/20 border ${err ? 'border-red-400 focus:ring-red-200' : 'border-primary/5 focus:ring-primary/5'} outline-none text-primary font-medium text-sm focus:ring-4 transition-all shadow-sm`;

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Data Distributor</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm">Kelola data mitra distributor</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    {/* Manajer Marketing of Sales bisa tambah distributor baru */}
                    {isManajerMarketing && (
                        <button
                            onClick={() => handleOpenForm()}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Distributor</span>
                        </button>
                    )}
                    {/* Lead Finance dialihkan menjadi tambah deposit */}
                    {isLeadFinance && (
                        <button
                            onClick={() => handleOpenTopDeposit()}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>Tambah Deposit</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Role info badge */}
            {(isManajerMarketing || isLeadFinance) && (
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-50 border border-amber-200 w-fit">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <p className="text-xs font-black text-amber-700 uppercase tracking-widest">
                        {role === 'super admin'
                            ? 'Mode: Kelola Distributor & Deposit (Akses Penuh)'
                            : isManajerMarketing
                                ? 'Mode: Kelola Distributor (Tambah & Edit Data Diri)'
                                : 'Mode: Kelola Deposit'}
                    </p>
                </div>
            )}

            {/* Main Content Area */}
            <div className="bg-white rounded-[2rem] md:rounded-[1rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                {/* Search */}
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

                {/* Table */}
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                            <tr className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] border-b border-primary/5 bg-gray-50/30">
                                <th className="px-6 py-4 text-primary/80">Nama Distributor</th>
                                <th className="px-6 py-4 text-primary/80">Nomor Telepon</th>
                                <th className="px-6 py-4 text-right text-primary/80">Sisa Deposit</th>
                                {isManajerMarketing && <th className="px-6 py-4 text-right text-primary/80">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {filteredData.map((item) => (
                                <tr
                                    key={item.id}
                                    onClick={() => handleOpenDetail(item)}
                                    className="cursor-pointer border-b border-primary/5 last:border-0 hover:bg-primary/[0.02] transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                                                <Briefcase className="w-5 h-5" />
                                            </div>
                                            <div className="font-medium text-primary text-sm">{item.Nama_Distributor}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-primary/80">{item.No_Telp}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-black text-primary text-sm bg-primary/5 px-4 py-1.5 rounded-xl border border-primary/10">
                                            {formatCurrency(item.Sisa_Deposit)}
                                        </span>
                                    </td>
                                    {isManajerMarketing && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Edit data diri — hanya untuk Manajer Marketing */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenForm(item); }}
                                                    className="p-2.5 rounded-xl bg-white border border-primary/10 text-primary/50 hover:text-primary hover:border-primary/20 hover:shadow-md transition-all active:scale-95"
                                                    title="Edit Data Diri"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    )}
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

            {/* ── Modal: Form Data Diri (Add / Edit) ─────────────────────────────── */}
            {isFormModalOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30" onClick={handleCloseForm}>
                    <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={handleCloseForm} className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/40 hover:scale-105 active:scale-95 transition-all z-[60] shadow-sm">
                            <X className="w-5 h-5" />
                        </button>

                        {/* Header modal */}
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
                                        {isEditing ? 'Edit Data Diri Distributor' : 'Tambah Distributor Baru'}
                                    </h3>
                                    <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                        {isEditing ? 'Perbarui informasi data diri distributor' : 'Tambahkan mitra distributor baru'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form body */}
                        <div className="p-8 max-h-[70vh] overflow-y-auto">
                            <form id="distributor-form" onSubmit={handleSave} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Nama Distributor <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.Nama_Distributor}
                                        onChange={e => setFormData({ ...formData, Nama_Distributor: e.target.value })}
                                        className={inputClass(formErrors.Nama_Distributor)}
                                        placeholder="Masukkan nama distributor..."
                                    />
                                    {formErrors.Nama_Distributor && <p className="text-xs text-red-500 font-medium mt-1 ml-1">{formErrors.Nama_Distributor}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Tanggal Lahir <span className="text-red-500">*</span></label>
                                        <input
                                            type="date"
                                            value={formData.Tanggal_Lahir}
                                            onChange={e => setFormData({ ...formData, Tanggal_Lahir: e.target.value })}
                                            className={inputClass(formErrors.Tanggal_Lahir)}
                                        />
                                        {formErrors.Tanggal_Lahir && <p className="text-xs text-red-500 font-medium mt-1 ml-1">{formErrors.Tanggal_Lahir}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Nomor Telepon <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.No_Telp}
                                            onChange={e => setFormData({ ...formData, No_Telp: e.target.value })}
                                            className={inputClass(formErrors.No_Telp)}
                                            placeholder="Contoh: 081234567890"
                                        />
                                        {formErrors.No_Telp && <p className="text-xs text-red-500 font-medium mt-1 ml-1">{formErrors.No_Telp}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Email <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        value={formData.Email}
                                        onChange={e => setFormData({ ...formData, Email: e.target.value })}
                                        className={inputClass(formErrors.Email)}
                                        placeholder="Masukkan alamat email..."
                                    />
                                    {formErrors.Email && <p className="text-xs text-red-500 font-medium mt-1 ml-1">{formErrors.Email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Alamat <span className="text-red-500">*</span></label>
                                    <textarea
                                        value={formData.Alamat}
                                        onChange={e => setFormData({ ...formData, Alamat: e.target.value })}
                                        rows="2"
                                        className={inputClass(formErrors.Alamat) + ' resize-none'}
                                        placeholder="Masukkan alamat lengkap..."
                                    />
                                    {formErrors.Alamat && <p className="text-xs text-red-500 font-medium mt-1 ml-1">{formErrors.Alamat}</p>}
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

            {/* ── Modal: Tambah Deposit (Lead Finance only) ───────────────────────── */}
            {isDepositModalOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30" onClick={handleCloseDeposit}>
                    <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-visible animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={handleCloseDeposit} className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/40 hover:scale-105 active:scale-95 transition-all z-[60] shadow-sm">
                            <X className="w-5 h-5" />
                        </button>

                        {/* Header modal deposit */}
                        <div className="relative p-8 pb-6 bg-primary rounded-t-[2.5rem] overflow-hidden shrink-0">
                            <div className="absolute inset-0 opacity-10 z-0">
                                <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                            </div>
                            <div className="relative z-10 flex items-center gap-4 pr-12">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-secondary backdrop-blur-sm border border-white/10 shrink-0">
                                    <Wallet className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tighter leading-none">Tambah Deposit</h3>
                                    <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                        {selectedData ? selectedData.Nama_Distributor : 'Pilih Distributor'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form deposit */}
                        <div className="p-8">
                            {selectedData ? (
                                /* Info sisa deposit jika distributor sudah ditentukan */
                                <div className="mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/10 flex justify-between items-center">
                                    <p className="text-xs font-black uppercase tracking-widest text-primary/60">Sisa Deposit Saat Ini</p>
                                    <p className="text-lg font-black text-primary">{formatCurrency(selectedData.Sisa_Deposit)}</p>
                                </div>
                            ) : (
                                <div className="mb-6 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Pilih Distributor <span className="text-red-500">*</span></label>
                                    <CustomSelect
                                        options={distributors.map(d => ({
                                            value: String(d.id),
                                            label: `${d.Nama_Distributor} (${formatCurrency(d.Sisa_Deposit)})`
                                        }))}
                                        value={selectedDistributorId}
                                        onChange={(val) => {
                                            setSelectedDistributorId(val);
                                            setDepositError('');
                                        }}
                                        placeholder="-- Pilih Mitra Distributor --"
                                        searchable={true}
                                    />
                                    {depositError && !selectedDistributorId && <p className="text-xs text-red-500 font-medium mt-1 ml-1">{depositError}</p>}
                                </div>
                            )}

                            <form onSubmit={handleSaveDeposit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Nominal Deposit Masuk <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        value={depositAmount}
                                        onChange={e => {
                                            setDepositAmount(e.target.value);
                                            setDepositError('');
                                        }}
                                        className={`w-full px-5 py-4 rounded-2xl bg-secondary/20 border ${depositError ? 'border-red-400 focus:ring-red-200' : 'border-primary/5 focus:ring-primary/20'} outline-none text-primary font-medium text-sm focus:ring-4 transition-all shadow-sm`}
                                        placeholder="Masukkan nominal deposit (Rp)..."
                                        min="1"
                                    />
                                    {depositError && <p className="text-xs text-red-500 font-medium mt-1 ml-1">{depositError}</p>}
                                </div>

                                {depositAmount && !isNaN(depositAmount) && (selectedData || selectedDistributorId) && Number(depositAmount) > 0 && (
                                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex justify-between items-center">
                                        <p className="text-xs font-black uppercase tracking-widest text-blue-500/70">Sisa Deposit Setelah Top-up</p>
                                        <p className="text-base font-black text-blue-700">
                                            {formatCurrency(
                                                ((selectedData ? selectedData.Sisa_Deposit : (distributors.find(d => String(d.id) === String(selectedDistributorId))?.Sisa_Deposit || 0)) + Number(depositAmount))
                                            )}
                                        </p>
                                    </div>
                                )}

                                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
                                    <PlusCircle className="w-4 h-4" />
                                    Tambahkan Deposit
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                , document.body)}

            {/* ── Modal: Detail Distributor ──────────────────────────────────────── */}
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
                                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">Detail Distributor</h3>
                                    <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">Informasi Lengkap Mitra</p>
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

                            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex justify-between items-center">
                                <p className="text-xs font-black uppercase tracking-widest text-emerald-600/70">Sisa Deposit</p>
                                <p className="text-lg font-black text-emerald-700">{formatCurrency(selectedData.Sisa_Deposit)}</p>
                            </div>

                            {/* Tombol aksi di dalam detail modal */}
                            {isManajerMarketing && (
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => { setIsDetailModalOpen(false); handleOpenForm(selectedData); }}
                                        className="flex-1 flex items-center justify-center gap-2 bg-primary text-secondary py-3.5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Edit Data Diri
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                , document.body)}
        </div>
    );
};

export default DistributorsPage;
