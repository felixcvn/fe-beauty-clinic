import React, { useState, useEffect } from 'react';
import { Package, ClipboardList, AlertTriangle, Activity, RefreshCw } from 'lucide-react';
import StatsCard from '../Dashboard/StatsCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import TableSkeleton from '../../components/UI/TableSkeleton';
import { stokProdukAPI } from '../../services/api';

const WarehouseDashboard = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [allItems, setAllItems] = useState([]);
    const [stats, setStats] = useState({
        totalItems: 0,
        totalStock: 0,
        totalValue: 0,
        lowStockCount: 0
    });

    // Fetch data from Stok Produk API only
    const fetchAllData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');

        try {
            const res = await stokProdukAPI.getAll(token);

            if (res.success && Array.isArray(res.data)) {
                const products = res.data.map(item => ({
                    id: item.Kode_Produk || item.id,
                    name: item.Nama_produk || '',
                    category: item.Kategori || '',
                    stock: Number(item.Stok || 0),
                    minStock: Number(item.Batas_minimal_stok || 15),
                    price: Number(item.Harga || 0),
                    image: item.image || ''
                }));

                setAllItems(products);

                // Calculate statistics
                const totalItems = products.length;
                const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
                const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
                const lowStockItems = products.filter(p => p.stock <= p.minStock);
                const lowStockCount = lowStockItems.length;

                setStats({
                    totalItems,
                    totalStock,
                    totalValue,
                    lowStockCount
                });

                console.log('[Dashboard] Stok Produk loaded:', { totalItems, totalStock, totalValue, lowStockCount });
            } else {
                showToast('Data stok produk tidak ditemukan', 'error');
                setAllItems([]);
                setStats({
                    totalItems: 0,
                    totalStock: 0,
                    totalValue: 0,
                    lowStockCount: 0
                });
            }
        } catch (error) {
            console.error('[Dashboard] Error fetching stok produk:', error);
            showToast('Gagal memload data stok produk', 'error');
            setAllItems([]);
            setStats({
                totalItems: 0,
                totalStock: 0,
                totalValue: 0,
                lowStockCount: 0
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchAllData();
    }, []);

    // Filter low stock items
    const lowStockProducts = allItems
        .filter(p => p.stock <= p.minStock)
        .sort((a, b) => a.stock - b.stock); // Sort by lowest stock first

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Dashboard Stok & Gudang</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse"></span>
                        Selamat Datang, <span className="text-primary/70">{user?.name}</span>
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                <StatsCard title="Total Item Stok" value={stats.totalItems} change="5.2%" trend="up" icon={Package} />
                <StatsCard title="Nilai Total Stok" value={`Rp ${(stats.totalValue / 1000000).toFixed(1)}Jt`} change="8.4%" trend="up" icon={ClipboardList} />
                <StatsCard title="Total Quantity" value={stats.totalStock.toLocaleString('id-ID')} change="8.4%" trend="up" icon={Activity} />
                <StatsCard title="Stok Menipis" value={stats.lowStockCount} change={stats.lowStockCount > 0 ? "Check now" : "All safe"} trend={stats.lowStockCount > 0 ? "down" : "up"} icon={AlertTriangle} />
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-primary/15 shadow-2xl shadow-primary/[0.04] bg-white flex flex-col transition-all hover:border-primary/20">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-primary tracking-tight italic">Peringatan Stok Rendah</h3>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchAllData}
                            disabled={isLoading}
                            className="p-2 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary disabled:opacity-50 transition-all active:scale-95"
                            title="Refresh data"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <span className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full">Urgent</span>
                    </div>
                </div>
                
                {isLoading ? (
                    <TableSkeleton rows={3} columns={4} />
                ) : (
                    <>
                        {/* Desktop View Table */}
                        <div className="hidden md:block overflow-x-auto scrollbar-hide">
                    {lowStockProducts.length > 0 ? (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-primary/5">
                                    <th className="pb-4 text-[12px] uppercase tracking-widest font-black text-primary/30">Item Stok</th>
                                    <th className="pb-4 text-[12px] uppercase tracking-widest font-black text-primary/30">Kategori</th>
                                    <th className="pb-4 text-[12px] uppercase tracking-widest font-black text-primary/30">Stok Sisa</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {lowStockProducts.map(p => (
                                    <tr key={p.id} className="group hover:bg-primary/5 transition-colors">
                                        <td className="py-5 font-medium text-sm text-primary">{p.name}</td>
                                        <td className="py-5 text-sm text-primary/60 font-medium">{p.category}</td>
                                        <td className="py-5 font-black text-sm text-red-500">{p.stock}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-12 text-center text-primary/20 text-sm font-bold uppercase tracking-widest">Semua stok terpantau aman</div>
                    )}
                </div>

                {/* Mobile View Cards */}
                <div className="md:hidden space-y-4">
                    {lowStockProducts.length > 0 ? (
                        lowStockProducts.map(p => (
                            <div key={p.id} className="p-4 rounded-2xl bg-gray-50 border border-primary/5 flex items-center justify-between">
                                <div className="flex-1">
                                    <h4 className="text-sm font-black text-primary truncate">{p.name}</h4>
                                    <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">{p.category}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-black text-red-500">{p.stock}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center text-primary/20 text-[10px] font-black uppercase tracking-widest">Stok Aman</div>
                    )}
                </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default WarehouseDashboard;