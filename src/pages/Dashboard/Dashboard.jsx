import React from 'react';
import { Users, DollarSign, CalendarCheck, TrendingUp } from 'lucide-react';
import StatsCard from './StatsCard';
import AnalysisChart from './AnalysisChart';

const Dashboard = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold text-primary">Dashboard Overview</h2>
                <p className="text-primary-light mt-1">Welcome back, Dr. Sarah. Here is today's clinic summary.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Patients"
                    value="1,284"
                    change="12.5%"
                    trend="up"
                    icon={Users}
                />
                <StatsCard
                    title="Revenue"
                    value="$45.2k"
                    change="8.2%"
                    trend="up"
                    icon={DollarSign}
                />
                <StatsCard
                    title="Appointments"
                    value="84"
                    change="2.4%"
                    trend="down"
                    icon={CalendarCheck}
                />
                <StatsCard
                    title="Growth Rate"
                    value="18.6%"
                    change="5.1%"
                    trend="up"
                    icon={TrendingUp}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <AnalysisChart />
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-secondary-dark/20">
                    <h3 className="text-xl font-bold text-primary mb-6">Upcoming Appointments</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 hover:bg-secondary rounded-xl transition-colors cursor-pointer border border-transparent hover:border-secondary-dark/10">
                                <div className="w-12 h-12 rounded-full bg-secondary-dark/30 flex items-center justify-center text-primary font-bold">
                                    {10 + index}:00
                                </div>
                                <div>
                                    <h4 className="font-bold text-primary">Emma Watson</h4>
                                    <p className="text-xs text-primary-light">Skin Care Treatment</p>
                                </div>
                                <div className="ml-auto">
                                    <span className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">Confirmed</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-6 py-3 text-sm font-bold text-primary border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all">
                        View All Schedule
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
