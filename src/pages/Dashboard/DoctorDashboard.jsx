import React from 'react';
import { Users, Calendar, ClipboardList, Activity, ArrowRight, UserCheck } from 'lucide-react';
import StatsCard from './StatsCard';
import { useAuth } from '../../context/AuthContext';
import { useMockData } from '../../context/MockDataContext';

const DoctorDashboard = () => {
    const { user } = useAuth();
    const { bookings, patients } = useMockData();

    // Filter appointments for "today" (using mock data)
    const todayAppointments = bookings.slice(0, 5);
    const pendingCount = todayAppointments.filter(b => b.status === 'Waiting').length;

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Medical Dashboard</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        Status Dokter: <span className="text-blue-600 font-black">Aktif Pelayanan</span>
                    </p>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl border border-primary/5 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">Dokter Spesialis</p>
                    <p className="text-sm font-black text-primary italic">Dr. {user?.name}</p>
                </div>
            </div>

            {/* Medical Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatsCard
                    title="Pasien Hari Ini"
                    value={todayAppointments.length}
                    change="+2"
                    trend="up"
                    icon={Users}
                />
                <StatsCard
                    title="Menunggu Konsul"
                    value={pendingCount}
                    change="Prioritas"
                    trend="down"
                    icon={Activity}
                />
                <StatsCard
                    title="Total Pasien"
                    value={patients.length + 1200}
                    change="Database"
                    trend="up"
                    icon={UserCheck}
                />
                <StatsCard
                    title="Jadwal Besok"
                    value="12"
                    change="Terjadwal"
                    trend="up"
                    icon={Calendar}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Appointment List */}
                <div className="lg:col-span-2 bg-white p-6 md:p-7 rounded-[2rem] md:rounded-[2.5rem] border border-primary/15 shadow-xl shadow-primary/[0.04] bg-white flex flex-col transition-all hover:border-primary/20">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-primary tracking-tight">Antrean Pasien</h3>
                            <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-1 block">Sesi Konsultasi & Treatment</span>
                        </div>
                        <button className="text-xs font-black text-primary/40 hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-widest">
                            Lihat Semua <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {todayAppointments.map((item, index) => (
                            <div key={index} className="flex items-center gap-5 p-5 hover:bg-blue-50/50 rounded-3xl transition-all duration-300 border border-transparent hover:border-blue-100 group">
                                <div className="w-16 h-16 rounded-2xl bg-secondary flex flex-col items-center justify-center text-primary border border-primary/5 group-hover:bg-primary group-hover:text-secondary transition-all duration-300 shadow-sm">
                                    <span className="text-sm font-black leading-none">{item.time.split(':')[0]}</span>
                                    <span className="text-[10px] font-bold opacity-60 leading-none">{item.time.split(':')[1]}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-black text-primary text-base tracking-tight">{item.name}</h4>
                                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full ${
                                            item.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-primary/40 font-bold uppercase tracking-wide">{item.treatment}</p>
                                </div>
                                <button className="p-3 rounded-xl bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-secondary">
                                    <ClipboardList className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions & Notes */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-xl flex flex-col">
                        <h4 className="text-primary text-sm font-black uppercase tracking-widest mb-6">Internal Notes</h4>
                        <div className="flex-1 space-y-4">
                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                                <p className="text-[10px] text-amber-700 font-bold leading-relaxed italic">
                                    "Jangan lupa konfirmasi ketersediaan bahan laser untuk pasien pukul 14:00."
                                </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 border border-primary/5">
                                <p className="text-[10px] text-primary/40 font-bold leading-relaxed">
                                    Rapat rutin koordinasi medis besok pagi pukul 08:00 di Ruang Meeting A.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
