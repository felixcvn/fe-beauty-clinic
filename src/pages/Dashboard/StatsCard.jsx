import React from 'react';

const StatsCard = ({ title, value, change, icon: Icon, trend = 'up' }) => {
    const isPositive = trend === 'up';
    const isRevenue = title === 'Revenue' || title.toLowerCase().includes('revenue');

    return (
        <div className="group bg-white p-6 md:p-7 rounded-[2rem] md:rounded-[2.5rem] border border-primary/15 shadow-2xl shadow-primary/[0.06] hover:border-primary/30 transition-all duration-500 hover:shadow-primary/10 relative overflow-hidden active:scale-[0.98] h-full flex flex-col justify-between">
            {/* Decorative background element */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-10 transition-opacity duration-500 group-hover:opacity-20 ${isPositive ? 'bg-primary' : 'bg-red-500'}`} />

            <div className="flex justify-between items-start relative z-10">
                <div className="flex-1">
                    <p className="text-primary/40 text-[9px] lg:text-[10px] uppercase tracking-[0.2em] font-black mb-1.5">{title}</p>
                    <div className="flex items-baseline gap-1">
                        <h3 className={`${typeof value === 'string' && value.length > 10 ? 'text-lg lg:text-xl' : 'text-xl lg:text-2xl'} font-black text-primary tracking-tight leading-none`}>
                            {value}
                        </h3>
                        {isRevenue && !value.toString().includes('Rp') && <span className="text-primary/20 text-xs font-black leading-none ml-0.5">K</span>}
                    </div>
                </div>
                <div className={`p-3 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg flex-shrink-0 ${isPositive ? 'bg-primary text-secondary shadow-primary/20' : 'bg-red-500 text-white shadow-red-500/20'}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>

            {change && (
                <div className="mt-8 flex items-center gap-2 relative z-10">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black tracking-widest shadow-sm ${isPositive ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-600'}`}>
                        {isPositive ? '↑' : '↓'} {change}
                    </div>
                    <span className="text-primary/20 text-[9px] font-black uppercase tracking-[0.1em] leading-none">Growth</span>
                </div>
            )}
        </div>
    );
};

export default StatsCard;
