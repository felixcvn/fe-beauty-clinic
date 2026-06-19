import React from 'react';
import { Users, UserPlus, Clock, CalendarX, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import StatsCard from './StatsCard';
import { useAuth } from '../../context/AuthContext';
import { useMockData } from '../../context/MockDataContext';

const HRDashboard = () => {
    const { user } = useAuth();
    const { staff, leaveRequests, overtimeRequests } = useMockData();

    // Stats
    const pendingLeave = leaveRequests.filter(r => r.status === 'Menunggu').length;
    const pendingOvertime = overtimeRequests.filter(r => r.status === 'Menunggu').length;

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">HR Dashboard</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
                        Admin HRD: <span className="text-violet-600 font-black">{user?.name}</span>
                    </p>
                </div>
            </div>

            {/* HR Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatsCard
                    title="Total Karyawan"
                    value={staff.length + 45} // Combined mock + default
                    change="Aktif"
                    trend="up"
                    icon={Users}
                />
                <StatsCard
                    title="Kehadiran Hari Ini"
                    value="94%"
                    change="+2%"
                    trend="up"
                    icon={Clock}
                />
                <StatsCard
                    title="Pengajuan Cuti"
                    value={pendingLeave}
                    change="Menunggu"
                    trend="down"
                    icon={CalendarX}
                />
                <StatsCard
                    title="Karyawan Baru"
                    value="4"
                    change="Bulan Ini"
                    trend="up"
                    icon={UserPlus}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Pending Requests */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Leave Requests */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-primary/10 shadow-xl shadow-primary/[0.04] bg-white">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-primary tracking-tight">Pengajuan Cuti (Menunggu)</h3>
                            <span className="text-violet-500 text-[10px] font-black uppercase tracking-widest">Persetujuan HRD</span>
                        </div>

                        <div className="space-y-4">
                            {leaveRequests.filter(r => r.status === 'Menunggu').slice(0, 3).map((item, index) => (
                                <div key={index} className="flex items-center gap-5 p-5 bg-gray-50/50 hover:bg-violet-50/50 rounded-3xl transition-all border border-transparent hover:border-violet-100 group">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-primary text-sm">{item.staffName}</h4>
                                        <p className="text-[10px] text-primary/40 font-black uppercase tracking-widest">{item.type} • {item.startDate}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                        <button className="p-2.5 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {pendingLeave === 0 && (
                                <p className="text-center py-10 text-xs font-bold text-primary/20 uppercase tracking-widest">Tidak ada pengajuan cuti tertunda</p>
                            )}
                        </div>
                    </div>

                    {/* Overtime/Anomaly */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-primary/10 shadow-xl shadow-primary/[0.04] bg-white">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-primary tracking-tight italic">Anomali & Lembur</h3>
                            <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest">Review Hari Ini</span>
                        </div>

                        <div className="space-y-4">
                            {overtimeRequests.filter(r => r.status === 'Menunggu').slice(0, 3).map((item, index) => (
                                <div key={index} className="flex items-center gap-5 p-5 bg-gray-50/50 hover:bg-amber-50/50 rounded-3xl transition-all border border-transparent hover:border-amber-100">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-primary text-sm">{item.staffName}</h4>
                                        <p className="text-[10px] text-primary/40 font-black uppercase tracking-widest">{item.primaryType} • {item.diffMinutes} Menit</p>
                                    </div>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center gap-2">
                                        Review <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Staff Distribution */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-primary/10 shadow-xl shadow-primary/[0.04] bg-white">
                    <h4 className="text-primary text-sm font-black uppercase tracking-widest mb-8 text-center">Distribusi Staf</h4>
                    <div className="space-y-6 flex-1 flex flex-col justify-center">
                        <div className="space-y-3">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Medis (Dokter/Perawat)</span>
                                <span className="text-sm font-black text-primary tracking-tighter">18</span>
                            </div>
                            <div className="h-2 w-full bg-primary/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: '40%' }} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Operasional (CS/Gudang)</span>
                                <span className="text-sm font-black text-primary tracking-tighter">24</span>
                            </div>
                            <div className="h-2 w-full bg-primary/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: '55%' }} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Umum (OB/Satpam)</span>
                                <span className="text-sm font-black text-primary tracking-tighter">12</span>
                            </div>
                            <div className="h-2 w-full bg-primary/5 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: '25%' }} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 p-6 rounded-3xl bg-violet-600 text-secondary relative overflow-hidden group cursor-pointer shadow-xl shadow-violet-600/20">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12 transition-all group-hover:bg-white/20" />
                        <h5 className="font-black text-xs uppercase tracking-widest mb-1 relative z-10">Payroll Overview</h5>
                        <p className="text-[10px] font-bold opacity-60 mb-4 relative z-10">Periode April 2026</p>
                        <div className="flex justify-between items-end relative z-10">
                            <span className="text-lg font-black tracking-tighter">Rp 284.5M</span>
                            <ArrowRight className="w-4 h-4 mb-1" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
