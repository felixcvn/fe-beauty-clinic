import React, { useState, useEffect } from 'react'; 
import { Users, DollarSign, Activity, TrendingUp, PieChart, BarChart3, ArrowUpRight, ArrowDownRight, ShoppingBag, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts'; 
import StatsCard from './StatsCard'; 
import { useAuth } from '../../context/AuthContext'; 
import { dashboardAPI } from '../../services/api';
import PatientDistributionMap from '../../components/Dashboard/PatientDistributionMap';
import TopSellingItems from '../../components/Dashboard/TopSellingItems';

const revenueData = [
    { name: 'Jan', revenue: 450, target: 400 }, 
    { name: 'Feb', revenue: 480, target: 420 },
    { name: 'Mar', revenue: 520, target: 450 },
    { name: 'Apr', revenue: 490, target: 480 },
    { name: 'Mei', revenue: 580, target: 500 },
    { name: 'Jun', revenue: 610, target: 550 },
    { name: 'Jul', revenue: 650, target: 600 },
];

const salesSourceData = [
    { name: 'Klinik (Kantor)', value: 1250, color: '#1B4D3E' }, 
    { name: 'E-Commerce', value: 850, color: '#D4AF37' }, 
    { name: 'Reseller', value: 450, color: '#829356' }, 
];

const treatmentPerfData = [
    { name: 'Facial', total: 120 },
    { name: 'Laser', total: 85 },
    { name: 'Botox', total: 60 },
    { name: 'Peeling', total: 50 },
    { name: 'Skincare', total: 200 },
];

const OwnerDashboard = () => {
    const { user } = useAuth();
    const [activePieIndex, setActivePieIndex] = useState(0);
    const [salesSource, setSalesSource] = useState([
        { name: 'Klinik (Kantor)', value: 0, color: '#1B4D3E' }, 
        { name: 'Reseller', value: 0, color: '#829356' }
    ]);
    const [stats, setStats] = useState({
        revenue: { value: 'Rp 0', change: '0%', trend: 'up' },
        patients: { value: '0', change: '0%', trend: 'up' }
    });

    const formatJuta = (num) => {
        return (num / 1000000).toFixed(1);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.token) return;
            const res = await dashboardAPI.getSummaryStats(user.token);
            if (res.success && res.data) {
                const { revenue, transactions, sales_sources } = res.data;

                const formatRev = (num) => {
                    if (num >= 1000000) return `Rp ${(num / 1000000).toFixed(1)}M`;
                    if (num >= 1000) return `Rp ${(num / 1000).toFixed(1)}k`;
                    return `Rp ${num}`;
                };

                setStats({
                    revenue: {
                        value: formatRev(revenue.value),
                        change: `${Math.abs(revenue.growth).toFixed(1)}%`,
                        trend: revenue.trend
                    },
                    patients: {
                        value: `+${transactions.value}`,
                        change: `${Math.abs(transactions.growth).toFixed(1)}%`,
                        trend: transactions.trend
                    }
                });

                if (sales_sources) {
                    setSalesSource(sales_sources);
                }
            }
        };

        fetchData();
    }, [user?.token]);

    const onPieEnter = (_, index) => {
        setActivePieIndex(index);
    };

    const renderActiveShape = (props) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
        return (
            <g>
                <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="#1B4D3E" className="font-semibold text-xs uppercase tracking-tighter">
                    {payload.name}
                </text>
                <text x={cx} y={cy} dy={15} textAnchor="middle" fill="#1B4D3E" className="font-semibold text-lg tracking-tighter">
                    Rp {value}jt
                </text>
                <Pie
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 8}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    stroke="none"
                />
            </g>
        );
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12"> 
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tighter leading-none">Dashboard Owner</h2>
                    <p className="text-primary/40 mt-3 font-medium text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse"></span>
                        {user?.role} 
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 md:py-4 bg-white text-primary border border-primary/10 rounded-2xl font-bold text-sm shadow-xl shadow-primary/5 hover:scale-105 active:scale-95 transition-all duration-300">
                        Bulan Ini
                    </button>
                    <button className="px-6 py-3 md:py-4 bg-primary text-secondary rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300">
                        Unduh Laporan Executive
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <StatsCard
                    title="Total Pendapatan"
                    value={stats.revenue.value}
                    change={stats.revenue.change}
                    trend={stats.revenue.trend}
                    icon={DollarSign}
                />
                <StatsCard
                    title="Pertumbuhan Transaksi"
                    value={stats.patients.value}
                    change={stats.patients.change}
                    trend={stats.patients.trend}
                    icon={Users}
                />
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Revenue vs Target Trend - spanning 2 columns */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-primary/15 shadow-xl shadow-primary/[0.08] bg-white">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-semibold text-primary tracking-tight">Pendapatan vs Target</h3>
                            <span className="text-primary/40 text-[10px] font-semibold uppercase tracking-widest mt-1 block">Dalam Jutaan Rupiah</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-primary/20"></span>
                                <span className="text-xs font-medium text-primary">Target</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-primary"></span>
                                <span className="text-xs font-medium text-primary">Realisasi</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevTarget" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1B4D3E" stopOpacity={0.05} />
                                        <stop offset="95%" stopColor="#1B4D3E" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRevReal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1B4D3E" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#1B4D3E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5D5B0" opacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '500', fill: '#1B4D3E', opacity: 0.5 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '500', fill: '#1B4D3E', opacity: 0.5 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#1B4D3E', fontWeight: '500' }}
                                />
                                <Area type="monotone" dataKey="target" stroke="#1B4D3E" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorRevTarget)" />
                                <Area type="monotone" dataKey="revenue" stroke="#1B4D3E" strokeWidth={3} fillOpacity={1} fill="url(#colorRevReal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sales Sources Pie Chart */}
                <div className="bg-white p-8 rounded-[3rem] border border-primary/15 shadow-xl shadow-primary/[0.08] flex flex-col">
                    <div>
                        <h3 className="text-xl font-semibold text-primary tracking-tight">Sumber Penjualan</h3>
                        <span className="text-primary/40 text-[10px] font-semibold uppercase tracking-widest mt-1 block">Distribusi Saluran (Juta Rp)</span>
                    </div>
                    <div className="h-[250px] w-full mt-4 flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie
                                    activeIndex={activePieIndex}
                                    activeShape={(props) => {
                                        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
                                        return (
                                            <g>
                                                <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="#1B4D3E" className="font-semibold text-xs uppercase tracking-tighter">
                                                    {payload.name}
                                                </text>
                                                <text x={cx} y={cy} dy={15} textAnchor="middle" fill="#1B4D3E" className="font-semibold text-lg tracking-tighter">
                                                    Rp {formatJuta(value)} Juta
                                                </text>
                                                <Pie
                                                    cx={cx}
                                                    cy={cy}
                                                    innerRadius={innerRadius}
                                                    outerRadius={outerRadius + 8}
                                                    startAngle={startAngle}
                                                    endAngle={endAngle}
                                                    fill={fill}
                                                    stroke="none"
                                                    data={salesSource}
                                                    dataKey="value"
                                                />
                                            </g>
                                        );
                                    }}
                                    data={salesSource}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={65}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                    onMouseEnter={onPieEnter}
                                >
                                    {salesSource.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} opacity={activePieIndex === index ? 1 : 0.6} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(v) => [`Rp ${formatJuta(v)} Juta`, 'Total']}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: '#1B4D3E', fontWeight: '500', fontSize: '12px' }}
                                />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-2.5 mt-4">
                        {salesSource.map((source, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: source.color }}></div>
                                    <span className="text-sm font-medium text-gray-700">{source.name}</span>
                                </div>
                                <span className="text-sm font-bold text-primary">Rp {formatJuta(source.value)} Juta</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Breakdown */}
            <div className="w-full">
                {/* Top Selling Items (Dynamic) */}
                <div className="bg-white p-8 rounded-[3rem] border border-primary/15 shadow-xl shadow-primary/[0.08] bg-white">
                     <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-semibold text-primary tracking-tight">Perilaku Pelanggan</h3>
                            <span className="text-primary/40 text-[10px] font-semibold uppercase tracking-widest mt-1 block">Item Paling Banyak Diminati</span>
                        </div>
                        <div className="p-3 bg-secondary rounded-2xl">
                            <ShoppingBag className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <div className="w-full">
                        <TopSellingItems />
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="bg-white p-8 rounded-[3rem] border border-primary/15 shadow-xl shadow-primary/[0.08] flex flex-col">
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-primary tracking-tight">Peta Kepadatan Pasien</h3>
                    <span className="text-primary/40 text-[10px] font-semibold uppercase tracking-widest mt-1 block">Distribusi Pasien Berdasarkan Kecamatan</span>
                </div>
                <div className="h-[500px] w-full rounded-[2rem] overflow-hidden border border-primary/10">
                    <PatientDistributionMap />
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;
