import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { WalletIcon as Wallet, ShoppingCartIcon as ShoppingCart, IdentificationIcon as Fingerprint, BriefcaseIcon as Briefcase, ArrowTrendingUpIcon as TrendingUp, ArrowRightIcon as ArrowRight, CurrencyDollarIcon as DollarSign, CreditCardIcon as CreditCard, PlusCircleIcon as PlusCircle, ClipboardDocumentListIcon as ClipboardList, CheckCircleIcon as CheckCircle, XMarkIcon as X, ExclamationCircleIcon as AlertCircle, PhoneIcon as Phone, EnvelopeIcon as Mail, UserIcon as User, CircleStackIcon as Coins } from '@heroicons/react/24/outline';
import StatsCard from './StatsCard';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { distributorAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const LeadFinanceDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [distributors, setDistributors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDistributor, setSelectedDistributor] = useState(null);
    const [depositAmount, setDepositAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [depositError, setDepositError] = useState('');

    const fetchDistributors = async () => {
        setIsLoading(true);
        if (user?.token) {
            const res = await distributorAPI.getAll(user.token);
            if (res.success) {
                setDistributors(res.data.data || res.data || []);
            } else {
                showToast(res.message || 'Gagal memuat data distributor', 'error');
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (user?.token) {
            fetchDistributors();
        }
    }, [user?.token]);

    const handleOpenDeposit = (dist) => {
        setSelectedDistributor(dist);
        setDepositAmount('');
        setDepositError('');
    };

    const handleSaveDeposit = async (e) => {
        e.preventDefault();
        if (!depositAmount || Number(depositAmount) <= 0) {
            setDepositError('Nominal deposit harus lebih besar dari 0');
            return;
        }

        setIsSubmitting(true);
        const res = await distributorAPI.addDeposit(user?.token, selectedDistributor.id, Number(depositAmount));
        if (res.success) {
            showToast(`Deposit Rp ${Number(depositAmount).toLocaleString('id-ID')} berhasil ditambahkan untuk ${selectedDistributor.Nama_Distributor}!`, 'success');
            setSelectedDistributor(null);
            fetchDistributors();
        } else {
            showToast(res.message || 'Gagal menambahkan deposit', 'error');
        }
        setIsSubmitting(false);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value || 0);
    };

    const quickLinks = [
        {
            icon: Fingerprint,
            label: 'Absensi',
            description: 'Kelola kehadiran karyawan',
            path: '/attendance',
            color: 'bg-violet-500',
            shadow: 'shadow-violet-500/20',
        },
        {
            icon: ShoppingCart,
            label: 'Transaksi',
            description: 'Pantau data transaksi',
            path: '/sales',
            color: 'bg-emerald-500',
            shadow: 'shadow-emerald-500/20',
        },
        {
            icon: Briefcase,
            label: 'Distributor',
            description: 'Kelola deposit distributor',
            path: '/distributors',
            color: 'bg-blue-500',
            shadow: 'shadow-blue-500/20',
        },
    ];

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Finance Dashboard</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Lead Finance — <span className="text-primary/70">{user?.name}</span>
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <StatsCard
                    title="Total Transaksi"
                    value="Rp 128.4M"
                    change="+8.2%"
                    trend="up"
                    icon={TrendingUp}
                />
                <StatsCard
                    title="Deposit Masuk"
                    value="Rp 42.1M"
                    change="Bulan Ini"
                    trend="up"
                    icon={Wallet}
                />
                <StatsCard
                    title="Kehadiran Hari Ini"
                    value="96%"
                    change="+1%"
                    trend="up"
                    icon={Fingerprint}
                />
            </div>

            {/* Antrean Deposit Distributor Baru */}
            <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-8 rounded-[3rem] border border-blue-200/60 shadow-xl shadow-blue-500/[0.02]">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-primary tracking-tight leading-none">Antrean Deposit Distributor Baru</h3>
                            <p className="text-[9px] font-bold text-blue-700 uppercase tracking-widest mt-1.5 leading-none">Mitra baru terdaftar yang belum melakukan deposit awal</p>
                        </div>
                    </div>
                    <span className="px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/25">
                        {distributors ? distributors.filter(d => Number(d.Sisa_Deposit || 0) === 0).length : 0} Antrean
                    </span>
                </div>

                {isLoading ? (
                    <div className="py-12 text-center text-primary/30 font-bold text-xs uppercase tracking-widest animate-pulse">
                        Memuat data distributor...
                    </div>
                ) : distributors && distributors.filter(d => Number(d.Sisa_Deposit || 0) === 0).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {distributors.filter(d => Number(d.Sisa_Deposit || 0) === 0).map(d => (
                            <div key={d.id} className="bg-white p-6 rounded-card border border-primary/5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-primary text-sm tracking-tight">{d.Nama_Distributor}</h4>
                                                <p className="text-[8px] font-bold text-primary/30 uppercase tracking-widest mt-0.5">Mitra Distributor</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                                        {d.No_Telp && (
                                            <div className="flex items-center gap-2 text-[10px] text-primary/60 font-semibold">
                                                <Phone className="w-3.5 h-3.5 text-primary/30" />
                                                <span>{d.No_Telp}</span>
                                            </div>
                                        )}
                                        {d.Email && (
                                            <div className="flex items-center gap-2 text-[10px] text-primary/60 font-semibold truncate">
                                                <Mail className="w-3.5 h-3.5 text-primary/30" />
                                                <span className="truncate">{d.Email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleOpenDeposit(d)}
                                    className="w-full mt-5 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all duration-300 shadow-md group-hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                    Beri Deposit Awal
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-card border border-dashed border-blue-200/80 flex flex-col items-center justify-center text-center py-10 shadow-inner">
                        <ClipboardList className="w-12 h-12 text-blue-300 mb-3 animate-[pulse_2s_infinite]" />
                        <p className="font-black text-xs uppercase tracking-widest text-primary/60 mb-1 leading-none">Tidak Ada Antrean</p>
                        <p className="text-primary/30 text-[10px] font-bold mt-1.5 leading-none">Semua distributor baru terdaftar telah memiliki deposit.</p>
                    </div>
                )}
            </div>

            {/* Quick Deposit Modal */}
            {selectedDistributor && createPortal(
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/30 animate-fade-in" onClick={() => setSelectedDistributor(null)}>
                    <div 
                        className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative p-8 pb-6 bg-blue-600 overflow-hidden text-white">
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #FFF 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                            </div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                                    <Coins className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight leading-none">Beri Deposit Awal</h3>
                                    <p className="text-white/60 text-[9px] font-bold tracking-widest uppercase mt-2">PENGISIAN SALDO MITRA BARU</p>
                                </div>
                            </div>
                        </div>

                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setSelectedDistributor(null)}
                            className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/20 text-white hover:bg-white/40 hover:scale-105 active:scale-95 transition-all z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <form onSubmit={handleSaveDeposit} className="p-8 space-y-6 overflow-y-auto scrollbar-hide flex-1">
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-blue-800 text-xs leading-relaxed space-y-1">
                                <p className="font-bold uppercase tracking-wider text-[8px] text-blue-600">MITRA DISTRIBUTOR:</p>
                                <p className="font-black text-sm text-primary">{selectedDistributor.Nama_Distributor}</p>
                                <p className="text-[10px] text-primary/60 font-semibold">{selectedDistributor.Email || selectedDistributor.No_Telp}</p>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1 block mb-2">Nominal Deposit Masuk (Rp)</label>
                                <input
                                    type="number"
                                    value={depositAmount}
                                    onChange={(e) => {
                                        setDepositAmount(e.target.value);
                                        setDepositError('');
                                    }}
                                    placeholder="Masukkan nominal deposit awal, contoh: 5000000"
                                    className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-primary/5 outline-none text-primary font-bold text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                                    required
                                    min="1"
                                />
                                {depositError && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1">{depositError}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all duration-300 shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CheckCircle className="w-4 h-4" />
                                {isSubmitting ? 'Memproses...' : 'Tambahkan Deposit Awal'}
                            </button>
                        </form>
                    </div>
                </div>
            , document.body)}

            {/* Quick Access */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Links */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {quickLinks.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="group relative bg-white p-7 rounded-card border border-primary/10 shadow-xl shadow-primary/[0.04] hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20 hover:-translate-y-1 transition-all duration-500 flex flex-col items-start gap-4 text-left"
                        >
                            <div className={`w-12 h-12 rounded-2xl ${item.color} ${item.shadow} shadow-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-base font-black text-primary tracking-tight">{item.label}</h4>
                                <p className="text-[11px] text-primary/40 font-bold mt-1">{item.description}</p>
                            </div>
                            <ArrowRight className="absolute bottom-6 right-6 w-4 h-4 text-primary/20 group-hover:text-primary/60 group-hover:translate-x-1 transition-all duration-300" />
                        </button>
                    ))}
                </div>

                {/* Finance Summary Card */}
                <div className="bg-primary p-8 rounded-card elevation-3 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-10 z-0">
                        <div className="absolute top-0 left-0 w-full h-full" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <DollarSign className="w-5 h-5 text-secondary" />
                            <h4 className="text-secondary text-sm font-black uppercase tracking-widest">Ringkasan Keuangan</h4>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] font-black text-secondary/50 uppercase tracking-widest">Target Transaksi</span>
                                    <span className="text-sm font-black text-secondary tracking-tighter">78%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-secondary rounded-full shadow-[0_0_15px_rgba(229,213,176,0.5)]" style={{ width: '78%' }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] font-black text-secondary/50 uppercase tracking-widest">Deposit Terserap</span>
                                    <span className="text-sm font-black text-secondary tracking-tighter">61%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent-gold rounded-full" style={{ width: '61%' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/distributors')}
                        className="relative z-10 mt-8 w-full py-4 bg-secondary text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                    >
                        <CreditCard className="w-4 h-4" />
                        Kelola Deposit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeadFinanceDashboard;
