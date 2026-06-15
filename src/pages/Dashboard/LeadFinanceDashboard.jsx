import React from 'react';
import { Wallet, ShoppingCart, Fingerprint, Briefcase, TrendingUp, ArrowRight, DollarSign, CreditCard } from 'lucide-react';
import StatsCard from './StatsCard';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LeadFinanceDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const quickLinks = [
        {
            icon: Fingerprint,
            label: 'Absensi',
            description: 'Kelola kehadiran karyawan',
            path: '/attendance',
            color: 'bg-violet-500',
            shadow: 'shadow-violet-500/20',
        },
        {
            icon: ShoppingCart,
            label: 'Transaksi',
            description: 'Pantau data transaksi',
            path: '/sales',
            color: 'bg-emerald-500',
            shadow: 'shadow-emerald-500/20',
        },
        {
            icon: Briefcase,
            label: 'Distributor',
            description: 'Kelola deposit distributor',
            path: '/distributors',
            color: 'bg-blue-500',
            shadow: 'shadow-blue-500/20',
        },
    ];

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Finance Dashboard</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Lead Finance — <span className="text-primary/70">{user?.name}</span>
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <StatsCard
                    title="Total Transaksi"
                    value="Rp 128.4M"
                    change="+8.2%"
                    trend="up"
                    icon={TrendingUp}
                />
                <StatsCard
                    title="Deposit Masuk"
                    value="Rp 42.1M"
                    change="Bulan Ini"
                    trend="up"
                    icon={Wallet}
                />
                <StatsCard
                    title="Kehadiran Hari Ini"
                    value="96%"
                    change="+1%"
                    trend="up"
                    icon={Fingerprint}
                />
            </div>

            {/* Quick Access */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Links */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {quickLinks.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="group relative bg-white p-7 rounded-[2rem] border border-primary/10 shadow-xl shadow-primary/[0.04] hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20 hover:-translate-y-1 transition-all duration-500 flex flex-col items-start gap-4 text-left"
                        >
                            <div className={`w-12 h-12 rounded-2xl ${item.color} ${item.shadow} shadow-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-base font-black text-primary tracking-tight">{item.label}</h4>
                                <p className="text-[11px] text-primary/40 font-bold mt-1">{item.description}</p>
                            </div>
                            <ArrowRight className="absolute bottom-6 right-6 w-4 h-4 text-primary/20 group-hover:text-primary/60 group-hover:translate-x-1 transition-all duration-300" />
                        </button>
                    ))}
                </div>

                {/* Finance Summary Card */}
                <div className="bg-primary p-8 rounded-[2rem] shadow-2xl shadow-primary/20 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-10 z-0">
                        <div className="absolute top-0 left-0 w-full h-full" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <DollarSign className="w-5 h-5 text-secondary" />
                            <h4 className="text-secondary text-sm font-black uppercase tracking-widest">Ringkasan Keuangan</h4>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] font-black text-secondary/50 uppercase tracking-widest">Target Transaksi</span>
                                    <span className="text-sm font-black text-secondary tracking-tighter">78%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-secondary rounded-full shadow-[0_0_15px_rgba(229,213,176,0.5)]" style={{ width: '78%' }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] font-black text-secondary/50 uppercase tracking-widest">Deposit Terserap</span>
                                    <span className="text-sm font-black text-secondary tracking-tighter">61%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent-gold rounded-full" style={{ width: '61%' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/distributors')}
                        className="relative z-10 mt-8 w-full py-4 bg-secondary text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                    >
                        <CreditCard className="w-4 h-4" />
                        Kelola Deposit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeadFinanceDashboard;
