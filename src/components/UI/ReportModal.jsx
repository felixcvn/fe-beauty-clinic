import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon as X, DocumentTextIcon as FileText, ArrowDownTrayIcon as Download, PrinterIcon as Printer } from '@heroicons/react/24/outline';

const ReportModal = ({ isOpen, onClose, data, type = 'patient' }) => {
    const reportRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    if (!isOpen) return null;

    const handleDownloadPDF = async () => {
        setIsDownloading(true);

        try {
            // Load heavy libraries dynamically only when needed
            const html2canvasModule = await import('html2canvas');
            const html2canvas = html2canvasModule.default || html2canvasModule;
            const jsPDFModule = await import('jspdf');
            const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF || jsPDFModule;

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
                    scale: 3,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: '#ffffff',
                    logging: false,
                    imageTimeout: 15000,
                    onclone: (clonedDoc) => {
                        // Pastikan semua gambar dalam container kloning sudah terload
                        const imgs = clonedDoc.querySelectorAll('img');
                        return Promise.all(Array.from(imgs).map(img => {
                            if (img.complete) return Promise.resolve();
                            return new Promise(resolve => {
                                img.onload = resolve;
                                img.onerror = resolve;
                            });
                        }));
                    }
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
                                 <div className="border-b-4 border-double border-[#1B4D3E] pb-4 mb-8 text-center flex flex-col items-center">
                                     <div className="flex items-center gap-4 justify-center">
                                         <div className="w-16 h-16 rounded-full overflow-hidden border border-[#1B4D3E] flex items-center justify-center bg-white shrink-0">
                                             <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1 rounded-full" crossOrigin="anonymous" />
                                         </div>
                                         <div className="text-left">
                                             <h1 className="text-3xl font-serif font-bold tracking-tight text-[#1B4D3E] leading-none">Personal Beauty</h1>
                                             <p className="text-[10px] font-sans font-medium text-[#1B4D3E] tracking-wider mt-1">your skin beauty solution</p>
                                         </div>
                                     </div>
                                     <p className="text-[11px] font-medium text-[#1B4D3E] mt-3">
                                         Jalan Kalimantan Nomor 64 C Jember
                                     </p>
                                 </div>



                                 {/* Patient Info Table */}
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                     <div className="space-y-4">
                                         <div>
                                             <h4 className="text-[10px] font-black uppercase tracking-widest text-[#a4bfb7] mb-1">Nama Pasien</h4>
                                             <p className="text-sm font-bold border-b border-[#e9efed] pb-2 text-[#1B4D3E]">{data.patientDetails?.name || data.patientDetails?.Nama_pasien || data.patientDetails?.nama_pasien || '-'}</p>
                                         </div>
                                         <div>
                                             <h4 className="text-[10px] font-black uppercase tracking-widest text-[#a4bfb7] mb-1">Nomor HP</h4>
                                             <p className="text-sm font-bold border-b border-[#e9efed] pb-2 text-[#1B4D3E]">{data.patientDetails?.noTelepon || data.patientDetails?.no_Telp || data.patientDetails?.no_telp || data.patientDetails?.phone || '-'}</p>
                                         </div>
                                         <div>
                                             <h4 className="text-[10px] font-black uppercase tracking-widest text-[#a4bfb7] mb-1">Alamat</h4>
                                             <p className="text-sm font-bold border-b border-[#e9efed] pb-2 text-[#1B4D3E]">{data.patientDetails?.alamat || data.patientDetails?.Alamat || data.patientDetails?.address || '-'}</p>
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

                                     {(() => {
                                         const getProductsStr = () => {
                                             if (data.reseps && data.reseps.length > 0) {
                                                 return data.reseps.map(r => r.stok_produk?.Nama_produk || r.Nama_produk || r.name || 'Produk').join(', ');
                                             }
                                             if (data.produks && data.produks.length > 0) {
                                                 return data.produks.map(r => r.stok_produk?.Nama_produk || r.Nama_produk || r.name || 'Produk').join(', ');
                                             }
                                             return '';
                                         };
                                         const productsStr = getProductsStr();
                                         const racikanStr = data.racikan || '';

                                         if (!productsStr && !racikanStr) return null;

                                         return (
                                             <div className="space-y-4 pt-6 border-t border-[#e9efed]">
                                                 <h4 className="text-[10px] font-black uppercase tracking-widest text-[#a4bfb7]">Rekomendasi Produk & Racikan</h4>
                                                 <div className="bg-[#f8faf9] p-6 rounded-2xl border border-[#e9efed] space-y-4">
                                                     {productsStr && (
                                                         <div>
                                                             <h5 className="text-[9px] font-black uppercase tracking-widest text-[#779e93] mb-1">Produk / Obat</h5>
                                                             <p className="text-sm font-bold text-[#1B4D3E]">{productsStr}</p>
                                                         </div>
                                                     )}
                                                     {racikanStr && (
                                                         <div>
                                                             <h5 className="text-[9px] font-black uppercase tracking-widest text-[#779e93] mb-1">Resep Racikan</h5>
                                                             <p className="text-sm font-medium italic text-[#1B4D3E]">"{racikanStr}"</p>
                                                         </div>
                                                     )}
                                                 </div>
                                             </div>
                                         );
                                     })()}
                                 </div>
                             </div>

                             {/* PAGE 2: PHOTOS & SIGNATURE */}
                             <div id="report-page-2" className="bg-white">
                                 {/* Treatment Photos */}
                                 {(data.beforeImage || data.afterImage) && (
                                     <div className="pt-8 border-t border-[#e9efed]">
                                         <h4 className="text-[10px] font-black uppercase tracking-widest text-[#a4bfb7] mb-4">Dokumentasi Foto</h4>
                                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                             {data.beforeImage && (
                                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                     <p style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', color: '#a4bfb7', margin: 0 }}>Kondisi Sebelum</p>
                                                     <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid #e9efed', background: '#f8faf9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                         <img src={data.beforeImage} alt="Before" crossOrigin="anonymous" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '10px' }} />
                                                     </div>
                                                 </div>
                                             )}
                                             {data.afterImage && (
                                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                     <p style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', color: '#a4bfb7', margin: 0 }}>Kondisi Sesudah</p>
                                                     <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid #e9efed', background: '#f8faf9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                         <img src={data.afterImage} alt="After" crossOrigin="anonymous" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '10px' }} />
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
