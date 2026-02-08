import React, { useState, useMemo } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, CheckCircle2, Package, ArrowLeft, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

const POSPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('Tunai');
    const [isProcessing, setIsProcessing] = useState(false);

    // Customer Selection State
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

    const categories = ['Semua', 'Obat', 'Treatment', 'Skincare'];

    const customers = [
        { id: 'PAS-001', name: 'Siti Aminah', phone: '0812-3456-7890' },
        { id: 'PAS-002', name: 'Budi Santoso', phone: '0813-9876-5432' },
        { id: 'PAS-003', name: 'Dewi Lestari', phone: '0811-5555-4444' },
        { id: 'PAS-004', name: 'Ahmad Fauzi', phone: '0819-2222-3333' },
        { id: 'PAS-005', name: 'Rina Wijaya', phone: '0812-8888-9999' },
    ];

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.id.toLowerCase().includes(customerSearch.toLowerCase())
    );

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

    const handleCheckout = () => {
        if (cart.length === 0) {
            showToast('Keranjang masih kosong!', 'error');
            return;
        }
        if (!selectedCustomer) {
            showToast('Pilih customer terlebih dahulu!', 'error');
            return;
        }
        setIsProcessing(true);

        setTimeout(() => {
            showToast('Transaksi Berhasil Disimpan!', 'success');
            setCart([]);
            setSelectedCustomer(null);
            setIsProcessing(false);
            navigate('/sales');
        }, 1500);
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6 animate-fade-in relative z-10">
            {/* Left Side: Product Selection */}
            <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] border border-primary/15 shadow-2xl shadow-primary/5 overflow-hidden min-h-0">
                <div className="p-6 md:p-8 bg-secondary/10 border-b border-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/sales')}
                            className="p-3 rounded-2xl bg-white text-primary/40 hover:text-primary transition-all shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-black text-primary tracking-tighter">Sistem Kasir (POS)</h2>
                            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mt-1">Pilih Produk atau Layanan</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-hide">
                    {/* Search & Categories */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Cari obat, skincare, treatment..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-secondary/20 border border-primary/10 outline-none text-primary font-bold focus:ring-4 focus:ring-primary/10 transition-all text-sm"
                            />
                        </div>
                        <div className="flex gap-2 min-w-max">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-primary text-secondary shadow-lg' : 'bg-white border border-primary/10 text-primary/60 hover:bg-secondary'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="p-4 rounded-3xl bg-white border border-primary/10 hover:bg-secondary/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group flex flex-col justify-between h-full"
                            >
                                <div>
                                    <div className="aspect-square rounded-2xl bg-secondary/20 overflow-hidden mb-4 shadow-sm relative">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-white/80 backdrop-blur-sm border border-primary/5 text-[8px] font-black text-primary uppercase">
                                            {product.stock} Tersedia
                                        </div>
                                    </div>
                                    <h4 className="text-[11px] font-black text-primary leading-tight mb-1 truncate">{product.name}</h4>
                                    <p className="text-[9px] font-bold text-primary/50 uppercase tracking-widest mb-3">{product.category}</p>
                                </div>
                                <div className="flex items-center justify-between mt-auto pt-4">
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

            {/* Right Side: Unified Cart & Summary */}
            <div className="w-full lg:w-[420px] bg-white rounded-[3rem] border border-primary/15 shadow-2xl shadow-primary/5 flex flex-col overflow-hidden h-full">

                {/* 1. Header & Customer Selection */}
                <div className="p-7 bg-secondary/10 border-b border-primary/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary relative">
                            <ShoppingCart className="w-5 h-5" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-gold text-primary text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                    {cart.reduce((a, b) => a + b.quantity, 0)}
                                </span>
                            )}
                        </div>
                        <h3 className="text-xl font-black text-primary tracking-tighter">Ringkasan Pesanan</h3>
                    </div>

                    <div className="relative">
                        {selectedCustomer ? (
                            <div className="p-4 rounded-2xl bg-white border border-primary/5 flex justify-between items-center animate-fade-in shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                        {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-primary">{selectedCustomer.name}</p>
                                        <p className="text-[9px] font-bold text-primary/60 leading-none">{selectedCustomer.id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedCustomer(null)}
                                    className="p-2 rounded-xl text-primary/20 hover:text-red-500 hover:bg-red-50 transition-all font-black text-[9px] uppercase tracking-widest"
                                >
                                    Ubah
                                </button>
                            </div>
                        ) : (
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/50 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Cari customer..."
                                    value={customerSearch}
                                    onChange={(e) => {
                                        setCustomerSearch(e.target.value);
                                        setIsCustomerDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsCustomerDropdownOpen(true)}
                                    className="w-full pl-11 pr-6 py-3.5 rounded-2xl bg-white border border-primary/10 outline-none text-[11px] font-bold text-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                                {isCustomerDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-primary/5 shadow-2xl z-50 overflow-hidden max-h-[160px] overflow-y-auto scrollbar-hide animate-fade-in">
                                        {filteredCustomers.length > 0 ? (
                                            filteredCustomers.map(customer => (
                                                <button
                                                    key={customer.id}
                                                    onClick={() => {
                                                        setSelectedCustomer(customer);
                                                        setIsCustomerDropdownOpen(false);
                                                        setCustomerSearch('');
                                                    }}
                                                    className="w-full p-3.5 text-left hover:bg-secondary/20 transition-all border-b border-primary/5 last:border-0 group"
                                                >
                                                    <p className="text-[11px] font-black text-primary group-hover:translate-x-1 transition-transform">{customer.name}</p>
                                                    <p className="text-[9px] font-bold text-primary/60 mt-0.5">{customer.id} • {customer.phone}</p>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-primary/30 text-[9px] font-black uppercase tracking-widest">
                                                Tidak ditemukan
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Cart Items (Scrollable Area) */}
                <div className="flex-1 overflow-y-auto p-7 space-y-4 scrollbar-hide bg-white shadow-inner">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-[9px] font-black text-primary/50 uppercase tracking-[0.2em]">Daftar Item ({cart.length})</p>
                        {cart.length > 0 && (
                            <button
                                onClick={() => setCart([])}
                                className="text-[8px] font-black text-primary/40 hover:text-red-500 uppercase tracking-widest transition-all"
                            >
                                Hapus Semua
                            </button>
                        )}
                    </div>
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-12">
                            <Package className="w-12 h-12 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Keranjang Kosong</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="p-4 rounded-2xl bg-secondary/5 border border-primary/10 shadow-sm animate-fade-in flex gap-4">
                                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-[10px] font-black text-primary tracking-tight leading-tight uppercase w-[120px]">{item.name}</h4>
                                        <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-300 hover:text-red-500 transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <div className="flex items-center gap-2.5 bg-white rounded-lg px-2 py-0.5 shadow-sm border border-primary/5">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="p-0.5 hover:bg-secondary rounded transition-all text-primary/40 hover:text-primary"><Minus className="w-2.5 h-2.5" /></button>
                                            <span className="text-[10px] font-black text-primary min-w-[15px] text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="p-0.5 hover:bg-secondary rounded transition-all text-primary/40 hover:text-primary"><Plus className="w-2.5 h-2.5" /></button>
                                        </div>
                                        <span className="text-[10px] font-black text-primary tracking-tighter">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 3. Checkout Section (Fixed at bottom) */}
                <div className="p-7 bg-secondary/10 border-t border-primary/5 space-y-5">
                    <div className="space-y-3">
                        <div className="flex justify-between text-primary/60 font-bold text-[9px] uppercase tracking-widest px-1">
                            <span>Subtotal</span>
                            <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-primary/60 font-bold text-[9px] uppercase tracking-widest px-1">
                            <span>Pajak (11%)</span>
                            <span>Rp {(cartTotal * 0.11).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-primary/5 px-1">
                            <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Total Tagihan</span>
                            <span className="text-2xl font-black text-primary tracking-tighter">Rp {(cartTotal * 1.11).toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setPaymentMethod('Tunai')}
                                className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'Tunai' ? 'bg-primary text-secondary shadow-lg active:scale-95' : 'bg-white text-primary/40 border border-primary/5 hover:bg-white'}`}
                            >
                                <Banknote className="w-4 h-4" />
                                <span>Tunai</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('E-Wallet')}
                                className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'E-Wallet' ? 'bg-primary text-secondary shadow-lg active:scale-95' : 'bg-white text-primary/40 border border-primary/5 hover:bg-white'}`}
                            >
                                <CreditCard className="w-4 h-4" />
                                <span>E-Wallet</span>
                            </button>
                        </div>

                        <button
                            disabled={cart.length === 0 || isProcessing}
                            onClick={handleCheckout}
                            className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 relative overflow-hidden group ${cart.length === 0 ? 'bg-primary/10 text-primary/20 pointer-events-none' : 'bg-primary text-secondary hover:scale-[1.02] active:scale-95 shadow-secondary/20 hover:shadow-secondary/40'}`}
                        >
                            <div className="relative z-10 flex items-center justify-center gap-3">
                                {isProcessing ? (
                                    <div className="w-5 h-5 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>Proses Transaksi</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POSPage;
