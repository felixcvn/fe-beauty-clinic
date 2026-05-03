import React, { useState, useEffect } from 'react';
import { Beaker, Package, AlertTriangle, Activity, RefreshCw, Calendar, TrendingUp } from 'lucide-react';
import StatsCard from '../Dashboard/StatsCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useMockData } from '../../context/MockDataContext';
import TableSkeleton from '../../components/UI/TableSkeleton';
import { bahanTreatmentAPI, bahanMedisAPI, bahanInfusAPI, barangApotekAPI } from '../../services/api';

const ApotekerDashboard = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { bookings } = useMockData();
    const [isLoading, setIsLoading] = useState(true);
    
    const [stats, setStats] = useState({
        totalMaterials: 0,
        totalMedicals: 0,
        totalInfusions: 0,
        totalApotekItems: 0,
        lowStockCount: 0
    });

    const [lowStockItems, setLowStockItems] = useState([]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');

        try {
            const [resMat, resMed, resInf, resApo] = await Promise.all([
                bahanTreatmentAPI.getAll(token),
                bahanMedisAPI.getAll(token),
                bahanInfusAPI.getAll(token),
                barangApotekAPI.getAll(token)
            ]);

            const allData = [];
            let lowCount = 0;

            const processData = (res, type) => {
                if (res.success && Array.isArray(res.data)) {
                    res.data.forEach(item => {
                        const stock = Number(item.Stok || 0);
                        const minStock = Number(item.Batas_minimal_stok || 5);
                        const processedItem = {
                            id: item.id,
                            name: item.Nama_produk || item.Nama_bahan_medis || item.Nama_bahan_infus || item.Nama_barang_apotek || 'Tanpa Nama',
                            stock,
                            minStock,
                            type
                        };
                        if (stock <= minStock) {
                            lowCount++;
                            allData.push(processedItem);
                        }
                    });
                    return res.data.length;
                }
                return 0;
            };

            const countMat = processData(resMat, 'Bahan Treatment');
            const countMed = processData(resMed, 'Bahan Medis');
            const countInf = processData(resInf, 'Bahan Infus');
            const countApo = processData(resApo, 'Barang Apotek');

            setStats({
                totalMaterials: countMat,
                totalMedicals: countMed,
                totalInfusions: countInf,
                totalApotekItems: countApo,
                lowStockCount: lowCount
            });

            setLowStockItems(allData.sort((a, b) => a.stock - b.stock).slice(0, 5));

        } catch (error) {
            console.error('[ApotekerDashboard] Error:', error);
            showToast('Gagal memuat statistik dashboard', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Dashboard Apoteker</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Status Apotek: <span className="text-emerald-600 font-black">Aktif</span>
                    </p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button 
                        onClick={fetchDashboardData}
                        className="flex-1 sm:flex-none p-4 rounded-2xl bg-white border border-primary/5 text-primary hover:bg-primary/5 transition-all shadow-sm group"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    </button>
                    <div className="flex-1 sm:flex-none px-6 py-4 bg-primary text-secondary rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
                        Apoteker On Duty
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                <StatsCard title="Bahan Medis" value={stats.totalMedicals} change="Total Jenis" trend="up" icon={Beaker} />
                <StatsCard title="Bahan Infus" value={stats.totalInfusions} change="Stok Terkini" trend="up" icon={Activity} />
                <StatsCard title="Barang Apotek" value={stats.totalApotekItems} change="Unit" trend="up" icon={Package} />
                <StatsCard 
                    title="Stok Kritis" 
                    value={stats.lowStockCount} 
                    change={stats.lowStockCount > 0 ? "Perlu Order" : "Aman"} 
                    trend={stats.lowStockCount > 0 ? "down" : "up"} 
                    icon={AlertTriangle} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Low Stock Section */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-primary/15 shadow-2xl shadow-primary/[0.04] bg-white flex flex-col transition-all hover:border-primary/20">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-primary tracking-tight italic">Peringatan Stok Rendah</h3>
                            <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest mt-1">Item yang perlu segera di-restock</p>
                        </div>
                        <span className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full">Prioritas</span>
                    </div>

                    {isLoading ? (
                        <TableSkeleton rows={4} columns={3} />
                    ) : lowStockItems.length > 0 ? (
                        <div className="overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-primary/5 text-[10px] font-black uppercase tracking-widest text-primary/20">
                                        <th className="pb-4">Nama Item</th>
                                        <th className="pb-4">Jenis</th>
                                        <th className="pb-4 text-right">Stok Sisa</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5">
                                    {lowStockItems.map((item, idx) => (
                                        <tr key={idx} className="group hover:bg-red-50/30 transition-colors">
                                            <td className="py-4 font-bold text-sm text-primary">{item.name}</td>
                                            <td className="py-4 text-[10px] text-primary/40 font-black uppercase tracking-widest">{item.type}</td>
                                            <td className="py-4 text-right font-black text-sm text-red-500">{item.stock} <span className="text-[10px] text-red-300">Unit</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-20">
                            <Package className="w-16 h-16 mb-4" />
                            <p className="font-black text-xs uppercase tracking-widest text-center">Semua stok farmasi dalam kondisi aman</p>
                        </div>
                    )}
                </div>

                {/* Today's Pharmacy Activity / Appointments */}
                <div className="bg-white p-8 rounded-[3rem] border border-primary/15 shadow-2xl shadow-primary/[0.04] bg-white flex flex-col transition-all hover:border-primary/20">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-primary tracking-tight">Kebutuhan Treatment</h3>
                            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1 block tracking-tighter">Hari Ini</span>
                        </div>
                        <Calendar className="w-5 h-5 text-primary/20" />
                    </div>

                    <div className="space-y-4 flex-1">
                        {bookings.slice(0, 5).map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 hover:bg-emerald-50/50 rounded-2xl transition-all border border-transparent hover:border-emerald-100">
                                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary font-black text-xs">
                                    {item.time.split(':')[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-primary text-xs truncate">{item.treatment}</h4>
                                    <p className="text-[9px] text-primary/40 font-bold uppercase tracking-widest">Persiapan Bahan Medis</p>
                                </div>
                                <TrendingUp className="w-3 h-3 text-emerald-500 opacity-50" />
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-8 py-4 text-[10px] font-black text-primary uppercase tracking-widest border border-primary/10 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all active:scale-95">
                        Lihat Jadwal Distribusi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApotekerDashboard;
