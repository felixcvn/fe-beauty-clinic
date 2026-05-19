import React, { useState, useMemo, useEffect } from 'react';
import { 
    Calendar, 
    Plus, 
    Search,
    Phone,
    User,
    Clock,
    Info,
    CheckCircle2,
    Clock4,
    AlertCircle,
    XCircle,
    Edit3,
    Trash2,
    Star,
    Award,
    Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { reservasiAPI } from '../../services/api';
import ReservationFormModal from '../../components/UI/ReservationFormModal';
import ConfirmModal from '../../components/UI/ConfirmModal';
import TableSkeleton from '../../components/UI/TableSkeleton';
import StatsCard from '../Dashboard/StatsCard';

const ReservationsPage = () => {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [bookings, setBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [confirmConfig, setConfirmConfig] = useState(null);
    const [fetchTrigger, setFetchTrigger] = useState(0);

    // Fetch real data from API
    useEffect(() => {
        const fetchReservations = async () => {
            if (!user?.token) return;
            setIsLoading(true);
            try {
                const result = await reservasiAPI.getAll(user.token);
                if (result.success) {
                    const rawData = result.data;
                    const dataArray = Array.isArray(rawData) ? rawData : (rawData?.data || []);
                    setBookings(dataArray);
                } else {
                    showToast(result.message, 'error');
                }
            } catch (error) {
                console.error("Failed to fetch reservations", error);
                showToast("Gagal terhubung ke server", "error");
            } finally {
                setIsLoading(false);
            }
        };
        fetchReservations();
    }, [user, fetchTrigger]);

    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            const patientName = String(booking.pasien?.Nama_pasien || booking.pasien?.nama_pasien || booking.Nama_pasien || '').toLowerCase();
            const phone = String(booking.No_Telp || booking.pasien?.no_Telp || booking.pasien?.no_telp || '');
            const staffName = String(booking.Pendaftar_pasien || booking.karyawan?.NamaLengkap_karyawan || '').toLowerCase();
            const treatmentName = String(booking.Nama_treatment || '').toLowerCase();
            const search = searchTerm.toLowerCase();

            return (
                patientName.includes(search) ||
                phone.includes(searchTerm) ||
                staffName.includes(search) ||
                treatmentName.includes(search)
            );
        });
    }, [bookings, searchTerm]);

    const stats = useMemo(() => {
        const favoriteTreatment = bookings.reduce((acc, b) => {
            const name = b.Nama_treatment;
            if (name) acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});
        
        const topStaff = bookings.reduce((acc, b) => {
            const name = b.Pendaftar_pasien || b.karyawan?.NamaLengkap_karyawan;
            if (name) acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});

        const getTop = (obj) => {
            const entries = Object.entries(obj);
            if (!entries.length) return '-';
            return entries.reduce((a, b) => b[1] > a[1] ? b : a)[0];
        };

        return {
            total: bookings.length,
            favorite: getTop(favoriteTreatment),
            topStaff: getTop(topStaff)
        };
    }, [bookings]);

    const handleDelete = async (id) => {
        try {
            const result = await reservasiAPI.delete(user.token, id);
            if (result.success) {
                showToast('Reservasi berhasil dihapus', 'success');
                setFetchTrigger(prev => prev + 1);
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            showToast('Gagal menghapus reservasi', 'error');
        }
    };

    const openEditModal = (booking) => {
        setEditingBooking(booking);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingBooking(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 lg:gap-0">
                <div className="w-full lg:w-auto">
                    <h2 className="text-4xl md:text-5xl lg:text-4xl font-black text-primary tracking-tighter leading-[0.9]">
                        Ringkasan <br className="hidden sm:block lg:hidden" /> Reservasi
                    </h2>
                    <p className="text-primary/40 mt-4 font-bold text-sm md:text-base">
                        Kelola antrian dan jadwal kunjungan customer secara real-time
                    </p>
                </div>
                <button 
                    onClick={openAddModal}
                    className="w-full lg:w-auto flex items-center justify-center gap-3 bg-primary text-secondary px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    Tambah Reservasi
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                <StatsCard title="Total Reservasi" value={stats.total} icon={Calendar} trend="up" />
                <StatsCard title="Treatment Favorit" value={stats.favorite} icon={Star} trend="up" />
                <StatsCard title="Pendaftar Teraktif" value={stats.topStaff} icon={Award} trend="up" />
                <StatsCard title="Jam Padat" value="14:00 - 16:00" icon={Clock} trend="up" />
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2rem] md:rounded-[1rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-primary/5 bg-gray-50/30">
                    <div className="relative w-full group">
                        <Search className="w-5 h-5 text-primary/20 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari nama, telp, atau Karyawan..."
                            className="w-full pl-12 pr-4 py-4 bg-white border border-primary/5 rounded-2xl text-primary placeholder:text-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium text-sm shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <TableSkeleton rows={8} columns={6} />
                ) : (
                    <>
                        <div className="hidden lg:block overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5 bg-gray-50/30">
                                        <th className="px-6 py-4 text-primary/80">Waktu</th>
                                        <th className="px-6 py-4 text-primary/80">Nama Customer</th>
                                        <th className="px-6 py-4 text-primary/80">Layanan</th>
                                        <th className="px-6 py-4 text-primary/80">Pendaftar</th>
                                        <th className="px-6 py-4 text-primary/80">Keterangan</th>
                                        <th className="px-6 py-4 text-right text-primary/80">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5">
                                    {filteredBookings.length > 0 ? (
                                        filteredBookings.map((booking) => {
                                            const patientName = booking.pasien?.Nama_pasien || booking.pasien?.nama_pasien || booking.Nama_pasien || 'Unknown';
                                            const phone = booking.No_Telp || booking.pasien?.no_Telp || booking.pasien?.no_telp || '-';
                                            
                                            return (
                                            <tr key={booking.id} className="group hover:bg-primary/[0.02] transition-colors cursor-default">
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                                            <Clock className="w-3.5 h-3.5 text-primary/30" />
                                                            {booking.Jam_reservasi ? String(booking.Jam_reservasi).substring(0, 5) : '--:--'}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-primary/40 font-black text-[9px] uppercase tracking-widest">
                                                            <Calendar className="w-3 h-3" />
                                                            {booking.Tanggal_reservasi}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-black text-primary tracking-tight">{patientName}</p>
                                                        <p className="text-[10px] font-bold text-primary/40 flex items-center gap-1.5">
                                                            <Phone className="w-3 h-3" /> {phone}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-primary/80">
                                                        <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                                            {booking.paket_treatment_id ? <Plus className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                                        </div>
                                                        <span className="text-xs font-black uppercase tracking-tight truncate max-w-[150px]">{booking.Nama_treatment || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-primary/80">
                                                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center border border-primary/5">
                                                            <User className="w-3 h-3" />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-wider">{booking.Pendaftar_pasien || 'System'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="max-w-xs text-primary/60 text-xs font-medium italic line-clamp-2">
                                                        {booking.Keterangan || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(booking)}
                                                            className="p-2.5 rounded-xl bg-white border border-primary/10 text-primary/50 hover:text-primary hover:border-primary/20 hover:shadow-md transition-all active:scale-95"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmConfig({
                                                                icon: 'delete',
                                                                header: 'Hapus Reservasi?',
                                                                message: `Yakin ingin menghapus reservasi ${patientName}?`,
                                                                acceptLabel: 'HAPUS',
                                                                onAccept: () => handleDelete(booking.id)
                                                            })}
                                                            className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-400 hover:text-red-500 hover:bg-red-100 hover:shadow-md transition-all active:scale-95"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )})
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-8 py-20 text-center text-primary/20 font-black uppercase text-xs tracking-widest">
                                                Belum ada data reservasi
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile view simplified */}
                        <div className="lg:hidden divide-y divide-primary/5">
                            {filteredBookings.map((booking) => (
                                <div key={booking.id} className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black text-xs">
                                                {booking.Jam_reservasi ? String(booking.Jam_reservasi).substring(0, 5) : '--:--'}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-primary text-sm">{booking.pasien?.Nama_pasien || booking.Nama_pasien}</h4>
                                                <p className="text-[10px] font-bold text-primary/40">{booking.Tanggal_reservasi}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEditModal(booking)} className="p-2 bg-white border border-primary/5 rounded-lg"><Edit3 className="w-3.5 h-3.5 text-primary/40" /></button>
                                            <button onClick={() => setConfirmConfig({
                                                                icon: 'delete',
                                                                header: 'Hapus Reservasi?',
                                                                message: `Yakin ingin menghapus reservasi?`,
                                                                acceptLabel: 'HAPUS',
                                                                onAccept: () => handleDelete(booking.id)
                                                            })} className="p-2 bg-red-50 border border-red-100 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60 bg-secondary/30 p-3 rounded-xl border border-primary/5">
                                        <Sparkles className="w-3 h-3" /> {booking.Nama_treatment || '-'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <ReservationFormModal 
                isOpen={isModalOpen} 
                onClose={() => { setIsModalOpen(false); setEditingBooking(null); }}
                initialData={editingBooking}
                onSuccess={() => setFetchTrigger(prev => prev + 1)}
            />

            <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />
        </div>
    );
};

export default ReservationsPage;
