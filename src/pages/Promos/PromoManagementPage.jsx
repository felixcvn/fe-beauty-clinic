import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // Untuk modal konfirmasi
import { Search, Plus, Tag, CheckCircle2, XCircle, Edit3, Trash2, AlertTriangle, Copy } from 'lucide-react';
import CustomSelect from '../../components/UI/CustomSelect';
import { useToast } from '../../context/ToastContext';
import PromoFormModal from '../../components/UI/PromoFormModal';
import PromoDetailModal from '../../components/UI/PromoDetailModal';
import TableSkeleton from '../../components/UI/TableSkeleton';
import StatsCard from '../Dashboard/StatsCard';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rbac';
import { promoAPI } from '../../services/api';
import ConfirmModal from '../../components/UI/ConfirmModal';
import Pagination from '../../components/UI/Pagination';


const PromoManagementPage = () => {
    const { showToast } = useToast();
    const { user } = useAuth();
    
    const [promos, setPromos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [isLoading, setIsLoading] = useState(true);

    const fetchPromos = async () => {
        setIsLoading(true);
        try {
            const res = await promoAPI.getAll(user?.token);
            if (res.success && res.data) {
                const dataArray = Array.isArray(res.data) ? res.data : (res.data.data || []);
                const mapped = dataArray.map(item => ({
                    id: item.id,
                    name: item.nama_promo,
                    code: item.kode_promo || '',
                    category: item.kategori,
                    promoMode: item.mode_promo,
                    type: item.tipe_diskon ? (item.tipe_diskon === 'persentase' ? 'Persen' : 'Nominal') : 'Persen',
                    value: item.nilai_diskon || 0,
                    minOrderAmount: item.min_order_amount || 0,
                    startDate: item.tanggal_mulai ? item.tanggal_mulai.split('T')[0] : '',
                    endDate: item.tanggal_selesai ? item.tanggal_selesai.split('T')[0] : '',
                    isVoucher: item.is_voucher_fisik === 1 || item.is_voucher_fisik === true,
                    voucherCount: item.vouchers_count || 0,
                    generatedCodes: item.vouchers ? item.vouchers.map(v => ({ code: v.kode_voucher, is_used: v.is_used })) : [], 
                    quota: item.kuota_global || '',
                    used: item.kuota_terpakai || 0,
                    totalOmset: item.total_omset ? Number(item.total_omset) : 0,
                    totalDiskon: item.total_diskon ? Number(item.total_diskon) : 0,
                    status: item.status,
                    targets: item.targets || [],
                    targetItems: (item.targets || []).map(t => t.item_name || String(t.item_id)),
                    bundleConfig: {
                        buyItems: (item.targets || []).filter(t => t.target_type === 'Syarat').map(t => t.item_name || String(t.item_id)),
                        getItems: (item.targets || []).filter(t => t.target_type === 'Benefit').map(t => t.item_name || String(t.item_id)),
                    },
                    itemDiscounts: (item.targets || []).filter(t => t.target_type === 'Spesifik').map(t => ({
                        id: t.item_name || String(t.item_id),
                        discountValue: t.nilai_diskon_spesifik || 0
                    }))
                }));
                setPromos(mapped);
            }
        } catch (error) {
            console.error('Failed to fetch promos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPromos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [detailPromo, setDetailPromo] = useState(null);
    const [defaultCategory, setDefaultCategory] = useState(null);

    // Confirmation Modal State
    const [confirmConfig, setConfirmConfig] = useState(null);


    const filteredPromos = promos.filter(promo => {
        // Filter by role category
        if (user?.role === ROLES.SUPERVISOR_TREATMENT && promo.category !== 'Treatment') return false;
        if (user?.role === ROLES.SUPERVISOR_PRODUK && promo.category !== 'Produk') return false;

        const matchesSearch = promo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (promo.targetItems && promo.targetItems.some(item => item.toLowerCase().includes(searchTerm.toLowerCase())));
        const matchesStatus = statusFilter === 'Semua Status' || promo.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPromos = filteredPromos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPromos.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Aktif': return 'bg-green-100 text-green-600';
            case 'Draf': return 'bg-yellow-100 text-yellow-600';
            case 'Berakhir': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    // Handler Simpan (Triggered dari form modal eksternal)
    const handleSavePromo = (formData) => {
        const isEdit = !!editingPromo;
        
        setConfirmConfig({
            icon: 'save',
            header: isEdit ? 'Konfirmasi Simpan' : 'Konfirmasi Tambah',
            message: isEdit ? 
                `Simpan perubahan untuk promo ${formData.code}?` : 
                `Buat promo baru ${formData.code}?`,
            acceptLabel: isEdit ? 'Ya, Simpan' : 'Ya, Tambahkan',
            onAccept: async () => {
                showToast(isEdit ? 'Menyimpan perubahan...' : 'Membuat promo baru...', 'info');
                
                // Map frontend form data to backend payload structure
                let targets = [];
                if (formData.promoMode === 'bundle') {
                    targets = [
                        ...formData.bundleConfig.buyItems.map(id => ({
                            target_type: 'Syarat',
                            item_type: id.startsWith('TRT-') || id.startsWith('PTR-') ? 'Treatment' : 'Produk',
                            item_id: Number(id.replace(/[^0-9]/g, ''))
                        })),
                        ...formData.bundleConfig.getItems.map(id => ({
                            target_type: 'Benefit',
                            item_type: id.startsWith('TRT-') || id.startsWith('PTR-') ? 'Treatment' : 'Produk',
                            item_id: Number(id.replace(/[^0-9]/g, ''))
                        }))
                    ];
                } else if (formData.promoMode === 'specific_item') {
                    targets = formData.itemDiscounts.map(item => ({
                        target_type: 'Spesifik',
                        item_type: item.id.startsWith('TRT-') || item.id.startsWith('PTR-') ? 'Treatment' : 'Produk',
                        item_id: Number(item.id.replace(/[^0-9]/g, '')),
                        nilai_diskon_spesifik: Number(item.discountValue)
                    }));
                } else {
                    targets = formData.targetItems.map(id => ({
                        target_type: 'Target',
                        item_type: id.startsWith('TRT-') || id.startsWith('PTR-') ? 'Treatment' : 'Produk',
                        item_id: Number(id.replace(/[^0-9]/g, ''))
                    }));
                }

                const payload = {
                    kategori: formData.category,
                    nama_promo: formData.name,
                    mode_promo: formData.promoMode,
                    tipe_diskon: formData.type.toLowerCase() === 'persen' ? 'persentase' : 'nominal',
                    nilai_diskon: formData.value ? Number(formData.value) : null,
                    min_order_amount: formData.minOrderAmount ? Number(formData.minOrderAmount) : null,
                    tanggal_mulai: formData.startDate,
                    tanggal_selesai: formData.endDate,
                    is_voucher_fisik: formData.isVoucher,
                    kode_promo: formData.isVoucher ? '' : formData.code,
                    kuota_global: formData.quota ? Number(formData.quota) : null,
                    status: 'Aktif', // Defaulting to Aktif, backend might override based on date
                    targets: targets,
                    jumlah_voucher: formData.isVoucher && formData.voucherCount ? Number(formData.voucherCount) : null
                };

                let res;
                if (isEdit) {
                    res = await promoAPI.update(user?.token, editingPromo.id, payload);
                } else {
                    res = await promoAPI.create(user?.token, payload);
                }
                
                if (res.success) {
                    showToast(res.message, 'success');
                    fetchPromos();
                    setIsModalOpen(false);
                    setEditingPromo(null);
                } else {
                    showToast(res.message, 'error');
                }
            }
        });
    };

    // Handler Hapus (Triggered dari tombol tong sampah)
    const handleOpenDelete = (promo) => {
        setConfirmConfig({
            icon: 'delete',
            header: 'Hapus Promo',
            message: `Tindakan ini permanen. Yakin ingin menghapus promo ${promo.code}?`,
            acceptLabel: 'Ya, Hapus',
            onAccept: async () => {
                showToast('Menghapus promo...', 'info');
                const res = await promoAPI.delete(user?.token, promo.id);
                if (res.success) {
                    showToast(`Promo ${promo.code || promo.name} telah dihapus.`, 'success');
                    fetchPromos();
                } else {
                    showToast(res.message, 'error');
                }
            }
        });
    };

    const handleCopyVouchers = (e, codesText) => {
        e.stopPropagation();
        try {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(codesText).then(() => {
                    showToast('Kode voucher berhasil disalin!', 'success');
                }).catch(() => {
                    fallbackCopyTextToClipboard(codesText);
                });
            } else {
                fallbackCopyTextToClipboard(codesText);
            }
        } catch (err) {
            fallbackCopyTextToClipboard(codesText);
        }
    };

    const fallbackCopyTextToClipboard = (text) => {
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            textArea.remove();
            if (successful) {
                showToast('Kode voucher berhasil disalin!', 'success');
            } else {
                showToast('Gagal menyalin kode voucher, gunakan browser terbaru', 'error');
            }
        } catch (err) {
            showToast('Gagal menyalin kode voucher', 'error');
        }
    };


    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            
            {/* Modal Form Tambah/Edit Eksternal */}
            <PromoFormModal 
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingPromo(null);
                    setDefaultCategory(null);
                }}
                onSave={handleSavePromo}
                initialData={editingPromo}
                defaultCategory={defaultCategory}
            />

            <PromoDetailModal 
                isOpen={!!detailPromo}
                promo={detailPromo}
                onClose={() => setDetailPromo(null)}
            />

            <ConfirmModal
                config={confirmConfig}
                onClose={() => setConfirmConfig(null)}
            />


            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Manajemen Promo</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm">Kelola diskon, voucher, dan penawaran spesial klinik</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button 
                        onClick={() => { setEditingPromo(null); setDefaultCategory(null); setIsModalOpen(true); }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-secondary px-6 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Buat Promo Baru</span>
                    </button>
                </div>
            </div>

            {/* Statistik Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Promo Aktif', value: promos.filter(p => p.status === 'Aktif').length, icon: Tag, trend: 'up' },
                    { label: 'Total Digunakan', value: promos.reduce((acc, curr) => acc + curr.used, 0), icon: CheckCircle2, trend: 'up' },
                    { label: 'Promo Berakhir', value: promos.filter(p => p.status === 'Berakhir').length, icon: XCircle, trend: 'down' }
                ].map((stat, idx) => (
                    <StatsCard 
                        key={idx} 
                        title={stat.label} 
                        value={stat.value} 
                        icon={stat.icon} 
                        trend={stat.trend} 
                    />
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2rem] md:rounded-[1rem] border border-primary/5 shadow-2xl shadow-primary/5">
                {/* Filter & Search */}
                <div className="relative z-50 p-4 md:p-8 border-b border-primary/5 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 bg-primary/5 rounded-t-[2rem] md:rounded-t-[1rem]">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari nama atau kode promo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-primary/5 outline-none text-primary placeholder:text-primary/20 font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                        />
                    </div>
                    <div className="w-full sm:w-48 relative z-50">
                        <CustomSelect
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: 'Semua Status', label: 'Semua Status' },
                                { value: 'Aktif', label: 'Aktif' },
                                { value: 'Draf', label: 'Draf' },
                                { value: 'Berakhir', label: 'Berakhir' }
                            ]}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <TableSkeleton rows={itemsPerPage} columns={6} />
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] border-b border-primary/5 bg-gray-50/30">
                                <th className="px-4 py-3 text-primary/80">Target Item ({user?.role?.includes('Treatment') ? 'Treatment' : 'Produk'})</th>
                                <th className="px-4 py-3 text-center text-primary/80">Nilai Diskon</th>
                                <th className="px-4 py-3 text-center text-primary/80">Masa Berlaku</th>
                                <th className="px-4 py-3 text-center text-primary/80">Kuota (Terpakai)</th>
                                <th className="px-4 py-3 text-center text-primary/80">Status</th>
                                <th className="px-4 py-3 text-right text-primary/80">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {currentPromos.map((promo) => (
                                <tr 
                                    key={promo.id} 
                                    className="border-b border-primary/5 last:border-0 hover:bg-primary/[0.02] transition-colors cursor-pointer"
                                    onClick={() => setDetailPromo(promo)}
                                >
                                    <td className="px-4 py-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                                                <Tag className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-black text-blue-600 text-[10px] uppercase tracking-[0.2em] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/50 flex items-center">
                                                        {promo.isVoucher ? `[${promo.generatedCodes?.length || 0} Voucher Fisik]` : promo.code}
                                                        {promo.isVoucher && (
                                                            <button 
                                                                onClick={(e) => {
                                                                    const codes = promo.generatedCodes.map(c => c.code).join('\n');
                                                                    handleCopyVouchers(e, codes);
                                                                }}
                                                                className="ml-2 p-1 text-blue-600/60 hover:text-blue-600 transition-all hover:bg-blue-100 rounded"
                                                                title="Copy semua kode voucher"
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="font-black text-primary text-sm tracking-tight mb-2 truncate">{promo.name}</div>
                                                
                                                <div className="flex flex-wrap gap-1.5 max-w-md">
                                                    {promo.promoMode === 'min_order' ? (
                                                        <span className="px-2 py-0.5 bg-yellow-50 border border-yellow-100 rounded text-[9px] font-bold text-yellow-600 whitespace-nowrap">
                                                            Min Belanja: Rp {Number(promo.minOrderAmount).toLocaleString('id-ID')}
                                                        </span>
                                                    ) : promo.promoMode === 'bundle' ? (
                                                        <div className="flex flex-col gap-1.5">
                                                            <span className="text-xs font-bold text-primary/60">Syarat: {promo.bundleConfig?.buyItems?.join(', ')}</span>
                                                            <span className="text-xs font-bold text-green-600">Benefit: {promo.bundleConfig?.getItems?.map(i => i.id).join(', ')}</span>
                                                        </div>
                                                    ) : promo.promoMode === 'specific_item' ? (
                                                        <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 rounded text-[9px] font-bold text-blue-600 whitespace-nowrap">
                                                            {promo.itemDiscounts?.length || 0} Item Spesifik
                                                        </span>
                                                    ) : promo.targetItems && promo.targetItems.length > 0 ? (
                                                        promo.targetItems.map(item => (
                                                            <span key={item} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs font-bold text-gray-600 whitespace-nowrap shadow-sm">
                                                                {item}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[9px] font-bold text-red-400 italic">Berlaku untuk semua</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className="font-medium text-primary text-sm">
                                            {promo.promoMode === 'specific_item' ? 'Bervariasi' :
                                             promo.promoMode === 'bundle' ? 'Bundle' :
                                             (promo.type === 'Persen' ? `${promo.value}%` : `Rp ${Number(promo.value).toLocaleString('id-ID')}`)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <p className="text-sm font-medium text-primary/80">{promo.startDate}</p>
                                        <p className="text-[9px] font-black text-primary/30 uppercase tracking-widest mt-0.5">S/D</p>
                                        <p className="text-sm font-medium text-primary/80">{promo.endDate}</p>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <div className="w-full bg-primary/5 rounded-full h-1.5 mb-1.5">
                                            <div className="bg-accent-gold h-1.5 rounded-full" style={{ width: `${(promo.used / promo.quota) * 100}%` }}></div>
                                        </div>
                                        <span className="text-sm font-medium text-primary">{promo.used} / {promo.quota}</span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`font-bold text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full shadow-sm border border-white/50 ${getStatusStyle(promo.status)}`}>
                                            {promo.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={(e) => { e.stopPropagation(); setEditingPromo(promo); setIsModalOpen(true); }} className="p-2.5 rounded-xl bg-white border border-primary/10 text-primary/50 hover:text-primary hover:border-primary/20 hover:shadow-md transition-all active:scale-95" title="Edit">
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleOpenDelete(promo); }} className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-400 hover:text-red-500 hover:bg-red-100 hover:shadow-md transition-all active:scale-95" title="Hapus">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-primary/5">
                    {currentPromos.map((promo) => (
                        <div 
                            key={promo.id} 
                            className="p-6 space-y-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setDetailPromo(promo)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center text-accent-gold border border-accent-gold/20 shrink-0">
                                        <Tag className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-blue-500 text-sm tracking-tight flex items-center gap-2">
                                            {promo.isVoucher ? `[${promo.generatedCodes?.length || 0} Voucher Fisik]` : promo.code}
                                            {promo.isVoucher && (
                                                <button 
                                                    onClick={(e) => {
                                                        const codes = promo.generatedCodes.map(c => c.code).join('\n');
                                                        handleCopyVouchers(e, codes);
                                                    }}
                                                    className="p-1 text-blue-600/60 hover:text-blue-600 transition-all hover:bg-blue-100 rounded"
                                                    title="Copy semua kode voucher"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="font-black text-primary text-xs mt-0.5">{promo.name}</div>
                                    </div>
                                </div>
                                <span className={`font-black text-[9px] tracking-widest uppercase px-2 py-1 rounded-md ${getStatusStyle(promo.status)}`}>
                                    {promo.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 bg-gray-50/50 p-4 rounded-2xl border border-primary/5">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-primary/30 uppercase tracking-widest leading-none">Nilai Diskon</p>
                                    <p className="text-sm font-black text-primary">
                                        {promo.promoMode === 'specific_item' ? 'Bervariasi' :
                                         promo.promoMode === 'bundle' ? 'Bundle' :
                                         (promo.type === 'Persen' ? `${promo.value}%` : `Rp ${Number(promo.value).toLocaleString('id-ID')}`)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-primary/30 uppercase tracking-widest leading-none">Kuota (Pakai)</p>
                                    <p className="text-sm font-black text-primary/60">{promo.used} / {promo.quota}</p>
                                </div>
                                <div className="col-span-2 pt-2 border-t border-primary/5 flex justify-between items-center">
                                    <div className="space-y-0.5">
                                        <p className="text-[8px] font-black text-primary/30 uppercase tracking-widest leading-none">Masa Berlaku</p>
                                        <p className="text-[10px] font-bold text-primary/60">{promo.startDate} - {promo.endDate}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setEditingPromo(promo); setIsModalOpen(true); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-primary/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all active:scale-95 shadow-sm"
                                >
                                    <Edit3 className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleOpenDelete(promo); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-sm"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredPromos.length === 0 && (
                        <div className="p-12 text-center text-primary/20 font-black uppercase text-[10px] tracking-widest">
                            Tidak ada data promo
                        </div>
                    )}
                </div>
                    </>
                )}


                <div className="relative z-10 p-6 md:p-8 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40 bg-secondary/5 rounded-b-[2rem] md:rounded-b-[1rem]">
                    <span>Menampilkan {filteredPromos.length === 0 ? 0 : indexOfFirstItem + 1} hingga {Math.min(indexOfLastItem, filteredPromos.length)} dari {filteredPromos.length} data</span>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            </div>
        </div>
    );
};

export default PromoManagementPage;