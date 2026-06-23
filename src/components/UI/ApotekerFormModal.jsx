import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Package, Beaker } from 'lucide-react';
import CustomSelect from './CustomSelect';
import { bahanTreatmentAPI, bahanMedisAPI, bahanInfusAPI, barangApotekAPI } from '../../services/api';
import ConfirmModal from './ConfirmModal';

/**
 * Modal formulir khusus untuk Apoteker dan Gudang Farmasi.
 * Menangani penambahan/pengeditan bahan treatment, bahan medis, bahan infus, dan barang apotek.
 */
const ApotekerFormModal = ({ isOpen, onClose, onSave, initialData, type }) => {
    const formRef = useRef(null);
    const [confirmConfig, setConfirmConfig] = useState(null);

    // State untuk menyimpan data input formulir
    const [formState, setFormState] = useState({
        name: '',
        category: '',
        stock: '',
        minStock: '',
        price: '',
        id: ''
    });
    
    // State untuk menyimpan pesan error validasi
    const [errors, setErrors] = useState({});

    // type menentukan kategori item: 'material', 'medical', 'infusion', 'apotekItem'

    /**
     * Mendapatkan label human-readable berdasarkan tipe item
     */
    const getTypeLabel = () => {
        if (type === 'material') return 'bahan treatment';
        if (type === 'medical') return 'bahan medis';
        if (type === 'infusion') return 'bahan infus';
        if (type === 'apotekItem') return 'barang apotek';
        return 'item';
    };


    useEffect(() => {
        if (isOpen) {
            setErrors({});
            if (initialData) {
                setFormState({
                    name: initialData.name || '',
                    category: initialData.category || '',
                    stock: initialData.stock !== undefined ? initialData.stock : '',
                    minStock: initialData.minStock !== undefined ? initialData.minStock : '',
                    price: initialData.price !== undefined ? initialData.price : '',
                    id: initialData.id || ''
                });
            } else {
                setFormState({
                    name: '',
                    category: '',
                    stock: '',
                    minStock: '',
                    price: '',
                    id: ''
                });

                // Fetch auto-generate code immediately based on type
                const token = localStorage.getItem('token');
                let apiCall;
                if (type === 'material') apiCall = bahanTreatmentAPI.getNextCode(token);
                else if (type === 'medical') apiCall = bahanMedisAPI.getNextCode(token);
                else if (type === 'infusion') apiCall = bahanInfusAPI.getNextCode(token);
                else if (type === 'apotekItem') apiCall = barangApotekAPI.getNextCode(token);

                if (apiCall) {
                    apiCall.then(res => {
                        if (res.success && res.data) {
                            const data = res.data;
                            // Cek semua kemungkinan key dari berbagai endpoint backend
                            const nextCode = 
                                data.Kode_Produk || data.Kode_Paket || data.Kode_Treatment ||
                                data.next_number || data.nextNumber || data.next_code ||
                                (typeof data === 'string' ? data : '');
                            if (nextCode) setFormState(prev => ({ ...prev, id: nextCode }));
                        }
                    });
                }
            }
        }
    }, [isOpen, initialData, type]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    /**
     * Memvalidasi apakah field wajib (Nama, Stok, Kategori) sudah diisi.
     * Khusus tipe 'material', harga juga wajib diisi.
     */
    const validate = () => {
        let newErrors = {};
        const typeLabel = getTypeLabel();
        
        if (!formState.name || !formState.name.trim()) newErrors.name = `Nama ${typeLabel} wajib diisi`;
        if (formState.stock === '' || formState.stock === null) newErrors.stock = "Stok wajib diisi";
        if (formState.minStock === '' || formState.minStock === null) newErrors.minStock = "Batas minimal stok wajib diisi";
        
        // Kategori hanya wajib untuk bahan treatment dan bahan medis
        if ((type === 'material' || type === 'medical') && !formState.category) {
            newErrors.category = "Kategori wajib diisi";
        }

        // Validasi harga khusus untuk tipe material
        if (type === 'material' && (formState.price === '' || formState.price === null || formState.price === undefined)) {
            newErrors.price = "Harga wajib diisi";
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            setTimeout(() => {
                const firstErrorEl = formRef.current?.querySelector('.text-red-500');
                if (firstErrorEl) {
                    firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 50);
        }
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSave(formState);
        }
    };

    const handleChange = (field, value) => {
        setFormState(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const getDynamicInputClass = (field) => {
        return `w-full px-4 py-4 rounded-2xl bg-white border ${errors[field] ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/5 focus:ring-primary/5'} outline-none text-primary font-bold text-sm focus:ring-4 transition-all shadow-sm`;
    };

    const labelClassName = "text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1 block mb-2";

    const getCategoryOptions = () => {
        if (type === 'material') {
            return [
                { value: 'Serum', label: 'Serum' },
                { value: 'Masker', label: 'Masker' },
                { value: 'Peeling', label: 'Peeling' },
                { value: 'Alat', label: 'Alat' },
            ];
        }
        if (type === 'medical') {
            return [
                { value: 'Benang', label: 'Benang' },
                { value: 'Filler', label: 'Filler' },
                { value: 'Botox', label: 'Botox' },
                { value: 'Skinbooster', label: 'Skinbooster' },
                { value: 'Alkes', label: 'Alkes' },
            ];
        }
        if (type === 'infusion') {
            return [
                { value: 'Cairan Infus', label: 'Cairan Infus' },
                { value: 'Alat Infus', label: 'Alat Infus' }
            ];
        }
        if (type === 'apotekItem') {
            return [
                { value: 'Habis Pakai', label: 'Habis Pakai' },
                { value: 'Obat Bebas', label: 'Obat Bebas' },
                { value: 'Lainnya', label: 'Lainnya' }
            ];
        }
        return [{ value: 'Umum', label: 'Umum' }];
    };

    const titleType = getTypeLabel()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

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
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/30 animate-fade-in"
            onClick={handleRequestClose}
        >
            <div 
                className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Section */}
                <div className="relative p-8 pb-6 bg-primary overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>

                    <div className="relative z-10 flex items-center gap-4 pr-12">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-secondary backdrop-blur-sm border border-white/10">
                            {type === 'apotekItem' ? <Package className="w-6 h-6" /> : <Beaker className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                                {initialData?.uid ? 'Edit' : 'Tambah'} {titleType}
                            </h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                Formulir Stok Apotek
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRequestClose(); }}
                    className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/40 hover:scale-105 active:scale-95 transition-all z-[60] shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Form Section */}
                <div className="p-8 border-t-[0.5px] border-primary/5 max-h-[70vh] overflow-y-auto scrollbar-hide">
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className={labelClassName}>Kode {titleType}</label>
                            <input
                                type="text"
                                value={formState.id}
                                onChange={(e) => handleChange('id', e.target.value)}
                                className={`${getDynamicInputClass('id')} ${!initialData?.uid ? 'bg-gray-100 text-primary/60 cursor-not-allowed' : ''}`}
                                placeholder="Memuat kode otomatis..."
                                readOnly={!initialData?.uid}
                            />
                            {/* Not strictly required, so no error mostly but we can show formatting */}
                        </div>
                        
                        <div>
                            <label className={labelClassName}>Nama {titleType}</label>
                            <input
                                type="text"
                                value={formState.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className={getDynamicInputClass('name')}
                                placeholder={`Masukkan nama ${getTypeLabel()}...`}
                            />
                            {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.name}</p>}
                        </div>

                        {(type === 'material' || type === 'medical') && (
                            <div>
                                <CustomSelect
                                    label="Kategori"
                                    value={formState.category}
                                    onChange={(value) => handleChange('category', value)}
                                    options={getCategoryOptions()}
                                />
                                {errors.category && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.category}</p>}
                            </div>
                        )}

                        {type === 'material' && (
                            <div>
                                <label className={labelClassName}>Harga (Rp)</label>
                                <input
                                    type="number"
                                    value={formState.price}
                                    onChange={(e) => handleChange('price', e.target.value === '' ? '' : Number(e.target.value))}
                                    className={getDynamicInputClass('price')}
                                    placeholder="Contoh: 50000"
                                />
                                {errors.price && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.price}</p>}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClassName}>Stok Tersedia</label>
                                <input
                                    type="number"
                                    value={formState.stock}
                                    onChange={(e) => handleChange('stock', e.target.value === '' ? '' : Number(e.target.value))}
                                    className={getDynamicInputClass('stock')}
                                    placeholder="0"
                                />
                                {errors.stock && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.stock}</p>}
                            </div>
                            <div>
                                <label className={labelClassName}>Batas Minimal Stok</label>
                                <input
                                    type="number"
                                    value={formState.minStock}
                                    onChange={(e) => handleChange('minStock', e.target.value === '' ? '' : Number(e.target.value))}
                                    className={getDynamicInputClass('minStock')}
                                    placeholder="5"
                                />
                                {errors.minStock && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.minStock}</p>}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 mt-4"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Simpan Data
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

export default ApotekerFormModal;
