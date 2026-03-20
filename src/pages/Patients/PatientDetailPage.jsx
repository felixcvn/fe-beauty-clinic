import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, FileText, Gift } from 'lucide-react';

const PatientDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('produk');

    const patientDetail = {
        name: "ALIFIAH AYU TIARA (TIARA)",
        tier: "GOLD",
        noMember: "1001212239409",
        noRM: "AL-0989/L-000056",
        noIdentitas: "3509196809000005",
        tanggalLahir: "28 September 2000"
    };

    const pointHistory = [
        { date: "2024-01-01", desc: "Penyesuaian Point akhir tahun", change: 0, total: 0 },
        { date: "2023-12-11", desc: "Perolehan point dari treatment #PB-2311091011", change: 1, total: 8 }
    ];

    const productHistory = [
        { id: "PBL-20260123008", date: "2026-01-23", total: 189687, items: ["PAKET 5IN1 BRIGHTENING SET"] },
        { id: "PBL-20240827013", date: "2024-08-27", total: 105915, items: ["AHA BODY CREAM"] }
    ];

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            {/* Header & Back Button */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-3 rounded-2xl bg-white border border-primary/5 shadow-sm hover:scale-105 active:scale-95 transition-all text-primary"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-primary tracking-tighter leading-none">Detail Pasien</h2>
                    <p className="text-primary/40 mt-1 font-bold text-xs uppercase tracking-widest">Informasi Lengkap & Riwayat Transaksi</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* KOLOM KIRI: Identitas & Poin */}
                <div className="space-y-6">
                    {/* Kartu Profil */}
                    <div className="bg-white rounded-[2rem] border border-primary/5 shadow-xl shadow-primary/5 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        
                        <div className="text-center mb-8 relative z-10">
                            <h3 className="text-xl font-black text-primary">{patientDetail.name}</h3>
                            <span className="inline-block mt-2 px-4 py-1.5 bg-accent-gold/10 text-accent-gold text-[10px] font-black uppercase tracking-widest rounded-full">
                                {patientDetail.tier} MEMBER
                            </span>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">No Member</p>
                                    <p className="font-bold text-primary text-sm text-teal-500">{patientDetail.noMember}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">No RM</p>
                                    <p className="font-bold text-primary text-sm text-teal-500">{patientDetail.noRM}</p>
                                </div>
                            </div>
                            <div className="h-px w-full bg-primary/5" />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">No. Identitas</p>
                                    <p className="font-bold text-primary text-sm text-teal-500">{patientDetail.noIdentitas}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Tanggal Lahir</p>
                                    <p className="font-bold text-primary text-sm text-teal-500">{patientDetail.tanggalLahir}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kartu Poin */}
                    <div className="bg-white rounded-[2rem] border border-primary/5 shadow-xl shadow-primary/5 overflow-hidden">
                        <div className="p-6 border-b border-primary/5 flex justify-between items-center">
                            <h3 className="text-lg font-black text-primary flex items-center gap-2">
                                <Gift className="w-5 h-5 text-accent-gold" />
                                Riwayat Point
                            </h3>
                            <span className="text-xs font-black text-primary/60">Total Point: <span className="text-accent-gold">0</span></span>
                        </div>
                        <div className="p-6 space-y-4">
                            {pointHistory.map((pt, index) => (
                                <div key={index} className="flex justify-between items-start gap-4 text-xs font-bold border-b border-primary/5 pb-4 last:border-0 last:pb-0">
                                    <div className="text-teal-500 shrink-0">{pt.date}</div>
                                    <div className="flex-1 text-primary/60">{pt.desc} ({pt.change})</div>
                                    <div className="text-primary font-black shrink-0">({pt.total})</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* KOLOM KANAN: Riwayat Transaksi */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] border border-primary/5 shadow-xl shadow-primary/5 overflow-hidden flex flex-col h-full">
                    <div className="flex items-center justify-between border-b border-primary/5 p-4 md:p-6 bg-primary/5">
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setActiveTab('produk')}
                                className={`px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'produk' ? 'bg-primary text-secondary shadow-lg' : 'text-primary/40 hover:bg-white'}`}
                            >
                                Riwayat Produk
                            </button>
                            <button 
                                onClick={() => setActiveTab('treatment')}
                                className={`px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'treatment' ? 'bg-primary text-secondary shadow-lg' : 'text-primary/40 hover:bg-white'}`}
                            >
                                Riwayat Treatment
                            </button>
                        </div>
                    </div>

                    <div className="p-6 flex-1 bg-gray-50/50 space-y-6">
                        {activeTab === 'produk' ? (
                            productHistory.map((trx, index) => (
                                <div key={index} className="bg-white rounded-2xl border border-primary/5 shadow-sm overflow-hidden">
                                    <div className="bg-teal-600 px-4 py-2 text-white font-black text-[10px] tracking-widest inline-block rounded-br-2xl mb-2">
                                        {trx.id}
                                    </div>
                                    <div className="p-5 pt-0">
                                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-primary/5">
                                            <span className="font-bold text-primary/60 text-sm">Total Order: Rp {trx.total.toLocaleString('id-ID')}</span>
                                            <span className="flex items-center gap-1.5 text-xs text-primary/40 font-bold"><Calendar className="w-3.5 h-3.5" /> {trx.date}</span>
                                        </div>
                                        <ul className="space-y-2">
                                            {trx.items.map((item, idx) => (
                                                <li key={idx} className="flex justify-between items-center text-sm font-bold text-primary">
                                                    <span>{item}</span>
                                                    <span className="text-teal-500">1</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-primary/30">
                                <FileText className="w-12 h-12 mb-3" />
                                <p className="font-bold text-sm tracking-wide">Belum ada riwayat treatment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDetailPage;