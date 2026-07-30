import React from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon as X, TagIcon as Tag, CheckCircleIcon as CheckCircle2, CalendarIcon as Calendar, DocumentTextIcon as FileText, ShoppingBagIcon as ShoppingBag, GiftIcon as Gift } from '@heroicons/react/24/outline';

const PromoDetailModal = ({ isOpen, promo, onClose }) => {
    if (!isOpen || !promo) return null;

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Aktif': return 'bg-green-100 text-green-600 border-green-200';
            case 'Draf': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
            case 'Berakhir': return 'bg-red-100 text-red-600 border-red-200';
            default: return 'bg-gray-100 text-gray-500 border-gray-200';
        }
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 transition-all"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/40 hover:scale-105 active:scale-95 transition-all z-[60] shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header Modal */}
                <div className="relative p-8 pb-6 bg-primary overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10 z-0">
                        <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>

                    <div className="relative z-10 flex items-center gap-4 pr-12">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-secondary backdrop-blur-sm border border-white/10 shrink-0">
                            <Tag className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                                Detail Promo
                            </h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                Informasi lengkap data diskon
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Body / Detail Info */}
                <div className="p-8 max-h-[70vh] overflow-y-auto bg-secondary/5 space-y-6">
                    {/* Basic Info */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-primary/5 shadow-sm">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-black text-blue-600 text-[10px] uppercase tracking-[0.2em] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                    {promo.code || (promo.isVoucher ? 'VOUCHER FISIK' : 'TIDAK ADA KODE')}
                                </span>
                                <span className={`font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-md border ${getStatusStyle(promo.status)}`}>
                                    {promo.status}
                                </span>
                            </div>
                            <h4 className="text-xl font-black text-primary tracking-tight">{promo.name}</h4>
                            <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mt-1">
                                Kategori: {promo.category || 'Semua'}
                            </p>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Nilai Diskon</p>
                            <p className="text-2xl font-black text-primary">
                                {promo.promoMode === 'specific_item' ? 'Bervariasi' :
                                 promo.promoMode === 'bundle' ? 'Paket/Bundle' :
                                 (promo.type === 'Persen' ? `${promo.value}%` : `Rp ${Number(promo.value).toLocaleString('id-ID')}`)}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-3xl border border-primary/5 shadow-sm flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Masa Berlaku</p>
                                <p className="text-sm font-bold text-primary mt-1">{promo.startDate} <span className="text-primary/40">s/d</span> {promo.endDate}</p>
                            </div>
                        </div>
                        
                        <div className="bg-white p-5 rounded-3xl border border-primary/5 shadow-sm flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div className="w-full">
                                <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Kuota & Penggunaan</p>
                                <div className="mt-2 mb-1 w-full bg-primary/5 rounded-full h-1.5">
                                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (promo.used / (promo.quota || 1)) * 100)}%` }}></div>
                                </div>
                                <p className="text-sm font-bold text-primary">
                                    Terpakai: {promo.used} <span className="text-primary/40">dari</span> {promo.quota || 'Tidak Terbatas'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Performance Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-3xl border border-primary/5 shadow-sm flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Total Omset</p>
                                <p className="text-xl font-black text-indigo-600 mt-1">Rp {(promo.totalOmset || 0).toLocaleString('id-ID')}</p>
                                <p className="text-[9px] font-bold text-primary/40 mt-1">Pendapatan bersih dari promo ini</p>
                            </div>
                        </div>
                        
                        <div className="bg-white p-5 rounded-3xl border border-primary/5 shadow-sm flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                                <Gift className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Total Diskon (Spent)</p>
                                <p className="text-xl font-black text-orange-600 mt-1">Rp {(promo.totalDiskon || 0).toLocaleString('id-ID')}</p>
                                <p className="text-[9px] font-bold text-primary/40 mt-1">Total diskon yang telah diberikan</p>
                            </div>
                        </div>
                    </div>

                    {/* Target / Mode Info */}
                    <div className="bg-white p-6 rounded-3xl border border-primary/5 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                                <ShoppingBag className="w-4 h-4" />
                            </div>
                            <h5 className="text-sm font-black text-primary uppercase tracking-widest">Aturan Promo</h5>
                        </div>
                        
                        <div className="pl-11 space-y-3 text-sm text-primary/80">
                            <div className="grid grid-cols-3 gap-2 border-b border-primary/5 pb-2">
                                <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Mode Promo</span>
                                <span className="col-span-2 font-bold">
                                    {promo.promoMode === 'basic' ? 'Basic (Global/Item)' :
                                     promo.promoMode === 'min_order' ? 'Minimum Belanja' :
                                     promo.promoMode === 'bundle' ? 'Tebus Murah / Bundle' :
                                     promo.promoMode === 'specific_item' ? 'Diskon Spesifik Tiap Item' : promo.promoMode}
                                </span>
                            </div>
                            
                            {promo.promoMode === 'min_order' && (
                                <div className="grid grid-cols-3 gap-2 border-b border-primary/5 pb-2">
                                    <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Min. Belanja</span>
                                    <span className="col-span-2 font-bold text-green-600">Rp {Number(promo.minOrderAmount).toLocaleString('id-ID')}</span>
                                </div>
                            )}

                            {promo.promoMode === 'bundle' ? (
                                <>
                                    <div className="grid grid-cols-3 gap-2 border-b border-primary/5 pb-2">
                                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Syarat Beli</span>
                                        <span className="col-span-2 font-bold">{promo.bundleConfig?.buyItems?.join(', ') || '-'}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 border-b border-primary/5 pb-2">
                                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Benefit/Dapat</span>
                                        <span className="col-span-2 font-bold text-green-600">{promo.bundleConfig?.getItems?.join(', ') || '-'}</span>
                                    </div>
                                </>
                            ) : promo.promoMode === 'specific_item' ? (
                                <div className="grid grid-cols-3 gap-2 border-b border-primary/5 pb-2">
                                    <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest mt-1">Item Spesifik</span>
                                    <div className="col-span-2 space-y-2">
                                        {promo.itemDiscounts?.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-secondary/10 p-2 rounded-lg border border-primary/5">
                                                <span className="font-bold text-xs">{item.id}</span>
                                                <span className="font-black text-green-600 text-xs">Rp {Number(item.discountValue).toLocaleString('id-ID')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2 border-b border-primary/5 pb-2">
                                    <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest mt-1">Target Item</span>
                                    <div className="col-span-2 flex flex-wrap gap-1.5">
                                        {promo.targetItems && promo.targetItems.length > 0 ? (
                                            promo.targetItems.map(item => (
                                                <span key={item} className="px-2.5 py-1 bg-secondary/20 border border-primary/5 rounded-md text-[10px] font-bold text-primary shadow-sm">
                                                    {item}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[10px] font-bold text-primary/40 italic mt-1">Berlaku untuk semua item</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PromoDetailModal;
