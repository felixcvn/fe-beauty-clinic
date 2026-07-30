import React from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon as X, UserIcon as User, CalendarIcon as Calendar, MapPinIcon as MapPin, ReceiptRefundIcon as Receipt, CubeIcon as Package, ClipboardDocumentListIcon as ClipboardList, ClockIcon as Clock } from '@heroicons/react/24/outline';

const ReportDetailModal = ({ isOpen, onClose, reportData }) => {
    if (!isOpen || !reportData) return null;

    const { 
        No_Faktur, 
        Nama_Customer, 
        No_RM, 
        Alamat_Pengiriman, 
        Tanggal_Transaksi, 
        Nama_Kasir_atau_MOS, 
        Catatan_Pesanan, 
        details, 
        Total_Harga_Keseluruhan 
    } = reportData;

    return createPortal(
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 transition-opacity animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Floating Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all z-[60] shadow-sm border border-white/10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header Section */}
                <div className="relative p-8 bg-primary overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10 z-0">
                        <div className="absolute top-0 left-0 w-full h-full" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>

                    <div className="relative z-10 flex items-center gap-5 pr-12">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-sm border border-white/10 shadow-inner">
                            <Receipt className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tighter leading-none italic">Laporan Penjualan</h3>
                            <div className="flex items-center gap-3 mt-3">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{No_Faktur}</span>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border bg-green-100/20 text-white border-green-200/50">
                                    Selesai
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide bg-gray-50/30">
                    {/* Customer & Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Konsumen Info */}
                        <div className="p-6 rounded-3xl bg-white border border-primary/5 space-y-4 shadow-sm group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-2 mb-2 text-primary/30 uppercase tracking-[0.2em] font-black text-[9px]">
                                <User className="w-3 h-3 text-primary/40" /> Info Konsumen
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-sm font-black text-primary border border-primary/5 group-hover:scale-110 transition-transform">
                                    {Nama_Customer ? Nama_Customer.split(' ').map(n => n[0]).join('').substring(0,2) : 'UM'}
                                </div>
                                <div>
                                    <p className="text-base font-black text-primary leading-tight">{Nama_Customer || 'Umum'}</p>
                                    {No_RM && (
                                        <p className="text-[10px] font-bold text-primary/40 uppercase mt-1 tracking-wider">No RM: {No_RM}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Waktu & Kasir Info */}
                        <div className="p-6 rounded-3xl bg-white border border-primary/5 space-y-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2 text-primary/30 uppercase tracking-[0.2em] font-black text-[9px]">
                                <Calendar className="w-3 h-3 text-primary/40" /> Info Transaksi
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-primary/30 uppercase tracking-widest">Tanggal</span>
                                    <span className="text-primary font-black tracking-tight bg-secondary/30 px-3 py-1 rounded-lg text-sm">{Tanggal_Transaksi}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-primary/30 uppercase tracking-widest">Kasir / MOS</span>
                                    <span className="text-primary font-black tracking-tight bg-secondary/30 px-3 py-1 rounded-lg text-sm truncate max-w-[120px]">
                                        {Nama_Kasir_atau_MOS || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Alamat Info */}
                        {Alamat_Pengiriman && (
                            <div className="p-6 rounded-3xl bg-white border border-primary/5 space-y-4 shadow-sm md:col-span-2">
                                <div className="flex items-center gap-2 mb-2 text-primary/30 uppercase tracking-[0.2em] font-black text-[9px]">
                                    <MapPin className="w-3 h-3 text-primary/40" /> Alamat Pengiriman
                                </div>
                                <p className="text-sm font-bold text-primary/80">{Alamat_Pengiriman}</p>
                            </div>
                        )}

                        {/* Catatan Info */}
                        {Catatan_Pesanan && (
                            <div className="p-6 rounded-3xl bg-white border border-primary/5 space-y-4 shadow-sm md:col-span-2">
                                <div className="flex items-center gap-2 mb-2 text-primary/30 uppercase tracking-[0.2em] font-black text-[9px]">
                                    <ClipboardList className="w-3 h-3 text-primary/40" /> Catatan Pesanan
                                </div>
                                <p className="text-sm font-bold text-primary/80">{Catatan_Pesanan}</p>
                            </div>
                        )}
                    </div>

                    {/* Items Table */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary/30 uppercase tracking-[0.2em] font-black text-[9px]">
                            <Package className="w-3 h-3 text-primary/40" /> Rincian Item
                        </div>
                        <div className="rounded-card border border-primary/5 overflow-hidden shadow-sm bg-white">
                            <table className="w-full text-left">
                                <thead className="bg-secondary/10 text-[8px] font-black uppercase tracking-[0.2em] text-primary/40 border-b border-primary/5">
                                    <tr>
                                        <th className="px-8 py-5">Nama Produk</th>
                                        <th className="px-8 py-5 text-center">Qty</th>
                                        <th className="px-8 py-5 text-right">Harga</th>
                                        <th className="px-8 py-5 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5 font-bold">
                                    {details && details.length > 0 ? details.map((item, idx) => (
                                        <tr key={idx} className="text-xs text-primary group hover:bg-secondary/10 transition-colors">
                                            <td className="px-8 py-5 font-black uppercase tracking-tight">{item.Nama_Produk}</td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="inline-block px-3 py-1 rounded-lg bg-primary/5 text-primary/80 font-black text-sm">{item.Qty}x</span>
                                            </td>
                                            <td className="px-8 py-5 text-right text-sm">Rp {Number(item.Harga).toLocaleString('id-ID')}</td>
                                            <td className="px-8 py-5 text-right font-black italic text-sm">Rp {Number(item.Total_Harga).toLocaleString('id-ID')}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-5 text-center text-primary/40 italic">Tidak ada detail item</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-primary p-9 rounded-[2.5rem] text-secondary shadow-2xl shadow-primary/30 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000 scale-150">
                            <Receipt className="w-24 h-24" />
                        </div>
                        <div className="relative z-10 space-y-5">
                             <div className="flex justify-between items-center">
                                <div className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">Total Tagihan</div>
                                <div className="text-3xl font-black tracking-tighter italic text-secondary-light">
                                    Rp {Number(Total_Harga_Keseluruhan || 0).toLocaleString('id-ID')}
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-8 bg-white border-t border-primary/5 flex justify-end gap-4 shrink-0">
                    <button 
                        onClick={onClose}
                        className="px-8 py-4 rounded-2xl bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/10 transition-all active:scale-95"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ReportDetailModal;
