import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, Filter, Phone, Trash2, Edit3, AlertTriangle, CheckCircle2, Building2, Mail, ShieldCheck, Wifi, WifiOff, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useMockData } from '../../context/MockDataContext';
import { karyawanAPI } from '../../services/api';
import StaffFormModal from '../../components/UI/StaffFormModal';
import StaffDetailModal from '../../components/UI/StaffDetailModal';
import TableSkeleton from '../../components/UI/TableSkeleton';
import EmptyState from '../../components/UI/EmptyState';
import ConfirmModal from '../../components/UI/ConfirmModal';

// ── Helper: Konversi data karyawan dari backend ke format UI ──────────────────
const formatTitleCase = (str) => {
    if (!str) return '';
    // Clean redundant dashes and spaces
    let cleaned = str.replace(/\s*-\s*/g, ' - ').replace(/(\s*-\s*)+$/, '').trim();

    return cleaned.split(' ').map((word, index) => {
        if (word === '-') return '-';
        const lower = word.toLowerCase();
        const upper = word.toUpperCase();

        // Keep acronyms uppercase
        if (['HRD', 'OB', 'CS', 'IT'].includes(upper)) return upper;

        // Keep conjunctions lowercase (except if it's the first word)
        if (['of', 'and'].includes(lower) && index !== 0) return lower;

        // Default: Capitalize first letter
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
};

const mapKaryawanFromAPI = (k) => {
    let rawPosisi = (k.Jabatan || k.jabatan || '').trim();
    let rawDivisi = (k.Divisi || k.divisi || '').trim();

    rawPosisi = rawPosisi.replace(/(\s*-\s*)+$/, '');
    rawDivisi = rawDivisi.replace(/(\s*-\s*)+$/, '');

    let divisi = formatTitleCase(rawDivisi) || '-';

    return {
        id: k.id,
        name: k.nama_lengkap || k.NamaLengkap_karyawan,
        email: k.email || k.Email,
        phone: k.no_telp || k.No_Telp,
        jabatan: divisi,
        posisi: rawPosisi || '',
        divisi: divisi,
        cabang: k.cabang || k.Cabang,
        inisial: k.inisial,
        nik: k.Nomor_Identitas || k.nomor_identitas || k.nik,
        tanggal_lahir: k.Tanggal_Lahir || k.tanggal_lahir,
        tempat_lahir: k.Tempat_Lahir || k.tempat_lahir,
        alamat: k.Alamat || k.alamat,
        tanggal_bergabung: k.Tanggal_bergabung || k.tanggal_bergabung,
        kode_karyawan: k.kode_karyawan || k.Kode_Karyawan,
        username: k.username || k.Username || '',
        _source: 'api',
    };
};

/* ─────────────────────────────────────────────────────────────
   StaffPage
───────────────────────────────────────────────────────────── */
const StaffPage = () => {
    const { user } = useAuth();
    const { staff: mockStaffList, addStaff, updateStaff, deleteStaff } = useMockData();
    const isReadOnly = ['Owner', 'Komisaris'].includes(user?.role);
    const { showToast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [apiStaff, setApiStaff] = useState([]);
    const [apiPagination, setApiPagination] = useState(null);
    const [isApiMode, setIsApiMode] = useState(false);
    const [apiError, setApiError] = useState(null);
    const itemsPerPage = 10;

    // ── Fetch data karyawan dari API ─────────────────────────────────────────
    const fetchKaryawan = useCallback(async (page = 1, search = '') => {
        setIsLoading(true);
        setApiError(null);
        try {
            const token = user?.token || localStorage.getItem('token');
            const params = search ? `search=${encodeURIComponent(search)}` : '';
            const result = await karyawanAPI.getAll(token, page, params);

            if (result.success && result.data) {
                console.log('[StaffPage] API Result:', result.data);

                // Response structure: result.data.data.data
                const paginatedData = result.data.data;
                const employeeArray = paginatedData?.data || [];

                const mapped = employeeArray.map(mapKaryawanFromAPI);
                setApiStaff(mapped);
                setApiPagination(paginatedData);
                setIsApiMode(true);
            } else {
                // Fallback ke mock data
                setIsApiMode(false);
                setApiError(result.message || null);
            }
        } catch (error) {
            console.error('[StaffPage] Fetch error:', error);
            setIsApiMode(false);
            setApiError('Gagal terhubung ke server');
        } finally {
            setIsLoading(false);
        }
    }, [user?.token]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchKaryawan(currentPage, searchTerm);
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [fetchKaryawan, currentPage, searchTerm]);

    // Modal State
    const [editingStaff, setEditingStaff] = useState(null);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('full'); // 'full', 'personal', 'credentials'
    const [detailStaff, setDetailStaff] = useState(null);

    // Confirm Dialog State
    const [confirmConfig, setConfirmConfig] = useState(null);
    const pendingSaveRef = useRef(null);

    // ── Pilih source data: API atau Mock ──────────────────────────────────────
    const staffList = isApiMode ? apiStaff : mockStaffList;

    const filteredStaff = useMemo(() => {
        if (isApiMode) return staffList;
        return staffList.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.jabatan && s.jabatan.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.divisi && s.divisi.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.posisi && s.posisi.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [staffList, searchTerm, isApiMode]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    // Pagination - jika API mode, gunakan server pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStaff = isApiMode ? filteredStaff : filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = isApiMode
        ? (apiPagination?.last_page || 1)
        : Math.ceil(filteredStaff.length / itemsPerPage);
    const totalCount = isApiMode
        ? (apiPagination?.total || filteredStaff.length)
        : filteredStaff.length;

    /* ── Handlers ── */
    const handleOpenAdd = () => {
        setEditingStaff(null);
        setModalMode('full');
        setIsStaffModalOpen(true);
    };

    const handleOpenEdit = async (staff) => {
        if (!isApiMode) {
            setEditingStaff(staff);
            setModalMode('personal');
            setIsStaffModalOpen(true);
            return;
        }

        try {
            setIsLoading(true);
            const token = user?.token || localStorage.getItem('token');
            const result = await karyawanAPI.getById(token, staff.id);

            if (result.success && result.data) {
                setEditingStaff(mapKaryawanFromAPI(result.data));
            } else {
                setEditingStaff(staff); // Fallback ke data list
                showToast('Gagal mengambil data lengkap untuk diedit', 'error');
            }
        } catch (error) {
            setEditingStaff(staff);
            showToast('Terjadi kesalahan koneksi saat memuat data', 'error');
        } finally {
            setIsLoading(false);
            setModalMode('personal');
            setIsStaffModalOpen(true);
        }
    };

    const handleOpenCredentials = async (staff) => {
        if (!isApiMode) {
            setEditingStaff(staff);
            setModalMode('credentials');
            setIsStaffModalOpen(true);
            return;
        }

        try {
            setIsLoading(true);
            const token = user?.token || localStorage.getItem('token');
            const result = await karyawanAPI.getById(token, staff.id);

            if (result.success && result.data) {
                setEditingStaff(mapKaryawanFromAPI(result.data));
            } else {
                setEditingStaff(staff);
            }
        } catch (error) {
            setEditingStaff(staff);
        } finally {
            setIsLoading(false);
            setModalMode('credentials');
            setIsStaffModalOpen(true);
        }
    };

    // Dipanggil dari StaffFormModal saat klik Simpan
    const handleRequestSave = (formData) => {
        pendingSaveRef.current = formData;
        const isEdit = !!editingStaff;

        setConfirmConfig({
            icon: 'save',
            header: isEdit ? 'Konfirmasi Simpan' : 'Konfirmasi Tambah',
            message: isEdit ? 'Simpan perubahan data karyawan ini?' : 'Tambahkan data karyawan baru ini?',
            acceptLabel: isEdit ? 'Ya, Simpan' : 'Ya, Tambahkan',
            onAccept: async () => {
                const token = user?.token || localStorage.getItem('token');

                if (isApiMode) {
                    // Pakai API Asli
                    setIsLoading(true);
                    try {
                        if (isEdit) {
                            let result;
                            if (modalMode === 'credentials') {
                                result = await karyawanAPI.resetPassword(token, editingStaff.id, pendingSaveRef.current);
                            } else {
                                result = await karyawanAPI.update(token, editingStaff.id, pendingSaveRef.current);
                            }

                            if (result.success) {
                                showToast(
                                    modalMode === 'credentials'
                                        ? 'Password berhasil direset'
                                        : 'Data karyawan berhasil diperbarui',
                                    'success'
                                );
                                fetchKaryawan(currentPage);
                            } else {
                                showToast(result.message || 'Gagal memperbarui data', 'error');
                            }
                        } else {
                            const result = await karyawanAPI.create(token, pendingSaveRef.current);
                            if (result.success) {
                                showToast('Karyawan baru berhasil ditambahkan', 'success');
                                fetchKaryawan(currentPage);
                            } else {
                                showToast(result.message || 'Gagal menambah karyawan', 'error');
                            }
                        }
                    } catch (error) {
                        showToast('Terjadi kesalahan koneksi', 'error');
                    }
                    setIsLoading(false);
                } else {
                    // Fallback Mock
                    if (isEdit) {
                        updateStaff({ ...editingStaff, ...pendingSaveRef.current });
                        showToast('Data karyawan berhasil diperbarui (Mock)', 'success');
                    } else {
                        addStaff(pendingSaveRef.current);
                        showToast('Karyawan baru berhasil ditambahkan (Mock)', 'success');
                    }
                }

                setIsStaffModalOpen(false);
                pendingSaveRef.current = null;
            },
        });
    };



    const handleOpenDetail = async (staff) => {
        if (!isApiMode) {
            setDetailStaff(staff);
            return;
        }

        try {
            // Tampilkan loading dengan menggunakan global isLoading (bisa juga state terpisah)
            setIsLoading(true);
            const token = user?.token || localStorage.getItem('token');
            const result = await karyawanAPI.getById(token, staff.id);

            if (result.success && result.data) {
                setDetailStaff(mapKaryawanFromAPI(result.data));
            } else {
                setDetailStaff(staff); // Fallback ke data list
                showToast('Gagal mengambil detail penuh karyawan', 'error');
            }
        } catch (error) {
            setDetailStaff(staff);
        } finally {
            setIsLoading(false);
        }
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
                mode={modalMode}
            />
            <StaffDetailModal
                isOpen={!!detailStaff}
                onClose={() => setDetailStaff(null)}
                staff={detailStaff}
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">
                            {isReadOnly ? 'Data Karyawan' : 'Manajemen Karyawan'}
                        </h2>
                        {/* Badge sumber data */}
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isApiMode
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                : 'bg-amber-50 text-amber-600 border border-amber-200'
                            }`}>
                            {isApiMode
                                ? <><Wifi className="w-3 h-3" /> Live API</>
                                : <><WifiOff className="w-3 h-3" /> Mock Data</>}
                        </span>
                    </div>
                    <p className="text-primary/40 mt-1 font-bold text-sm">Kelola rincian dan akses seluruh karyawan klinik</p>
                    {apiError && !isApiMode && (
                        <p className="text-amber-500 text-xs font-semibold mt-1">
                            ⚠ {apiError} — menampilkan data lokal.
                        </p>
                    )}
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    {!isReadOnly && (
                        <button
                            onClick={handleOpenAdd}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Karyawan</span>
                        </button>
                    )}
                </div>
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
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">

                {isLoading ? (
                    <TableSkeleton rows={itemsPerPage} columns={isReadOnly ? 4 : 5} />
                ) : (
                    <>
                        {/* Desktop */}
                        <div className="hidden lg:block overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left border-collapse" style={{ minWidth: '860px' }}>
                                <thead>
                                    <tr className="border-b border-primary/5 bg-gray-50/30">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-primary/50">Nama Karyawan</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-primary/50">No. Telpon</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-primary/50">Email</th>
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
                                            onClick={() => handleOpenDetail(staff)}
                                        >
                                            <td className="px-6 py-3.5">
                                                <div className="flex items-center gap-3">
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
                                                <span className="text-sm font-medium text-primary/70">{staff.cabang}</span>
                                            </td>
                                            {!isReadOnly && (
                                                <td className="px-6 py-3.5 text-right">
                                                    <div className="flex justify-end gap-1.5">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleOpenEdit(staff); }}
                                                            className="p-2.5 rounded-xl bg-white border border-primary/10 text-primary/50 hover:text-primary hover:border-primary/20 hover:shadow-md transition-all active:scale-95"
                                                            title="Edit Profil & Username"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleOpenCredentials(staff); }}
                                                            className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-500 hover:text-amber-600 hover:bg-amber-100 hover:shadow-md transition-all active:scale-95"
                                                            title="Reset Password"
                                                        >
                                                            <Lock className="w-4 h-4" />
                                                        </button>

                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {currentStaff.length === 0 && (
                                        <tr>
                                            <td colSpan={isReadOnly ? 4 : 5}>
                                                <EmptyState
                                                    type="staff"
                                                    title="Karyawan Tidak Ditemukan"
                                                    description="Sistem tidak menemukan data karyawan yang sesuai dengan kriteria pencarian Anda. Pastikan nama atau jabatan yang Anda masukkan sudah benar."
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="lg:hidden divide-y divide-primary/5">
                            {currentStaff.map((staff) => (
                                <div key={staff.id} className="p-6 space-y-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleOpenDetail(staff)}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <h4 className="text-sm font-black text-primary tracking-tight">{staff.name}</h4>
                                                <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">{staff.kode_karyawan || staff.id}</p>
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
                                            <span className="text-[11px] font-bold tracking-wide">
                                                {staff.jabatan}
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
                                                <Edit3 className="w-3.5 h-3.5" /> Data Diri
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleOpenCredentials(staff); }}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-50 border border-amber-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-500 hover:text-white transition-all active:scale-95 shadow-sm"
                                            >
                                                <Lock className="w-3.5 h-3.5" /> Akun
                                            </button>

                                        </div>
                                    )}
                                </div>
                            ))}
                            {currentStaff.length === 0 && (
                                <EmptyState
                                    type="staff"
                                    title="Karyawan Tidak Ditemukan"
                                    description="Sistem tidak menemukan data karyawan yang sesuai dengan kriteria pencarian Anda."
                                />
                            )}
                        </div>
                    </>
                )}

                {/* Pagination Footer */}
                <div className="p-6 md:p-8 bg-gray-50/30 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40">
                    <span>
                        {isApiMode
                            ? `Total ${totalCount} karyawan • Halaman ${currentPage} dari ${totalPages}`
                            : `Menampilkan ${totalCount === 0 ? 0 : indexOfFirstItem + 1} hingga ${Math.min(indexOfLastItem, totalCount)} dari ${totalCount} data`
                        }
                    </span>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => {
                                const prev = currentPage - 1;
                                setCurrentPage(prev);
                            }}
                            disabled={currentPage === 1}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-primary/10 bg-white hover:bg-gray-50 text-primary transition-all disabled:opacity-30 active:scale-95 shadow-sm"
                        >
                            Sebelumnya
                        </button>
                        <button
                            onClick={() => {
                                const next = currentPage + 1;
                                setCurrentPage(next);
                            }}
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
