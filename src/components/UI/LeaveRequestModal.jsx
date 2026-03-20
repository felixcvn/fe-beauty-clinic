import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, FileText, Send, CalendarDays, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';

const LeaveRequestModal = ({ isOpen, onClose, onSubmit }) => {
    const { showToast } = useToast();
    const [leaveType, setLeaveType] = useState('Sakit');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!startDate || !endDate || !reason) {
            showToast('Harap lengkapi semua form!', 'error');
            return;
        }

        const isCuti = leaveType.includes('Cuti');
        
        if (isCuti) {
            const start = new Date(startDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const diffTime = start.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 7) {
                showToast('Tidak bisa melakukan pengajuan cuti. Minimal pengajuan H-7.', 'error');
                return;
            }
        }

        onSubmit({ leaveType, startDate, endDate, reason });
        
        // Don't close immediately, show success guidance
        setIsSubmitted(true);
        
        // Reset form for next time
        setLeaveType('Sakit');
        setStartDate('');
        setEndDate('');
        setReason('');
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30"
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
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">Pengajuan Cuti</h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">Formulir Permohonan Izin / Cuti</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="p-8 border-t-[0.5px] border-primary/5">
                    {isSubmitted ? (
                        <div className="text-center py-6 animate-fade-in">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h4 className="text-xl font-black text-primary mb-3">Pengajuan Terkirim!</h4>
                            <p className="text-sm font-bold text-primary/60 leading-relaxed mb-8 px-4">
                                Harap menunggu persetujuan HRD. Jikalau tidak ada balasan, bisa menghubungi atau bertemu langsung dengan HRD.
                            </p>
                            <button
                                onClick={() => {
                                    setIsSubmitted(false);
                                    onClose();
                                }}
                                className="w-full py-4 bg-primary text-secondary rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                            >
                                Selesai
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Jenis Cuti</label>
                                <CustomSelect 
                                    value={leaveType}
                                    onChange={setLeaveType}
                                    options={[
                                        { value: 'Sakit', label: 'Sakit' },
                                        { value: 'Cuti Tahunan', label: 'Cuti Tahunan' },
                                        { value: 'Cuti Menikah', label: 'Cuti Menikah' },
                                        { value: 'Cuti Melahirkan', label: 'Cuti Melahirkan' },
                                        { value: 'Izin Lainnya', label: 'Izin Lainnya' }
                                    ]}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <CustomDatePicker
                                    label="Tanggal Mulai"
                                    value={startDate}
                                    onChange={setStartDate}
                                    className="w-full"
                                />
                                <CustomDatePicker
                                    label="Tanggal Selesai"
                                    value={endDate}
                                    onChange={setEndDate}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Alasan Terperinci</label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-4 w-4 h-4 text-primary/30" />
                                    <textarea 
                                        placeholder="Jelaskan alasan pengajuan cuti anda..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        rows={3}
                                        className="w-full pl-10 pr-4 py-4 rounded-2xl bg-secondary/20 border border-primary/5 outline-none text-primary font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 mt-4"
                            >
                                <Send className="w-4 h-4" />
                                Kirim Pengajuan
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    , document.body);
};

export default LeaveRequestModal;
