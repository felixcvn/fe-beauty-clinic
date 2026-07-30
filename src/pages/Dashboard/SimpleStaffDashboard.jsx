import React from 'react';
import { ClockIcon as Clock, CheckCircleIcon as CheckCircle2, CalendarIcon as Calendar, MapPinIcon as MapPin, ArrowRightIcon as ArrowRight, UserCircleIcon as UserCircle, BellAlertIcon as BellRing } from '@heroicons/react/24/outline';
import StatsCard from './StatsCard';
import { useAuth } from '../../context/AuthContext';

const SimpleStaffDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Staff Dashboard</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Selamat Bekerja, <span className="text-primary/70">{user?.name}</span>
                    </p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Check-In Aktif
                    </div>
                </div>
            </div>

            {/* Simple Staff Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatsCard
                    title="Status Kehadiran"
                    value="Hadir"
                    change="Tepat Waktu"
                    trend="up"
                    icon={Clock}
                />
                <StatsCard
                    title="Total Jam Kerja"
                    value="6h 45m"
                    change="Hari Ini"
                    trend="up"
                    icon={Calendar}
                />
                <StatsCard
                    title="Lokasi Tugas"
                    value={user?.role === 'Staff Satpam' ? 'Pos Depan' : 'Gedung Utama'}
                    change="Area"
                    trend="up"
                    icon={MapPin}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Information / Tasks */}
                <div className="bg-white p-8 rounded-[3rem] border border-primary/15 shadow-2xl shadow-primary/[0.04] bg-white flex flex-col transition-all hover:border-primary/20">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-primary tracking-tight italic text-primary/60">Informasi & Pengumuman</h3>
                        </div>
                        <BellRing className="w-5 h-5 text-primary/20" />
                    </div>

                    <div className="space-y-4">
                        <div className="p-6 rounded-card bg-gray-50/50 border border-primary/5 flex items-start gap-4 group cursor-pointer hover:bg-white hover:shadow-lg transition-all duration-300">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-secondary transition-colors">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-primary">Update Jam Operasional</h4>
                                <p className="text-xs text-primary/40 font-medium leading-relaxed mt-1">Mulai minggu depan, jam operasional hari Sabtu diperpanjang hingga pukul 20:00 WIB.</p>
                            </div>
                        </div>
                        <div className="p-6 rounded-card bg-gray-50/50 border border-primary/5 flex items-start gap-4 group cursor-pointer hover:bg-white hover:shadow-lg transition-all duration-300">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-secondary transition-colors">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-primary">Area Parkir Baru</h4>
                                <p className="text-xs text-primary/40 font-medium leading-relaxed mt-1">Area parkir belakang sudah bisa digunakan untuk motor karyawan mulai hari ini.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Quick Link */}
                <div className="bg-primary p-8 rounded-[2.5rem] elevation-3 flex flex-col justify-between group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-white/10 transition-all duration-700" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-primary shadow-lg shadow-black/10">
                                <UserCircle className="w-10 h-10" />
                            </div>
                            <div>
                                <h4 className="text-secondary text-xl font-black tracking-tight leading-none">{user?.name}</h4>
                                <p className="text-secondary/40 text-[10px] font-black uppercase tracking-widest mt-2">{user?.role}</p>
                            </div>
                        </div>
                        <p className="text-secondary/60 text-sm font-medium leading-relaxed mb-8">
                            Pastikan data profil dan nomor telepon Anda sudah benar untuk keperluan koordinasi tim di lapangan.
                        </p>
                    </div>
                    <button className="relative z-10 w-full py-4 bg-secondary text-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white active:scale-95 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2">
                        Lihat Profil Saya <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SimpleStaffDashboard;
