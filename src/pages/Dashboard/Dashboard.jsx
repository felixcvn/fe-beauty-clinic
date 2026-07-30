import React, { useState } from 'react';
import { UsersIcon as Users, CurrencyDollarIcon as DollarSign, CalendarDaysIcon as CalendarCheck, ArrowTrendingUpIcon as TrendingUp, PlusIcon as Plus } from '@heroicons/react/24/outline';
import StatsCard from './StatsCard';
import AnalysisChart from './AnalysisChart';
import { useAuth } from '../../context/AuthContext';
import { useMockData } from '../../context/MockDataContext';

const Dashboard = () => {
    // Mengambil data user dari context autentikasi
    const { user } = useAuth();
    // Mengambil data booking/pertemuan dari context mock data
    const { bookings } = useMockData();


    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0 px-1 md:px-0">
                <div>
                    <h2 className="text-2xl md:text-4xl font-black text-primary tracking-tighter leading-tight md:leading-none">Dashboard</h2>
                    <p className="text-primary/40 mt-2 md:mt-3 font-bold text-xs md:text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-accent-gold animate-pulse"></span>
                        Selamat datang, <span className="text-primary/70">{user?.name || 'User'}</span>
                    </p>
                </div>
                <button className="w-full sm:w-auto px-6 py-3.5 md:py-4 bg-primary text-secondary rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300">
                    Generate Report
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                <StatsCard
                    title="Total Pasien"
                    value="1,284"
                    change="12.5%"
                    trend="up"
                    icon={Users}
                />
                <StatsCard
                    title="Revenue"
                    value="Rp 58.4"
                    change="8.2%"
                    trend="up"
                    icon={DollarSign}
                />
                <StatsCard
                    title="Pertemuan"
                    value="84"
                    change="2.4%"
                    trend="down"
                    icon={CalendarCheck}
                />
                <StatsCard
                    title="Pertemuan Rata-rata"
                    value="18.6%"
                    change="5.1%"
                    trend="up"
                    icon={TrendingUp}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
                <div className="lg:col-span-2">
                    {/* Removed outer card wrapper since AnalysisChart has its own */}
                    <AnalysisChart />
                </div>

                <div className="bg-white p-6 md:p-8 rounded-card md:rounded-[2.5rem] border border-primary/5 elevation-2 flex flex-col">
                    <div className="flex justify-between items-center mb-6 md:mb-10">
                        <div>
                            <h3 className="text-lg md:text-xl font-black text-primary tracking-tight">Appointments</h3>
                            <span className="text-accent-gold text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-1 block">Today</span>
                        </div>
                    </div>

                    <div className="space-y-3.5 md:space-y-5 flex-1">
                        {bookings.slice(0, 4).map((item, index) => (
                            <div key={index} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 hover:bg-primary/5 rounded-2xl md:rounded-3xl transition-all duration-500 group cursor-pointer border border-transparent hover:border-primary/5 hover:translate-x-1">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-secondary shadow-sm flex flex-col items-center justify-center text-primary border border-primary/5 group-hover:bg-primary group-hover:text-secondary group-hover:border-primary transition-all duration-500">
                                    <span className="text-[10px] md:text-xs font-black leading-none">{item.time.split(':')[0]}</span>
                                    <span className="text-[8px] md:text-[10px] font-bold opacity-60 leading-none">{item.time.split(':')[1]}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-primary text-xs md:text-sm tracking-tight truncate">{item.name}</h4>
                                    <p className="text-[10px] md:text-[11px] text-primary/40 font-bold truncate">{item.treatment}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`px-2 py-0.5 md:px-2.5 md:py-1 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm ${item.status === 'Confirmed' ? 'bg-primary/10 text-primary' :
                                        item.status === 'Waiting' ? 'bg-accent-gold/10 text-accent-gold' : 'bg-red-50 text-red-400'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-6 md:mt-10 py-3.5 md:py-4 text-[10px] font-black text-primary uppercase tracking-widest border border-primary/10 rounded-2xl hover:bg-primary hover:text-secondary hover:border-primary hover:shadow-xl hover:shadow-primary/20 transition-all duration-500 active:scale-95">
                        View Full Schedule
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
