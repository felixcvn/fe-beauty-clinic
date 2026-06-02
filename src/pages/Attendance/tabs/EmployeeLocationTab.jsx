import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, Filter, Edit2, MapPin, Clock, X, Settings, CheckCircle2 } from 'lucide-react';
import { karyawanAPI } from '../../../services/api';
import { getActiveShift, getShiftOptionsByDivisi } from '../../../utils/shiftConfig';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import CustomSelect from '../../../components/UI/CustomSelect';
import TableSkeleton from '../../../components/UI/TableSkeleton';
import EmptyState from '../../../components/UI/EmptyState';

// Helper for title case and API mapping
const formatTitleCase = (str) => {
    if (!str) return '';
    let cleaned = str.replace(/\s*-\s*/g, ' - ').replace(/(\s*-\s*)+$/, '').trim();
    return cleaned.split(' ').map((word, index) => {
        if (word === '-') return '-';
        const lower = word.toLowerCase();
        const upper = word.toUpperCase();
        if (['HRD', 'OB', 'CS', 'IT'].includes(upper)) return upper;
        if (['of', 'and'].includes(lower) && index !== 0) return lower;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
};

const mapKaryawanFromAPI = (k) => {
    let rawPosisi = (k.Jabatan || k.jabatan || '').trim();
    let rawDivisi = (k.Divisi || k.divisi || '').trim();
    rawPosisi = rawPosisi.replace(/(\s*-\s*)+$/, '');
    rawDivisi = rawDivisi.replace(/(\s*-\s*)+$/, '');
    let posisi = formatTitleCase(rawPosisi) || '-';
    let divisi = formatTitleCase(rawDivisi) || '-';

    return {
        id: k.id,
        name: k.nama_lengkap || k.NamaLengkap_karyawan,
        divisi: divisi,
        posisi: posisi,
        kode_karyawan: k.kode_karyawan || k.Kode_Karyawan || k.id,
        shift: k.shift || '',
        lokasi_absen: k.lokasi_absen || 'Di Kantor',
    };
};

const EmployeeSettingsModal = ({ isOpen, onClose, employee, onSave }) => {
    const { showToast } = useToast();
    const [shift, setShift] = useState('');
    const [lokasiAbsen, setLokasiAbsen] = useState('Di Kantor');

    useEffect(() => {
        if (employee) {
            setShift(employee.shift || getShiftOptionsByDivisi(employee.divisi)[0]?.value || '');
            setLokasiAbsen(employee.lokasi_absen || 'Di Kantor');
        }
    }, [employee]);

    if (!isOpen || !employee) return null;

    const shiftOptions = getShiftOptionsByDivisi(employee.divisi);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(employee.id, { shift, lokasi_absen: lokasiAbsen });
        showToast('Konfigurasi karyawan berhasil diperbarui', 'success');
        onClose();
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-visible animate-fade-in-up flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/40 hover:scale-105 active:scale-95 transition-all z-[60] shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="relative p-8 pb-6 bg-primary overflow-hidden shrink-0 rounded-t-[2.5rem]">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>

                    <div className="relative z-10 flex items-center gap-4 pr-12">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-secondary backdrop-blur-sm border border-white/10">
                            <Settings className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">Konfigurasi</h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">{employee.name}</p>
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-8 overflow-visible flex-1 bg-gray-50/30 rounded-b-[2.5rem]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Shift Kerja</label>
                            <CustomSelect 
                                value={shift}
                                onChange={setShift}
                                options={shiftOptions}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Lokasi Absen</label>
                            <CustomSelect 
                                value={lokasiAbsen}
                                onChange={setLokasiAbsen}
                                options={[
                                    { value: 'Di Kantor', label: 'Di Kantor' },
                                    { value: 'Di Luar Kantor', label: 'Di Luar Kantor' }
                                ]}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 mt-4"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Simpan Perubahan
                        </button>
                    </form>
                </div>
            </div>
        </div>
    , document.body);
};

const EmployeeLocationTab = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState(null);

    const fetchKaryawan = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            const token = user?.token || localStorage.getItem('token');
            const result = await karyawanAPI.getAll(token, page);

            if (result.success && result.data) {
                const paginatedData = result.data.data;
                const employeeArray = paginatedData?.data || [];
                const mapped = employeeArray.map(mapKaryawanFromAPI);
                setEmployees(mapped);
                setPaginationInfo(paginatedData);
            }
        } catch (error) {
            console.error('[EmployeeLocationTab] Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user?.token]);

    useEffect(() => {
        fetchKaryawan(1);
    }, [fetchKaryawan]);

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => 
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.divisi.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);

    const handleEditClick = (emp) => {
        setSelectedEmployee(emp);
        setIsModalOpen(true);
    };

    const handleSaveSettings = (id, data) => {
        // In a real app, send update to backend.
        // For now, update local state
        setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...data } : emp));
    };

    const totalPages = paginationInfo?.last_page || 1;
    const totalCount = paginationInfo?.total || employees.length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-xl font-black text-primary tracking-tighter">Daftar Konfigurasi Karyawan</h3>
                    <p className="text-primary/40 text-sm font-medium">Kelola shift, penempatan cabang, dan radius kerja karyawan.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary/5 text-primary font-bold text-sm hover:bg-primary/10 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </div>

            <div className="w-full relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                <input 
                    type="text" 
                    placeholder="Cari karyawan atau divisi..." 
                    className="w-full pl-12 pr-6 py-3 rounded-2xl bg-primary/5 border-none outline-none text-primary placeholder:text-primary/30 font-medium text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 border-b border-primary/10">
                            <th className="px-4 py-4">Karyawan</th>
                            <th className="px-4 py-4">Divisi</th>
                            <th className="px-4 py-4">Shift</th>
                            <th className="px-4 py-4">Lokasi Absen</th>
                            <th className="px-4 py-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                        {isLoading ? (
                            <tr>
                                <td colSpan="5">
                                    <TableSkeleton rows={5} columns={5} />
                                </td>
                            </tr>
                        ) : filteredEmployees.length > 0 ? (
                            filteredEmployees.map((emp) => {
                                const activeShift = getActiveShift(emp.shift || getShiftOptionsByDivisi(emp.divisi)[0]?.value, false);
                                
                                return (
                                    <tr key={emp.id} className="hover:bg-primary/[0.02] transition-colors">
                                        <td className="px-4 py-4">
                                            <div>
                                                <div className="font-bold text-primary text-sm">{emp.name}</div>
                                                <div className="text-[10px] text-primary/40 font-black uppercase tracking-widest mt-0.5">{emp.kode_karyawan}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-wider">
                                                {emp.divisi}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm font-bold text-primary/80">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-primary/30" />
                                                {activeShift.label}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm font-bold text-primary/80">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-primary/40" />
                                                {emp.lokasi_absen}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button onClick={() => handleEditClick(emp)} className="p-2 hover:bg-primary/5 rounded-lg text-primary/40 hover:text-primary transition-colors" title="Pengaturan Karyawan">
                                                <Edit2 className="w-4 h-4 mx-auto" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5">
                                    <EmptyState type="staff" title="Karyawan Tidak Ditemukan" description="Data karyawan tidak ditemukan." />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-primary/40 mt-4 border-t border-primary/10 pt-4 gap-4">
                <span>
                    Menampilkan dari total {totalCount} Karyawan
                </span>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => {
                            const prev = currentPage - 1;
                            setCurrentPage(prev);
                            fetchKaryawan(prev);
                        }}
                        disabled={currentPage === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-primary/10 hover:bg-primary/5 transition-colors disabled:opacity-30"
                    >
                        &lt;
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-secondary shadow-md shadow-primary/20">
                        {currentPage}
                    </button>
                    <button 
                        onClick={() => {
                            const next = currentPage + 1;
                            setCurrentPage(next);
                            fetchKaryawan(next);
                        }}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-primary/10 hover:bg-primary/5 transition-colors disabled:opacity-30"
                    >
                        &gt;
                    </button>
                </div>
            </div>

            <EmployeeSettingsModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                employee={selectedEmployee} 
                onSave={handleSaveSettings}
            />
        </div>
    );
};

export default EmployeeLocationTab;
