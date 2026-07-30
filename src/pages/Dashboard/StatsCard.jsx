import React from 'react';

const StatsCard = ({ title, value, change, icon: Icon, trend = 'up' }) => {
    const isPositive = trend === 'up';
    const isRevenue = title === 'Revenue' || title.toLowerCase().includes('revenue');

    return (
        <div className="group card p-5 md:p-7 hover:border-primary/20 transition-all hover:elevation-2 relative overflow-hidden active:scale-95 h-full flex flex-col justify-between">
            {/* Decorative background element */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-5 transition-opacity duration-500 group-hover:opacity-15 ${isPositive ? 'bg-primary' : 'bg-red-500'}`} />

            <div className="flex justify-between items-start relative z-10">
                <div className="flex-1 min-w-0">
                    <p className="text-caption tracking-[0.2em] mb-1.5 truncate">{title}</p>
                    <div className="flex items-baseline gap-1 overflow-hidden">
                        <h3 className={`${typeof value === 'string' && value.length > 10 ? 'text-lg lg:text-xl' : 'text-xl lg:text-2xl'} font-bold text-primary tracking-tight leading-none truncate`}>
                            {value}
                        </h3>
                        {isRevenue && !value.toString().includes('Rp') && <span className="text-primary/20 text-[10px] font-semibold leading-none ml-0.5">K</span>}
                    </div>
                </div>
                <div className={`p-2.5 md:p-3 rounded-btn transition-all duration-200 group-hover:scale-110 group-hover:rotate-3 shadow-level-1 flex-shrink-0 ${isPositive ? 'bg-primary text-secondary shadow-primary/20' : 'bg-red-500 text-white shadow-red-500/20'}`}>
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
            </div>

            {change && (
                <div className="mt-6 md:mt-8 flex items-center gap-2 relative z-10">
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-badge text-[8px] md:text-[9px] font-semibold tracking-widest shadow-level-1 ${isPositive ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-600'}`}>
                        {isPositive ? '↑' : '↓'} {change}
                    </div>
                    <span className="text-primary/20 text-[8px] md:text-[9px] font-semibold uppercase tracking-[0.1em] leading-none">Growth</span>
                </div>
            )}
        </div>
    );
};

export default StatsCard;
