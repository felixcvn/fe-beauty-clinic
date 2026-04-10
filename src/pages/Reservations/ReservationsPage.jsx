import React, { useState } from 'react';
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
    XCircle
} from 'lucide-react';
import { useMockData } from '../../context/MockDataContext';
import ReservationFormModal from '../../components/UI/ReservationFormModal';

const ReservationsPage = () => {
    const { bookings } = useMockData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredBookings = bookings.filter(booking => 
        (booking.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (booking.phone?.includes(searchTerm)) ||
        (booking.broughtByStaff?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'waiting':
            case 'menunggu':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return <CheckCircle2 className="w-3 h-3" />;
            case 'waiting':
            case 'menunggu':
                return <Clock4 className="w-3 h-3" />;
            case 'cancelled':
                return <XCircle className="w-3 h-3" />;
            default:
                return <AlertCircle className="w-3 h-3" />;
        }
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">
                        Ringkasan Reservasi
                    </h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm">
                        Kelola antrian dan jadwal kunjungan customer
                    </p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300 group shadow-lg"
                >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                    Tambah Reservasi
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Reservasi', value: bookings.length, color: 'text-primary', bg: 'bg-primary/5', icon: Calendar },
                    { label: 'Terkonfirmasi', value: bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length, color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
                    { label: 'Menunggu', value: bookings.filter(b => b.status?.toLowerCase() === 'waiting' || b.status?.toLowerCase() === 'menunggu').length, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock4 },
                    { label: 'Jam Padat', value: '14:00 - 16:00', color: 'text-[#8E7AB5]', bg: 'bg-[#8E7AB5]/5', icon: Clock },
                ].map((stat, i) => (
                    <div key={i} className={`${stat.bg} p-6 rounded-[2rem] border border-white/50 backdrop-blur-sm relative overflow-hidden group hover:scale-[1.02] transition-all`}>
                        <stat.icon className={`w-12 h-12 absolute -right-2 -bottom-2 opacity-10 group-hover:rotate-12 transition-transform ${stat.color}`} />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className={`text-2xl font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="p-6 md:p-6 border-b border-primary/5 bg-gray-50/30">
                    <div className="relative w-full group">
                        <Search className="w-5 h-5 text-primary/20 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari nama, telp, atau pegawai..."
                            className="w-full pl-12 pr-4 py-4 bg-white border border-primary/5 rounded-2xl text-primary placeholder:text-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none font-bold text-sm shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-primary/40 uppercase tracking-widest border-b border-primary/5">Waktu Kedatangan</th>
                                <th className="px-8 py-5 text-[10px] font-black text-primary/40 uppercase tracking-widest border-b border-primary/5">Detail Customer</th>
                                <th className="px-8 py-5 text-[10px] font-black text-primary/40 uppercase tracking-widest border-b border-primary/5">Pendaftar</th>
                                <th className="px-8 py-5 text-[10px] font-black text-primary/40 uppercase tracking-widest border-b border-primary/5">Keterangan</th>
                                <th className="px-8 py-5 text-[10px] font-black text-primary/40 uppercase tracking-widest border-b border-primary/5 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {filteredBookings.length > 0 ? (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="group hover:bg-primary/[0.02] transition-colors cursor-default">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-secondary transition-all">
                                                    <Clock className="w-5 h-5 text-primary group-hover:text-secondary" />
                                                </div>
                                                <span className="font-black text-primary tracking-tighter text-lg">{booking.time}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <p className="font-black text-primary group-hover:translate-x-1 transition-transform">{booking.name}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-primary/40 font-black uppercase tracking-widest">
                                                    <Phone className="w-3 h-3" />
                                                    {booking.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-primary/60">
                                                <User className="w-4 h-4 opacity-40" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{booking.broughtByStaff}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-start gap-2 max-w-xs group-hover:bg-white p-2 rounded-xl transition-all border border-transparent group-hover:border-primary/5">
                                                <Info className="w-4 h-4 text-primary/20 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs font-bold text-primary/60 line-clamp-2 leading-relaxed">{booking.notes || 'Tidak ada catatan khusus'}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(booking.status)}`}>
                                                {getStatusIcon(booking.status)}
                                                {booking.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center gap-4 animate-bounce">
                                            <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center text-primary/20">
                                                <Search className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <p className="text-primary/60 font-black uppercase tracking-widest text-xs">Data tidak ditemukan</p>
                                                <p className="text-primary/20 text-[10px] font-bold uppercase tracking-widest mt-1">Coba kata kunci pencarian lainnya</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ReservationFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
};

export default ReservationsPage;
