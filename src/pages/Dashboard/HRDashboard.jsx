import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Clock, CalendarX, ArrowRight, CheckCircle, XCircle, Calendar } from 'lucide-react';
import StatsCard from './StatsCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { cutiAPI, absensiAPI, karyawanAPI, hariLiburAPI } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const parseDateOnly = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('-');
    if (parts.length !== 3) return new Date(dateStr);
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 0, 0, 0, 0);
};

const getHolidayLabel = (dateStr, suffix = " Lagi") => {
    const diff = Math.ceil((parseDateOnly(dateStr) - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Hari Ini";
    return `${diff} Hari${suffix}`;
};

const HRDashboard = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [leaveRequests, setLeaveRequests] = useState([]);
    const [todayAttendance, setTodayAttendance] = useState([]);
    const [totalEmployees, setTotalEmployees] = useState(45);
    const [latenessTrend, setLatenessTrend] = useState({ this_month: [], last_month: [] });
    const [upcomingHolidays, setUpcomingHolidays] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = user?.token;
            if (!token) return;

            // 1. Fetch Leave Requests
            const leaveRes = await cutiAPI.getAll(token);
            if (leaveRes.success && leaveRes.data) {
                const dataArray = Array.isArray(leaveRes.data) ? leaveRes.data : (leaveRes.data.data || []);
                const mapped = dataArray.map(item => ({
                    id: item.id,
                    staffName: item.Nama_Karyawan || 'Karyawan',
                    role: item.karyawan?.Jabatan || item.Jabatan || '-',
                    type: item.Jenis_Cuti || 'Cuti',
                    startDate: item.Tanggal_Mulai,
                    endDate: item.Tanggal_Selesai,
                    reason: item.Alasan,
                    status: item.Status_pengajuan === 'PENDING' ? 'Menunggu HRD' : (item.Status_pengajuan === 'DISETUJUI' ? 'Disetujui' : 'Ditolak')
                }));
                setLeaveRequests(mapped);
            }

            // 2. Fetch Today's Attendance
            const todayStr = new Date().toISOString().split('T')[0];
            const absensiRes = await absensiAPI.getAll(token, { tanggal: todayStr });
            if (absensiRes.success && absensiRes.data) {
                const dataArray = Array.isArray(absensiRes.data) ? absensiRes.data : (absensiRes.data.data || []);
                setTodayAttendance(dataArray);
            }

            // 3. Fetch Total Employees
            const karyawanRes = await karyawanAPI.getAll(token, 1, 'per_page=100');
            if (karyawanRes.success && karyawanRes.data) {
                const total = karyawanRes.data.data?.total || karyawanRes.data.total || 45;
                setTotalEmployees(total);
            }

            // 4. Fetch Holidays
            const holidayRes = await hariLiburAPI.getAll(token);
            if (holidayRes.success && holidayRes.data) {
                let rawHolidays = [];
                if (Array.isArray(holidayRes.data)) {
                    rawHolidays = holidayRes.data;
                } else if (holidayRes.data && Array.isArray(holidayRes.data.data)) {
                    rawHolidays = holidayRes.data.data;
                } else if (typeof holidayRes.data === 'object') {
                    rawHolidays = Object.values(holidayRes.data).filter(Array.isArray)[0] || [];
                }

                const now = new Date();
                now.setHours(0,0,0,0);
                
                const filtered = rawHolidays
                    .map(item => ({
                        id: item.id || Math.random().toString(),
                        name: item.nama_hari_libur || item.name,
                        date: item.tanggal_mulai || item.date,
                        type: item.jenis_hari_libur || item.type || 'Libur Nasional'
                    }))
                    .filter(item => {
                        const hDate = parseDateOnly(item.date);
                        return hDate >= now;
                    })
                    .sort((a, b) => parseDateOnly(a.date) - parseDateOnly(b.date));

                setUpcomingHolidays(filtered);
            }

            // 5. Fetch Lateness Trend
            const trendRes = await absensiAPI.getLatenessTrend(token);
            if (trendRes.success && trendRes.data) {
                setLatenessTrend({
                    this_month: trendRes.data.this_month || [],
                    last_month: trendRes.data.last_month || []
                });
            }

        } catch (error) {
            console.error('Error fetching HR Dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.token) {
            fetchData();
        }
    }, [user]);

    const handleReviewLeave = async (id, actionStatus) => {
        try {
            const token = user?.token;
            if (!token) return;
            const payloadStatus = actionStatus === 'Disetujui' ? 'DISETUJUI' : 'DITOLAK';
            const res = await cutiAPI.review(token, id, payloadStatus);
            if (res.success) {
                showToast(res.message || 'Persetujuan cuti berhasil diproses', 'success');
                fetchData();
            } else {
                showToast(res.message || 'Gagal memproses persetujuan', 'error');
            }
        } catch (error) {
            console.error('Error reviewing leave:', error);
            showToast('Terjadi kesalahan koneksi', 'error');
        }
    };

    // Calculate counts
    const pendingLeave = leaveRequests.filter(r => r.status === 'Menunggu').length;
    const presentCount = todayAttendance.filter(item => item.Jam_Masuk !== null && item.Jam_Masuk !== '').length;

    const todayStr = new Date().toISOString().split('T')[0];
    const leavesToday = leaveRequests.filter(r => {
        return r.status === 'Disetujui' && todayStr >= r.startDate && todayStr <= r.endDate;
    }).length;

    // Generate chart data for current and previous months (days 1 to 31)
    const chartData = Array.from({ length: 31 }, (_, index) => {
        const day = index + 1;
        
        const thisMonthRecord = latenessTrend.this_month.find(item => {
            const dateObj = new Date(item.tanggal);
            return dateObj.getDate() === day;
        });

        const lastMonthRecord = latenessTrend.last_month.find(item => {
            const dateObj = new Date(item.tanggal);
            return dateObj.getDate() === day;
        });

        return {
            day: `Tgl ${day}`,
            'Bulan Ini': thisMonthRecord ? Number(thisMonthRecord.terlambat_count) : 0,
            'Bulan Lalu': lastMonthRecord ? Number(lastMonthRecord.terlambat_count) : 0,
        };
    });

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">HR Dashboard</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
                        Admin HRD: <span className="text-violet-600 font-black">{user?.name}</span>
                    </p>
                </div>
            </div>

            {/* HR Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatsCard
                    title="Total Karyawan"
                    value={totalEmployees}
                    change="Aktif"
                    trend="up"
                    icon={Users}
                />
                <StatsCard
                    title="Kehadiran Hari Ini"
                    value={`${presentCount} / ${totalEmployees}`}
                    change="Karyawan Masuk"
                    trend={presentCount === totalEmployees ? "up" : "none"}
                    icon={Clock}
                />
                <StatsCard
                    title="Pengajuan Cuti"
                    value={pendingLeave}
                    change="Menunggu"
                    trend="down"
                    icon={CalendarX}
                />
                <StatsCard
                    title="Karyawan Cuti Hari Ini"
                    value={leavesToday}
                    change="Orang"
                    trend="none"
                    icon={UserPlus}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Leave Requests */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-primary/10 shadow-xl shadow-primary/[0.04]">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black text-primary tracking-tight">Pengajuan Cuti (Menunggu)</h3>
                        <span className="text-violet-500 text-[10px] font-black uppercase tracking-widest">Persetujuan HRD</span>
                    </div>

                    <div className="space-y-4">
                        {leaveRequests.filter(r => r.status === 'Menunggu HRD' || r.status === 'Menunggu').slice(0, 3).map((item, index) => (
                            <div 
                                key={index} 
                                onClick={() => navigate('/attendance', { state: { openLeaveApprovalData: item, activeTab: 'leave' } })}
                                className="flex items-center gap-5 p-5 bg-gray-50/50 hover:bg-violet-50/50 rounded-3xl transition-all border border-transparent hover:border-violet-100 group cursor-pointer"
                            >
                                <div className="flex-1">
                                    <h4 className="font-bold text-primary text-sm">{item.staffName}</h4>
                                    <p className="text-[10px] text-primary/40 font-black uppercase tracking-widest">{item.type} • {item.startDate} s/d {item.endDate}</p>
                                    {item.reason && <p className="text-xs text-primary/60 mt-1 italic">"{item.reason}"</p>}
                                </div>
                                <div className="flex gap-2">
                                    <ArrowRight className="w-5 h-5 text-violet-300 group-hover:text-violet-500 transition-colors" />
                                </div>
                            </div>
                        ))}
                        {pendingLeave === 0 && (
                            <p className="text-center py-10 text-xs font-bold text-primary/20 uppercase tracking-widest">Tidak ada pengajuan cuti tertunda</p>
                        )}
                    </div>
                </div>

                {/* Upcoming Holidays Card */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-primary/10 shadow-xl shadow-primary/[0.04]">
                    <h4 className="text-primary text-sm font-black uppercase tracking-widest mb-6 text-center">Hari Libur Terdekat</h4>
                    
                    <div className="space-y-4">
                        {upcomingHolidays.length > 0 ? (
                            <>
                                {/* Primary Nearest Holiday Showcase */}
                                <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/10 text-center relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl -mr-6 -mt-6" />
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest mb-3">
                                        <Calendar className="w-3 h-3" />
                                        {upcomingHolidays[0].type}
                                    </span>
                                    <h5 className="font-black text-primary text-base tracking-tight mb-1">{upcomingHolidays[0].name}</h5>
                                    <p className="text-xs text-primary/60 font-bold mb-4">
                                        {parseDateOnly(upcomingHolidays[0].date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                    <div className="py-2.5 px-5 rounded-2xl bg-amber-500 text-white font-black text-xs uppercase tracking-widest inline-block shadow-lg shadow-amber-500/20">
                                        {getHolidayLabel(upcomingHolidays[0].date)}
                                    </div>
                                </div>

                                {/* Secondary Upcoming Holidays */}
                                {upcomingHolidays.slice(1, 3).map((h, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-4 bg-gray-50/55 hover:bg-violet-500/[0.03] rounded-2xl border border-transparent hover:border-violet-500/10 transition-all">
                                        <div className="pr-2 flex-1 min-w-0">
                                            <h6 className="font-bold text-primary text-sm truncate">{h.name}</h6>
                                            <p className="text-xs text-primary/40 font-bold mt-0.5">
                                                {parseDateOnly(h.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <span className="text-xs font-black text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-lg shrink-0">
                                            {getHolidayLabel(h.date, "")}
                                        </span>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <p className="text-center py-10 text-xs font-bold text-primary/20 uppercase tracking-widest">Tidak ada hari libur terdekat</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Lateness Performance Chart */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-primary/10 shadow-xl shadow-primary/[0.04]">
                <div className="mb-6">
                    <h3 className="text-xl font-black text-primary tracking-tight">Performa Ketelatan Karyawan</h3>
                    <p className="text-xs text-primary/40 font-bold uppercase tracking-widest mt-1">Tren Harian Keterlambatan Bulan Ini vs Bulan Lalu</p>
                </div>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#ffffff', borderRadius: '1.25rem', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }} />
                            <Line type="monotone" dataKey="Bulan Ini" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="Bulan Lalu" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
