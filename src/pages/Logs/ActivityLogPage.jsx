import React, { useState, useEffect } from 'react';
import { ChartBarIcon as Activity, MagnifyingGlassIcon as Search, ShieldExclamationIcon as ShieldAlert, ClockIcon as Clock, UserIcon as User, FunnelIcon as Filter, ExclamationTriangleIcon as AlertTriangle, ExclamationCircleIcon as AlertCircle, InformationCircleIcon as Info, HashtagIcon as Hash, ChevronLeftIcon as ChevronLeft, ChevronRightIcon as ChevronRight, ArrowPathIcon as Loader2, CalendarIcon as Calendar } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { activityLogsAPI } from '../../services/api';

const ActivityLogPage = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);

    const [dateFilter, setDateFilter] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset page on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchLogs = async () => {
        setIsLoading(true);
        const result = await activityLogsAPI.getAll(user?.token, page, debouncedSearch, dateFilter);
        if (result.success) {
            setLogs(result.data.data || []);
            setTotalPages(result.data.last_page || 1);
            setTotalLogs(result.data.total || 0);
        } else {
            setLogs([]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (user?.token) {
            fetchLogs();
        }
    }, [page, debouncedSearch, dateFilter, user?.token]);

    const getActionBadgeClass = (action) => {
        const type = action?.toUpperCase() || '';
        if (type.includes('CREATE') || type.includes('TAMBAH')) {
            return 'bg-blue-50 text-blue-600 border border-blue-100';
        }
        if (type.includes('UPDATE') || type.includes('UBAH')) {
            return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
        }
        if (type.includes('DELETE') || type.includes('HAPUS')) {
            return 'bg-red-50 text-red-600 border border-red-100';
        }
        if (type.includes('LOGIN') || type.includes('LOGOUT')) {
            return 'bg-violet-50 text-violet-600 border border-violet-100';
        }
        return 'bg-amber-50 text-amber-600 border border-amber-100';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('id-ID', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            }).format(date);
        } catch(e) {
            return dateString;
        }
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 lg:gap-0">
                <div className="w-full lg:w-auto">
                    <h2 className="text-4xl md:text-5xl lg:text-4xl font-black text-primary tracking-tighter leading-[0.9]">
                        Log Aktivitas
                    </h2>
                    <p className="text-primary/40 mt-4 font-bold text-sm md:text-base">
                        Pantau seluruh aktivitas karyawan dan histori sistem
                    </p>
                </div>
                <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
                    <div className="bg-primary/5 text-primary px-6 py-4 rounded-card border border-primary/10 flex items-center gap-3">
                        <Activity className="w-5 h-5" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Aktivitas</p>
                            <p className="text-lg font-black leading-none mt-1">{totalLogs}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-card border border-primary/5 p-4 md:p-6 elevation-2 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:flex-1 group">
                    <Search className="w-5 h-5 text-primary/20 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Cari user, aksi, modul, atau detail..."
                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-primary/5 rounded-2xl text-primary placeholder:text-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium text-sm shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative w-full md:w-auto group">
                    <Calendar className="w-5 h-5 text-primary/20 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors pointer-events-none" />
                    <input
                        type="date"
                        className="w-full md:w-48 pl-12 pr-4 py-4 bg-gray-50/50 border border-primary/5 rounded-2xl text-primary placeholder:text-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium text-sm shadow-sm cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                        value={dateFilter}
                        onChange={(e) => {
                            setDateFilter(e.target.value);
                            setPage(1); // Reset page when date changes
                        }}
                    />
                </div>
                {dateFilter && (
                    <button
                        onClick={() => {
                            setDateFilter('');
                            setPage(1);
                        }}
                        className="w-full md:w-auto px-6 py-4 bg-red-50/50 hover:bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        Hapus Filter Tanggal
                    </button>
                )}
            </div>

            {/* Activity List */}
            <div className="bg-white rounded-card border border-primary/5 elevation-2 overflow-hidden">
                <div className="hidden lg:block overflow-x-auto scrollbar-hide min-h-[400px] relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    )}
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5 bg-gray-50/30">
                                <th className="px-6 py-5 text-primary/80">Waktu &amp; ID</th>
                                <th className="px-6 py-5 text-primary/80">User</th>
                                <th className="px-6 py-5 text-primary/80">Modul &amp; Aksi</th>
                                <th className="px-6 py-5 text-primary/80">Detail Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {logs.length > 0 ? (
                                logs.map((log) => {
                                    const userName = log.karyawan?.NamaLengkap_karyawan || log.karyawan?.Username || log.user?.NamaLengkap_karyawan || log.user?.Username || 'Sistem';
                                    const userRole = log.karyawan?.Divisi || log.user?.Divisi || 'Sistem';
                                    const initials = userName.substring(0, 2).toUpperCase();

                                    return (
                                        <tr key={log.id} className="group hover:bg-primary/[0.02] transition-colors cursor-default">
                                            <td className="px-6 py-4">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-1.5 text-primary font-bold text-xs bg-primary/5 w-fit px-2.5 py-1 rounded-lg">
                                                        <Clock className="w-3.5 h-3.5 text-primary/50" />
                                                        {formatDate(log.created_at)}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-primary/30 font-bold text-[10px] uppercase tracking-widest">
                                                        <Hash className="w-3 h-3" />
                                                        {String(log.id).substring(0, 8)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <p className="text-sm font-bold text-primary tracking-tight leading-tight">{userName}</p>
                                                        <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mt-0.5">{userRole}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1.5">
                                                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">{log.module}</p>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getActionBadgeClass(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-primary/80 line-clamp-2 max-w-sm">
                                                    {log.details}
                                                </p>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                !isLoading && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3 text-primary/20">
                                                <ShieldAlert className="w-12 h-12 opacity-50" />
                                                <p className="font-black uppercase text-xs tracking-widest">Belum ada log aktivitas</p>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden divide-y divide-primary/5 relative min-h-[300px]">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    )}
                    {logs.length > 0 ? (
                        logs.map(log => {
                            const userName = log.karyawan?.NamaLengkap_karyawan || log.karyawan?.Username || log.user?.NamaLengkap_karyawan || log.user?.Username || 'Sistem';
                            const userRole = log.karyawan?.Divisi || log.user?.Divisi || 'Sistem';
                            const initials = userName.substring(0, 2).toUpperCase();

                            return (
                                <div key={log.id} className="p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <p className="text-sm font-bold text-primary tracking-tight leading-tight">{userName}</p>
                                                <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mt-0.5">{userRole}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-primary/5 space-y-2">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">{log.module}</p>
                                                <div className="mt-1">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getActionBadgeClass(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-primary/50 text-[10px] font-bold bg-white px-2 py-1 rounded-lg border border-primary/5">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(log.created_at)}
                                            </div>
                                        </div>
                                        <p className="text-xs text-primary/70 font-medium pt-2 border-t border-primary/5">
                                            {log.details}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        !isLoading && (
                            <div className="p-12 text-center text-primary/20 font-black uppercase text-xs tracking-widest">
                                Belum ada log aktivitas
                            </div>
                        )
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-primary/5 flex items-center justify-between bg-gray-50/50">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-xl border border-primary/10 text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/5 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <p className="text-xs font-bold text-primary/60 uppercase tracking-widest">
                            Halaman {page} dari {totalPages}
                        </p>
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-xl border border-primary/10 text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/5 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogPage;
