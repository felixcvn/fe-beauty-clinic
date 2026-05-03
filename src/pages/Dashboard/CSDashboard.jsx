import React from 'react';
import { Users, PhoneCall, ShoppingCart, CalendarCheck, ArrowRight, PlusCircle, CreditCard } from 'lucide-react';
import StatsCard from './StatsCard';
import { useAuth } from '../../context/AuthContext';
import { useMockData } from '../../context/MockDataContext';

const CSDashboard = () => {
    const { user } = useAuth();
    const { bookings, patients } = useMockData();

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Dashboard Customer Service</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Status CS: <span className="text-emerald-600 font-black">Online - Siap Melayani</span>
                    </p>
                </div>
            </div>

            {/* Front Desk Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatsCard
                    title="Reservasi Hari Ini"
                    value={bookings.length}
                    change="+5"
                    trend="up"
                    icon={CalendarCheck}
                />
                <StatsCard
                    title="Panggilan Keluar"
                    value="42"
                    change="Follow Up"
                    trend="up"
                    icon={PhoneCall}
                />
                <StatsCard
                    title="Pasien Baru"
                    value="12"
                    change="+15%"
                    trend="up"
                    icon={Users}
                />
                <StatsCard
                    title="Total Sales (Est)"
                    value="Rp 12.4M"
                    change="+8.2%"
                    trend="up"
                    icon={ShoppingCart}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Reservations */}
                <div className="lg:col-span-2 bg-white p-6 md:p-7 rounded-[2rem] md:rounded-[2.5rem] border border-primary/15 shadow-xl shadow-primary/[0.04] bg-white flex flex-col transition-all hover:border-primary/20">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-primary tracking-tight italic">Reservasi Terbaru</h3>
                            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1 block">Data Kedatangan Pasien</span>
                        </div>
                        <button className="text-xs font-black text-primary/40 hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-widest">
                            Selengkapnya <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {bookings.slice(0, 5).map((item, index) => (
                            <div key={index} className="flex items-center gap-5 p-5 hover:bg-emerald-50/50 rounded-3xl transition-all duration-300 border border-transparent hover:border-emerald-100 group">
                                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary border border-primary/5 group-hover:bg-primary group-hover:text-secondary transition-all duration-300 shadow-sm font-black text-sm">
                                    {item.time}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-primary text-base tracking-tight">{item.name}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] text-primary/40 font-bold uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md border border-primary/5">
                                            {item.treatment}
                                        </span>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${
                                            item.status === 'Confirmed' ? 'text-emerald-500' : 'text-amber-500'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-xs font-black text-primary/60">Cab. Jember</span>
                                    <p className="text-[9px] text-primary/30 font-bold uppercase">Front Desk A</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CS Targets */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-xl flex flex-col">
                        <h4 className="text-primary text-sm font-black uppercase tracking-widest mb-6">Target CS Bulan Ini</h4>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">New Member</span>
                                    <span className="text-sm font-black text-primary tracking-tighter">85/100</span>
                                </div>
                                <div className="h-2 w-full bg-primary/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Sales Target</span>
                                    <span className="text-sm font-black text-primary tracking-tighter">Rp 45M / 50M</span>
                                </div>
                                <div className="h-2 w-full bg-primary/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: '90%' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CSDashboard;
