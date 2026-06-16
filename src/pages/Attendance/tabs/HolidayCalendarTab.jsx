/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { hariLiburAPI } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import CustomSelect from '../../../components/UI/CustomSelect';
import CustomDatePicker from '../../../components/UI/CustomDatePicker';

const HolidayModal = ({ isOpen, onClose, onSave }) => {
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [type, setType] = useState('Libur Nasional');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName('');
            setStartDate('');
            setEndDate('');
            setType('Libur Nasional');
            setDescription('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleStartDateChange = (val) => {
        setStartDate(val);
        if (!endDate || endDate < val) {
            setEndDate(val);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !startDate || !endDate || !type) {
            showToast('Semua field wajib diisi', 'error');
            return;
        }
        if (endDate < startDate) {
            showToast('Tanggal selesai tidak boleh sebelum tanggal mulai', 'error');
            return;
        }
        const success = await onSave({ name, startDate, endDate, type, description });
        if (success) {
            onClose();
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30" onClick={onClose}>
            <div
                className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-visible animate-fade-in-up flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/40 hover:scale-105 active:scale-95 transition-all z-[60] shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="relative p-8 pb-6 bg-primary overflow-hidden shrink-0 rounded-t-[2.5rem]">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>

                    <div className="relative z-10 flex items-center gap-4 pr-12">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-secondary backdrop-blur-sm border border-white/10">
                            <CalendarIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">Tambah Libur</h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">Kalender Klinik</p>
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-8 flex-1 overflow-visible bg-gray-50/30 rounded-b-[2.5rem]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Nama Hari Libur</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Contoh: Hari Raya Idul Fitri"
                                className="w-full p-4 rounded-2xl border border-primary/5 bg-white text-sm font-medium text-primary outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <CustomDatePicker
                                label="Tanggal Mulai"
                                value={startDate}
                                onChange={handleStartDateChange}
                            />
                            <CustomDatePicker
                                label="Tanggal Selesai"
                                value={endDate}
                                onChange={setEndDate}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Jenis Libur</label>
                            <CustomSelect
                                value={type}
                                onChange={setType}
                                options={[
                                    { value: 'Libur Nasional', label: 'Libur Nasional' },
                                    { value: 'Cuti Bersama', label: 'Cuti Bersama' }
                                ]}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Keterangan</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Contoh: Libur nasional memperingati..."
                                className="w-full p-4 rounded-2xl border border-primary/5 bg-white text-sm font-medium text-primary outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 mt-4"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Simpan Hari Libur
                        </button>
                    </form>
                </div>
            </div>
        </div>
        , document.body);
};

const HolidayCalendarTab = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [holidays, setHolidays] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Use current date as default
    const [currentDate, setCurrentDate] = useState(new Date());

    const fetchHolidays = async () => {
        const res = await hariLiburAPI.getAll(user?.token);
        if (res.success && res.data) {
            const dataArray = Array.isArray(res.data) ? res.data : (res.data.data || []);
            const mapped = dataArray.map(h => ({
                id: h.id || Math.random().toString(),
                name: h.nama_hari_libur,
                date: h.tanggal_mulai,
                endDate: h.tanggal_selesai || h.tanggal_mulai,
                description: h.keterangan || '',
                type: h.jenis_hari_libur || 'Libur Nasional'
            }));
            setHolidays(mapped);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchHolidays();
    }, []);

    const handleSaveHoliday = async (data) => {
        const payload = {
            nama_hari_libur: data.name,
            jenis_hari_libur: data.type,
            tanggal_mulai: data.startDate,
            tanggal_selesai: data.endDate,
            keterangan: data.description
        };
        const res = await hariLiburAPI.create(user?.token, payload);
        if (res.success) {
            showToast('Hari libur berhasil ditambahkan', 'success');
            fetchHolidays();
            return true;
        } else {
            showToast(res.message, 'error');
            return false;
        }
    };

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
        const start = new Date(h.date);
        const end = h.endDate ? new Date(h.endDate) : start;
        const firstOfMonth = new Date(currentYear, currentMonth, 1);
        const lastOfMonth = new Date(currentYear, currentMonth + 1, 0);
        return start <= lastOfMonth && end >= firstOfMonth;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    const renderCalendarGrid = () => {
        const grid = [];
        let dayCounter = 1;
        let nextMonthCounter = 1;

        // Header days
        const header = dayNames.map((day, idx) => (
            <div key={`head-${idx}`} className="py-2.5 md:py-4 text-center text-[9px] md:text-[10px] font-black uppercase tracking-widest border-b border-r border-primary/10 text-primary/80 bg-primary/[0.02]">
                <span className="hidden md:inline">{day}</span>
                <span className="inline md:hidden">{day.substring(0, 3)}</span>
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
                    <div key={`prev-${i}`} className={`min-h-[60px] md:min-h-[120px] p-2 md:p-3 text-primary/20 font-medium text-xs md:text-sm bg-gray-50/50 ${borderClasses}`}>
                        {prevMonthDays - firstDay + i + 1}
                    </div>
                );
            } else if (dayCounter <= daysCount) {
                const isSunday = i % 7 === 0;

                // Cari hari libur untuk tanggal ini
                const currentCellDate = new Date(currentYear, currentMonth, dayCounter);
                currentCellDate.setHours(0, 0, 0, 0);

                const dayHolidays = currentMonthHolidays.filter(h => {
                    const start = new Date(h.date);
                    start.setHours(0, 0, 0, 0);
                    const end = h.endDate ? new Date(h.endDate) : start;
                    end.setHours(0, 0, 0, 0);
                    return currentCellDate >= start && currentCellDate <= end;
                });

                grid.push(
                    <div key={`curr-${i}`} className={`min-h-[60px] md:min-h-[120px] p-2 md:p-3 hover:bg-primary/[0.02] transition-colors relative group ${borderClasses}`}>
                        <span className={`font-bold text-xs md:text-sm ${isSunday || dayHolidays.length > 0 ? 'text-red-500' : 'text-primary'}`}>
                            {dayCounter}
                        </span>
                        <div className="mt-1 md:mt-2 space-y-1 md:space-y-1.5 flex flex-col items-center md:items-stretch">
                            {dayHolidays.map((h, idx) => (
                                <React.Fragment key={idx}>
                                    {/* Desktop view: full label */}
                                    <div 
                                        title={h.description ? `${h.name}: ${h.description}` : h.name}
                                        className={`hidden md:block text-[10px] md:text-xs font-medium p-1.5 md:p-2.5 rounded-lg md:rounded-xl leading-relaxed shadow-sm ${h.type === 'Libur Nasional' ? 'bg-red-600 text-white' : 'bg-gray-600 text-white'}`}
                                    >
                                        {h.name}
                                    </div>
                                    {/* Mobile view: small dot indicator */}
                                    <div 
                                        title={h.name}
                                        className={`block md:hidden w-1.5 h-1.5 rounded-full ${h.type === 'Libur Nasional' ? 'bg-red-500' : 'bg-gray-500'}`}
                                    />
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                );
                dayCounter++;
            } else {
                grid.push(
                    <div key={`next-${i}`} className={`min-h-[60px] md:min-h-[120px] p-2 md:p-3 text-primary/20 font-medium text-xs md:text-sm bg-gray-50/50 ${borderClasses}`}>
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
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-secondary font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
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
                    <p className="text-[10px] text-primary/40 font-black uppercase tracking-widest mt-0.5">{monthNames[currentMonth]} {currentYear}</p>
                </div>

                <div className="space-y-4">
                    {currentMonthHolidays.length > 0 ? (
                        currentMonthHolidays.map((holiday) => {
                            const startDateObj = new Date(holiday.date);
                            startDateObj.setHours(0, 0, 0, 0);
                            const endDateObj = holiday.endDate ? new Date(holiday.endDate) : startDateObj;
                            endDateObj.setHours(0, 0, 0, 0);

                            let formattedDate = `${startDateObj.getDate()} ${monthNames[startDateObj.getMonth()]} ${startDateObj.getFullYear()}`;
                            if (startDateObj.getTime() !== endDateObj.getTime()) {
                                const startStr = `${startDateObj.getDate()} ${monthNames[startDateObj.getMonth()]}`;
                                const endStr = `${endDateObj.getDate()} ${monthNames[endDateObj.getMonth()]} ${endDateObj.getFullYear()}`;
                                if (startDateObj.getFullYear() !== endDateObj.getFullYear()) {
                                    formattedDate = `${startStr} ${startDateObj.getFullYear()} - ${endStr}`;
                                } else {
                                    formattedDate = `${startStr} - ${endStr}`;
                                }
                            }

                            return (
                                <div key={holiday.id} className="p-5 rounded-2xl border border-primary/10 hover:border-primary/20 hover:shadow-lg transition-all bg-white group cursor-pointer">
                                    <div className={`text-xs font-bold mb-1.5 ${holiday.type === 'Libur Nasional' ? 'text-red-500' : 'text-gray-500'}`}>
                                        {formattedDate}
                                    </div>
                                    <div className="font-black text-primary text-base group-hover:text-primary transition-colors leading-tight">
                                        {holiday.name}
                                    </div>
                                    {holiday.description && (
                                        <div className="text-xs text-primary/60 mt-1 font-medium leading-normal">
                                            {holiday.description}
                                        </div>
                                    )}
                                    <div className="text-[11px] text-primary/50 font-bold mt-2">
                                        {holiday.type}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-6 rounded-3xl border border-dashed border-primary/20 bg-primary/5 flex items-center justify-center text-center">
                            <span className="text-sm font-medium text-primary/40 italic">
                                Belum ada hari libur untuk bulan {monthNames[currentMonth]} {currentYear}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            {/* Modal Tambah Libur */}
            <HolidayModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveHoliday}
            />
        </div>
    );
};

export default HolidayCalendarTab;
