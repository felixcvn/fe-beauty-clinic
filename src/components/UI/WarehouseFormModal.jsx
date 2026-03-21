import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Package, Activity } from 'lucide-react';

const WarehouseFormModal = ({ isOpen, onClose, onSave, initialData, type }) => {
    const [formState, setFormState] = useState({
        name: '',
        category: type === 'product' ? 'Obat' : 'Treatment',
        price: 0,
        stock: 0,
        minStock: 5,
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=200&h=200&auto=format&fit=crop'
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormState(initialData);
            } else {
                setFormState({
                    name: '',
                    category: type === 'product' ? 'Obat' : 'Treatment',
                    price: 0,
                    stock: 0,
                    minStock: 5,
                    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=200&h=200&auto=format&fit=crop'
                });
            }
        }
    }, [isOpen, initialData, type]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formState);
    };

    // Style seragam untuk input agar kodenya lebih rapi
    const inputClassName = "w-full px-4 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm";
    const labelClassName = "text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1 block mb-2";

    return createPortal(
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
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
                            {type === 'product' ? <Package className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                                {initialData ? 'Edit' : 'Tambah'} {type === 'product' ? 'Produk' : 'Treatment'}
                            </h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">
                                Formulir Data Master
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="p-8 border-t-[0.5px] border-primary/5 max-h-[70vh] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        <div>
                            <label className={labelClassName}>Nama {type === 'product' ? 'Produk' : 'Treatment'}</label>
                            <input
                                required
                                type="text"
                                value={formState.name}
                                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                className={inputClassName}
                                placeholder={`Masukkan nama ${type === 'product' ? 'produk' : 'treatment'}...`}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClassName}>Kategori</label>
                                <select
                                    value={formState.category}
                                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                                    className={inputClassName}
                                >
                                    {type === 'product' ? (
                                        <>
                                            <option value="Obat">Obat</option>
                                            <option value="Skincare">Skincare</option>
                                            <option value="Lainnya">Lainnya</option>
                                        </>
                                    ) : (
                                        <option value="Treatment">Treatment</option>
                                    )}
                                </select>
                            </div>
                            
                            <div>
                                <label className={labelClassName}>Harga (Rp)</label>
                                <input
                                    required
                                    type="number"
                                    value={formState.price}
                                    onChange={(e) => setFormState({ ...formState, price: parseInt(e.target.value) || 0 })}
                                    className={inputClassName}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {type === 'product' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClassName}>Stok Tersedia</label>
                                    <input
                                        required
                                        type="number"
                                        value={formState.stock}
                                        onChange={(e) => setFormState({ ...formState, stock: parseInt(e.target.value) || 0 })}
                                        className={inputClassName}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className={labelClassName}>Batas Minimal Stok</label>
                                    <input
                                        required
                                        type="number"
                                        value={formState.minStock}
                                        onChange={(e) => setFormState({ ...formState, minStock: parseInt(e.target.value) || 0 })}
                                        className={inputClassName}
                                        placeholder="5"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className={labelClassName}>URL Gambar</label>
                            <input
                                type="text"
                                value={formState.image}
                                onChange={(e) => setFormState({ ...formState, image: e.target.value })}
                                className={`${inputClassName} text-[11px]`}
                                placeholder="https://..."
                            />
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
            </div>
        </div>,
        document.body
    );
};

export default WarehouseFormModal;