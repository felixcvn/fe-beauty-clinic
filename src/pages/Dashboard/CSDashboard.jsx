import React from 'react';
import { Users, UserPlus, CalendarCheck, ArrowRight } from 'lucide-react';
import StatsCard from './StatsCard';
import { useAuth } from '../../context/AuthContext';
import { useMockData } from '../../context/MockDataContext';

const CSDashboard = () => {
    const { user } = useAuth();
    const { bookings, patients } = useMockData();

    // Hitung pasien baru bulan ini
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const newPatientsThisMonth = patients.filter(p => {
        const created = new Date(p.createdAt || p.created_at || p.tanggal_daftar || null);
        return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
    }).length;

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
                    value={bookings.length}
                    change="+5"
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
                    {bookings.slice(0, 6).map((item, index) => (
                        <div key={index} className="flex items-center gap-5 p-5 hover:bg-emerald-50/50 rounded-3xl transition-all duration-300 border border-transparent hover:border-emerald-100 group">
                            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary border border-primary/5 group-hover:bg-primary group-hover:text-secondary transition-all duration-300 shadow-sm font-black text-sm">
                                {item.time}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black text-primary text-base tracking-tight">{item.name}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] text-primary/40 font-bold uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md border border-primary/5">
                                        {item.treatment}
                                    </span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                                        item.status === 'Confirmed' ? 'text-emerald-500' : 'text-amber-500'
                                    }`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-xs font-black text-primary/60">Cab. Jember</span>
                                <p className="text-[9px] text-primary/30 font-bold uppercase">Front Desk A</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CSDashboard;

