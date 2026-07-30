import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCartIcon as ShoppingCart, ArrowTrendingUpIcon as TrendingUp, UsersIcon as Users, CubeIcon as Package, MagnifyingGlassIcon as Search, FunnelIcon as Filter, ArrowUpRightIcon as ArrowUpRight, ArrowDownRightIcon as ArrowDownRight, EllipsisHorizontalIcon as MoreHorizontal, CheckCircleIcon as CheckCircle2, ClockIcon as Clock, XCircleIcon as XCircle } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import TransactionDetailModal from '../../components/UI/TransactionDetailModal';
import TableSkeleton from '../../components/UI/TableSkeleton';
import StatsCard from '../Dashboard/StatsCard';
import { useAuth } from '../../context/AuthContext';
import { transaksiAPI } from '../../services/api';
import Pagination from '../../components/UI/Pagination';

const SalesPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const { user } = useAuth();
    const [recentSales, setRecentSales] = useState([]);

    const fetchTransactions = async () => {
        setIsLoading(true);
        const res = await transaksiAPI.getAll(user?.token);
        if (res.success) {
            const sortedData = [...res.data].sort((a, b) => new Date(b.created_at.replace(/Z$/, '')) - new Date(a.created_at.replace(/Z$/, '')));
            
            // Group by order_id
            const groups = {};
            sortedData.forEach(t => {
                const orderId = t.order_id || `INV-${t.id}`;
                if (!groups[orderId]) {
                    groups[orderId] = {
                        id: orderId,
                        customer: t.pasien ? t.pasien.Nama_pasien : (t.nama_pasien_distributor || 'Umum'),
                        products: [],
                        amount: 0,
                        status: t.status || 'Selesai',
                        date: t.tanggal_transaksi || t.created_at.split('T')[0],
                        transactions: []
                    };
                }
                
                groups[orderId].transactions.push(t);
                groups[orderId].amount += Number(t.total_keseluruhan || 0);
                
                // If any transaction in the group is Pending/Menunggu, status is Pending/Menunggu
                if (t.status === 'Pending' || t.status === 'Menunggu') {
                    groups[orderId].status = t.status;
                }
                
                if (t.details && t.details.length > 0) {
                    t.details.forEach(d => {
                        if (!groups[orderId].products.includes(d.nama_item)) {
                            groups[orderId].products.push(d.nama_item);
                        }
                    });
                }
            });

            const formatted = Object.values(groups).map(g => ({
                id: g.id,
                customer: g.customer,
                product: g.products.length > 0 ? g.products.join(', ') : 'Layanan Kesehatan',
                amount: `Rp ${g.amount.toLocaleString('id-ID')}`,
                status: g.status,
                date: g.date,
                raw: g.transactions[0], // fallback compatibility
                transactions: g.transactions // full array
            }));

            setRecentSales(formatted);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (user?.token) {
            fetchTransactions();
        }
    }, [user?.token]);

    const handleOpenDetail = (transaction) => {
        setSelectedTransaction(transaction);
        setIsDetailModalOpen(true);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'selesai':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'menunggu':
            case 'pending':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'cancelled':
            case 'dibatalkan':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'selesai':
                return <CheckCircle2 className="w-3 h-3" />;
            case 'menunggu':
            case 'pending':
                return <Clock className="w-3 h-3" />;
            case 'cancelled':
            case 'dibatalkan':
                return <XCircle className="w-3 h-3" />;
            default:
                return null;
        }
    };

    const salesStats = useMemo(() => {
        const totalSales = recentSales.reduce((sum, sale) => {
            const rawTotal = sale.raw?.total_keseluruhan ? Number(sale.raw.total_keseluruhan) : 0;
            const rawTotalWithPpn = rawTotal;
            return sum + rawTotalWithPpn;
        }, 0);
        const transactions = recentSales.length;
        const uniqueCustomers = new Set(recentSales.map(sale => sale.raw?.data_pasien_id || sale.customer)).size;
        const stokTerjual = recentSales.reduce((sum, sale) => sum + (sale.raw?.details?.reduce((qtySum, d) => qtySum + (d.qty || 0), 0) || 0), 0);

        return [
            { title: 'Total Penjualan', value: `Rp ${totalSales.toLocaleString('id-ID')}`, icon: ShoppingCart },
            { title: 'Transaksi', value: transactions.toLocaleString('id-ID'), icon: TrendingUp },
            { title: 'Pelanggan', value: uniqueCustomers.toLocaleString('id-ID'), icon: Users },
            { title: 'Stok Terjual', value: stokTerjual.toLocaleString('id-ID'), icon: Package },
        ];
    }, [recentSales]);

    const filteredSales = recentSales.filter(sale => sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) || sale.id.toLowerCase().includes(searchTerm.toLowerCase()));

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSales = filteredSales.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    return (
        <div className="space-y-8 md:space-y-12 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-display text-primary">Transaksi</h2>
                    <p className="text-label text-primary/40 mt-3 md:mt-4">Monitor dan kelola seluruh transaksi penjualan klinik</p>
                </div>
                <button
                    onClick={() => navigate('/sales/pos')}
                    className="w-full sm:w-auto btn-primary py-4 md:py-5 uppercase tracking-widest font-black text-xs"
                >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Transaksi Baru</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {salesStats.map((stat, index) => (
                    <StatsCard 
                        key={index} 
                        title={stat.title} 
                        value={stat.value} 
                        icon={stat.icon} 
                        trend={stat.trend} 
                        change={stat.change} 
                    />
                ))}
            </div>

            {/* Recent Sales Table */}
            <div className="card border-primary/5 elevation-1 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-primary/5 flex flex-col lg:flex-row items-stretch lg:items-center gap-6 bg-secondary/10">
                    <div className="flex flex-col sm:flex-row flex-1 gap-4 items-stretch sm:items-center">
                        <div className="relative group flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Cari invoice atau konsumen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 rounded-input bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium text-primary/60 shadow-sm"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex-1 sm:flex-none p-4 rounded-input bg-white border border-primary/5 text-primary/30 hover:text-primary hover:bg-primary/5 transition-all duration-300 shadow-sm">
                                <Filter className="w-5 h-5 mx-auto" />
                            </button>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <TableSkeleton rows={10} columns={7} />
                ) : (
                    <>
                        <div className="hidden lg:block overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left min-w-[1000px]">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5">
                                <th className="px-4 py-3 text-primary/80">ID Invoice</th>
                                <th className="px-4 py-3 text-primary/80">Konsumen</th>
                                <th className="px-4 py-3 text-primary/80">Stok/Layanan</th>
                                <th className="px-4 py-3 text-primary/80 whitespace-nowrap">Total</th>
                                <th className="px-4 py-3 text-center text-primary/80">Status</th>
                                <th className="px-4 py-3 text-primary/80">Tanggal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {currentSales.map((sale) => (
                                <tr 
                                    key={sale.id} 
                                    onClick={() => handleOpenDetail(sale)}
                                    className="border-b border-primary/5 last:border-0 hover:bg-secondary/20 cursor-pointer transition-colors group"
                                >
                                    <td className="px-4 py-2">
                                        <span className="text-sm font-medium text-primary tracking-tight">{sale.id}</span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-primary">{sale.customer}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className="text-sm font-medium text-primary/80">{sale.product}</span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <span className="text-sm font-medium text-primary">{sale.amount}</span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${getStatusColor(sale.status)}`}>
                                            {getStatusIcon(sale.status)}
                                            {sale.status}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className="text-sm font-medium text-primary/80">{sale.date}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-primary/5">
                    {currentSales.map((sale) => (
                        <div key={sale.id} className="p-6 border-b border-primary/5 last:border-0 flex flex-col gap-5">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="text-xs font-black text-primary tracking-tight">{sale.customer}</p>
                                        <p className="text-[9px] font-bold text-primary/30 uppercase tracking-widest">{sale.id}</p>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(sale.status)}`}>
                                    {getStatusIcon(sale.status)}
                                    {sale.status}
                                </span>
                            </div>

                            <div className="space-y-3 bg-secondary/30 p-4 rounded-card border border-primary/5">
                                <div className="flex justify-between items-center">
                                    <p className="text-[9px] font-black text-primary/30 uppercase tracking-widest">Layanan/Stok</p>
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
                                <button 
                                    onClick={() => handleOpenDetail(sale)}
                                    className="w-full py-3 text-[10px] font-black text-primary/70 uppercase tracking-widest border border-primary/15 bg-primary/5 hover:bg-primary/10 rounded-btn transition-all shadow-sm"
                                >
                                    Detail Invoice
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )}

                <div className="p-8 bg-secondary/5 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40">
                    <span>Menampilkan {filteredSales.length === 0 ? 0 : indexOfFirstItem + 1} hingga {Math.min(indexOfLastItem, filteredSales.length)} dari {filteredSales.length} data</span>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            </div>

            <TransactionDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                transaction={selectedTransaction}
            />
        </div>
    );
};

export default SalesPage;
