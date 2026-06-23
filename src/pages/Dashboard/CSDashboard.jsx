import React, { useState, useEffect } from 'react';
import { Users, UserPlus, CalendarCheck, ArrowRight, Loader2 } from 'lucide-react';
import StatsCard from './StatsCard';
import { useAuth } from '../../context/AuthContext';
import { useMockData } from '../../context/MockDataContext';
import { reservasiAPI } from '../../services/api';

const getTreatmentNames = (booking) => {
    if (!booking) return '';
    const names = [];
    
    if (Array.isArray(booking.treatments) && booking.treatments.length > 0) {
        booking.treatments.forEach(t => {
            const name = t.Nama_treatment || t.nama_treatment || t.name || t.Nama_Treatment;
            if (name) names.push(name);
        });
    }
    
    if (Array.isArray(booking.paket_treatments) && booking.paket_treatments.length > 0) {
        booking.paket_treatments.forEach(p => {
            const name = p.Nama_paket || p.nama_paket || p.name || p.Nama_Paket;
            if (name) names.push(name);
        });
    }
    
    if (names.length > 0) return names.join(', ');
    return booking.Nama_treatment || booking.nama_treatment || booking.Nama_paket || booking.nama_paket || '-';
};

const CSDashboard = () => {
    const { user } = useAuth();
    const { patients } = useMockData();
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReservations = async () => {
            if (!user?.token) return;
            try {
                const result = await reservasiAPI.getAll(user.token);
                if (result.success) {
                    const rawData = result.data;
                    const dataArray = Array.isArray(rawData) ? rawData : (rawData?.data || []);
                    // Sort descending by id or date to get latest
                    const sortedData = [...dataArray].reverse();
                    setReservations(sortedData);
                }
            } catch (error) {
                console.error("Failed to fetch reservations", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReservations();
    }, [user]);

    // Hitung pasien baru bulan ini
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const newPatientsThisMonth = patients.filter(p => {
        const created = new Date(p.createdAt || p.created_at || p.tanggal_daftar || null);
        return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
    }).length;

    const today = new Date().toISOString().split('T')[0];
    const todaysReservations = reservations.filter(r => {
        const resDate = r.Tanggal_reservasi ? r.Tanggal_reservasi.split('T')[0] : '';
        return resDate === today;
    });

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Dashboard Customer Service</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Status CS: <span className="text-emerald-600 font-black">Online - Siap Melayani</span>
                    </p>
                </div>
            </div>

            {/* Front Desk Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatsCard
                    title="Reservasi Hari Ini"
                    value={todaysReservations.length}
                    change="Hari ini"
                    trend="up"
                    icon={CalendarCheck}
                />
                <StatsCard
                    title="Total Pasien"
                    value={patients.length}
                    change="Terdaftar"
                    trend="up"
                    icon={Users}
                />
                <StatsCard
                    title="Pasien Baru Bulan Ini"
                    value={newPatientsThisMonth || 12}
                    change="Bulan Ini"
                    trend="up"
                    icon={UserPlus}
                />
            </div>

            {/* Recent Reservations - Full Width */}
            <div className="bg-white p-6 md:p-7 rounded-[2rem] md:rounded-[2.5rem] border border-primary/15 shadow-xl shadow-primary/[0.04] flex flex-col transition-all hover:border-primary/20">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-xl font-black text-primary tracking-tight italic">Reservasi Terbaru</h3>
                        <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1 block">Data Kedatangan Pasien</span>
                    </div>
                    <button className="text-xs font-black text-primary/40 hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-widest">
                        Selengkapnya <ArrowRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {isLoading ? (
                        <div className="col-span-1 md:col-span-2 flex justify-center items-center py-10">
                            <Loader2 className="w-8 h-8 text-primary/20 animate-spin" />
                        </div>
                    ) : reservations.length > 0 ? (
                        reservations.slice(0, 6).map((item, index) => {
                            const patientName = item.pasien?.Nama_pasien || item.pasien?.nama_pasien || item.Nama_pasien || 'Unknown';
                            const time = item.Jam_reservasi ? String(item.Jam_reservasi).substring(0, 5) : '--:--';
                            const treatmentName = getTreatmentNames(item);
                            const status = item.Status || item.status || 'Pending';

                            return (
                                <div key={item.id || index} className="flex items-center gap-5 p-5 hover:bg-emerald-50/50 rounded-3xl transition-all duration-300 border border-transparent hover:border-emerald-100 group">
                                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-secondary flex items-center justify-center text-primary border border-primary/5 group-hover:bg-primary group-hover:text-secondary transition-all duration-300 shadow-sm font-black text-sm">
                                        {time}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-primary text-base tracking-tight truncate">{patientName}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] text-primary/40 font-bold uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md border border-primary/5 truncate max-w-[120px] sm:max-w-[150px]" title={treatmentName}>
                                                {treatmentName}
                                            </span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest shrink-0 ${
                                                status === 'Confirmed' || status === 'Selesai' ? 'text-emerald-500' : 'text-amber-500'
                                            }`}>
                                                {status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span className="text-xs font-black text-primary/60">Cab. Jember</span>
                                        <p className="text-[9px] text-primary/30 font-bold uppercase truncate max-w-[80px]" title={item.Pendaftar_pasien || item.karyawan?.NamaLengkap_karyawan || 'System'}>
                                            {item.Pendaftar_pasien || item.karyawan?.NamaLengkap_karyawan || 'System'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-1 md:col-span-2 text-center py-10">
                            <span className="text-primary/30 font-black uppercase tracking-widest text-xs">Belum ada data reservasi</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CSDashboard;

