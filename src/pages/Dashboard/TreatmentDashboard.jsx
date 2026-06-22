import React, { useState, useEffect } from 'react';
import { Sparkles, Scissors, Clock, TrendingUp, Calendar, CheckCircle2, AlertCircle, ArrowRight, Percent, Zap } from 'lucide-react';
import StatsCard from './StatsCard';
import { useAuth } from '../../context/AuthContext';
import { useMockData } from '../../context/MockDataContext';
import api from '../../services/api';

const TreatmentDashboard = () => {
    const { user } = useAuth();
    const { bookings, treatments } = useMockData();
    const [realMaterials, setRealMaterials] = useState([]);

    useEffect(() => {
        const fetchMaterials = async () => {
            if (user?.token) {
                try {
                    const res = await api.bahanTreatmentAPI.getAll(user.token);
                    if (res.success) {
                        setRealMaterials(res.data || []);
                    }
                } catch (error) {
                    console.error('Failed to fetch materials:', error);
                }
            }
        };
        fetchMaterials();
    }, [user?.token]);

    // Stats
    const totalTreatments = treatments.length;
    const todaySessions = bookings.slice(0, 6);
    
    const lowStockMaterials = realMaterials.filter(m => {
        const stock = parseInt(m.Stok) || 0;
        const minStock = parseInt(m.Batas_minimal_stok) || 5;
        return stock <= minStock;
    });

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Treatment Dashboard</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse"></span>
                        Overview Operasional - <span className="text-primary/70">{user?.role}</span>
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-6 py-4 rounded-2xl border border-primary/5 shadow-sm flex flex-col justify-center">
                        <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">Kapasitas Slot</p>
                        <p className="text-sm font-black text-primary">85% Terisi <span className="text-[10px] text-emerald-500 font-bold ml-1">Optimal</span></p>
                    </div>
                </div>
            </div>

            {/* Treatment Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatsCard
                    title="Total Jenis Treatment"
                    value={totalTreatments}
                    change="Katalog"
                    trend="up"
                    icon={Sparkles}
                />
                <StatsCard
                    title="Sesi Hari Ini"
                    value={todaySessions.length}
                    change="+12%"
                    trend="up"
                    icon={Scissors}
                />
                <StatsCard
                    title="Promo yang Berlaku"
                    value="5"
                    change="Kampanye Aktif"
                    trend="up"
                    icon={Percent}
                />
                <StatsCard
                    title="Promo Dadakan"
                    value="2"
                    change="Penawaran Terbatas"
                    trend="up"
                    icon={Zap}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Session Schedule */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-primary/15 shadow-2xl shadow-primary/[0.04] bg-white flex flex-col transition-all hover:border-primary/20">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-primary tracking-tight">Jadwal Sesi & Treatment</h3>
                            <span className="text-accent-gold text-[10px] font-black uppercase tracking-widest mt-1 block italic">Urutan berdasarkan waktu kedatangan</span>
                        </div>
                        <Calendar className="w-5 h-5 text-primary/10" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {todaySessions.map((item, index) => (
                            <div key={index} className="flex flex-col p-6 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-primary/5 rounded-[2rem] transition-all border border-transparent hover:border-primary/5 group cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-secondary shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                        <span className="text-xs font-black">{item.time}</span>
                                    </div>

                                </div>
                                <h4 className="font-black text-primary text-base tracking-tight mb-1">{item.treatment}</h4>
                                <p className="text-xs text-primary/40 font-bold mb-4 italic">Pasien: {item.name}</p>
                                <div className="mt-auto pt-4 border-t border-primary/5 flex justify-between items-center">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Kesiapan Alat OK</span>
                                    </div>
                                    <CheckCircle2 className="w-4 h-4 text-primary/20 group-hover:text-primary transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Material & Tools Alerts */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[3rem] border border-primary/15 shadow-2xl shadow-primary/[0.04] bg-white flex flex-col transition-all hover:border-primary/20">
                        <div className="flex items-center gap-3 mb-6">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <h4 className="text-primary text-sm font-black uppercase tracking-widest">Peringatan Bahan</h4>
                        </div>
                        <div className="space-y-5">
                            {lowStockMaterials.length > 0 ? (
                                lowStockMaterials.map(m => {
                                    const stock = parseInt(m.Stok) || 0;
                                    const isEmpty = stock === 0;
                                    const bgClass = isEmpty ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100';
                                    const textClass = isEmpty ? 'text-red-500' : 'text-amber-600';
                                    const arrowClass = isEmpty ? 'text-red-300' : 'text-amber-300';
                                    const statusText = isEmpty ? 'Stok Habis' : 'Stok Kritis';
                                    
                                    return (
                                        <div key={m.id} className={`p-4 rounded-2xl ${bgClass} border flex items-center justify-between`}>
                                            <div>
                                                <p className="text-xs font-black text-primary">{m.Nama_produk}</p>
                                                <p className={`text-[10px] ${textClass} font-bold uppercase tracking-widest`}>{statusText}: {stock} Unit</p>
                                            </div>
                                            <ArrowRight className={`w-4 h-4 ${arrowClass}`} />
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-xs text-primary/40 font-bold italic">Semua stok bahan aman.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-secondary p-8 rounded-[2.5rem] border border-primary/5 shadow-xl flex flex-col group cursor-pointer hover:bg-primary hover:text-secondary transition-all duration-500">
                        <div className="flex justify-between items-start mb-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Maintenance Tools</h4>
                            <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-white/20 transition-colors">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-lg font-black tracking-tight mb-2 italic">Kalibrasi Laser Pico</p>
                        <p className="text-xs font-medium opacity-60 mb-6">Jadwal pemeliharaan rutin alat laser untuk memastikan keamanan & efektivitas.</p>
                        <div className="flex items-center gap-2 mt-auto">
                            <div className="h-1 flex-1 bg-primary/10 group-hover:bg-white/20 rounded-full">
                                <div className="h-full bg-primary group-hover:bg-secondary rounded-full" style={{ width: '65%' }} />
                            </div>
                            <span className="text-[10px] font-black tracking-widest uppercase">65%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TreatmentDashboard;
