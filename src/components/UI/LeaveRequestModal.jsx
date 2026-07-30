import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon as X, CalendarIcon as Calendar, DocumentTextIcon as FileText, PaperAirplaneIcon as Send, CalendarDaysIcon as CalendarDays, CheckCircleIcon as CheckCircle2, ArrowUpTrayIcon as Upload, PaperClipIcon as Paperclip, PhotoIcon as ImageIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../context/ToastContext';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';
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

const LeaveRequestModal = ({ isOpen, onClose, onSubmit }) => {
    const { showToast } = useToast();
    const [confirmConfig, setConfirmConfig] = useState(null);
    const [leaveType, setLeaveType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [attachmentBase64, setAttachmentBase64] = useState(null);
    const [attachmentName, setAttachmentName] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const todayStr = getTodayString();
    const formRef = useRef(null);
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const newErrors = {};
        if (!leaveType) newErrors.leaveType = 'Pilih jenis cuti/izin terlebih dahulu';
        if (!startDate) newErrors.startDate = 'Tanggal mulai wajib diisi';
        if (!endDate) newErrors.endDate = 'Tanggal selesai wajib diisi';
        if (!reason.trim()) newErrors.reason = 'Alasan wajib diisi';

        if (leaveType) {
            const isCuti = leaveType.includes('Cuti');
            if (isCuti && startDate) {
                const start = new Date(startDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const diffTime = start.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays < 7) {
                    newErrors.startDate = 'Tidak bisa melakukan pengajuan cuti. Minimal pengajuan H-7.';
                }
            }
            if (leaveType === 'Sakit' && !attachmentBase64) {
                newErrors.attachment = 'Harap upload surat keterangan sakit!';
            }
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            setTimeout(() => {
                const firstErrorEl = formRef.current?.querySelector('.text-red-500');
                if (firstErrorEl) {
                    firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 50);
            return;
        }

        try {
            const success = await onSubmit({ 
                leaveType, 
                startDate, 
                endDate, 
                reason, 
                attachment: attachmentBase64 
            });
            
            if (success) {
                setIsSubmitted(true);
                // Reset form for next time
                setLeaveType('');
                setStartDate('');
                setEndDate('');
                setReason('');
                setAttachmentBase64(null);
                setAttachmentName(null);
                setErrors({});
            }
        } catch (error) {
            console.error(error);
        }
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
            onClick={handleRequestClose}
        >
            <div 
                className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >

                <button
                    type="button"
                    onClick={handleRequestClose}
                    className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/40 hover:scale-105 active:scale-95 transition-all z-[60] shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>


                {/* Header */}
                <div className="relative p-8 pb-6 bg-primary overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full animate-[pulse_4s_infinite]" style={{ background: 'radial-gradient(circle, #E5D5B0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>

                    <div className="relative z-10 flex items-center gap-4 pr-12">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-secondary backdrop-blur-sm border border-white/10">
                            <CalendarDays className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">Pengajuan Cuti</h3>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-2">Formulir Permohonan Izin / Cuti</p>
                        </div>
                    </div>
                </div>

                {/* Form Body - Scrollable */}
                <div className="p-8 overflow-y-auto scrollbar-hide flex-1 bg-gray-50/30">

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
                        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Jenis Cuti</label>
                                <CustomSelect 
                                    value={leaveType}
                                    onChange={(val) => { setLeaveType(val); if (errors.leaveType) setErrors(prev => ({ ...prev, leaveType: null })); }}
                                    placeholder="Pilih jenis cuti/izin..."
                                    options={[
                                        { value: 'Sakit', label: 'Sakit' },
                                        { value: 'Cuti', label: 'Cuti' }
                                    ]}
                                />
                                {errors.leaveType && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.leaveType}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <CustomDatePicker
                                        label="Tanggal Mulai"
                                        value={startDate}
                                        onChange={(val) => { setStartDate(val); if (errors.startDate) setErrors(prev => ({ ...prev, startDate: null })); }}
                                        className="w-full"
                                        minDate={todayStr}
                                    />
                                    {errors.startDate && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.startDate}</p>}
                                </div>
                                <div>
                                    <CustomDatePicker
                                        label="Tanggal Selesai"
                                        value={endDate}
                                        onChange={(val) => { setEndDate(val); if (errors.endDate) setErrors(prev => ({ ...prev, endDate: null })); }}
                                        className="w-full"
                                        minDate={startDate || todayStr}
                                    />
                                    {errors.endDate && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.endDate}</p>}
                                </div>
                            </div>


                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Alasan Terperinci</label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-4 w-4 h-4 text-primary/30" />
                                    <textarea 
                                        placeholder="Jelaskan alasan pengajuan cuti anda..."
                                        value={reason}
                                        onChange={(e) => { setReason(e.target.value); if (errors.reason) setErrors(prev => ({ ...prev, reason: null })); }}
                                        rows={3}
                                        className={`w-full pl-10 pr-4 py-4 rounded-2xl bg-white border ${errors.reason ? 'border-red-400 focus:ring-red-400/20' : 'border-primary/5 focus:ring-primary/5'} outline-none text-primary font-medium text-sm focus:ring-4 transition-all shadow-sm resize-none`}
                                    />
                                </div>
                                {errors.reason && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.reason}</p>}
                            </div>

                            {leaveType === 'Sakit' && (
                                <div className="space-y-2 animate-fade-in">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1 italic flex items-center gap-1.5">
                                        <Paperclip className="w-3 h-3" />
                                        Wajib Upload Surat Sakit
                                    </label>
                                    <div className="relative group cursor-pointer">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setAttachmentName(file.name);
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setAttachmentBase64(reader.result);
                                                        if (errors.attachment) setErrors(prev => ({ ...prev, attachment: null }));
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className={`p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 ${attachmentName ? 'border-primary bg-primary/5' : errors.attachment ? 'border-red-400 bg-red-50/30' : 'border-primary/10 bg-secondary/5 group-hover:border-primary/20'}`}>
                                            {attachmentName ? (
                                                <>
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <ImageIcon className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-black text-primary truncate max-w-[200px]">{attachmentName}</p>
                                                        <p className="text-[8px] font-bold text-primary/30 uppercase mt-1">Ketuk untuk ganti file</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-6 h-6 text-primary/20 group-hover:text-primary/40 transition-colors" />
                                                    <p className="text-[10px] font-black text-primary/30 uppercase tracking-[0.15em]">Klik untuk Upload Foto Surat</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {errors.attachment && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.attachment}</p>}
                                </div>
                            )}

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
                <ConfirmModal
                    config={confirmConfig}
                    onClose={() => setConfirmConfig(null)}
                />
            </div>
        </div>
    , document.body);
};

export default LeaveRequestModal;
