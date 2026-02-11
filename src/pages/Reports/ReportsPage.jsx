import React from 'react';
import { BarChart3, TrendingUp, PieChart, Calendar, Download, ArrowUpRight, ArrowDownRight, Users, DollarSign, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const data = [
    { name: 'Jan', revenue: 4000, customers: 240 },
    { name: 'Feb', revenue: 3000, customers: 198 },
    { name: 'Mar', revenue: 2000, customers: 980 },
    { name: 'Apr', revenue: 2780, customers: 390 },
    { name: 'May', revenue: 1890, customers: 480 },
    { name: 'Jun', revenue: 2390, customers: 380 },
    { name: 'Jul', revenue: 3490, customers: 430 },
];

const treatmentData = [
    { name: 'Facial', value: 400, color: '#1B4D3E' },
    { name: 'Laser', value: 300, color: '#D4AF37' },
    { name: 'Botox', value: 300, color: '#2C5F4D' },
    { name: 'Peeling', value: 200, color: '#E5D5B0' },
];

const ReportsPage = () => {
    const reportCards = [
        { title: 'Revenue Growth', value: 'Rp 45.2M', change: '+15.4%', trend: 'up', icon: DollarSign },
        { title: 'New Customers', value: '124', change: '+8.2%', trend: 'up', icon: Users },
        { title: 'Treatment Success', value: '98.5%', change: '+0.5%', trend: 'up', icon: Activity },
        { title: 'Avg. Transaction', value: 'Rp 850k', change: '-2.1%', trend: 'down', icon: BarChart3 },
    ];

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Laporan</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm">Analisis performa dan statistik operasional klinik</p>
                </div>
                <div className="flex flex-col xs:flex-row gap-3 md:gap-4 w-full sm:w-auto">
                    <div className="flex items-center justify-center gap-2 bg-white px-6 py-4 rounded-2xl border border-primary/5 shadow-lg shadow-primary/5">
                        <Calendar className="w-4 h-4 text-primary/40" />
                        <span className="text-xs font-black text-primary uppercase tracking-widest">Last 30 Days</span>
                    </div>
                    <button className="flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
                        <Download className="w-4 h-4" />
                        <span>Export PDF</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {reportCards.map((card, index) => (
                    <div key={index} className="bg-white p-6 md:p-7 rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 hover:shadow-primary/10 transition-all duration-500 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-secondary rounded-xl md:rounded-2xl text-primary group-hover:bg-primary group-hover:text-secondary transition-all duration-500">
                                <card.icon className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${card.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                {card.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {card.change}
                            </div>
                        </div>
                        <div>
                            <p className="text-primary/40 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1">{card.title}</p>
                            <h3 className="text-xl md:text-2xl font-black text-primary tracking-tighter">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                        <div>
                            <h3 className="text-xl font-black text-primary tracking-tighter">Performa Pendapatan</h3>
                            <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest mt-1">Estimasi pendapatan bulanan (jutaan)</p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Revenue</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent-gold" />
                                <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Customers</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[250px] md:h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1B4D3E" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#1B4D3E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5D5B0" opacity={0.2} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 900, fill: '#1B4D3E', opacity: 0.3 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 900, fill: '#1B4D3E', opacity: 0.3 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '1.5rem',
                                        border: 'none',
                                        boxShadow: '0 25px 50px -12px rgba(27, 77, 62, 0.15)',
                                        fontFamily: 'Inter, sans-serif'
                                    }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#1B4D3E" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 flex flex-col">
                    <h3 className="text-xl font-black text-primary tracking-tighter mb-10">Popular Treatment</h3>
                    <div className="h-[200px] md:h-[250px] w-full mb-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={treatmentData}>
                                <XAxis
                                    dataKey="name"
                                    hide
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                                />
                                <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={40}>
                                    {treatmentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-6 mt-auto">
                        {treatmentData.map((item, index) => (
                            <div key={index} className="flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                                        {item.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-primary tracking-tight">{item.name}</p>
                                        <p className="text-[9px] font-black text-primary/30 uppercase tracking-widest">{item.value} Visits</p>
                                    </div>
                                </div>
                                <div className="text-[10px] font-black text-primary/40 uppercase tracking-widest">
                                    {Math.round((item.value / 1200) * 100)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
