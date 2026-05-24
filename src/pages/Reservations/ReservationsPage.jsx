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

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    } catch (e) {
        return dateStr;
    }
};

const getTreatmentNames = (booking) => {
    if (!booking) return '';
    const names = [];
    
    // Check treatments array
    if (Array.isArray(booking.treatments) && booking.treatments.length > 0) {
        booking.treatments.forEach(t => {
            const name = t.Nama_treatment || t.nama_treatment || t.name || t.Nama_Treatment;
            if (name) names.push(name);
        });
    }
    
    // Check paket_treatments array
    if (Array.isArray(booking.paket_treatments) && booking.paket_treatments.length > 0) {
        booking.paket_treatments.forEach(p => {
            const name = p.Nama_paket || p.nama_paket || p.name || p.Nama_Paket;
            if (name) names.push(name);
        });
    }
    
    if (names.length > 0) {
        return names.join(', ');
    }
    
    // Fallback to single fields
    return booking.Nama_treatment || booking.nama_treatment || booking.Nama_paket || booking.nama_paket || '-';
};

const DEFAULT_SLOTS = [
    { time: '08:00', active: true },
    { time: '09:00', active: true },
    { time: '10:00', active: true },
    { time: '11:00', active: true },
    { time: '12:00', active: true },
    { time: '13:00', active: true },
    { time: '14:00', active: true },
    { time: '15:00', active: true },
    { time: '16:00', active: true },
    { time: '17:00', active: true }
];

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

    // Available slots management state
    const [availableSlots, setAvailableSlots] = useState(() => {
        const saved = localStorage.getItem('clinic_available_slots');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    return parsed.filter(slot => slot.time <= '17:00');
                }
            } catch (e) {
                console.error("Failed to parse saved slots", e);
            }
        }
        return DEFAULT_SLOTS;
    });

    const canManageSlots = useMemo(() => {
        return ['Supervisor Treatment', 'Super Admin', 'Owner'].includes(user?.role);
    }, [user]);

    const toggleSlot = (time) => {
        const updated = availableSlots.map(slot => 
            slot.time === time ? { ...slot, active: !slot.active } : slot
        );
        setAvailableSlots(updated);
        localStorage.setItem('clinic_available_slots', JSON.stringify(updated));
        
        const isNowActive = updated.find(s => s.time === time).active;
        showToast(
            `Slot jam ${time} berhasil ${isNowActive ? 'diaktifkan' : 'dinonaktifkan'}`,
            isNowActive ? 'success' : 'info'
        );
    };

    useEffect(() => {
        const saved = localStorage.getItem('clinic_available_slots');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.some(slot => slot.time > '17:00')) {
                    const filtered = parsed.filter(slot => slot.time <= '17:00');
                    localStorage.setItem('clinic_available_slots', JSON.stringify(filtered));
                }
            } catch (e) {
                // ignore error
            }
        }
    }, []);

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
            const treatmentName = String(getTreatmentNames(booking) || '').toLowerCase();
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
            const names = [];
            if (Array.isArray(b.treatments) && b.treatments.length > 0) {
                b.treatments.forEach(t => {
                    const n = t.Nama_treatment || t.nama_treatment || t.name || t.Nama_Treatment;
                    if (n) names.push(n);
                });
            } else if (Array.isArray(b.paket_treatments) && b.paket_treatments.length > 0) {
                b.paket_treatments.forEach(p => {
                    const n = p.Nama_paket || p.nama_paket || p.name || p.Nama_Paket;
                    if (n) names.push(n);
                });
            } else if (b.Nama_treatment) {
                names.push(b.Nama_treatment);
            }
            
            names.forEach(name => {
                acc[name] = (acc[name] || 0) + 1;
            });
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
                    <h2 className="text-4xl md:text-5xl lg:text-4xl font-black text-primary tracking-tighter leading-[0.9]">Reservasi
                    </h2>
                    <p className="text-primary/40 mt-4 font-bold text-sm md:text-base">
                        Kelola antrian dan jadwal kunjungan customer secara efisien
                    </p>
                </div>
                <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={openAddModal}
                        className="flex items-center justify-center gap-3 bg-primary text-secondary px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        Tambah Reservasi
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                <StatsCard title="Total Reservasi" value={stats.total} icon={Calendar} trend="up" />
                <StatsCard title="Treatment Favorit" value={stats.favorite} icon={Star} trend="up" />
                <StatsCard title="Pendaftar Teraktif" value={stats.topStaff} icon={Award} trend="up" />
                <StatsCard title="Jam Padat" value="14:00 - 16:00" icon={Clock} trend="up" />
            </div>

            {/* Available Slots Management Panel */}
            {canManageSlots && (
                <div className="bg-white rounded-[2rem] border border-primary/5 p-6 md:p-8 shadow-2xl shadow-primary/5 animate-fade-in-up space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/5 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-primary uppercase tracking-tight">Pengaturan Jam Tersedia</h3>
                                <p className="text-[10px] font-bold text-primary/40 uppercase tracking-wider mt-0.5">Aktifkan atau nonaktifkan slot waktu kunjungan untuk reservasi</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-secondary/30 px-4 py-2 rounded-full border border-primary/5 self-start sm:self-auto">
                            <Info className="w-3.5 h-3.5 text-primary/40" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Disimpan otomatis</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
                        {availableSlots.map((slot) => (
                            <button
                                key={slot.time}
                                onClick={() => toggleSlot(slot.time)}
                                className={`group relative py-4 px-4 rounded-2xl font-black text-sm transition-all duration-300 active:scale-95 border flex flex-col items-center justify-center gap-1.5 overflow-hidden ${
                                    slot.active
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm hover:bg-emerald-100 hover:scale-[1.02]'
                                        : 'bg-gray-50 text-gray-400 border-gray-100/70 hover:bg-gray-100/70 hover:text-gray-500 hover:scale-[1.02]'
                                }`}
                            >
                                <span className="text-base tracking-tight">{slot.time}</span>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                                    slot.active ? 'bg-emerald-200/50 text-emerald-800' : 'bg-gray-200/60 text-gray-500'
                                }`}>
                                    {slot.active ? 'Aktif' : 'Tutup'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

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
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-1.5 bg-primary/5 px-2.5 py-1.5 rounded-xl text-primary font-black text-xs">
                                                                <Clock className="w-3.5 h-3.5 text-primary/50" />
                                                                {booking.Jam_reservasi ? String(booking.Jam_reservasi).substring(0, 5) : '--:--'} WIB
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-primary/60 font-bold text-xs">
                                                                <Calendar className="w-3.5 h-3.5 text-primary/30" />
                                                                {formatDate(booking.Tanggal_reservasi)}
                                                            </div>
                                                        </div>
                                                    </td>
                                                     <td className="px-6 py-4">
                                                         <div className="space-y-1">
                                                             <p className="text-md font-medium text-primary tracking-tight">{patientName}</p>
                                                             {phone && phone !== '-' && (
                                                                 <p className="text-[11px] font-bold text-primary/40 flex items-center gap-1.5 mt-0.5">
                                                                     <Phone className="w-3.5 h-3.5 text-primary/30" />
                                                                     {phone}
                                                                 </p>
                                                             )}
                                                         </div>
                                                     </td>
                                                     <td className="px-6 py-4">
                                                         <div className="flex items-center text-primary/80">
                                                             <span className="text-md font-medium tracking-tight truncate max-w-[280px]" title={getTreatmentNames(booking)}>
                                                                 {getTreatmentNames(booking)}
                                                             </span>
                                                         </div>
                                                     </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-primary/80">
                                                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center border border-primary/5">
                                                                <User className="w-3 h-3" />
                                                            </div>
                                                            <span className="text-md font-medium tracking-tight">{booking.Pendaftar_pasien || 'System'}</span>
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
                                            )
                                        })
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
                                                <div className="space-y-0.5 mt-0.5">
                                                    <p className="text-xs font-bold text-primary/60">{formatDate(booking.Tanggal_reservasi)}</p>
                                                    <p className="text-[10px] font-bold text-primary/40 flex items-center gap-1"><Phone className="w-3 h-3 text-primary/30" /> {booking.No_Telp || booking.pasien?.no_Telp || booking.pasien?.no_telp || '-'}</p>
                                                </div>
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
                                    <div className="flex items-start gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60 bg-secondary/30 p-3 rounded-xl border border-primary/5">
                                        <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
                                        <span className="leading-relaxed">{getTreatmentNames(booking)}</span>
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
                bookings={bookings}
                onSuccess={() => setFetchTrigger(prev => prev + 1)}
            />

            <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />
        </div>
    );
};

export default ReservationsPage;
