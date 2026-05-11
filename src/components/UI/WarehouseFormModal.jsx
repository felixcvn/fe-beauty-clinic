import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Package, Activity, Beaker } from 'lucide-react';
import CustomSelect from './CustomSelect';
import CustomMultiSelect from './CustomMultiSelect';
import { useMockData } from '../../context/MockDataContext';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rbac';
import { stokProdukAPI, paketBundlingsAPI } from '../../services/api';
import ConfirmModal from './ConfirmModal';

const WarehouseFormModal = ({ isOpen, onClose, onSave, initialData, type, products = [] }) => {
    const { user } = useAuth();
    const { materials, treatments } = useMockData();
    const [formState, setFormState] = useState({
        name: '',
        category: type === 'product' ? 'Obat' : type === 'racikan' ? 'Racikan' : type === 'material' ? 'Bahan' : 'Treatment',
        price: '',
        priceDistributor: '',
        stock: '',
        minStock: '',
        bahan_ids: [],
        package_treatment_ids: [],
        id: '',
        isPackage: false,
        packageCount: '',
        package_items: [], // Array of { id, quantity }
        description: ''
    });
    const [errors, setErrors] = useState({});
    const [confirmConfig, setConfirmConfig] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            if (initialData) {
                setFormState({
                    ...initialData,
                    priceDistributor: initialData.priceDistributor || '',
                    bahan_ids: initialData.bahan_ids || [],
                    package_treatment_ids: initialData.package_treatment_ids || [],
                    isPackage: initialData.isPackage || false,
                    packageCount: initialData.packageCount || '',
                    package_items: initialData.package_items || (initialData.package_product_ids ? initialData.package_product_ids.map(id => ({ id, quantity: 1 })) : []),
                    description: initialData.description || '',
                    id: initialData.id || ''
                });
            } else {
                setFormState({
                    name: '',
                    category: type === 'product' ? 'Obat' : type === 'racikan' ? 'Racikan' : type === 'material' ? 'Bahan' : 'Treatment',
                    price: '',
                    priceDistributor: '',
                    stock: '',
                    minStock: '',
                    bahan_ids: [],
                    package_treatment_ids: [],
                    id: '',
                    isPackage: false,
                    packageCount: '',
                    package_items: [],
                    description: ''
                });

                // Fetch auto-generate code immediately for products
                if (type === 'product') {
                    const token = localStorage.getItem('token');
                    // Tentukan apakah paket atau bukan berdasarkan initialData atau default (false untuk baru)
                    const isBundle = initialData ? (initialData.isPackage || !!initialData.Kode_paket) : false;
                    const apiToUse = isBundle ? paketBundlingsAPI : stokProdukAPI;
                    
                    apiToUse.getNextCode(token).then(res => {
                        if (res.success && res.data) {
                            const data = res.data;
                            const nextCode = 
                                (data.data && typeof data.data === 'object' ? (data.data.next_number || data.data.nextNumber || data.data.next_code || data.data.data) : null) ||
                                data.next_number || data.nextNumber || data.next_code || data.data || 
                                (typeof data === 'string' ? data : '');
                            
                            if (nextCode) setFormState(prev => ({ ...prev, id: nextCode }));
                        }
                    });
                }
            }
        }
    }, [isOpen, initialData, type]);

    if (!isOpen) return null;

    const validate = () => {
        let newErrors = {};
        const typeLabel = type === 'product' ? 'stok' : type === 'racikan' ? 'racikan' : type === 'material' ? 'bahan' : 'treatment';
        if (!formState.name.trim()) newErrors.name = `Nama ${typeLabel} wajib diisi`;
        
        if (type === 'product' || type === 'racikan' || type === 'material') {
            if (!formState.category) newErrors.category = "Kategori wajib dipilih";
            if (user?.role === ROLES.MANAJER_MARKETING_SALES) {
                if (formState.price === '' || formState.price === null) newErrors.price = "Harga Normal wajib diisi";
                if (formState.priceDistributor === '' || formState.priceDistributor === null) newErrors.priceDistributor = "Harga Distributor wajib diisi";
            } else if (user?.role !== ROLES.GUDANG_UMUM) {
                if (formState.price === '' || formState.price === null) newErrors.price = "Harga wajib diisi";
            }
            if (!formState.isPackage) {
                if (formState.stock === '' || formState.stock === null) newErrors.stock = "Stok wajib diisi";
                if (formState.minStock === '' || formState.minStock === null) newErrors.minStock = "Batas minimal stok wajib diisi";
            }
            
            if (formState.isPackage) {
                if (!formState.package_items || formState.package_items.length === 0) {
                    newErrors.package_items = "Pilih minimal satu produk dalam paket";
                }
            }
        } else {
            if (formState.price === '' || formState.price === null) newErrors.price = "Harga wajib diisi";
            if (formState.isPackage) {
                if (!formState.packageCount || formState.packageCount <= 0) {
                    newErrors.packageCount = "Jumlah sesi wajib diisi";
                }
                if (!formState.package_treatment_ids || formState.package_treatment_ids.length === 0) {
                    newErrors.package_treatment_ids = "Pilih minimal satu treatment dalam paket";
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSave(formState);
        }
    };

    const handleChange = (field, value) => {
        setFormState(prev => {
            const newState = { ...prev, [field]: value };
            
            // Jika toggle isPackage berubah pada mode TAMBAH
            if (field === 'isPackage' && !initialData?.uid && type === 'product') {
                const token = localStorage.getItem('token');
                const apiToUse = value ? paketBundlingsAPI : stokProdukAPI;
                
                if (value) {
                    // Set kategori Paket, stok 0 dan ambil kode paket otomatis
                    setFormState(current => ({ 
                        ...current, 
                        category: 'Paket',
                        stock: 0,
                        minStock: 0
                    }));
                } else {
                    setFormState(current => ({ ...current, category: '' }));
                }

                apiToUse.getNextCode(token).then(res => {
                    if (res.success && res.data) {
                        const data = res.data;
                        const nextCode = 
                            (data.data && typeof data.data === 'object' ? (data.data.next_number || data.data.nextNumber || data.data.next_code || data.data.data) : null) ||
                            data.next_number || data.nextNumber || data.next_code || data.data || 
                            (typeof data === 'string' ? data : '');
                        
                        if (nextCode) setFormState(current => ({ ...current, id: nextCode }));
                    }
                });
            }
            
            return newState;
        });
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const getDynamicInputClass = (field) => {
        return `w-full px-4 py-4 rounded-2xl bg-white border ${errors[field] ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/5 focus:ring-primary/5'} outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm`;
    };

    const labelClassName = "text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1 block mb-2";

    const materialOptions = materials.map(m => ({
        value: m.id,
        label: `${m.name} (${m.stock} unit)`
    }));
    
    const treatmentOptions = treatments.map(t => ({
        value: t.id,
        label: t.name
    }));

    const productOptions = products
        .filter(p => Number(p.uid) !== Number(initialData?.uid)) // Prevent selecting self
        .map(p => ({
            value: p.uid,
            label: p.name
        }));

    const handleCloseAttempt = () => {
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
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/30"
            onClick={handleCloseAttempt}
        >
            <div 
                className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCloseAttempt(); }}
                    className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/40 hover:scale-105 active:scale-95 transition-all z-[60] shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header Section */}
                <div className="relative p-8 pb-6 bg-primary overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>

                    <div className="relative z-10 flex items-center gap-4 pr-12">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-secondary backdrop-blur-sm border border-white/10">
                            {type === 'product' ? <Package className="w-6 h-6" /> : type === 'material' ? <Beaker className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                            {formState.isPackage ? (initialData?.uid ? 'Edit' : 'Tambah') + ' Paket' : (initialData?.uid ? 'Edit' : 'Tambah') + ' ' + (type === 'product' ? 'Stok' : type === 'racikan' ? 'Racikan' : type === 'material' ? 'Bahan' : 'Treatment')}
                            </h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                Formulir Data Master
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="p-8 border-t-[0.5px] border-primary/5 max-h-[70vh] overflow-y-auto scrollbar-hide">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative z-[60]">
                            <label className={labelClassName}>Kode {type === 'product' ? 'Stok' : type === 'racikan' ? 'Racikan' : type === 'material' ? 'Bahan' : 'Treatment'}</label>
                            <input
                                type="text"
                                value={formState.id}
                                onChange={(e) => handleChange('id', e.target.value)}
                                className={`${getDynamicInputClass('id')} ${!initialData?.uid ? 'bg-white text-primary' : 'bg-gray-100 text-primary/60 cursor-not-allowed'}`}
                                placeholder="Memuat kode otomatis..."
                                readOnly={!initialData?.uid}
                            />
                            {errors.id && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.id}</p>}
                        </div>
                        
                        <div className="relative z-[50]">
                            <label className={labelClassName}>Nama {formState.isPackage ? 'Paket' : (type === 'product' ? 'Stok' : type === 'racikan' ? 'Racikan' : type === 'material' ? 'Bahan' : 'Treatment')}</label>
                            <input
                                type="text"
                                value={formState.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className={getDynamicInputClass('name')}
                                placeholder={`Masukkan nama ${type === 'product' ? 'stok' : type === 'racikan' ? 'racikan' : type === 'material' ? 'bahan' : 'treatment'}...`}
                            />
                            {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.name}</p>}
                        </div>

                        {type === 'product' && (
                            <div className="relative z-[45] p-4 rounded-2xl border border-primary/5 bg-gray-50/50 space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer group w-max">
                                    <div className="relative flex items-center justify-center">
                                        <input 
                                            type="checkbox" 
                                            className="peer appearance-none w-5 h-5 border-2 border-primary/20 rounded-md checked:bg-blue-500 checked:border-blue-500 transition-all cursor-pointer group-hover:border-primary/40"
                                            checked={formState.isPackage}
                                            onChange={(e) => handleChange('isPackage', e.target.checked)}
                                        />
                                        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-primary/60 group-hover:text-primary transition-colors">
                                        Produk ini merupakan paket (Bundle)
                                    </span>
                                </label>

                                {formState.isPackage && (
                                    <div className="pt-2 animate-fade-in-up space-y-4">
                                        <div>
                                            <CustomMultiSelect
                                                label="Pilih Produk"
                                                placeholder="Pilih produk untuk ditambahkan..."
                                                values={formState.package_items.map(i => i.id)}
                                                onChange={(ids) => {
                                                    const newItems = ids.map(id => {
                                                        const existing = formState.package_items.find(i => Number(i.id) === Number(id));
                                                        return existing || { id, quantity: 1 };
                                                    });
                                                    handleChange('package_items', newItems);
                                                }}
                                                options={productOptions}
                                                searchable={true}
                                            />
                                            {errors.package_items && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.package_items}</p>}
                                        </div>

                                        {formState.package_items.length > 0 && (
                                            <div className="space-y-3 bg-white p-4 rounded-2xl border border-primary/5 shadow-sm">
                                                <label className={labelClassName}>Daftar Produk & Jumlah</label>
                                                {formState.package_items.map((item, index) => {
                                                    return (
                                                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-primary/5">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-primary truncate">{products.find(p => Number(p.uid) === Number(item.id))?.name || item.id}</p>
                                                            </div>
                                                            <div className="w-24">
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.quantity}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value === '' ? '' : Number(e.target.value);
                                                                        const updatedItems = [...formState.package_items];
                                                                        updatedItems[index].quantity = val;
                                                                        handleChange('package_items', updatedItems);
                                                                    }}
                                                                    className="w-full px-2 py-1.5 rounded-lg bg-white border border-primary/10 text-xs font-bold text-center"
                                                                    placeholder="Jumlah"
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <div>
                                            <label className={labelClassName}>Deskripsi Paket</label>
                                            <textarea
                                                value={formState.description}
                                                onChange={(e) => handleChange('description', e.target.value)}
                                                className={`${getDynamicInputClass('description')} h-20 py-3 resize-none`}
                                                placeholder="Contoh: Isi 2x Serum, 1x Sabun..."
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {type === 'treatment' && (
                            <>
                                <div className="relative z-[40] p-4 rounded-2xl border border-primary/5 bg-gray-50/50 space-y-4">
                                    <label className="flex items-center gap-3 cursor-pointer group w-max">
                                        <div className="relative flex items-center justify-center">
                                            <input 
                                                type="checkbox" 
                                                className="peer appearance-none w-5 h-5 border-2 border-primary/20 rounded-md checked:bg-green-500 checked:border-green-500 transition-all cursor-pointer group-hover:border-primary/40"
                                                checked={formState.isPackage}
                                                onChange={(e) => handleChange('isPackage', e.target.checked)}
                                            />
                                            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-primary/60 group-hover:text-primary transition-colors">
                                            Treatment ini merupakan paket
                                        </span>
                                    </label>

                                    {formState.isPackage && (
                                        <div className="pt-2 animate-fade-in-up space-y-4">
                                            <div>
                                                <label className={labelClassName}>Jumlah Sesi Dalam Paket</label>
                                                <input
                                                    type="number"
                                                    value={formState.packageCount}
                                                    onChange={(e) => handleChange('packageCount', e.target.value === '' ? '' : Number(e.target.value))}
                                                    className={getDynamicInputClass('packageCount')}
                                                    placeholder="Contoh: 5"
                                                    min="1"
                                                />
                                                {errors.packageCount && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.packageCount}</p>}
                                            </div>

                                            <div>
                                                <CustomMultiSelect
                                                    label="Treatment Dalam Paket"
                                                    placeholder="Pilih treatment..."
                                                    values={formState.package_treatment_ids}
                                                    onChange={(val) => handleChange('package_treatment_ids', val)}
                                                    options={treatmentOptions}
                                                    searchable={true}
                                                />
                                                {errors.package_treatment_ids && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.package_treatment_ids}</p>}
                                                <p className="text-[9px] font-bold text-primary/30 mt-2 px-1">Pilih satu atau lebih treatment yang termasuk dalam paket ini.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="relative z-[30]">
                                    <CustomMultiSelect
                                        label="Bahan yang digunakan"
                                        placeholder="Pilih bahan..."
                                        values={formState.bahan_ids}
                                        onChange={(val) => handleChange('bahan_ids', val)}
                                        options={materialOptions}
                                        searchable={true}
                                    />
                                    <p className="text-[9px] font-bold text-primary/30 mt-2 px-1">Pilih satu atau lebih bahan yang dihabiskan dalam sesi treatment ini.</p>
                                </div>
                            </>
                        )}

                        <div className={`relative z-[20] ${(type === 'product' || type === 'racikan' || type === 'material') ? "grid grid-cols-2 gap-4" : "block"}`}>
                            {(type === 'product' || type === 'racikan' || type === 'material') && (
                                <div className="relative z-[25]">
                                    <CustomSelect
                                        label="Kategori"
                                        value={formState.category}
                                        onChange={(value) => handleChange('category', value)}
                                        disabled={formState.isPackage}
                                        options={formState.isPackage ? [{ value: 'Paket', label: 'Paket Bundling' }] : (type === 'product' ? [
                                            { value: 'Obat', label: 'Obat' },
                                            { value: 'Skincare', label: 'Skincare' },
                                            { value: 'Lainnya', label: 'Lainnya' },
                                        ] : type === 'material' ? [
                                            { value: 'Bahan Habis Pakai', label: 'Habis Pakai' },
                                            { value: 'Alat Medis', label: 'Alat Medis' },
                                            { value: 'Cairan', label: 'Cairan' },
                                        ] : [
                                            { value: 'Racikan', label: 'Racikan Khusus' }
                                        ])}
                                    />
                                    {errors.category && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.category}</p>}
                                </div>
                            )}
                            
                            {(user?.role === ROLES.MANAJER_MARKETING_SALES || user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.OWNER) ? (
                                <div className="grid grid-cols-2 gap-4 col-span-2">
                                    <div className="relative z-[22]">
                                        <label className={labelClassName}>Harga Normal (Rp)</label>
                                        <input
                                            type="number"
                                            value={formState.price}
                                            onChange={(e) => handleChange('price', e.target.value === '' ? '' : Number(e.target.value))}
                                            className={getDynamicInputClass('price')}
                                            placeholder="0"
                                        />
                                        {errors.price && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.price}</p>}
                                    </div>
                                    <div className="relative z-[22]">
                                        <label className={labelClassName}>Harga Distributor (Rp)</label>
                                        <input
                                            type="number"
                                            value={formState.priceDistributor}
                                            onChange={(e) => handleChange('priceDistributor', e.target.value === '' ? '' : Number(e.target.value))}
                                            className={getDynamicInputClass('priceDistributor')}
                                            placeholder="0"
                                        />
                                        {errors.priceDistributor && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.priceDistributor}</p>}
                                    </div>
                                </div>
                            ) : user?.role !== ROLES.GUDANG_UMUM ? (
                                <div className="relative z-[22]">
                                    <label className={labelClassName}>Harga (Rp)</label>
                                    <input
                                        type="number"
                                        value={formState.price}
                                        onChange={(e) => handleChange('price', e.target.value === '' ? '' : Number(e.target.value))}
                                        className={getDynamicInputClass('price')}
                                        placeholder="0"
                                    />
                                    {errors.price && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.price}</p>}
                                </div>
                            ) : null}
                        </div>

                        {(type === 'product' || type === 'racikan' || type === 'material') && !formState.isPackage && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClassName}>Stok Tersedia</label>
                                    <input
                                        type="number"
                                        value={formState.stock}
                                        onChange={(e) => handleChange('stock', e.target.value === '' ? '' : Number(e.target.value))}
                                        className={`${getDynamicInputClass('stock')} ${user?.role === ROLES.MANAJER_MARKETING_SALES ? 'bg-gray-100 text-primary/60 cursor-not-allowed shadow-none' : ''}`}
                                        placeholder="0"
                                        readOnly={user?.role === ROLES.MANAJER_MARKETING_SALES}
                                    />
                                    {errors.stock && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.stock}</p>}
                                </div>
                                <div>
                                    <label className={labelClassName}>Batas Minimal Stok</label>
                                    <input
                                        type="number"
                                        value={formState.minStock}
                                        onChange={(e) => handleChange('minStock', e.target.value === '' ? '' : Number(e.target.value))}
                                        className={`${getDynamicInputClass('minStock')} ${user?.role === ROLES.MANAJER_MARKETING_SALES ? 'bg-gray-100 text-primary/60 cursor-not-allowed shadow-none' : ''}`}
                                        placeholder="5"
                                        readOnly={user?.role === ROLES.MANAJER_MARKETING_SALES}
                                    />
                                    {errors.minStock && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.minStock}</p>}
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="relative z-[1] w-full flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 mt-4"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Simpan Data
                        </button>
                    </form>
                </div>
            </div>
            <ConfirmModal
                config={confirmConfig}
                onClose={() => setConfirmConfig(null)}
            />
        </div>,
        document.body
    );
};

export default WarehouseFormModal;