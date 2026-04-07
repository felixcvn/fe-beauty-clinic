import React, { useState, useEffect } from 'react';
import {
    CalendarDays, Clock, UserCheck, UserMinus, Search, Filter,
    MoreHorizontal, CheckCircle2, XCircle, LogOut, Camera,
    Calendar, Edit3, Download, FileText, ChevronRight
} from 'lucide-react';
import FaceScanModal from '../../components/UI/FaceScanModal';
import AttendanceDetailModal from '../../components/UI/AttendanceDetailModal';
import LeaveRequestModal from '../../components/UI/LeaveRequestModal';
import LeaveApprovalModal from '../../components/UI/LeaveApprovalModal';
import CustomSelect from '../../components/UI/CustomSelect';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const AttendancePage = () => {
    const { showToast } = useToast();
    const { user } = useAuth();

    // States
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('attendance');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Modal States
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [scanType, setScanType] = useState('in');
    const [selectedStaffId, setSelectedStaffId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailStaff, setDetailStaff] = useState(null);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [selectedLeaveRequest, setSelectedLeaveRequest] = useState(null);

    // Cek Role
    const canAccessReports = user?.role === 'Owner' || user?.role === 'Komisaris' || user?.role === 'HRD';
    const canApproveLeave = user?.role === 'HRD';

    // Mock Data
    const [attendanceStats, setAttendanceStats] = useState([
        { title: 'Hadir Hari Ini', value: '24', total: '26', icon: UserCheck, color: 'text-green-500' },
        { title: 'Izin / Sakit', value: '2', total: '26', icon: UserMinus, color: 'text-yellow-500' },
        { title: 'Terlambat', value: '3', total: '24', icon: Clock, color: 'text-red-500' },
        { title: 'Rata-rata Kehadiran', value: '96%', icon: CalendarDays, color: 'text-primary' },
    ]);

    const [staffAttendance, setStaffAttendance] = useState([
        { id: 'STF-001', name: 'Dr. Sarah Smith', role: 'Dokter', checkIn: '08:45', checkOut: '17:15', status: 'Hadir', date: '2026-03-24', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'STF-002', name: 'Linda Rahayu', role: 'Perawat', checkIn: '08:55', checkOut: '17:05', status: 'Hadir', date: '2026-03-24', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'STF-003', name: 'Andi Pratama', role: 'Customer Service', checkIn: '09:15', checkOut: '--:--', status: 'Terlambat', date: '2026-03-24', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: null },
        { id: 'STF-004', name: 'Maya Sari', role: 'Perawat', checkIn: '--:--', checkOut: '--:--', status: 'Izin', date: '2026-03-24', photoIn: null, photoOut: null },
        { id: 'STF-005', name: 'Bambang Heru', role: 'Staff Gudang', checkIn: '07:30', checkOut: '15:30', status: 'Hadir', date: '2026-03-24', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'STF-006', name: 'Ayu Lestari', role: 'Customer Service', checkIn: '08:50', checkOut: '17:00', status: 'Hadir', date: '2026-03-24', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'STF-007', name: 'Dewi Rahmawati', role: 'HRD', checkIn: '08:00', checkOut: '16:00', status: 'Hadir', date: '2026-03-24', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'STF-008', name: 'Fajar Nugroho', role: 'Manager', checkIn: '09:30', checkOut: '--:--', status: 'Terlambat', date: '2026-03-24', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: null },
        { id: 'STF-009', name: 'Rina Kartika', role: 'Perawat', checkIn: '08:40', checkOut: '16:45', status: 'Hadir', date: '2026-03-24', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'STF-010', name: 'Agus Setiawan', role: 'Perawat', checkIn: '--:--', checkOut: '--:--', status: 'Sakit', date: '2026-03-24', photoIn: null, photoOut: null },
        { id: 'STF-011', name: 'Reza Pahlevi', role: 'Kasir', checkIn: '08:58', checkOut: '--:--', status: 'Hadir', date: '2026-03-24', photoIn: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop', photoOut: null },
        { id: 'STF-012', name: 'Nina Wulandari', role: 'Kasir', checkIn: '--:--', checkOut: '--:--', status: 'Cuti', date: '2026-03-24', photoIn: null, photoOut: null },
    ]);

    const [leaveRequests, setLeaveRequests] = useState([
        { id: 'LR-001', staffName: 'Dr. Sarah Smith', role: 'Dokter', type: 'Cuti Tahunan', startDate: '2026-03-25', endDate: '2026-03-27', reason: 'Liburan keluarga', status: 'Menunggu' },
        { id: 'LR-002', staffName: 'Budi Santoso', role: 'Customer Service', type: 'Sakit', startDate: '2026-03-20', endDate: '2026-03-21', reason: 'Demam tinggi', status: 'Disetujui', attachment: 'surat_sakit_budi.jpg' },
        { id: 'LR-003', staffName: 'Maya Sari', role: 'Perawat', type: 'Izin Lainnya', startDate: '2026-03-22', endDate: '2026-03-22', reason: 'Urusan keluarga mendadak', status: 'Ditolak' },
        { id: 'LR-004', staffName: 'Dewi Rahmawati', role: 'HRD', type: 'Cuti Tahunan', startDate: '2026-04-10', endDate: '2026-04-15', reason: 'Libur lebaran', status: 'Menunggu' },
        { id: 'LR-005', staffName: 'Agus Setiawan', role: 'Perawat', type: 'Sakit', startDate: '2026-03-24', endDate: '2026-03-26', reason: 'Gejala tifus', status: 'Disetujui', attachment: 'surat_keterangan_dokter_agus.png' },
        { id: 'LR-006', staffName: 'Rina Kartika', role: 'Perawat', type: 'Cuti Melahirkan', startDate: '2026-05-01', endDate: '2026-07-31', reason: 'Persiapan persalinan', status: 'Disetujui' },
        { id: 'LR-007', staffName: 'Hendra Saputra', role: 'Staff Gudang', type: 'Izin Lainnya', startDate: '2026-03-28', endDate: '2026-03-28', reason: 'Mengurus perpanjangan SIM', status: 'Menunggu' },
        { id: 'LR-008', staffName: 'Nina Wulandari', role: 'Kasir', type: 'Cuti Tahunan', startDate: '2026-03-24', endDate: '2026-03-26', reason: 'Menjenguk keluarga', status: 'Disetujui' },
    ]);

    // Handlers
    const handleOpenScan = (type, staffId = null) => {
        setScanType(type);
        setSelectedStaffId(staffId);
        setIsScanModalOpen(true);
    };

    const handleOpenDetail = (staff) => {
        setDetailStaff(staff);
        setIsDetailModalOpen(true);
    };

    const handleAttend = () => {
        const myAttendance = staffAttendance.find(s => s.name === user?.name);
        const hasCheckedIn = myAttendance && myAttendance.checkIn !== '--:--';
        const hasCheckedOut = myAttendance && myAttendance.checkOut !== '--:--';

        if (!hasCheckedIn) {
            handleOpenScan('in');
        } else if (!hasCheckedOut) {
            handleOpenScan('out', myAttendance.id);
        } else {
            showToast('Anda sudah menyelesaikan absensi hari ini.', 'info');
        }
    };

    const handleScanSuccess = (photoUrl) => {
        const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        if (scanType === 'in') {
            setStaffAttendance(prev => {
                const existingIndex = prev.findIndex(s => s.name === user?.name);
                if (existingIndex !== -1) {
                    return prev.map((s, i) => i === existingIndex ? { ...s, checkIn: currentTime, photoIn: photoUrl, status: 'Hadir' } : s);
                } else {
                    return [
                        ...prev,
                        {
                            id: `STF-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                            name: user?.name, role: user?.role, checkIn: currentTime, checkOut: '--:--', status: 'Hadir', date: '2024-02-08', photoIn: photoUrl, photoOut: null
                        }
                    ];
                }
            });
            showToast(`Scan Berhasil sebagai ${user?.role}! Selamat bekerja.`, 'success');
        } else {
            const targetId = selectedStaffId || staffAttendance.find(s => s.name === user?.name)?.id;
            if (targetId) {
                setStaffAttendance(prev => prev.map(staff => staff.id === targetId ? { ...staff, checkOut: currentTime, photoOut: photoUrl } : staff));
                showToast(`Check-out berhasil sebagai ${user?.role}. Sampai jumpa!`, 'success');
            }
        }
        setIsScanModalOpen(false);
    };

    // Filter Logic Khusus Managerial View (Owner & HRD)
    const filteredManagerAttendance = staffAttendance.filter(record => {
        const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.role.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'Semua Status' || record.status === statusFilter;
        let matchesDate = true;
        if (startDate && endDate) {
            matchesDate = record.date >= startDate && record.date <= endDate;
        } else if (startDate) {
            matchesDate = record.date >= startDate;
        } else if (endDate) {
            matchesDate = record.date <= endDate;
        }
        return matchesSearch && matchesStatus && matchesDate;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Hadir': return 'bg-green-100 text-green-600';
            case 'Terlambat': return 'bg-yellow-100 text-yellow-600';
            case 'Sakit': case 'Izin': case 'Cuti': return 'bg-blue-100 text-blue-600';
            case 'Alpa': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    // Pagination & Search Logic
    const finalAttendance = canAccessReports ? filteredManagerAttendance : staffAttendance.filter(record =>
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [attendancePage, setAttendancePage] = useState(1);
    const [leavePage, setLeavePage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setAttendancePage(1);
        setLeavePage(1);
    }, [searchTerm, statusFilter, startDate, endDate, activeTab]);

    const idxLastAttendance = attendancePage * itemsPerPage;
    const idxFirstAttendance = idxLastAttendance - itemsPerPage;
    const currentAttendance = finalAttendance.slice(idxFirstAttendance, idxLastAttendance);
    const totalAttendancePages = Math.ceil(finalAttendance.length / itemsPerPage);

    const filteredLeave = leaveRequests.filter(req =>
        req.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const idxLastLeave = leavePage * itemsPerPage;
    const idxFirstLeave = idxLastLeave - itemsPerPage;
    const currentLeave = filteredLeave.slice(idxFirstLeave, idxLastLeave);
    const totalLeavePages = Math.ceil(filteredLeave.length / itemsPerPage);

    const handleExport = () => {
        let csvContent = "sep=,\n";
        if (activeTab === 'attendance') {
            csvContent += "ID,Nama Pegawai,Role,Tanggal,Jam Masuk,Jam Keluar,Status\n";
            finalAttendance.forEach(record => {
                csvContent += `${record.id},"${record.name}","${record.role}",${record.date},${record.checkIn},${record.checkOut},${record.status}\n`;
            });
        } else {
            csvContent += "ID,Nama Pegawai,Role,Jenis Pengajuan,Tanggal Mulai,Tanggal Selesai,Alasan,Status\n";
            filteredLeave.forEach(req => {
                csvContent += `${req.id},"${req.staffName}","${req.role}","${req.type}",${req.startDate},${req.endDate},"${req.reason}",${req.status}\n`;
            });
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Laporan_${activeTab === 'attendance' ? 'Kehadiran' : 'Cuti'}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Laporan berhasil diexport ke format Excel', 'success');
    };

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            {/* Modals */}
            <FaceScanModal isOpen={isScanModalOpen} onClose={() => setIsScanModalOpen(false)} onScanSuccess={handleScanSuccess} type={scanType} />
            <AttendanceDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} staffData={detailStaff} />
            <LeaveApprovalModal
                isOpen={isApprovalModalOpen}
                onClose={() => setIsApprovalModalOpen(false)}
                requestData={selectedLeaveRequest}
                showActions={canApproveLeave}
                onUpdateStatus={(id, status) => setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req))}
            />
            <LeaveRequestModal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} onSubmit={(data) => {
                const newRequest = { id: `LR-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`, staffName: user?.name, role: user?.role, type: data.leaveType, startDate: data.startDate, endDate: data.endDate, reason: data.reason, attachment: data.attachment, status: 'Menunggu' };
                setLeaveRequests([newRequest, ...leaveRequests]);
            }} />

            {/* Header Section Dinamis (Manager vs Staff) */}
            {canAccessReports ? (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Rekap Absensi</h2>
                        <p className="text-primary/40 mt-3 font-bold text-sm">Pantau kehadiran dan kedisiplinan seluruh pegawai klinik</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        {user?.role === 'HRD' && (
                            <>
                                <button onClick={() => setIsLeaveModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-secondary text-primary border-2 border-primary px-6 py-4 rounded-2xl hover:bg-primary/5 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-sm">
                                    <CalendarDays className="w-4 h-4" />
                                    <span>Cuti</span>
                                </button>
                                <button onClick={handleAttend} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-6 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
                                    <Camera className="w-4 h-4" />
                                    <span>Absen</span>
                                </button>
                            </>
                        )}
                        <button
                            onClick={handleExport}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export Laporan</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Kehadiran Staff</h2>
                        <p className="text-primary/40 mt-3 font-bold text-sm tracking-tight">Monitoring Absensi dan Jam Kerja Real-time</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <button onClick={handleAttend} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
                            <Camera className="w-4 h-4" />
                            <span>Absen Sekarang</span>
                        </button>
                        <button onClick={() => setIsLeaveModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-secondary text-primary border-2 border-primary px-8 py-4 rounded-2xl hover:bg-primary/5 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-sm">
                            <CalendarDays className="w-4 h-4" />
                            <span>Pengajuan Cuti</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-primary/10 mb-8 mt-4 gap-8">
                <button onClick={() => setActiveTab('attendance')} className={`pb-4 text-[10px] md:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'attendance' ? 'text-primary border-b-2 border-primary' : 'text-primary/30 hover:text-primary/60'}`}>
                    Data Kehadiran
                </button>
                <button onClick={() => setActiveTab('leave')} className={`pb-4 text-[10px] md:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'leave' ? 'text-primary border-b-2 border-primary' : 'text-primary/30 hover:text-primary/60'}`}>
                    Pengajuan Cuti / Izin
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'attendance' ? (
                <div className="space-y-8">

                    {/* STATS CARDS (Managerial View: Owner & HRD) */}
                    {canAccessReports ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2.5 text-primary/60">
                                <CalendarDays className="w-5 h-5" />
                                <span className="text-sm md:text-base font-black uppercase tracking-widest mt-0.5">
                                    Hari ini, {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                {[
                                    { label: 'Hadir Tepat Waktu', value: '24', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
                                    { label: 'Terlambat', value: '3', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50' },
                                    { label: 'Sakit / Izin / Cuti', value: '5', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
                                    { label: 'Tanpa Keterangan', value: '1', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' }
                                ].map((stat, idx) => (
                                    <div key={idx} className="bg-white rounded-3xl p-6 border border-primary/5 shadow-xl shadow-primary/5 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
                                        <div className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                                            <stat.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">{stat.label}</h4>
                                            <span className="text-3xl font-black text-primary">{stat.value}</span>
                                            <span className="text-xs font-bold text-primary/30 ml-2">Pegawai</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : canApproveLeave ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                            {attendanceStats.map((stat, index) => (
                                <div key={index} className="bg-white p-7 rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 bg-secondary rounded-2xl ${stat.color}`}>
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
                    ) : null}

                    {/* TABLE AREA */}
                    <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">

                        {/* Table Header / Filters */}
                        {canAccessReports ? (
                            <div className="p-4 md:p-8 border-b border-primary/5 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 bg-primary/5">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                                    <input type="text" placeholder="Cari nama pegawai atau divisi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all" />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex items-center gap-2 relative z-50 bg-white border border-primary/5 rounded-2xl px-4 py-2 opacity-100 shadow-sm focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                                        <Calendar className="w-4 h-4 text-primary/30" />
                                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent border-none outline-none text-primary font-bold text-[10px] md:text-xs" />
                                        <span className="text-primary/30 text-xs font-bold">-</span>
                                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent border-none outline-none text-primary font-bold text-[10px] md:text-xs" />
                                    </div>
                                    <div className="w-full sm:w-48 relative z-40">
                                        <CustomSelect value={statusFilter} onChange={setStatusFilter} options={[{ value: 'Semua Status', label: 'Semua Status' }, { value: 'Hadir', label: 'Hadir' }, { value: 'Terlambat', label: 'Terlambat' }, { value: 'Sakit', label: 'Sakit' }, { value: 'Cuti', label: 'Cuti' }, { value: 'Alpa', label: 'Alpa' }]} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 md:p-8 border-b border-primary/5 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 bg-secondary/10">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                                    <input type="text" placeholder="Cari nama staff atau divisi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" />
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
                        )}

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 border-b border-primary/5 bg-gray-50/50">
                                        <th className="px-8 py-5 rounded-tl-xl">{canAccessReports ? 'Nama Pegawai' : 'Staff'}</th>
                                        <th className="px-8 py-5">{canAccessReports ? 'Tanggal' : 'Role'}</th>
                                        <th className="px-8 py-5 text-center">Jam Masuk</th>
                                        <th className="px-8 py-5 text-center">Jam Keluar</th>
                                        {canAccessReports ? <th className="px-8 py-5 text-center">Durasi</th> : null}
                                        <th className="px-8 py-5 text-center rounded-tr-xl">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5">
                                    {currentAttendance.map((record) => (
                                        <tr key={record.id} onClick={() => handleOpenDetail(record)} className="border-b border-primary/5 last:border-0 hover:bg-primary/[0.02] transition-colors cursor-pointer">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-secondary shadow-sm flex items-center justify-center text-primary font-black text-xs border border-primary/5 shrink-0">
                                                        {record.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-primary text-sm tracking-tight">{record.name}</div>
                                                        <div className="text-[10px] text-primary/40 font-bold uppercase tracking-widest mt-0.5">
                                                            {canAccessReports ? record.role : record.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 text-primary/60 font-bold text-sm tracking-tight">
                                                {canAccessReports ? record.date : <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">{record.role}</span>}
                                            </td>
                                            <td className="px-8 py-4 text-center">
                                                {!canAccessReports && <div className={`w-1.5 h-1.5 rounded-full inline-block mr-2 ${record.checkIn === '--:--' ? 'bg-primary/10' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'}`} />}
                                                <span className={`font-bold text-sm ${record.checkIn !== '--:--' ? 'text-primary' : 'text-primary/20'}`}>{record.checkIn}</span>
                                            </td>
                                            <td className="px-8 py-4 text-center">
                                                <span className={`font-bold text-sm ${record.checkOut !== '--:--' ? 'text-primary' : 'text-primary/20'}`}>{record.checkOut}</span>
                                            </td>
                                            {canAccessReports && (
                                                <td className="px-8 py-4 text-center text-primary/60 font-bold text-sm tracking-tight">
                                                    {record.checkIn !== '--:--' && record.checkOut !== '--:--' ? '8j 15m' : '-'}
                                                </td>
                                            )}
                                            <td className="px-8 py-4 text-center">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusStyle(record.status)}`}>
                                                    {record.status === 'Hadir' ? <CheckCircle2 className="w-3 h-3" /> : record.status === 'Terlambat' ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 md:p-8 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40 bg-primary/5">
                            <span>Menampilkan {finalAttendance.length === 0 ? 0 : idxFirstAttendance + 1} hingga {Math.min(idxLastAttendance, finalAttendance.length)} dari {finalAttendance.length} data</span>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setAttendancePage(p => Math.max(1, p - 1))}
                                    disabled={attendancePage === 1}
                                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-primary/10 bg-white hover:bg-gray-50 text-primary transition-all duration-300 disabled:opacity-30 active:scale-95 shadow-sm"
                                >
                                    Sebelumnya
                                </button>
                                <button
                                    onClick={() => setAttendancePage(p => Math.min(totalAttendancePages, p + 1))}
                                    disabled={attendancePage === totalAttendancePages || totalAttendancePages === 0}
                                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-primary text-secondary hover:bg-primary/90 transition-all duration-300 disabled:opacity-30 active:scale-95 shadow-sm"
                                >Selanjutnya</button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* TAB CUTI / IZIN TETAP SAMA SEPERTI SEBELUMNYA */
                <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                    <div className="p-4 md:p-8 border-b border-primary/5 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 bg-secondary/10">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                            <input type="text" placeholder="Cari data pengajuan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" />
                        </div>
                    </div>

                    <div className="hidden md:block overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 border-b border-primary/5">
                                    <th className="px-8 py-6">Staff</th>
                                    <th className="px-8 py-6">Jenis Pengajuan</th>
                                    <th className="px-8 py-6">Durasi Tanggal</th>
                                    <th className="px-8 py-6">Alasan</th>
                                    <th className="px-8 py-6">Status</th>
                                    {canApproveLeave && <th className="px-8 py-6 text-center">Aksi</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {currentLeave.map((req) => (
                                    <tr
                                        key={req.id}
                                        onClick={() => {
                                            setSelectedLeaveRequest(req);
                                            setIsApprovalModalOpen(true);
                                        }}
                                        className="border-b border-primary/5 last:border-0 hover:bg-secondary/5 transition-colors cursor-pointer"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-[11px] font-black text-primary shadow-sm">
                                                    {req.staffName.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-primary tracking-tight">{req.staffName}</p>
                                                    <p className="text-[9px] font-bold text-primary/30 uppercase tracking-widest">{req.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">{req.type}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-[10px] font-bold text-primary mb-0.5"><span className="text-primary/40">Mulai:</span> {req.startDate}</p>
                                            <p className="text-[10px] font-bold text-primary"><span className="text-primary/40">Klr:</span> {req.endDate}</p>
                                        </td>
                                        <td className="px-8 py-6 max-w-[200px]">
                                            <p className="text-[10px] font-bold text-primary/60 truncate">{req.reason}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${req.status === 'Disetujui' ? 'bg-green-100 text-green-700' :
                                                    req.status === 'Ditolak' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {req.status === 'Disetujui' ? <CheckCircle2 className="w-3 h-3" /> :
                                                    req.status === 'Ditolak' ? <XCircle className="w-3 h-3" /> :
                                                        <Clock className="w-3 h-3" />}
                                                {req.status}
                                            </span>
                                        </td>
                                        {canApproveLeave && (
                                            <td className="px-8 py-6 text-center">
                                                <button
                                                    onClick={() => {
                                                        setSelectedLeaveRequest(req);
                                                        setIsApprovalModalOpen(true);
                                                    }}
                                                    className="p-2 rounded-xl text-primary/40 hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
                                                    title="Proses Pengajuan"
                                                >
                                                    <Edit3 className="w-4 h-4 mx-auto" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 md:p-8 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40 bg-primary/5">
                        <span>Menampilkan {filteredLeave.length === 0 ? 0 : idxFirstLeave + 1} hingga {Math.min(idxLastLeave, filteredLeave.length)} dari {filteredLeave.length} data</span>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => setLeavePage(p => Math.max(1, p - 1))}
                                disabled={leavePage === 1}
                                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-primary/10 bg-white hover:bg-gray-50 text-primary transition-all duration-300 disabled:opacity-30 active:scale-95 shadow-sm"
                            >
                                Sebelumnya
                            </button>
                            <button
                                onClick={() => setLeavePage(p => Math.min(totalLeavePages, p + 1))}
                                disabled={leavePage === totalLeavePages || totalLeavePages === 0}
                                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-primary text-secondary hover:bg-primary/90 transition-all duration-300 disabled:opacity-30 active:scale-95 shadow-sm"
                            >Selanjutnya</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendancePage;