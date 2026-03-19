import React from 'react';
import { createPortal } from 'react-dom';
import { X, CalendarDays, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const LeaveApprovalModal = ({ isOpen, onClose, requestData, onUpdateStatus }) => {
    const { showToast } = useToast();

    if (!isOpen || !requestData) return null;

    const handleApprove = () => {
        onUpdateStatus(requestData.id, 'Disetujui');
        showToast('Pengajuan cuti disetujui.', 'success');
        onClose();
    };

    const handleReject = () => {
        onUpdateStatus(requestData.id, 'Ditolak');
        showToast('Pengajuan cuti ditolak.', 'error');
        onClose();
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative p-8 pb-6 bg-primary overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-secondary backdrop-blur-sm border border-white/10">
                            <CalendarDays className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">Persetujuan Cuti</h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">Detail Pengajuan</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 border-t-[0.5px] border-primary/5 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Nama Pegawai</p>
                            <p className="text-sm font-bold text-primary">{requestData.staffName} <span className="text-xs text-primary/40 font-semibold">({requestData.role})</span></p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Jenis</p>
                                <p className="text-sm font-bold text-primary">{requestData.type}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Tanggal</p>
                                <p className="text-sm font-bold text-primary">{requestData.startDate} <br/>s/d<br/> {requestData.endDate}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Alasan Terperinci</p>
                            <div className="p-4 rounded-2xl bg-secondary/20 border border-primary/5 text-sm font-bold text-primary/80">
                                {requestData.reason}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-primary/5">
                        <button
                            onClick={handleReject}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-500 py-4 rounded-2xl hover:bg-red-500 hover:text-white transition-all font-black text-xs uppercase tracking-widest"
                        >
                            <XCircle className="w-4 h-4" />
                            Tolak
                        </button>
                        <button
                            onClick={handleApprove}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-600 py-4 rounded-2xl hover:bg-green-500 hover:text-white transition-all font-black text-xs uppercase tracking-widest"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Setujui
                        </button>
                    </div>
                </div>
            </div>
        </div>
    , document.body);
};

export default LeaveApprovalModal;
