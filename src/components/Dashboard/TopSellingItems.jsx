import React, { useState, useEffect } from 'react';
import { Package, Sparkles, Beaker, Trophy, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../services/api';

const TopSellingItems = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('produk');
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState({
        produk: [],
        treatment: [],
        racikan: []
    });

    useEffect(() => {
        const fetchTopSelling = async () => {
            if (!user?.token) return;
            setIsLoading(true);
            try {
                // Fetch default (e.g. all time or current month, the backend has start_date/end_date params but we can use default)
                const res = await dashboardAPI.getTopSellingItems(user.token, { limit: 5 });
                if (res.success && res.data) {
                    setData(res.data);
                }
            } catch (error) {
                console.error("Gagal mengambil data top selling:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTopSelling();
    }, [user?.token]);

    const tabs = [
        { id: 'produk', label: 'Produk Terlaris', icon: Package, color: 'text-amber-600', bg: 'bg-amber-100' },
        { id: 'treatment', label: 'Treatment Terlaris', icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { id: 'racikan', label: 'Racikan Terlaris', icon: Beaker, color: 'text-purple-600', bg: 'bg-purple-100' }
    ];

    const formatCurrency = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num);
    };

    const renderList = (items) => {
        if (!items || items.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Trophy className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm font-medium">Belum ada data penjualan</p>
                </div>
            );
        }

        return (
            <div className="space-y-4 mt-6">
                {items.map((item, index) => (
                    <div key={item.id || index} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-white border border-transparent hover:border-primary/10 transition-all group shadow-sm hover:shadow-md">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg
                                ${index === 0 ? 'bg-amber-100 text-amber-600' : 
                                  index === 1 ? 'bg-gray-200 text-gray-600' : 
                                  index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                                #{index + 1}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 group-hover:text-primary transition-colors">{item.nama_item}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs font-semibold text-gray-500 bg-gray-200/50 px-2 py-0.5 rounded-md">
                                        {formatCurrency(item.harga)} / qty
                                    </span>
                                    {item.kode && <span className="text-[10px] text-gray-400 font-mono">{item.kode}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center justify-end gap-1.5 mb-1">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <span className="font-black text-gray-800">{item.total_terjual} <span className="text-xs font-semibold text-gray-400">terjual</span></span>
                            </div>
                            <div className="flex items-center justify-end gap-1 text-primary">
                                <span className="text-xs font-bold bg-primary/5 px-2 py-0.5 rounded-md">
                                    {formatCurrency(item.total_pendapatan)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                                isActive 
                                    ? 'bg-primary text-secondary shadow-md scale-100' 
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 scale-95 hover:scale-100'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-secondary' : tab.color}`} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="flex-1 relative min-h-[300px]">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        {activeTab === 'produk' && renderList(data.produk)}
                        {activeTab === 'treatment' && renderList(data.treatment)}
                        {activeTab === 'racikan' && renderList(data.racikan)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopSellingItems;
