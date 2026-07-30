import React from 'react';
import { TagIcon as Tag, ArrowTrendingUpIcon as TrendingUp, ShoppingBagIcon as ShoppingBag, ViewfinderCircleIcon as Target, ArrowRightIcon as ArrowRight, BoltIcon as Zap, GiftIcon as Gift } from '@heroicons/react/24/outline';
import StatsCard from './StatsCard';
import { useAuth } from '../../context/AuthContext';
import { useMockData } from '../../context/MockDataContext';

const MarketingDashboard = () => {
    const { user } = useAuth();
    const { promos, products } = useMockData();

    // Stats
    const activePromos = promos.filter(p => p.status === 'Aktif').length;

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Marketing Dashboard</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse"></span>
                        Marketing & Sales - <span className="text-primary/70">{user?.role}</span>
                    </p>
                </div>
            </div>

            {/* Marketing Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatsCard
                    title="Promo Aktif"
                    value={activePromos}
                    change="Running"
                    trend="up"
                    icon={Tag}
                />
                <StatsCard
                    title="Promo Terpakai"
                    value="1,482"
                    change="+12.5%"
                    trend="up"
                    icon={Gift}
                />
                <StatsCard
                    title="Total Sales (Produk)"
                    value="Rp 48.2M"
                    change="+5.1%"
                    trend="up"
                    icon={ShoppingBag}
                />
                <StatsCard
                    title="Konversi Campaign"
                    value="18.6%"
                    change="+2.4%"
                    trend="up"
                    icon={TrendingUp}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Active Campaigns List */}
                <div className="lg:col-span-2 bg-white p-6 md:p-7 rounded-card md:rounded-[2.5rem] border border-primary/15 shadow-xl shadow-primary/[0.04] bg-white flex flex-col transition-all hover:border-primary/20">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-primary tracking-tight">Campaign & Promo Saat Ini</h3>
                            <span className="text-primary/40 text-[10px] font-black uppercase tracking-widest mt-1 block">Monitoring performa promo aktif</span>
                        </div>
                        <button className="text-xs font-black text-primary/40 hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-widest">
                            Lihat Semua <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {promos.filter(p => p.status === 'Aktif').slice(0, 4).map((promo, index) => (
                            <div key={index} className="p-6 rounded-3xl bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all border border-transparent hover:border-primary/5 group">
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-primary font-black text-xs shadow-sm flex-shrink-0 group-hover:bg-primary group-hover:text-secondary transition-colors duration-500">
                                        {promo.type === 'Persen' ? `${promo.value}%` : 'FIXED'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-black text-primary text-base tracking-tight italic">{promo.name}</h4>
                                            <span className="px-2 py-0.5 text-[8px] font-black text-primary/40 bg-primary/5 rounded-full uppercase tracking-widest">{promo.code}</span>
                                        </div>
                                        <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest">Berakhir: {promo.endDate} • Kuota: {promo.quota}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 w-full md:w-32">
                                        <div className="w-full flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-primary/40 mb-1">
                                            <span>Terpakai</span>
                                            <span>{Math.round((promo.used / promo.quota) * 100)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-primary/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(promo.used / promo.quota) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Marketing Insights */}
                <div className="space-y-8">
                    <div className="bg-primary p-8 rounded-[2.5rem] elevation-3 flex flex-col group cursor-pointer hover:scale-[1.02] transition-all duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <Target className="w-5 h-5 text-secondary" />
                            <h4 className="text-secondary text-sm font-black uppercase tracking-widest">Target Bulanan</h4>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">Revenue Target</span>
                                    <span className="text-sm font-black text-secondary tracking-tighter">82%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-secondary rounded-full shadow-[0_0_15px_rgba(229,213,176,0.5)]" style={{ width: '82%' }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">New Leads</span>
                                    <span className="text-sm font-black text-secondary tracking-tighter">65%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent-gold rounded-full" style={{ width: '65%' }} />
                                </div>
                            </div>
                        </div>
                        <button className="mt-10 w-full py-4 bg-secondary text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-black/10">
                            Analisis Lengkap
                        </button>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-xl flex flex-col">
                        <h4 className="text-primary text-sm font-black uppercase tracking-widest mb-6">Produk Terlaris</h4>
                        <div className="space-y-5">
                            {products.slice(0, 3).map((p, idx) => (
                                <div key={idx} className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-secondary transition-all">
                                        <ShoppingBag className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-primary truncate">{p.name}</p>
                                        <p className="text-[10px] text-primary/40 font-bold">Stok: {p.stock}</p>
                                    </div>
                                    <TrendingUp className="w-3 h-3 text-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketingDashboard;
