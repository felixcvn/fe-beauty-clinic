import React, { useState } from 'react';
import { ShoppingCart, TrendingUp, Users, Package, Search, Filter, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SalesPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const [recentSales, setRecentSales] = useState([
        { id: 'INV-001', customer: 'Siti Aminah', product: 'Acne Treatment Pack', amount: 'Rp 450.000', status: 'Completed', date: '2024-02-08' },
        { id: 'INV-002', customer: 'Budi Santoso', product: 'Laser Therapy Session', amount: 'Rp 1.200.000', status: 'Pending', date: '2024-02-08' },
        { id: 'INV-003', customer: 'Dewi Lestari', product: 'Chemical Peel', amount: 'Rp 350.000', status: 'Completed', date: '2024-02-07' },
        { id: 'INV-004', customer: 'Ahmad Fauzi', product: 'Skin Glow Kit', amount: 'Rp 850.000', status: 'Completed', date: '2024-02-07' },
        { id: 'INV-005', customer: 'Rina Wijaya', product: 'Microdermabrasion', amount: 'Rp 600.000', status: 'Cancelled', date: '2024-02-06' },
    ]);

    const salesStats = [
        { title: 'Total Sales', value: 'Rp 145.280.000', change: '+12.5%', trend: 'up', icon: ShoppingCart },
        { title: 'Transactions', value: '1,240', change: '+8.2%', trend: 'up', icon: TrendingUp },
        { title: 'Customers', value: '850', change: '+5.4%', trend: 'up', icon: Users },
        { title: 'Products Sold', value: '3,120', change: '-2.1%', trend: 'down', icon: Package },
    ];

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Penjualan</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm">Monitor dan kelola seluruh transaksi penjualan klinik</p>
                </div>
                <button
                    onClick={() => navigate('/sales/pos')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Transaksi Baru</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {salesStats.map((stat, index) => (
                    <div key={index} className="bg-white p-7 rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 hover:shadow-primary/10 transition-all duration-500 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-secondary rounded-2xl text-primary group-hover:bg-primary group-hover:text-secondary transition-all duration-500">
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.change}
                            </div>
                        </div>
                        <div>
                            <p className="text-primary/40 text-[10px] font-black uppercase tracking-widest mb-1">{stat.title}</p>
                            <h3 className="text-2xl font-black text-primary tracking-tighter">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Sales Table */}
            <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="p-4 md:p-8 border-b border-primary/5 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 bg-secondary/10">
                    <h3 className="text-xl font-black text-primary tracking-tighter">Riwayat Penjualan</h3>
                    <div className="flex flex-1 gap-4 items-center">
                        <div className="relative group flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Cari invoice, konsumen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-3 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-xs font-bold text-primary"
                            />
                        </div>
                        <button className="p-3.5 rounded-2xl bg-white border border-primary/5 text-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-300 shadow-sm">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5">
                                <th className="px-8 py-6">ID Invoice</th>
                                <th className="px-8 py-6">Konsumen</th>
                                <th className="px-8 py-6">Produk/Layanan</th>
                                <th className="px-8 py-6">Total</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6">Tanggal</th>
                                <th className="px-8 py-6 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {recentSales.filter(sale => sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) || sale.id.toLowerCase().includes(searchTerm.toLowerCase())).map((sale) => (
                                <tr key={sale.id} className="group hover:bg-secondary/20 transition-all duration-300">
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-primary tracking-tight">{sale.id}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                                {sale.customer.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-xs font-bold text-primary">{sale.customer}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-medium text-primary/60">{sale.product}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-primary">{sale.amount}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${sale.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                            sale.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {sale.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-black text-primary/30 uppercase tracking-widest">{sale.date}</span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <button className="p-2 rounded-xl text-primary/20 hover:text-primary hover:bg-white transition-all duration-300">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-secondary/5 border-t border-primary/5 flex justify-between items-center">
                    <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">Showing {recentSales.length} items</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-xl bg-white border border-primary/5 text-[10px] font-black uppercase tracking-widest text-primary/30 hover:text-primary transition-all shadow-sm">Previous</button>
                        <button className="px-4 py-2 rounded-xl bg-primary text-secondary text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/10">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesPage;
