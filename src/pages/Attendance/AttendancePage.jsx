import React, { useState } from 'react';
import { CalendarDays, Clock, UserCheck, UserMinus, Search, Filter, MoreHorizontal, CheckCircle2, XCircle, LogOut, Camera, Calendar } from 'lucide-react';
import FaceScanModal from '../../components/UI/FaceScanModal';
import AttendanceDetailModal from '../../components/UI/AttendanceDetailModal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const AttendancePage = () => {
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [scanType, setScanType] = useState('in'); // 'in' or 'out'
    const [selectedStaffId, setSelectedStaffId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailStaff, setDetailStaff] = useState(null);

    const [attendanceStats, setAttendanceStats] = useState([
        { title: 'Hadir Hari Ini', value: '24', total: '26', icon: UserCheck, color: 'text-green-500' },
        { title: 'Izin / Sakit', value: '2', total: '26', icon: UserMinus, color: 'text-yellow-500' },
        { title: 'Terlambat', value: '3', total: '24', icon: Clock, color: 'text-red-500' },
        { title: 'Rata-rata Kehadiran', value: '96%', icon: CalendarDays, color: 'text-primary' },
    ]);

    const [staffAttendance, setStaffAttendance] = useState([
        { id: 'STF-001', name: 'Dr. Sarah Smith', role: 'Dermatologist', checkIn: '08:45', checkOut: '17:15', status: 'Hadir', date: '2024-02-08', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'STF-002', name: 'Linda Rahayu', role: 'Nurse', checkIn: '08:55', checkOut: '17:05', status: 'Hadir', date: '2024-02-08', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'STF-003', name: 'Andi Pratama', role: 'Receptionist', checkIn: '09:15', checkOut: '--:--', status: 'Terlambat', date: '2024-02-08', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: null },
        { id: 'STF-004', name: 'Maya Sari', role: 'Therapist', checkIn: '--:--', checkOut: '--:--', status: 'Izin', date: '2024-02-08', photoIn: null, photoOut: null },
        { id: 'STF-005', name: 'Bambang Heru', role: 'Security', checkIn: '07:30', checkOut: '15:30', status: 'Hadir', date: '2024-02-08', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop' },
    ]);

    const handleOpenScan = (type, staffId = null) => {
        setScanType(type);
        setSelectedStaffId(staffId);
        setIsScanModalOpen(true);
    };

    const handleOpenDetail = (staff) => {
        setDetailStaff(staff);
        setIsDetailModalOpen(true);
    };

    const { user } = useAuth();

    const handleScanSuccess = (photoUrl) => {
        const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        if (scanType === 'in') {
            // Find if this user already exists in the list or create/update their entry
            setStaffAttendance(prev => {
                const existingIndex = prev.findIndex(s => s.name === user?.name);
                if (existingIndex !== -1) {
                    return prev.map((s, i) => i === existingIndex
                        ? { ...s, checkIn: currentTime, photoIn: photoUrl, status: 'Hadir' }
                        : s
                    );
                } else {
                    // Add new entry for the logged-in user if they aren't in the mock list
                    return [
                        ...prev,
                        {
                            id: `STF-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                            name: user?.name,
                            role: user?.role,
                            checkIn: currentTime,
                            checkOut: '--:--',
                            status: 'Hadir',
                            date: '2024-02-08',
                            photoIn: photoUrl,
                            photoOut: null
                        }
                    ];
                }
            });
            showToast(`Scan Berhasil sebagai ${user?.role}! Selamat bekerja.`, 'success');
        } else {
            // Simulated check-out
            const targetId = selectedStaffId || staffAttendance.find(s => s.name === user?.name)?.id;
            if (targetId) {
                setStaffAttendance(prev => prev.map(staff =>
                    staff.id === targetId
                        ? { ...staff, checkOut: currentTime, photoOut: photoUrl }
                        : staff
                ));
                showToast(`Check-out berhasil sebagai ${user?.role}. Sampai jumpa!`, 'success');
            }
        }
        setIsScanModalOpen(false);
    };

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            <FaceScanModal
                isOpen={isScanModalOpen}
                onClose={() => setIsScanModalOpen(false)}
                onScanSuccess={handleScanSuccess}
                type={scanType}
            />

            <AttendanceDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                staffData={detailStaff}
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Kehadiran Staff</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm tracking-tight">Monitoring Absensi dan Jam Kerja Real-time</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => handleOpenScan('in')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                    >
                        <Camera className="w-4 h-4" />
                        <span>Face Scan Masuk</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {attendanceStats.map((stat, index) => (
                    <div key={index} className="bg-white p-7 rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 hover:shadow-primary/10 transition-all duration-500 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 bg-secondary rounded-2xl ${stat.color} group-hover:bg-primary group-hover:text-secondary transition-all duration-500`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <div>
                            <p className="text-primary/40 text-[10px] font-black uppercase tracking-widest mb-1">{stat.title}</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-xl md:text-2xl font-black text-primary tracking-tighter">{stat.value}</h3>
                                {stat.total && <span className="text-[10px] font-bold text-primary/20">/ {stat.total} Staff</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="p-4 md:p-8 border-b border-primary/5 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 bg-secondary/10">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                        <input
                            type="text"
                            placeholder="Cari nama staff atau divisi..."
                            className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex-1 md:flex-none p-3.5 rounded-2xl border border-primary/5 bg-white text-primary/60 hover:text-primary transition-all shadow-sm">
                            <Filter className="w-5 h-5 mx-auto" />
                        </button>
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-primary/5 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-secondary transition-all shadow-sm">
                            <Calendar className="w-4 h-4" />
                            <span>Filter Tanggal</span>
                        </button>
                    </div>
                </div>

                <div className="hidden md:block overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5">
                                <th className="px-8 py-6">Staff</th>
                                <th className="px-8 py-6">Role</th>
                                <th className="px-8 py-6">Jam Masuk</th>
                                <th className="px-8 py-6">Jam Keluar</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {staffAttendance.map((staff) => (
                                <tr
                                    key={staff.id}
                                    onClick={() => handleOpenDetail(staff)}
                                    className="group hover:bg-secondary/20 transition-all duration-300 cursor-pointer"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-[11px] font-black text-primary shadow-sm group-hover:bg-white transition-all">
                                                {staff.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-primary tracking-tight">{staff.name}</p>
                                                <p className="text-[9px] font-bold text-primary/30 uppercase tracking-widest">{staff.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">{staff.role}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${staff.checkIn === '--:--' ? 'bg-primary/10' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'}`} />
                                            <span className="text-xs font-bold text-primary">{staff.checkIn}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold text-primary/40">{staff.checkOut}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${staff.status === 'Hadir' ? 'bg-green-100 text-green-700' :
                                            staff.status === 'Terlambat' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {staff.status === 'Hadir' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {staff.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        {staff.checkOut === '--:--' && staff.status !== 'Izin' ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenScan('out', staff.id);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-secondary transition-all shadow-sm"
                                            >
                                                <LogOut className="w-3 h-3" />
                                                Check-out
                                            </button>
                                        ) : (
                                            <button className="p-2 rounded-xl text-primary/20 hover:text-primary hover:bg-white transition-all duration-300">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-primary/5">
                    {staffAttendance.map((staff) => (
                        <div
                            key={staff.id}
                            onClick={() => handleOpenDetail(staff)}
                            className="p-6 hover:bg-secondary/10 transition-all duration-300 flex flex-col gap-4 cursor-pointer active:bg-secondary/20"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-[10px] font-black text-primary border border-primary/5">
                                        {staff.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-primary tracking-tight">{staff.name}</p>
                                        <p className="text-[9px] font-bold text-primary/30 uppercase tracking-widest">{staff.role}</p>
                                    </div>
                                </div>
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${staff.status === 'Hadir' ? 'bg-green-100 text-green-700' :
                                    staff.status === 'Terlambat' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {staff.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-primary/5 p-4 rounded-2xl">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-primary/30 uppercase tracking-widest flex items-center gap-1.5">
                                        <Clock className="w-2.5 h-2.5" /> Masuk
                                    </p>
                                    <p className="text-xs font-bold text-primary">{staff.checkIn}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-primary/30 uppercase tracking-widest flex items-center gap-1.5">
                                        <LogOut className="w-2.5 h-2.5" /> Keluar
                                    </p>
                                    <p className="text-xs font-bold text-primary">{staff.checkOut}</p>
                                </div>
                            </div>

                            {staff.checkOut === '--:--' && staff.status !== 'Izin' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenScan('out', staff.id);
                                    }}
                                    className="w-full py-3 bg-primary text-secondary rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10"
                                >
                                    Check-out Sekarang
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="p-8 bg-secondary/5 border-t border-primary/5 flex justify-between items-center text-[10px] font-black text-primary/30 uppercase tracking-widest">
                    <span>Terakhir diupdate: Hari ini, 09:30</span>
                    <button className="text-primary hover:underline">Refresh Data</button>
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;
