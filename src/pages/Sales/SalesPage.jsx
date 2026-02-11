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
        <div className="space-y-8 md:space-y-12 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tighter leading-none">Penjualan</h2>
                    <p className="text-primary/40 mt-3 md:mt-4 font-bold text-sm tracking-tight">Monitor dan kelola seluruh transaksi penjualan klinik</p>
                </div>
                <button
                    onClick={() => navigate('/sales/pos')}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-secondary px-8 py-4 md:py-5 rounded-2xl md:rounded-[2rem] hover:scale-105 active:scale-95 transition-all duration-500 font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20"
                >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Transaksi Baru</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {salesStats.map((stat, index) => (
                    <div key={index} className="bg-white p-7 rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 hover:shadow-primary/10 transition-all duration-500 group">
                        <div className="flex justify-between items-start mb-5">
                            <div className="p-3.5 bg-secondary rounded-2xl text-primary group-hover:bg-primary group-hover:text-secondary transition-all duration-500 shadow-sm">
                                <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${stat.trend === 'up' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.change}
                            </div>
                        </div>
                        <div>
                            <p className="text-primary/30 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1.5">{stat.title}</p>
                            <h3 className="text-xl md:text-2xl font-black text-primary tracking-tighter">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Sales Table */}
            <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-primary/5 flex flex-col lg:flex-row items-stretch lg:items-center gap-6 bg-secondary/10">
                    <h3 className="text-xl md:text-2xl font-black text-primary tracking-tighter">Riwayat Penjualan</h3>
                    <div className="flex flex-col sm:flex-row flex-1 gap-4 items-stretch sm:items-center">
                        <div className="relative group flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Cari invoice atau konsumen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-primary shadow-sm"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex-1 sm:flex-none p-4 rounded-2xl bg-white border border-primary/5 text-primary/30 hover:text-primary hover:bg-primary/5 transition-all duration-300 shadow-sm">
                                <Filter className="w-5 h-5 mx-auto" />
                            </button>
                            <button className="flex-1 sm:flex-none px-6 py-4 rounded-2xl bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-secondary transition-all shadow-sm">
                                Export Log
                            </button>
                        </div>
                    </div>
                </div>

                <div className="hidden md:block overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left min-w-[1000px]">
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
                                <tr key={sale.id} className="group hover:bg-secondary/20 transition-all duration-300 cursor-pointer">
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-primary tracking-tight">{sale.id}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-2xl bg-primary/5 border border-primary/5 flex items-center justify-center text-[10px] font-black text-primary shadow-sm group-hover:bg-white transition-all">
                                                {sale.customer.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-xs font-bold text-primary">{sale.customer}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold text-primary/40 uppercase tracking-widest text-[10px]">{sale.product}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-primary">{sale.amount}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${sale.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                            sale.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {sale.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-black text-primary/20 uppercase tracking-widest">{sale.date}</span>
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

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-primary/5">
                    {recentSales.filter(sale => sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) || sale.id.toLowerCase().includes(searchTerm.toLowerCase())).map((sale) => (
                        <div key={sale.id} className="p-6 hover:bg-secondary/10 transition-all duration-300 flex flex-col gap-5 cursor-pointer active:bg-secondary/20">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-[10px] font-black text-primary border border-primary/5">
                                        {sale.customer.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-primary tracking-tight">{sale.customer}</p>
                                        <p className="text-[9px] font-bold text-primary/30 uppercase tracking-widest">{sale.id}</p>
                                    </div>
                                </div>
                                <span className={`inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${sale.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                    sale.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {sale.status}
                                </span>
                            </div>

                            <div className="space-y-3 bg-secondary/30 p-4 rounded-2xl border border-primary/5">
                                <div className="flex justify-between items-center">
                                    <p className="text-[9px] font-black text-primary/30 uppercase tracking-widest">Layanan/Produk</p>
                                    <p className="text-[10px] font-bold text-primary">{sale.product}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-[9px] font-black text-primary/30 uppercase tracking-widest">Total Bayar</p>
                                    <p className="text-sm font-black text-primary">{sale.amount}</p>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-primary/5">
                                    <p className="text-[9px] font-black text-primary/30 uppercase tracking-widest">Tanggal</p>
                                    <p className="text-[10px] font-bold text-primary/60">{sale.date}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button className="flex-1 py-3 text-[9px] font-black text-primary/40 uppercase tracking-widest border border-primary/5 rounded-xl hover:bg-white transition-all">
                                    Detail Invoice
                                </button>
                                <button className="p-3 text-primary/40 hover:text-primary transition-all rounded-xl border border-primary/5 hover:bg-white">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-8 bg-secondary/5 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest order-2 sm:order-1">Showing {recentSales.length} items of {recentSales.length}</p>
                    <div className="flex gap-3 order-1 sm:order-2 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-white border border-primary/5 text-[10px] font-black uppercase tracking-widest text-primary/20 hover:text-primary transition-all shadow-sm">Previous</button>
                        <button className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-primary text-secondary text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">Next Page</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesPage;
