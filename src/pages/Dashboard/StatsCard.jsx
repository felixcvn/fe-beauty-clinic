import React from 'react';

const StatsCard = ({ title, value, change, icon: Icon, trend }) => {
    const isPositive = trend === 'up';

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-secondary-dark/20 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-primary-light font-medium text-sm">{title}</p>
                    <h3 className="text-3xl font-bold text-primary mt-1">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${isPositive ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-500'}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isPositive ? '+' : ''}{change}
                </span>
                <span className="text-gray-400 text-xs font-medium">vs last month</span>
            </div>
        </div>
    );
};

export default StatsCard;
