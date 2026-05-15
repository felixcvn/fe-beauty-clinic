import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Download, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ReportModal = ({ isOpen, onClose, data, type = 'patient' }) => {
    const reportRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    if (!isOpen) return null;

    const handleDownloadPDF = async () => {
        setIsDownloading(true);

        try {
            // A4 dimensions in mm
            const pdfWidth = 210;
            const pdfHeight = 297;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const captureSection = async (elementId, pageNumber) => {
                const element = document.getElementById(elementId);
                if (!element) return;

                // Create a temporary container to render the section off-screen
                const container = document.createElement('div');
                container.style.width = '800px';
                container.style.position = 'absolute';
                container.style.left = '-9999px';
                container.style.top = '0';
                container.style.background = '#ffffff';
                container.style.padding = '40px'; // Add some padding for the PDF
                
                const clone = element.cloneNode(true);
                container.appendChild(clone);
                document.body.appendChild(container);

                const canvas = await html2canvas(container, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: '#ffffff',
                    logging: false
                });

                document.body.removeChild(container);

                const imgData = canvas.toDataURL('image/png');
                const imgHeight = (canvas.height * pdfWidth) / canvas.width;

                if (pageNumber > 1) pdf.addPage();
                
                // Add the captured section to the PDF
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            };

            // Capture Page 1 (Info & Notes)
            await captureSection('report-page-1', 1);
            
            // Capture Page 2 (Photos & Signature)
            await captureSection('report-page-2', 2);

            pdf.save(`Medical_Report_${data?.patientDetails?.name || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert(`Failed to generate PDF: ${error.message}`);
        } finally {
            setIsDownloading(false);
        }
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="p-6 border-b border-secondary-dark/10 flex justify-between items-center bg-secondary-light/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-primary">Medical Report</h3>
                            <p className="text-sm text-primary-light">Generated on {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-secondary-dark/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-primary-light" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-10 overflow-y-auto bg-white" ref={reportRef}>
                    {type === 'patient' && data ? (
                        <div className="max-w-2xl mx-auto space-y-8 text-[#1B4D3E]">
                            
                            {/* PAGE 1: HEADER & CLINICAL INFO */}
                            <div id="report-page-1" className="bg-white">
                                {/* Letterhead (Kop Surat) */}
                                <div className="border-b-4 border-double border-[#1B4D3E] pb-6 mb-8 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-[#e9efed] bg-white flex items-center justify-center p-2">
                                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" crossOrigin="anonymous" />
                                        </div>
                                        <div className="space-y-1">
                                            <h1 className="text-3xl font-black uppercase tracking-tighter text-[#1B4D3E]">Personal Beauty</h1>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#779e93]">Aesthetics & Wellness Clinic</p>
                                            <p className="text-[11px] font-medium leading-tight text-[#446d60] max-w-[280px]">
                                                Jl. Kalimantan No. 123, Jember, Jawa Timur<br />
                                                Telp: (0331) 123456 | WA: +62 812-3456-7890<br />
                                                Email: info@personalbeauty.id
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <div className="text-[10px] font-black uppercase tracking-widest bg-[#f4f7f6] px-4 py-2 rounded-lg inline-block border border-[#e9efed] text-[#1B4D3E]">
                                            Surat Keterangan Medis
                                        </div>
                                    </div>
                                </div>

                                {/* Report Header */}
                                <div className="text-center space-y-2 mb-10">
                                    <h2 className="text-xl font-black uppercase tracking-widest underline decoration-2 underline-offset-8 text-[#1B4D3E]">LAPORAN REKAM MEDIS</h2>
                                    <p className="text-xs font-bold text-[#779e93]">Nomor: RM/{new Date().getFullYear()}/{data.id?.toString().slice(-4) || '0000'}</p>
                                </div>

                                {/* Patient Info Table */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#a4bfb7] mb-1">Nama Pasien</h4>
                                            <p className="text-sm font-bold border-b border-[#e9efed] pb-2 text-[#1B4D3E]">{data.patientDetails?.name || '-'}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#a4bfb7] mb-1">ID Pasien</h4>
                                            <p className="text-sm font-bold border-b border-[#e9efed] pb-2 text-[#1B4D3E]">{data.patientDetails?.id ? (data.patientDetails.id.length > 15 ? data.patientDetails.id.slice(0, 15) + '...' : data.patientDetails.id) : '-'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#a4bfb7] mb-1">Tanggal Kunjungan</h4>
                                            <p className="text-sm font-bold border-b border-[#e9efed] pb-2 text-[#1B4D3E]">{data.date || '-'}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#a4bfb7] mb-1">Dokter Pemeriksa</h4>
                                            <p className="text-sm font-bold border-b border-[#e9efed] pb-2 text-[#1B4D3E]">{data.specialist || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Treatment Details */}
                                <div className="mt-10 space-y-6 pb-10">
                                    <div className="bg-[#f4f7f6] p-6 rounded-2xl border border-[#e9efed]">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#779e93] mb-3">Tindakan / Perawatan</h4>
                                        <p className="text-base font-bold text-[#1B4D3E]">{data.treatment || 'General Checkup'}</p>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#a4bfb7]">Diagnosa & Catatan Medis</h4>
                                        <div className="min-h-[120px] p-6 rounded-2xl border border-dashed border-[#d1dfdb] text-sm leading-relaxed italic text-[#446d60]">
                                            "{data.notes || 'Tidak ada catatan medis tambahan untuk sesi ini.'}"
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* PAGE 2: PHOTOS & SIGNATURE */}
                            <div id="report-page-2" className="bg-white">
                                {/* Treatment Photos */}
                                {(data.beforeImage || data.afterImage) && (
                                    <div className="pt-8 border-t border-[#e9efed]">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#a4bfb7] mb-4">Dokumentasi Foto</h4>
                                        <div className="grid grid-cols-2 gap-8">
                                            {data.beforeImage && (
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-center text-[#a4bfb7]">Kondisi Sebelum</p>
                                                    <div className="aspect-square rounded-2xl overflow-hidden border-2 border-[#f4f7f6] shadow-sm bg-[#f4f7f6]">
                                                        <img src={data.beforeImage} alt="Before" className="w-full h-full object-cover" crossOrigin="anonymous" />
                                                    </div>
                                                </div>
                                            )}
                                            {data.afterImage && (
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-center text-[#a4bfb7]">Kondisi Sesudah</p>
                                                    <div className="aspect-square rounded-2xl overflow-hidden border-2 border-[#f4f7f6] shadow-sm bg-[#f4f7f6]">
                                                        <img src={data.afterImage} alt="After" className="w-full h-full object-cover" crossOrigin="anonymous" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Signature Area */}
                                <div className="pt-16 flex justify-end">
                                    <div className="text-center space-y-20 min-w-[200px]">
                                        <div>
                                            <p className="text-[11px] font-medium text-[#779e93]">Jember, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            <p className="text-xs font-bold uppercase tracking-widest text-[#1B4D3E]">Dokter Pemeriksa,</p>
                                        </div>
                                        <div className="space-y-1 border-t border-[#d1dfdb] pt-4">
                                            <p className="text-sm font-black uppercase tracking-tight text-[#1B4D3E]">{data.specialist || 'Tenaga Medis'}</p>
                                            <p className="text-[9px] font-bold text-[#a4bfb7] uppercase tracking-widest">SIP: 123/PB-CLINIC/IX/{new Date().getFullYear()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-[#f4f7f6] rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-[#d1dfdb]" />
                            </div>
                            <p className="text-[#a4bfb7] font-bold uppercase text-[10px] tracking-widest">Memuat laporan...</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-secondary-dark/10 bg-secondary-light/30 flex justify-end gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-secondary-dark/20 rounded-lg text-primary font-medium hover:bg-white transition-colors">
                        <Printer className="w-4 h-4" /> Print
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-secondary rounded-lg font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {isDownloading ? (
                            <>Generating...</>
                        ) : (
                            <>
                                <Download className="w-4 h-4" /> Download PDF
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    , document.body);
};

export default ReportModal;
