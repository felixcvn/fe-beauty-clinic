import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, CheckCircle2, Package, Star, Filter } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const SalesPOSModal = ({ isOpen, onClose, onTransactionSuccess }) => {
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('Tunai');
    const [isProcessing, setIsProcessing] = useState(false);

    const categories = ['Semua', 'Obat', 'Treatment', 'Skincare'];

    const products = [
        { id: 'PRD-001', name: 'Acne Treatment Pack', category: 'Skincare', price: 450000, stock: 15, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-002', name: 'Laser Therapy Session', category: 'Treatment', price: 1200000, stock: 5, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-003', name: 'Chemical Peel', category: 'Treatment', price: 350000, stock: 8, image: 'https://images.unsplash.com/photo-1570172619991-8079603683a3?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-004', name: 'Skin Glow Kit', category: 'Skincare', price: 850000, stock: 12, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-005', name: 'Sunscreen SPF 50', category: 'Skincare', price: 150000, stock: 25, image: 'https://images.unsplash.com/photo-1598440499033-547b19615c0a?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-006', name: 'Paracetamol 500mg', category: 'Obat', price: 15000, stock: 100, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-007', name: 'Night Cream Retinol', category: 'Skincare', price: 250000, stock: 10, image: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?q=80&w=200&h=200&auto=format&fit=crop' },
        { id: 'PRD-008', name: 'Amoxicillin Syrup', category: 'Obat', price: 45000, stock: 20, image: 'https://images.unsplash.com/photo-1471864190281-ad5f9f30d947?q=80&w=200&h=200&auto=format&fit=crop' },
    ];

    const [isMember, setIsMember] = useState(false);
    const [promoInput, setPromoInput] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [isPromoDropdownOpen, setIsPromoDropdownOpen] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

    const SYSTEM_PROMOS = [
        { code: 'RAMADHAN50', name: 'Diskon Spesial Ramadhan', type: 'Persen', value: 10, startDate: '2026-03-01', endDate: '2026-04-30', status: 'Aktif' },
        { code: 'NEWGLOW', name: 'Potongan Treatment Glow Up', type: 'Nominal', value: 150000, startDate: '2026-03-15', endDate: '2026-04-15', status: 'Aktif' },
        { code: 'MEMBERBARU', name: 'Welcome New Member', type: 'Nominal', value: 50000, startDate: '2026-01-01', endDate: '2026-12-31', status: 'Aktif' },
        { code: 'CANTIK100', name: 'Potongan Facial 100k', type: 'Nominal', value: 100000, startDate: '2026-03-10', endDate: '2026-05-10', status: 'Aktif' },
    ];

    const customers = [
        { id: 'PAS-001', name: 'Siti Aminah', phone: '0812-3456-7890' },
        { id: 'PAS-002', name: 'Budi Santoso', phone: '0813-9876-5432' },
        { id: 'PAS-003', name: 'Dewi Lestari', phone: '0811-5555-4444' },
        { id: 'PAS-004', name: 'Ahmad Fauzi', phone: '0819-2222-3333' },
        { id: 'PAS-005', name: 'Rina Wijaya', phone: '0812-8888-9999' },
    ];

    const getActivePromos = () => {
        const today = new Date().toISOString().split('T')[0];
        return SYSTEM_PROMOS.filter(p => p.status === 'Aktif' && today >= p.startDate && today <= p.endDate);
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.id.toLowerCase().includes(customerSearch.toLowerCase())
    );

    const filteredProducts = products.filter(p =>
        (activeCategory === 'Semua' || p.category === activeCategory) &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item =>
            item.id === id
                ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                : item
        ));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const cartTotal = useMemo(() =>
        cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        , [cart]);

    const memberDiscount = isMember ? (cartTotal * 0.05) : 0;
    const promoDiscount = useMemo(() => {
        if (!appliedPromo) return 0;
        if (appliedPromo.type === 'Persen') return (cartTotal - memberDiscount) * (appliedPromo.value / 100);
        return appliedPromo.value;
    }, [appliedPromo, cartTotal, memberDiscount]);

    const tax = Math.max(0, (cartTotal - memberDiscount - promoDiscount) * 0.11);
    const finalTotal = Math.max(0, (cartTotal - memberDiscount - promoDiscount) + tax);

    const handleApplyPromo = (codeToApply = promoInput) => {
        if (!codeToApply.trim()) {
            setAppliedPromo(null);
            return;
        }
        const found = getActivePromos().find(p => p.code.toUpperCase() === codeToApply.toUpperCase());
        if (found) {
            setAppliedPromo(found);
            setPromoInput(found.code);
            showToast('Promo berhasil diterapkan!', 'success');
        } else {
            showToast('Kode promo tidak valid', 'error');
            setAppliedPromo(null);
        }
        setIsPromoDropdownOpen(false);
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        if (!selectedCustomer) {
            showToast('Pilih customer terlebih dahulu!', 'error');
            return;
        }
        setIsProcessing(true);

        setTimeout(() => {
            const transaction = {
                id: `INV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                customer: selectedCustomer.name,
                product: cart.length > 1 ? `${cart[0].name} & ${cart.length - 1} lainnya` : cart[0].name,
                amount: `Rp ${finalTotal.toLocaleString('id-ID')}`,
                status: 'Selesai',
                date: new Date().toISOString().split('T')[0]
            };

            onTransactionSuccess(transaction);
            showToast('Transaksi Berhasil Disimpan!', 'success');
            setCart([]);
            setIsProcessing(false);
            onClose();
        }, 1500);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="relative w-full h-full sm:h-[90vh] md:h-auto md:max-w-7xl md:rounded-[3.5rem] bg-white shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-fade-in-up border border-primary/5" onClick={(e) => e.stopPropagation()}>


                {/* Left Side: Product Selection */}
                <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-primary/5 bg-white">
                    <div className="p-6 md:p-8 bg-secondary/10 flex justify-between items-center shrink-0">
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-primary tracking-tighter">Katalog POS</h3>
                            <p className="text-[9px] md:text-[10px] font-bold text-primary/60 uppercase tracking-widest mt-1">Pilih Stok atau Layanan</p>
                        </div>
                        <button onClick={onClose} className="lg:hidden p-3 rounded-2xl hover:bg-secondary transition-all">
                            <X className="w-6 h-6 text-primary" />
                        </button>
                    </div>

                    <div className="p-5 md:p-8 space-y-6 flex-1 overflow-y-auto scrollbar-hide">
                        {/* Search & Categories */}
                        <div className="space-y-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Cari stok..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-6 py-3.5 md:py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-bold focus:ring-4 focus:ring-primary/5 transition-all text-xs md:text-sm"
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-5 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-primary text-secondary shadow-lg' : 'bg-white border border-primary/10 text-primary/60 hover:bg-secondary'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredProducts.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="p-4 rounded-3xl bg-secondary/10 border border-primary/5 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group flex flex-col justify-between h-full"
                                >
                                    <div>
                                        <div className="aspect-square rounded-2xl bg-white overflow-hidden mb-4 shadow-sm relative">
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-white/80 backdrop-blur-sm border border-primary/5 text-[8px] font-black text-primary uppercase">
                                                {product.stock}
                                            </div>
                                        </div>
                                        <h4 className="text-[10px] md:text-[11px] font-black text-primary leading-tight mb-1 truncate">{product.name}</h4>
                                        <p className="text-[8px] md:text-[9px] font-bold text-primary/50 uppercase tracking-widest mb-3">{product.category}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-xs font-black text-primary tracking-tighter">Rp {product.price.toLocaleString('id-ID')}</span>
                                        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-secondary group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Cart Summary (E-commerce Style) */}
                <div className="w-full lg:w-[450px] bg-secondary/20 flex flex-col h-full shadow-inner border-t lg:border-t-0 lg:border-l border-primary/5">
                    {/* 1. Customer & Promo Section (Top - Fixed) */}
                    <div className="p-6 md:p-7 border-b border-primary/5 bg-white shrink-0 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                <Star className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-primary tracking-tighter">Konfigurasi Transaksi</h3>
                        </div>

                        {/* Customer Selection */}
                        <div className="relative">
                            {selectedCustomer ? (
                                <div className="p-3.5 rounded-2xl bg-secondary/10 border border-primary/5 flex items-center justify-between animate-fade-in group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-primary text-secondary flex items-center justify-center font-black text-[10px]">
                                            {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-primary tracking-tight">{selectedCustomer.name}</p>
                                            <p className="text-[8px] font-bold text-primary/40 uppercase tracking-widest">{selectedCustomer.id}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedCustomer(null)} className="p-2 text-primary/20 hover:text-red-500 transition-all">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/30" />
                                    <input
                                        type="text"
                                        placeholder="Cari customer..."
                                        value={customerSearch}
                                        onChange={(e) => { setCustomerSearch(e.target.value); setIsCustomerDropdownOpen(true); }}
                                        onFocus={() => setIsCustomerDropdownOpen(true)}
                                        className="w-full pl-11 pr-6 py-3 rounded-xl bg-secondary/10 border border-primary/5 outline-none text-[10px] font-bold text-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                                    />
                                    {isCustomerDropdownOpen && customerSearch && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-primary/5 shadow-2xl z-50 overflow-hidden max-h-[160px] overflow-y-auto scrollbar-hide">
                                            {filteredCustomers.map(customer => (
                                                <button
                                                    key={customer.id}
                                                    onClick={() => { setSelectedCustomer(customer); setIsCustomerDropdownOpen(false); setCustomerSearch(''); }}
                                                    className="w-full p-3 text-left hover:bg-secondary/20 border-b border-primary/5 last:border-0"
                                                >
                                                    <p className="text-[10px] font-black text-primary">{customer.name}</p>
                                                    <p className="text-[8px] font-bold text-primary/30 uppercase">{customer.id} • {customer.phone}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Promo Input */}
                        <div className="flex gap-2 relative">
                            <div className="relative flex-1 group">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/30 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Kode promo?"
                                    value={promoInput}
                                    onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setIsPromoDropdownOpen(true); }}
                                    onFocus={() => setIsPromoDropdownOpen(true)}
                                    className="w-full pl-11 pr-6 py-3 rounded-xl bg-secondary/10 border border-primary/5 outline-none text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                                />
                            </div>
                            <button onClick={() => handleApplyPromo()} className="px-5 py-3 bg-primary text-secondary rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/10">
                                Pakai
                            </button>
                            {isPromoDropdownOpen && promoInput && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-primary/5 shadow-2xl z-50 overflow-hidden animate-fade-in">
                                    {getActivePromos().map(promo => (
                                        <button
                                            key={promo.code}
                                            onClick={() => handleApplyPromo(promo.code)}
                                            className="w-full p-4 text-left hover:bg-secondary/10 border-b border-primary/5 flex justify-between items-center"
                                        >
                                            <div>
                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">{promo.code}</p>
                                                <p className="text-[8px] font-bold text-primary/40 uppercase">{promo.name}</p>
                                            </div>
                                            <span className="text-[10px] font-black text-green-500">+{promo.type === 'Persen' ? `${promo.value}%` : `Rp ${promo.value.toLocaleString('id-ID')}`}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. Cart Items (Middle - Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 scrollbar-hide min-h-[200px] bg-secondary/5">
                        <div className="flex justify-between items-center px-1 mb-2">
                            <p className="text-[9px] font-black text-primary/30 uppercase tracking-[0.2em]">Item Terpilih ({cart.length})</p>
                            {cart.length > 0 && (
                                <button onClick={() => setCart([])} className="text-[8px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors">Kosongkan</button>
                            )}
                        </div>
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-12">
                                <Package className="w-12 h-12 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Keranjang Kosong</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="p-4 rounded-3xl bg-white border border-primary/5 shadow-sm animate-fade-in flex gap-4 hover:border-primary/10 transition-all">
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 bg-secondary/10">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-[10px] font-black text-primary tracking-tight leading-tight uppercase line-clamp-1">{item.name}</h4>
                                            <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-200 hover:text-red-500 transition-all">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center mt-1.5">
                                            <div className="flex items-center gap-2.5 bg-secondary/30 rounded-lg px-2 py-0.5">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="p-0.5 hover:bg-white rounded transition-all"><Minus className="w-2.5 h-2.5 text-primary/40" /></button>
                                                <span className="text-[9px] font-black text-primary">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="p-0.5 hover:bg-white rounded transition-all"><Plus className="w-2.5 h-2.5 text-primary/40" /></button>
                                            </div>
                                            <span className="text-[10px] font-black text-primary tracking-tighter">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* 3. Totals & Checkout (Bottom - Fixed) */}
                    <div className="p-6 md:p-8 bg-white border-t border-primary/5 space-y-5 shrink-0">
                        <div className="space-y-2.5 border-b border-primary/5 pb-5">
                            <div className="flex justify-between text-primary/40 font-bold text-[9px] uppercase tracking-[0.2em]">
                                <span>Subtotal</span>
                                <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                            </div>
                            {appliedPromo && (
                                <div className="flex justify-between text-green-500 font-bold text-[9px] uppercase tracking-[0.2em]">
                                    <span>Promo ({appliedPromo.code})</span>
                                    <span>- Rp {promoDiscount.toLocaleString('id-ID')}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-primary/40 font-bold text-[9px] uppercase tracking-[0.2em]">
                                <span>Pajak (11%)</span>
                                <span>Rp {tax.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-[11px] font-black text-primary uppercase tracking-[0.3em]">Total Bayar</span>
                                <span className="text-2xl font-black text-primary tracking-tighter">Rp {finalTotal.toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        <button
                            disabled={cart.length === 0 || isProcessing}
                            onClick={handleCheckout}
                            className={`w-full py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 relative overflow-hidden group ${cart.length === 0 ? 'bg-primary/10 text-primary/20 pointer-events-none' : 'bg-primary text-secondary hover:scale-[1.02] active:scale-95 shadow-primary/20 hover:shadow-primary/40'}`}
                        >
                            <div className="relative z-10 flex items-center justify-center gap-3">
                                {isProcessing ? (
                                    <div className="w-5 h-5 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                        <span>Selesaikan Pembayaran</span>
                                    </>
                                )}
                            </div>
                            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-full transition-all duration-1000" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    , document.body);
};

export default SalesPOSModal;
