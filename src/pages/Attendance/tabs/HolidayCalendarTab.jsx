import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useMockData } from '../../../context/MockDataContext';

const HolidayCalendarTab = () => {
    const { holidays } = useMockData();
    // Use May 2026 as default to match mock data or current year/month
    const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); 

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const dayNames = ["MINGGU", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const daysCount = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const currentMonthHolidays = (holidays || []).filter(h => {
        const d = new Date(h.date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const yearHolidays = (holidays || []).filter(h => new Date(h.date).getFullYear() === currentYear)
                                 .sort((a,b) => new Date(a.date) - new Date(b.date));

    const renderCalendarGrid = () => {
        const grid = [];
        let dayCounter = 1;
        let nextMonthCounter = 1;

        // Header days
        const header = dayNames.map((day, idx) => (
            <div key={`head-${idx}`} className="py-4 text-center text-[10px] font-black uppercase tracking-widest border-b border-r border-primary/10 text-primary/80 bg-primary/[0.02]">
                {day}
            </div>
        ));
        grid.push(...header);

        // Grid cells (6 rows = 42 cells)
        for (let i = 0; i < 42; i++) {
            // Add right border except for the last column (Saturday)
            const isLastCol = (i + 1) % 7 === 0;
            const borderClasses = `border-b ${isLastCol ? '' : 'border-r'} border-primary/10`;

            if (i < firstDay) {
                grid.push(
                    <div key={`prev-${i}`} className={`min-h-[120px] p-3 text-primary/20 font-medium text-sm bg-gray-50/50 ${borderClasses}`}>
                        {prevMonthDays - firstDay + i + 1}
                    </div>
                );
            } else if (dayCounter <= daysCount) {
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
                const isSunday = i % 7 === 0;
                
                const dayHolidays = currentMonthHolidays.filter(h => h.date === dateStr);
                
                grid.push(
                    <div key={`curr-${i}`} className={`min-h-[120px] p-3 hover:bg-primary/[0.02] transition-colors relative group ${borderClasses}`}>
                        <span className={`font-bold text-sm ${isSunday || dayHolidays.length > 0 ? 'text-red-500' : 'text-primary'}`}>
                            {dayCounter}
                        </span>
                        <div className="mt-2 space-y-1.5">
                            {dayHolidays.map((h, idx) => (
                                <div key={idx} className={`text-[10px] font-bold p-2 rounded-xl leading-snug shadow-sm ${h.type === 'Libur Nasional' ? 'bg-red-600 text-white' : 'bg-gray-600 text-white'}`}>
                                    {h.name}
                                </div>
                            ))}
                        </div>
                    </div>
                );
                dayCounter++;
            } else {
                grid.push(
                    <div key={`next-${i}`} className={`min-h-[120px] p-3 text-primary/20 font-medium text-sm bg-gray-50/50 ${borderClasses}`}>
                        {nextMonthCounter++}
                    </div>
                );
            }
        }

        return grid;
    };

    return (
        <div className="flex flex-col xl:flex-row gap-8">
            {/* Left: Calendar */}
            <div className="flex-1 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h3 className="text-2xl md:text-3xl font-black text-primary tracking-tighter">
                            {monthNames[currentMonth]} {currentYear}
                        </h3>
                        <div className="flex items-center bg-primary/5 rounded-xl p-1 border border-primary/10">
                            <button onClick={prevMonth} className="p-2 hover:bg-white rounded-lg text-primary/40 hover:text-primary transition-all hover:shadow-sm">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={nextMonth} className="p-2 hover:bg-white rounded-lg text-primary/40 hover:text-primary transition-all hover:shadow-sm">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-secondary font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        <Plus className="w-4 h-4" />
                        Tambah Hari Libur
                    </button>
                </div>

                <div className="border border-primary/10 rounded-3xl overflow-hidden bg-white shadow-sm">
                    <div className="grid grid-cols-7">
                        {renderCalendarGrid()}
                    </div>
                </div>
            </div>

            {/* Right: List */}
            <div className="w-full xl:w-80 shrink-0 border-t xl:border-t-0 xl:border-l border-primary/10 pt-8 xl:pt-0 xl:pl-8 space-y-6">
                <div>
                    <h3 className="text-xl font-black text-primary tracking-tighter">Daftar Hari Libur</h3>
                    <p className="text-[10px] text-primary/40 font-black uppercase tracking-widest mt-0.5">Tahun {currentYear}</p>
                </div>

                <div className="space-y-4">
                    {yearHolidays.length > 0 ? (
                        yearHolidays.map((holiday) => {
                            const dateObj = new Date(holiday.date);
                            const formattedDate = `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
                            
                            return (
                                <div key={holiday.id} className="p-5 rounded-2xl border border-primary/10 hover:border-primary/20 hover:shadow-lg transition-all bg-white group cursor-pointer">
                                    <div className={`text-xs font-bold mb-1.5 ${holiday.type === 'Libur Nasional' ? 'text-red-500' : 'text-gray-500'}`}>
                                        {formattedDate}
                                    </div>
                                    <div className="font-black text-primary text-base group-hover:text-primary transition-colors leading-tight">
                                        {holiday.name}
                                    </div>
                                    <div className="text-[11px] text-primary/50 font-bold mt-2">
                                        {holiday.type}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-6 rounded-3xl border border-dashed border-primary/20 bg-primary/5 flex items-center justify-center text-center">
                            <span className="text-sm font-medium text-primary/40 italic">
                                Belum ada hari libur untuk tahun {currentYear}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HolidayCalendarTab;
