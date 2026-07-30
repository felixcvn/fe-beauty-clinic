import React, { useState, useEffect } from 'react';
import { CubeIcon as Package, SparklesIcon as Sparkles, BeakerIcon as Beaker, TrophyIcon as Trophy, ArrowTrendingUpIcon as TrendingUp, CurrencyDollarIcon as DollarSign } from '@heroicons/react/24/outline';
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

        const maxSold = Math.max(...items.map(item => Number(item.total_terjual) || 0), 1);

        return (
            <div className="space-y-4 mt-6">
                {items.map((item, index) => {
                    const percent = Math.min((Number(item.total_terjual) / maxSold) * 100, 100);
                    return (
                        <div key={item.id || index} className="relative flex items-center justify-between p-4 card elevation-0 hover:border-primary/20 transition-all group hover:elevation-1 overflow-hidden">
                            {/* Visual Progress Bar Indicator */}
                            <div 
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl transition-all duration-1000 ease-out" 
                                style={{ width: `${percent}%` }}
                            ></div>
                            
                            <div className="flex items-center gap-4 relative z-10">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm
                                    ${index === 0 ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700' : 
                                      index === 1 ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600' : 
                                      index === 2 ? 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700' : 'bg-gray-50 text-gray-400'}`}>
                                    #{index + 1}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 group-hover:text-primary transition-colors text-base">{item.nama_item}</h4>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200/50">
                                            {formatCurrency(item.harga)} / qty
                                        </span>
                                        {item.kode && <span className="text-[10px] text-gray-400 font-mono tracking-wider">{item.kode}</span>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-right relative z-10 flex flex-col items-end justify-center gap-1.5">
                                <div className="text-sm md:text-base font-bold text-primary bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm border border-primary/5">
                                    {formatCurrency(item.total_pendapatan)}
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-md">
                                    <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                                    <span className="text-xs font-medium">
                                        <span className="font-bold text-gray-700">{item.total_terjual}</span> terjual
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
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
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-btn text-sm font-medium transition-all duration-300 ${
                                isActive 
                                    ? 'bg-primary text-secondary shadow-level-1 scale-100' 
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
