import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Tag } from 'lucide-react';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rbac';
import { stokProdukAPI, treatmentAPI, paketTreatmentAPI } from '../../services/api';
import { Search } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

const getTodayString = () => {
    const d = new Date();
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
};

const PromoFormModal = ({ isOpen, onClose, onSave, initialData, defaultCategory }) => {
    const { user } = useAuth();
    const [confirmConfig, setConfirmConfig] = useState(null);
    const [apiProducts, setApiProducts] = useState([]);
    const [apiTreatments, setApiTreatments] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    
    const isSupervisorTreatment = user?.role === ROLES.SUPERVISOR_TREATMENT;
    const isSupervisorProduk = user?.role === ROLES.SUPERVISOR_PRODUK;
    const todayStr = getTodayString();

    useEffect(() => {
        const loadData = async () => {
            if (!user?.token) return;
            setIsLoadingData(true);
            try {
                const [resProducts, resTreatments, resPakets] = await Promise.all([
                    stokProdukAPI.getAll(user.token),
                    treatmentAPI.getAll(user.token),
                    paketTreatmentAPI.getAll(user.token)
                ]);

                if (resProducts.success && resProducts.data) {
                    const responseData = resProducts.data.data || resProducts.data;
                    const productArray = Array.isArray(responseData) ? responseData : (responseData.data || []);
                    setApiProducts(productArray.map(p => ({
                        id: p.id ? `PRD-${p.id}` : String(p.Kode_Produk || ''),
                        name: p.Nama_produk || p.Nama_Produk || p.nama_produk || p.name || 'Tanpa Nama',
                        price: Number(p.Harga || p.harga || p.price || 0)
                    })));
                }

                let treatmentsList = [];
                if (resTreatments.success && resTreatments.data) {
                    const responseData = resTreatments.data.data || resTreatments.data;
                    const treatmentArray = Array.isArray(responseData) ? responseData : (responseData.data || []);
                    treatmentsList = [...treatmentsList, ...treatmentArray.map(t => ({
                        id: t.id ? `TRT-${t.id}` : String(t.kode_treatment || ''),
                        name: t.Nama_treatment || t.Nama_Treatment || t.nama_treatment || t.name || 'Treatment Tanpa Nama',
                        price: Number(t.Harga || t.harga || t.price || 0)
                    }))];
                }

                if (resPakets && resPakets.success && resPakets.data) {
                    const responseData = resPakets.data.data || resPakets.data;
                    const paketArray = Array.isArray(responseData) ? responseData : (responseData.data || []);
                    treatmentsList = [...treatmentsList, ...paketArray.map(p => ({
                        id: p.id ? `PTR-${p.id}` : String(p.Kode_paket || ''),
                        name: p.Nama_paket || p.name || 'Paket Tanpa Nama',
                        price: Number(p.Harga_paket || p.harga || p.price || 0)
                    }))];
                }
                setApiTreatments(treatmentsList);
            } catch (error) {
                console.error('[PromoFormModal] Error loading real data:', error);
            } finally {
                setIsLoadingData(false);
            }
        };

        if (isOpen) {
            loadData();
        }
    }, [isOpen, user]);

    const [formState, setFormState] = useState({
        name: '',
        code: '',
        type: 'Persen',
        value: '',
        quota: '',
        startDate: '',
        endDate: '',
        category: 'Treatment',
        promoMode: 'basic',
        minOrderAmount: '',
        bundleConfig: { buyItems: [], getItems: [] },
        itemDiscounts: [],
        targetItems: [],
        isVoucher: false,
        voucherCount: ''
    });

    const [itemSearch, setItemSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormState({
                    ...initialData,
                    targetItems: initialData.targetItems || []
                });
            } else {
                setFormState({
                    name: '',
                    code: '',
                    type: 'Persen',
                    value: '',
                    quota: '',
                    startDate: '',
                    endDate: '',
                    category: defaultCategory || (isSupervisorTreatment ? 'Treatment' : (isSupervisorProduk ? 'Produk' : 'Treatment')),
                    promoMode: 'basic',
                    minOrderAmount: '',
                    bundleConfig: { buyItems: [], getItems: [] },
                    itemDiscounts: [],
                    targetItems: [],
                    isVoucher: false,
                    voucherCount: ''
                });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formState);
    };

    const handleRequestClose = () => {
        setConfirmConfig({
            icon: 'warning',
            header: 'Tutup Form?',
            message: 'Apakah Anda yakin ingin menutup form ini? Data yang belum disimpan akan hilang.',
            acceptLabel: 'Ya, Tutup',
            rejectLabel: 'Tidak',
            onAccept: onClose
        });
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30"
            onClick={handleRequestClose} // Klik background gelap untuk tutup
        >
            <div 
                className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal ikut menutup modal
            >
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRequestClose();
                    }}
                    className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/40 hover:scale-105 active:scale-95 transition-all z-[60] shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header Modal */}
                <div className="relative p-8 pb-6 bg-primary overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10 z-0">
                        <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>

                    <div className="relative z-10 flex items-center gap-4 pr-12"> {/* pr-12 agar teks tidak menabrak tombol X */}
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-secondary backdrop-blur-sm border border-white/10 shrink-0">
                            <Tag className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                                {initialData ? 'Edit Promo' : 'Buat Promo Baru'}
                            </h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                Formulir Pengaturan Data Diskon
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Body / Form */}
                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Nama Promo</label>
                            <input 
                                required 
                                type="text" 
                                placeholder="Contoh: Diskon Ramadhan" 
                                value={formState.name}
                                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" 
                            />
                        </div>


                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Kategori Promo</label>
                            <CustomSelect 
                                value={formState.category}
                                onChange={(val) => setFormState({ ...formState, category: val })}
                                options={[
                                    { value: 'Produk', label: 'Produk' },
                                    { value: 'Treatment', label: 'Treatment' },
                                    { value: 'Kombinasi', label: 'Kombinasi (Produk & Treatment)' }
                                ]}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Mode Promo</label>
                            <CustomSelect 
                                value={formState.promoMode}
                                onChange={(val) => setFormState({ ...formState, promoMode: val, category: val === 'bundle' ? 'Kombinasi' : formState.category })}
                                options={[
                                    { value: 'basic', label: 'Basic (Diskon Global/Item)' },
                                    { value: 'min_order', label: 'Minimum Belanja' },
                                    { value: 'bundle', label: 'Tebus Murah / Bundle' },
                                    { value: 'specific_item', label: 'Diskon Spesifik Tiap Item' }
                                ]}
                            />
                        </div>

                        {formState.promoMode === 'min_order' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Minimal Belanja (Rp)</label>
                                <input 
                                    required 
                                    type="number" 
                                    placeholder="Contoh: 500000" 
                                    value={formState.minOrderAmount}
                                    onChange={(e) => setFormState({ ...formState, minOrderAmount: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" 
                                />
                            </div>
                        )}

                        <div className="space-y-4 border border-primary/10 rounded-2xl p-4 bg-secondary/5">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input 
                                        type="checkbox" 
                                        className="peer sr-only"
                                        checked={formState.isVoucher}
                                        onChange={(e) => setFormState({ ...formState, isVoucher: e.target.checked })}
                                    />
                                    <div className="w-5 h-5 border-2 border-primary/20 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-secondary opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-primary/70 group-hover:text-primary transition-colors">Jadikan Voucher Fisik (Generate Kode Acak)</span>
                            </label>

                            <div className="grid grid-cols-2 gap-4">
                                {!formState.isVoucher ? (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Kode Promo</label>
                                        <input 
                                            required 
                                            type="text" 
                                            placeholder="RAMADHAN50" 
                                            value={formState.code}
                                            onChange={(e) => setFormState({ ...formState, code: e.target.value.toUpperCase() })}
                                            className="w-full px-5 py-4 rounded-2xl bg-white border border-primary/5 outline-none text-primary font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all uppercase shadow-sm" 
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Jumlah Voucher</label>
                                        <input 
                                            required 
                                            type="number" 
                                            placeholder="Contoh: 10" 
                                            value={formState.voucherCount}
                                            onChange={(e) => setFormState({ ...formState, voucherCount: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl bg-white border border-primary/5 outline-none text-primary font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" 
                                        />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">{formState.isVoucher ? "Batas Pemakaian per Voucher" : "Batas Kuota Penggunaan"}</label>
                                    <input 
                                        required 
                                        type="number" 
                                        placeholder="Contoh: 1" 
                                        value={formState.quota}
                                        onChange={(e) => setFormState({ ...formState, quota: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl bg-white border border-primary/5 outline-none text-primary font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" 
                                    />
                                </div>
                            </div>
                        </div>

                        {['basic', 'min_order'].includes(formState.promoMode) && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Tipe Diskon</label>
                                    <CustomSelect 
                                        value={formState.type}
                                        onChange={(val) => setFormState({ ...formState, type: val })}
                                        options={[
                                            { value: 'Persen', label: 'Persentase (%)' },
                                            { value: 'Nominal', label: 'Nominal (Rp)' }
                                        ]}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Nilai Diskon</label>
                                    <input 
                                        required 
                                        type="number" 
                                        placeholder={formState.type === 'Persen' ? 'Contoh: 50' : 'Contoh: 50000'}
                                        value={formState.value}
                                        onChange={(e) => setFormState({ ...formState, value: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-medium text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" 
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <CustomDatePicker
                                label="Mulai Berlaku"
                                value={formState.startDate}
                                onChange={(val) => setFormState({ ...formState, startDate: val })}
                                className="w-full"
                                minDate={todayStr}
                            />
                            <CustomDatePicker
                                label="Berakhir"
                                value={formState.endDate}
                                onChange={(val) => setFormState({ ...formState, endDate: val })}
                                className="w-full"
                                minDate={formState.startDate || todayStr}
                            />
                        </div>

                        {/* Item Selection Section (only for non-bundle) */}
                        {formState.promoMode !== 'bundle' && (
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">
                                    Pilih {formState.category === 'Treatment' ? 'Treatment' : 'Produk'} yang mendapatkan Promo
                                </label>
                                <div className="relative group mb-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/30" />
                                    <input 
                                        type="text"
                                        placeholder={`Cari ${formState.category.toLowerCase()}...`}
                                        value={itemSearch}
                                        onChange={(e) => setItemSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary/10 border border-primary/5 outline-none text-xs text-primary font-bold placeholder:text-primary/20 focus:ring-2 focus:ring-primary/5 transition-all"
                                    />
                                </div>
                                <div className="max-h-48 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                                    {isLoadingData ? (
                                        <div className="text-center p-4 text-[10px] text-primary/40 font-bold uppercase tracking-widest animate-pulse">Memuat data dari database...</div>
                                    ) : (
                                    (formState.category === 'Treatment' ? apiTreatments : apiProducts)
                                        .filter(item => item.name.toLowerCase().includes(itemSearch.toLowerCase()))
                                        .map(item => {
                                            const isChecked = formState.targetItems.includes(item.id);
                                            return (
                                            <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${isChecked ? 'bg-primary/5 border-primary/20' : 'hover:bg-primary/[0.02] border-transparent hover:border-primary/5'}`}>
                                                <input 
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        const newTargets = e.target.checked 
                                                            ? [...formState.targetItems, item.id]
                                                            : formState.targetItems.filter(t => t !== item.id);
                                                        setFormState({ ...formState, targetItems: newTargets });
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-black text-primary truncate tracking-tight">{item.name}</p>
                                                    <p className="text-[8px] font-bold text-primary/30 uppercase tracking-widest">{item.id}</p>
                                                </div>
                                                <span className="text-[10px] font-bold text-primary/60">Rp {item.price.toLocaleString('id-ID')}</span>
                                            </div>
                                            )
                                        })
                                    )}
                                </div>
                                
                                {/* Specific Item Discount Form */}
                                {formState.promoMode === 'specific_item' && formState.targetItems.length > 0 && (
                                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 mt-4 space-y-3">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">Atur Diskon Per Item Terpilih</p>
                                        {formState.targetItems.map(itemId => {
                                            const existingConfig = formState.itemDiscounts?.find(d => d.id === itemId) || { type: 'Persen', value: 0 };
                                            const itemObj = (formState.category === 'Treatment' ? apiTreatments : apiProducts).find(i => i.id === itemId);
                                            const itemName = itemObj ? itemObj.name : itemId;
                                            return (
                                                <div key={itemId} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-primary/5">
                                                    <div className="flex-1 truncate text-[10px] font-bold px-2">{itemName}</div>
                                                    <select 
                                                        className="w-24 px-2 py-1.5 rounded-lg bg-secondary/10 text-[10px] font-bold outline-none"
                                                        value={existingConfig.type}
                                                        onChange={(e) => {
                                                            const newDiscounts = (formState.itemDiscounts || []).filter(d => d.id !== itemId);
                                                            setFormState({ ...formState, itemDiscounts: [...newDiscounts, { id: itemId, type: e.target.value, value: existingConfig.value }] });
                                                        }}
                                                    >
                                                        <option value="Persen">%</option>
                                                        <option value="Nominal">Rp</option>
                                                    </select>
                                                    <input 
                                                        type="number"
                                                        className="w-24 px-2 py-1.5 rounded-lg bg-secondary/10 text-[10px] font-bold outline-none"
                                                        placeholder="Nilai"
                                                        value={existingConfig.value || ''}
                                                        onChange={(e) => {
                                                            const newDiscounts = (formState.itemDiscounts || []).filter(d => d.id !== itemId);
                                                            setFormState({ ...formState, itemDiscounts: [...newDiscounts, { id: itemId, type: existingConfig.type, value: e.target.value }] });
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Bundle Mode Section */}
                        {formState.promoMode === 'bundle' && (
                            <div className="p-5 rounded-3xl bg-secondary/20 border border-primary/10 space-y-6">
                                <p className="text-sm font-black text-primary">Konfigurasi Bundle / Kombinasi</p>
                                
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-primary/60 uppercase tracking-widest">Jika Membeli (Syarat Item):</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <CustomSelect 
                                                value=""
                                                placeholder="-- Pilih Item Syarat --"
                                                searchable={true}
                                                onChange={(val) => {
                                                    if (val && !formState.bundleConfig?.buyItems?.includes(val)) {
                                                        setFormState({
                                                            ...formState, 
                                                            bundleConfig: {
                                                                ...formState.bundleConfig,
                                                                buyItems: [...(formState.bundleConfig?.buyItems || []), val]
                                                            }
                                                        });
                                                    }
                                                }}
                                                options={isLoadingData ? [{ label: 'Memuat data...', value: '' }] : [
                                                    ...apiTreatments.map(t => ({ label: t.name, value: t.id })),
                                                    ...apiProducts.map(p => ({ label: p.name, value: p.id }))
                                                ]}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {formState.bundleConfig?.buyItems?.map(itemId => {
                                            const itemName = [...apiTreatments, ...apiProducts].find(i => i.id === itemId)?.name || itemId;
                                            return (
                                            <span key={itemId} className="px-3 py-1.5 bg-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 border border-primary/10">
                                                {itemName}
                                                <X className="w-4 h-4 cursor-pointer text-red-500 hover:scale-110 transition-transform" onClick={() => {
                                                    setFormState({
                                                        ...formState,
                                                        bundleConfig: { ...formState.bundleConfig, buyItems: formState.bundleConfig.buyItems.filter(i => i !== itemId) }
                                                    })
                                                }} />
                                            </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-primary/5">
                                    <label className="text-xs font-black text-primary/60 uppercase tracking-widest">Maka Dapatkan (Benefit):</label>
                                    <div className="flex gap-3">
                                        <div className="flex-1" id="benefitSelectContainer">
                                            <CustomSelect 
                                                value={window.tempBenefitVal || ""}
                                                placeholder="-- Pilih Item Diskon --"
                                                searchable={true}
                                                onChange={(val) => {
                                                    window.tempBenefitVal = val;
                                                    // Trigger re-render to update the internal select state (hacky for temp state without React state)
                                                    document.getElementById('benefitAddBtn').click(); 
                                                }}
                                                options={isLoadingData ? [{ label: 'Memuat data...', value: '' }] : [
                                                    ...apiTreatments.map(t => ({ label: t.name, value: t.name })),
                                                    ...apiProducts.map(p => ({ label: p.name, value: p.name }))
                                                ]}
                                            />
                                        </div>
                                        <button id="benefitAddBtn" type="button" className="px-6 py-4 bg-primary text-secondary rounded-2xl text-xs font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all" onClick={() => {
                                            const val = window.tempBenefitVal;
                                            if (val && !formState.bundleConfig?.getItems?.find(i => i.id === val)) {
                                                setFormState({
                                                    ...formState,
                                                    bundleConfig: {
                                                        ...formState.bundleConfig,
                                                        getItems: [...(formState.bundleConfig?.getItems || []), { id: val, type: 'Persen', value: 0 }]
                                                    }
                                                });
                                                window.tempBenefitVal = ""; // reset
                                            }
                                        }}>Tambah</button>
                                    </div>
                                    <div className="space-y-3 mt-4">
                                        {formState.bundleConfig?.getItems?.map(item => (
                                            <div key={item.id} className="flex gap-3 items-center bg-white p-3 rounded-2xl border border-primary/5 shadow-sm">
                                                <div className="flex-1 truncate text-xs font-black px-2">{item.id}</div>
                                                <div className="w-32">
                                                    <CustomSelect 
                                                        value={item.type}
                                                        options={[
                                                            { label: 'Persen (%)', value: 'Persen' },
                                                            { label: 'Nominal (Rp)', value: 'Nominal' }
                                                        ]}
                                                        onChange={(val) => {
                                                            const newItems = formState.bundleConfig.getItems.map(i => i.id === item.id ? { ...i, type: val } : i);
                                                            setFormState({ ...formState, bundleConfig: { ...formState.bundleConfig, getItems: newItems } });
                                                        }}
                                                    />
                                                </div>
                                                <input 
                                                    type="number"
                                                    className="w-28 px-4 py-3 rounded-2xl bg-secondary/10 text-xs font-bold outline-none border border-primary/5 focus:border-primary/20 transition-all"
                                                    placeholder="Nilai"
                                                    value={item.value || ''}
                                                    onChange={(e) => {
                                                        const newItems = formState.bundleConfig.getItems.map(i => i.id === item.id ? { ...i, value: e.target.value } : i);
                                                        setFormState({ ...formState, bundleConfig: { ...formState.bundleConfig, getItems: newItems } });
                                                    }}
                                                />
                                                <X className="w-5 h-5 cursor-pointer text-red-500 mx-2 hover:scale-110 transition-transform" onClick={() => {
                                                    setFormState({
                                                        ...formState,
                                                        bundleConfig: { ...formState.bundleConfig, getItems: formState.bundleConfig.getItems.filter(i => i.id !== item.id) }
                                                    })
                                                }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <button 
                            type="submit" 
                            className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Simpan Promo
                        </button>
                    </form>
                </div>
                <ConfirmModal
                    config={confirmConfig}
                    onClose={() => setConfirmConfig(null)}
                />
            </div>
        </div>,
        document.body
    );
};

export default PromoFormModal;