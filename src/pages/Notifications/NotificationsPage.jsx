import React, { useState, useEffect } from 'react';
import { Search, MailOpen, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { transaksiAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const NotificationsPage = () => {
    const [filter, setFilter] = useState('all');
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { showToast } = useToast();

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await transaksiAPI.getAll(token, 'Pending');
            if (res.success && Array.isArray(res.data)) {
                // Filter only Produk and format to notification structure
                const poNotifications = res.data
                    .filter(t => t.tipe_transaksi === 'Produk' && t.status === 'Pending')
                    .map(t => {
                        const date = new Date(t.created_at || t.tanggal_transaksi);
                        const timeDiffMs = new Date() - date;
                        const diffMins = Math.floor(timeDiffMs / 60000);
                        const timeStr = diffMins < 60 ? `${diffMins} Menit yang Lalu` : 
                                        diffMins < 1440 ? `${Math.floor(diffMins/60)} Jam yang Lalu` : 
                                        `${Math.floor(diffMins/1440)} Hari yang Lalu`;
                        const namaPasien = t.pasien ? t.pasien.Nama_pasien : (t.nama_pasien_distributor || 'Umum');
                        const noResi = t.no_resi || t.order_id || `INV-${t.id}`;
                        const qty = t.details ? t.details.reduce((sum, d) => sum + (d.qty || 0), 0) : 0;
                        const namaKaryawan = t.karyawan ? (t.karyawan.NamaLengkap_karyawan || t.karyawan.nama_lengkap || t.karyawan.name) : 'Admin';
                        
                        return {
                            id: t.id,
                            raw: t,
                            type: 'po',
                            title: 'PO Produk Baru',
                            description: `Pesanan atas nama ${namaPasien} telah masuk.`,
                            extraData: {
                                namaPasien,
                                noResi,
                                qty,
                                namaKaryawan
                            },
                            time: timeStr,
                            read: false,
                            icon: ShoppingBag,
                            color: 'text-blue-500',
                            bg: 'bg-blue-50'
                        };
                    });
                
                setNotifications(poNotifications);
            } else {
                setNotifications([]);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
            showToast('Gagal memuat notifikasi', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await transaksiAPI.approve(token, id);
            if (res.success) {
                showToast('PO Berhasil di-ACC dan Stok Berkurang', 'success');
                fetchNotifications(); // Refresh list
            } else {
                showToast(res.message || 'Gagal ACC PO', 'error');
            }
        } catch (error) {
            showToast('Terjadi kesalahan jaringan', 'error');
        }
    };

    const handleDetail = (notif) => {
        navigate('/warehouse-transactions', { state: { openTransactionId: notif.raw.id } });
    };

    const filteredNotifs = notifications.filter(n => {
        if (filter === 'unread' && n.read) return false;
        if (filter === 'important' && n.type !== 'po') return false;
        if (searchTerm && !n.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Notifikasi</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm">Pusat informasi dan pemberitahuan aktivitas klinik</p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-all">
                        <MailOpen className="w-4 h-4" />
                        <span>Tandai Semua Dibaca</span>
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-all">
                        <Trash2 className="w-4 h-4" />
                        <span>Hapus Semua</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="p-4 md:p-8 border-b border-primary/5 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 bg-secondary/10">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
                        {['Semua', 'Belum Dibaca', 'Penting'].map((opt, idx) => {
                            const val = ['all', 'unread', 'important'][idx];
                            return (
                                <button
                                    key={val}
                                    onClick={() => setFilter(val)}
                                    className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${filter === val ? 'bg-primary text-secondary shadow-lg shadow-primary/20' : 'bg-white text-primary/40 border border-primary/5 hover:bg-primary/5 hover:text-primary'
                                        }`}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari notifikasi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full lg:w-64 pl-12 pr-6 py-3 rounded-2xl bg-white border border-primary/5 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-xs font-bold text-primary"
                        />
                    </div>
                </div>

                <div className="divide-y divide-primary/5 min-h-[300px]">
                    {isLoading ? (
                        <div className="p-10 text-center text-primary/40 font-bold text-sm">Memuat notifikasi...</div>
                    ) : filteredNotifs.length > 0 ? (
                        filteredNotifs.map((notif) => (
                            <div key={notif.id} className={`p-6 md:p-8 border-b border-primary/5 last:border-0 flex flex-col sm:flex-row gap-6 md:gap-8 items-start ${!notif.read ? 'bg-secondary/20' : ''}`}>
                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${notif.bg} flex items-center justify-center ${notif.color} shadow-sm shrink-0`}>
                                    <notif.icon className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                                        <h4 className={`text-base md:text-lg font-black tracking-tight ${!notif.read ? 'text-primary' : 'text-primary/60'}`}>{notif.title}</h4>
                                        <span className="text-[9px] md:text-[10px] font-black text-primary/30 uppercase tracking-widest">{notif.time}</span>
                                    </div>
                                    <p className={`text-xs md:text-sm leading-relaxed ${!notif.read ? 'text-primary/60 font-medium' : 'text-primary/40'}`}>{notif.description}</p>
                                    
                                    {notif.extraData && (
                                        <div className="mt-3 bg-white/50 border border-primary/5 p-4 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-primary/30">Nama Pasien</p>
                                                <p className="text-xs font-bold text-primary">{notif.extraData.namaPasien}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-primary/30">No Resi</p>
                                                <p className="text-xs font-bold text-primary">{notif.extraData.noResi}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-primary/30">Total Qty</p>
                                                <p className="text-xs font-bold text-primary">{notif.extraData.qty} Pcs</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-primary/30">Kasir / Admin</p>
                                                <p className="text-xs font-bold text-primary">{notif.extraData.namaKaryawan}</p>
                                            </div>
                                        </div>
                                    )}

                                    {!notif.read && (
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <button 
                                                onClick={() => handleDetail(notif)}
                                                className="px-6 py-3 rounded-xl bg-primary text-secondary text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md">
                                                Lihat Detail
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-row sm:flex-col items-center gap-4 ml-auto sm:ml-0">
                                    {!notif.read && <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.5)]" title="Unread" />}
                                    <button className="p-2 text-primary/20 transition-all hover:text-red-500">
                                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-10 text-center text-primary/40 font-bold text-sm">Tidak ada notifikasi baru</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
