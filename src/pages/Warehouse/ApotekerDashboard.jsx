import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BeakerIcon as Beaker, CubeIcon as Package, ExclamationTriangleIcon as AlertTriangle, ChartBarIcon as Activity, ArrowPathIcon as RefreshCw, CalendarIcon as Calendar, ArrowTrendingUpIcon as TrendingUp, ClipboardDocumentListIcon as ClipboardList, SparklesIcon as Wand2, CircleStackIcon as Coins, CheckCircleIcon as CheckCircle, DocumentTextIcon as FileText, BeakerIcon as FlaskConical, XMarkIcon as X } from '@heroicons/react/24/outline';
import StatsCard from '../Dashboard/StatsCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useMockData } from '../../context/MockDataContext';
import TableSkeleton from '../../components/UI/TableSkeleton';
import { bahanTreatmentAPI, bahanMedisAPI, bahanInfusAPI, barangApotekAPI } from '../../services/api';
import ConfirmModal from '../../components/UI/ConfirmModal';

const ApotekerDashboard = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { bookings, antreanRacikan, completeAntreanRacikan } = useMockData();
    const [isLoading, setIsLoading] = useState(true);

    // State untuk Modal Pemrosesan Racikan
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [racikanName, setRacikanName] = useState('');
    const [racikanPrice, setRacikanPrice] = useState('');
    const [racikanStock, setRacikanStock] = useState('1');
    const [isSubmittingRacikan, setIsSubmittingRacikan] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState(null);
    const [errors, setErrors] = useState({});
    const formRef = useRef(null);
    
    const [stats, setStats] = useState({
        totalMaterials: 0,
        totalMedicals: 0,
        totalInfusions: 0,
        totalApotekItems: 0,
        lowStockCount: 0
    });

    const [lowStockItems, setLowStockItems] = useState([]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');

        try {
            const [resMat, resMed, resInf, resApo] = await Promise.all([
                bahanTreatmentAPI.getAll(token),
                bahanMedisAPI.getAll(token),
                bahanInfusAPI.getAll(token),
                barangApotekAPI.getAll(token)
            ]);

            const allData = [];
            let lowCount = 0;

            const processData = (res, type) => {
                if (res.success && Array.isArray(res.data)) {
                    res.data.forEach(item => {
                        const stock = Number(item.Stok || 0);
                        const minStock = Number(item.Batas_minimal_stok || 5);
                        const processedItem = {
                            id: item.id,
                            name: item.Nama_produk || item.Nama_bahan_medis || item.Nama_bahan_infus || item.Nama_barang_apotek || 'Tanpa Nama',
                            stock,
                            minStock,
                            type
                        };
                        if (stock <= minStock) {
                            lowCount++;
                            allData.push(processedItem);
                        }
                    });
                    return res.data.length;
                }
                return 0;
            };

            const countMat = processData(resMat, 'Bahan Treatment');
            const countMed = processData(resMed, 'Bahan Medis');
            const countInf = processData(resInf, 'Bahan Infus');
            const countApo = processData(resApo, 'Barang Apotek');

            setStats({
                totalMaterials: countMat,
                totalMedicals: countMed,
                totalInfusions: countInf,
                totalApotekItems: countApo,
                lowStockCount: lowCount
            });

            setLowStockItems(allData.sort((a, b) => a.stock - b.stock).slice(0, 5));

        } catch (error) {
            console.error('[ApotekerDashboard] Error:', error);
            showToast('Gagal memuat statistik dashboard', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (selectedRequest) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedRequest]);

    const handleProcessRequest = (req) => {
        setSelectedRequest(req);
        setRacikanName(`Racikan - ${req.patientName}`);
        setRacikanPrice('');
        setRacikanStock('1');
    };

    const handleRequestClose = () => {
        setConfirmConfig({
            icon: 'warning',
            header: 'Tutup Form?',
            message: 'Apakah Anda yakin ingin menutup form ini? Data yang belum disimpan akan hilang.',
            acceptLabel: 'Ya, Tutup',
            rejectLabel: 'Tidak',
            onAccept: () => setSelectedRequest(null)
        });
    };

    const handleSaveRacikan = (e) => {
        e.preventDefault();
        
        const newErrors = {};
        if (!racikanName.trim()) newErrors.racikanName = 'Nama obat racikan wajib diisi';
        if (!racikanPrice || Number(racikanPrice) <= 0) newErrors.racikanPrice = 'Harga jual wajib diisi dan harus lebih dari 0';
        if (!racikanStock || Number(racikanStock) <= 0) newErrors.racikanStock = 'Jumlah stok wajib diisi dan harus lebih dari 0';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showToast('Mohon lengkapi semua field yang wajib diisi', 'error');
            setTimeout(() => {
                const firstErrorElement = formRef.current?.querySelector('.border-red-500');
                if (firstErrorElement) {
                    firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            return;
        }

        setErrors({});
        setIsSubmittingRacikan(true);
        // Simulasi submit/saving
        setTimeout(() => {
            completeAntreanRacikan(selectedRequest.id, {
                name: racikanName,
                price: Number(racikanPrice),
                stock: Number(racikanStock)
            });
            showToast(`Racikan "${racikanName}" berhasil dibuat dengan harga Rp ${Number(racikanPrice).toLocaleString('id-ID')}!`, 'success');
            setSelectedRequest(null);
            setIsSubmittingRacikan(false);
        }, 800);
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Dashboard Apoteker</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Status Apotek: <span className="text-emerald-600 font-black">Aktif</span>
                    </p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button 
                        onClick={fetchDashboardData}
                        className="flex-1 sm:flex-none p-4 rounded-2xl bg-white border border-primary/5 text-primary hover:bg-primary/5 transition-all shadow-sm group"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    </button>
                    <div className="flex-1 sm:flex-none px-6 py-4 bg-primary text-secondary rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
                        Apoteker On Duty
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                <StatsCard title="Bahan Medis" value={stats.totalMedicals} change="Total Jenis" trend="up" icon={Beaker} />
                <StatsCard title="Bahan Infus" value={stats.totalInfusions} change="Stok Terkini" trend="up" icon={Activity} />
                <StatsCard title="Barang Apotek" value={stats.totalApotekItems} change="Unit" trend="up" icon={Package} />
                <StatsCard 
                    title="Stok Kritis" 
                    value={stats.lowStockCount} 
                    change={stats.lowStockCount > 0 ? "Perlu Order" : "Aman"} 
                    trend={stats.lowStockCount > 0 ? "down" : "up"} 
                    icon={AlertTriangle} 
                />
            </div>

            {/* Antrean Resep Racikan Masuk */}
            <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 p-8 rounded-[3rem] border border-amber-200/60 shadow-xl shadow-amber-500/[0.02] mb-10">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-primary tracking-tight leading-none">Antrean Resep Racikan Masuk</h3>
                            <p className="text-[9px] font-bold text-amber-700 uppercase tracking-widest mt-1.5 leading-none">Butuh pembuatan & penetapan harga oleh Apoteker</p>
                            
                            {/* Visual Debugger helper */}
                            <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 w-fit">
                                <span className="text-[8px] font-black text-primary/40 uppercase tracking-wider">
                                    [DEBUG STORAGE]: Raw Browser LocalStorage = <span className="text-amber-600 font-extrabold">{localStorage.getItem('antrean_racikan') ? JSON.parse(localStorage.getItem('antrean_racikan')).length : 0}</span> items
                                </span>
                            </div>
                        </div>
                    </div>
                    <span className="px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest bg-amber-500 text-white rounded-full shadow-lg shadow-amber-500/25">
                        {antreanRacikan ? antreanRacikan.filter(req => req.status === 'Pending').length : 0} Antrean
                    </span>
                </div>

                {antreanRacikan && antreanRacikan.filter(req => req.status === 'Pending').length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {antreanRacikan.filter(req => req.status === 'Pending').map(req => (
                            <div key={req.id} className="bg-white p-6 rounded-card border border-primary/5 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-300 flex flex-col justify-between group">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-black text-primary text-sm tracking-tight">{req.patientName}</h4>
                                            <p className="text-[8px] font-bold text-primary/30 uppercase tracking-widest mt-0.5">{req.patientId}</p>
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-md">
                                            {req.date}
                                        </span>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[8px] font-black text-primary/30 uppercase tracking-widest mb-1.5">Resep Dokter ({req.dokterName})</p>
                                        <p className="text-xs text-primary/70 font-medium leading-relaxed italic">"{req.racikanText}"</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleProcessRequest(req)}
                                    className="w-full mt-5 py-3 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all duration-300 shadow-md group-hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Wand2 className="w-3.5 h-3.5" />
                                    Proses & Beri Harga
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-card border border-dashed border-amber-200/80 flex flex-col items-center justify-center text-center py-10 shadow-inner">
                        <ClipboardList className="w-12 h-12 text-amber-300 mb-3 animate-[pulse_2s_infinite]" />
                        <p className="font-black text-xs uppercase tracking-widest text-primary/60 mb-1 leading-none">Tidak Ada Antrean Resep</p>
                        <p className="text-primary/30 text-[10px] font-bold mt-1.5 leading-none">Semua antrean resep racikan telah selesai diproses oleh Apoteker.</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Low Stock Section */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-primary/15 shadow-2xl shadow-primary/[0.04] bg-white flex flex-col transition-all hover:border-primary/20">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-primary tracking-tight italic">Peringatan Stok Rendah</h3>
                            <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest mt-1">Item yang perlu segera di-restock</p>
                        </div>
                        <span className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full">Prioritas</span>
                    </div>

                    {isLoading ? (
                        <TableSkeleton rows={4} columns={3} />
                    ) : lowStockItems.length > 0 ? (
                        <div className="overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-primary/5 text-[10px] font-black uppercase tracking-widest text-primary/20">
                                        <th className="pb-4">Nama Item</th>
                                        <th className="pb-4">Jenis</th>
                                        <th className="pb-4 text-right">Stok Sisa</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5">
                                    {lowStockItems.map((item, idx) => (
                                        <tr key={idx} className="group hover:bg-red-50/30 transition-colors">
                                            <td className="py-4 font-bold text-sm text-primary">{item.name}</td>
                                            <td className="py-4 text-[10px] text-primary/40 font-black uppercase tracking-widest">{item.type}</td>
                                            <td className="py-4 text-right font-black text-sm text-red-500">{item.stock} <span className="text-[10px] text-red-300">Unit</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-20">
                            <Package className="w-16 h-16 mb-4" />
                            <p className="font-black text-xs uppercase tracking-widest text-center">Semua stok farmasi dalam kondisi aman</p>
                        </div>
                    )}
                </div>

                {/* Today's Pharmacy Activity / Appointments */}
                <div className="bg-white p-8 rounded-[3rem] border border-primary/15 shadow-2xl shadow-primary/[0.04] bg-white flex flex-col transition-all hover:border-primary/20">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-primary tracking-tight">Kebutuhan Treatment</h3>
                            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1 block tracking-tighter">Hari Ini</span>
                        </div>
                        <Calendar className="w-5 h-5 text-primary/20" />
                    </div>

                    <div className="space-y-4 flex-1">
                        {bookings.slice(0, 5).map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 hover:bg-emerald-50/50 rounded-2xl transition-all border border-transparent hover:border-emerald-100">
                                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary font-black text-xs">
                                    {item.time.split(':')[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-primary text-xs truncate">{item.treatment}</h4>
                                    <p className="text-[9px] text-primary/40 font-bold uppercase tracking-widest">Persiapan Bahan Medis</p>
                                </div>
                                <TrendingUp className="w-3 h-3 text-emerald-500 opacity-50" />
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-8 py-4 text-[10px] font-black text-primary uppercase tracking-widest border border-primary/10 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all active:scale-95">
                        Lihat Jadwal Distribusi
                    </button>
                </div>
            </div>

            {/* Modal Pemrosesan & Harga Racikan */}
            {selectedRequest && createPortal(
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/30 animate-fade-in" onClick={handleRequestClose}>
                    <div 
                        className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative p-8 pb-6 bg-amber-600 overflow-hidden text-white">
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #FFF 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                            </div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                                    <FlaskConical className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight leading-none">Beri Harga & Buat Racikan</h3>
                                    <p className="text-white/60 text-[9px] font-bold tracking-widest uppercase mt-2">FORMULIR STOK RACIKAN BARU</p>
                                </div>
                            </div>
                        </div>

                        {/* Close button */}
                        <button
                            type="button"
                            onClick={handleRequestClose}
                            className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/20 text-white hover:bg-white/40 hover:scale-105 active:scale-95 transition-all z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <form ref={formRef} noValidate onSubmit={handleSaveRacikan} className="p-8 space-y-6 overflow-y-auto scrollbar-hide flex-1">
                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800 text-xs leading-relaxed space-y-1">
                                <p className="font-bold uppercase tracking-wider text-[8px] text-amber-600">RESEP DOKTER ({selectedRequest.dokterName}):</p>
                                <p className="font-semibold italic">"{selectedRequest.racikanText}"</p>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1 block mb-2">Nama Obat Racikan</label>
                                <input
                                    type="text"
                                    value={racikanName}
                                    onChange={(e) => { setRacikanName(e.target.value); if (errors.racikanName) setErrors({...errors, racikanName: null}); }}
                                    placeholder="Contoh: Racikan Cream Budi"
                                    className={`w-full px-4 py-3.5 rounded-2xl bg-gray-50 border outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm ${
                                        errors.racikanName 
                                            ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500' 
                                            : 'border-primary/5 focus:ring-amber-500/10 focus:border-amber-500'
                                    }`}
                                />
                                {errors.racikanName && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors.racikanName}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1 block mb-2">Harga Jual (Rp)</label>
                                    <input
                                        type="number"
                                        value={racikanPrice}
                                        onChange={(e) => { setRacikanPrice(e.target.value); if (errors.racikanPrice) setErrors({...errors, racikanPrice: null}); }}
                                        placeholder="85000"
                                        className={`w-full px-4 py-3.5 rounded-2xl bg-gray-50 border outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm ${
                                            errors.racikanPrice 
                                                ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500' 
                                                : 'border-primary/5 focus:ring-amber-500/10 focus:border-amber-500'
                                        }`}
                                    />
                                    {errors.racikanPrice && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors.racikanPrice}</p>}
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1 block mb-2">Jumlah Stok</label>
                                    <input
                                        type="number"
                                        value={racikanStock}
                                        onChange={(e) => { setRacikanStock(e.target.value); if (errors.racikanStock) setErrors({...errors, racikanStock: null}); }}
                                        placeholder="1"
                                        className={`w-full px-4 py-3.5 rounded-2xl bg-gray-50 border outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm ${
                                            errors.racikanStock 
                                                ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500' 
                                                : 'border-primary/5 focus:ring-amber-500/10 focus:border-amber-500'
                                        }`}
                                    />
                                    {errors.racikanStock && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors.racikanStock}</p>}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmittingRacikan}
                                className="w-full py-4 bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-700 active:scale-95 transition-all duration-300 shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CheckCircle className="w-4 h-4" />
                                {isSubmittingRacikan ? 'Memproses...' : 'Selesaikan & Simpan ke Stok'}
                            </button>
                        </form>
                    </div>
                </div>
            , document.body)}

            <ConfirmModal
                config={confirmConfig}
                onClose={() => setConfirmConfig(null)}
            />
        </div>
    );
};

export default ApotekerDashboard;
