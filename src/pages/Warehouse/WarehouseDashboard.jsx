import React from 'react';
import { Package, ClipboardList, AlertTriangle, Activity } from 'lucide-react';
import StatsCard from '../Dashboard/StatsCard';
import { useMockData } from '../../context/MockDataContext';
import { useAuth } from '../../context/AuthContext';

const WarehouseDashboard = () => {
    const { products, treatments } = useMockData();
    const { user } = useAuth();

    const lowStockProducts = products.filter(p => p.stock < 15);
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Warehouse Dashboard</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse"></span>
                        Welcome back, <span className="text-primary/70">{user?.name}</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatsCard 
                    title="Total Produk" 
                    value={products.length} 
                    change="5.2%" 
                    trend="up" 
                    icon={Package} 
                />
                <StatsCard 
                    title="Total Treatment" 
                    value={treatments.length} 
                    change="2.1%" 
                    trend="up" 
                    icon={Activity} 
                />
                <StatsCard 
                    title="Total Stok" 
                    value={totalStock.toLocaleString('id-ID')} 
                    change="8.4%" 
                    trend="up" 
                    icon={ClipboardList} 
                />
                <StatsCard 
                    title="Stok Menipis" 
                    value={lowStockProducts.length} 
                    change={lowStockProducts.length > 0 ? "Check now" : "All safe"} 
                    trend={lowStockProducts.length > 0 ? "down" : "up"} 
                    icon={AlertTriangle} 
                />
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-primary tracking-tight">Peringatan Stok Rendah</h3>
                    <span className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full">Urgent</span>
                </div>
                
                <div className="overflow-x-auto scrollbar-hide">
                    {lowStockProducts.length > 0 ? (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-primary/5">
                                    <th className="pb-4 text-[10px] uppercase tracking-widest font-black text-primary/30">Produk</th>
                                    <th className="pb-4 text-[10px] uppercase tracking-widest font-black text-primary/30">Kategori</th>
                                    <th className="pb-4 text-[10px] uppercase tracking-widest font-black text-primary/30">Stok Sisa</th>
                                    <th className="pb-4 text-[10px] uppercase tracking-widest font-black text-primary/30 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {lowStockProducts.map(p => (
                                    <tr key={p.id} className="group hover:bg-primary/5 transition-colors">
                                        <td className="py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-secondary/50 overflow-hidden border border-primary/5">
                                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="font-bold text-sm text-primary">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 text-xs text-primary/60 font-medium uppercase tracking-tighter">{p.category}</td>
                                        <td className="py-5">
                                            <span className="font-black text-sm text-red-500">{p.stock}</span>
                                        </td>
                                        <td className="py-5 text-right">
                                            <button className="text-[10px] font-black text-primary/30 hover:text-primary uppercase tracking-widest transition-all">Restock</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-12 text-center text-primary/20 text-sm font-bold uppercase tracking-widest">Semua stok terpantau aman</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WarehouseDashboard;
