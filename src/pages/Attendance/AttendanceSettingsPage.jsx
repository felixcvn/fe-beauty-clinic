import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmployeeLocationTab from './tabs/EmployeeLocationTab';
import HolidayCalendarTab from './tabs/HolidayCalendarTab';

const AttendanceSettingsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('employee');

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <button 
                    onClick={() => navigate('/attendance')} 
                    className="flex items-center gap-2 text-primary/40 hover:text-primary transition-colors w-fit font-bold text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Rekap Absensi
                </button>
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">
                        Pengaturan Absensi
                    </h2>
                    <p className="text-primary/40 font-bold text-sm mt-2">
                        Kelola konfigurasi shift karyawan, lokasi absensi, dan jadwal hari libur klinik.
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-primary/10 mb-8 mt-4 gap-8 overflow-x-auto scrollbar-hide">
                <button 
                    onClick={() => setActiveTab('employee')} 
                    className={`pb-4 text-[10px] md:text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        activeTab === 'employee' ? 'text-primary border-b-2 border-primary' : 'text-primary/30 hover:text-primary/60'
                    }`}
                >
                    Shift & Lokasi Karyawan
                </button>
                <button 
                    onClick={() => setActiveTab('holiday')} 
                    className={`pb-4 text-[10px] md:text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        activeTab === 'holiday' ? 'text-primary border-b-2 border-primary' : 'text-primary/30 hover:text-primary/60'
                    }`}
                >
                    Kalender Hari Libur
                </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-[2rem] border border-primary/5 shadow-xl shadow-primary/5 p-6 md:p-8">
                {activeTab === 'employee' && <EmployeeLocationTab />}
                {activeTab === 'holiday' && <HolidayCalendarTab />}
            </div>
        </div>
    );
};

export default AttendanceSettingsPage;
