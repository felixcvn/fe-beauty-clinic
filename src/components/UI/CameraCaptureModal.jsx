import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CameraIcon as Camera, XMarkIcon as X, CheckCircleIcon as CheckCircle2, ExclamationCircleIcon as AlertCircle, ArrowPathIcon as Loader2 } from '@heroicons/react/24/outline';

const CameraCaptureModal = ({ isOpen, onClose, onCapture, facingMode = 'environment' }) => {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [scanStatus, setScanStatus] = useState('initializing'); // 'initializing', 'ready', 'error'
    const [cameraError, setCameraError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isOpen, facingMode]);

    const startCamera = async () => {
        try {
            setScanStatus('initializing');
            setCameraError(null);
            
            // Allow multiple attempts if environment is not available
            let constraints = { video: { facingMode: facingMode } };
            
            try {
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                handleStream(stream);
            } catch (err) {
                // Fallback to any camera if the requested facingMode is not available
                if (facingMode === 'environment') {
                    const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    handleStream(fallbackStream);
                } else {
                    throw err;
                }
            }
        } catch (err) {
            console.error("Camera access error:", err);
            // Handle if navigator.mediaDevices is undefined (HTTP issue)
            if (!navigator.mediaDevices) {
                alert("Kamera diblokir: Browser mewajibkan koneksi HTTPS (Secure) atau localhost untuk mengakses kamera di perangkat mobile.");
            }
            setCameraError(err.message || 'Kamera tidak dapat diakses');
            setScanStatus('error');
        }
    };

    const handleStream = (stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
        setScanStatus('ready');
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const takePicture = () => {
        if (!videoRef.current) return;

        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        // Don't mirror for environment camera, but maybe mirror for user camera
        if (facingMode === 'user') {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to File object
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
                // We also pass a data URL for immediate preview
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                onCapture(file, dataUrl);
                stopCamera();
                onClose();
            }
        }, 'image/jpeg', 0.8);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-primary/20 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div 
                className="relative w-full max-w-lg bg-white rounded-card md:rounded-[2.5rem] shadow-2xl border border-primary/5 overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 md:p-6 border-b border-primary/5 flex justify-between items-center bg-secondary/10 shrink-0">
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-primary tracking-tighter leading-none">
                            Ambil Foto
                        </h3>
                        <p className="text-[9px] md:text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] mt-2">
                            Posisikan objek dengan jelas
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 md:p-3 rounded-2xl bg-white border border-primary/5 text-primary/30 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Camera View */}
                <div className="p-5 md:p-8 flex-1 overflow-y-auto scrollbar-hide bg-gray-50/50">
                    <div className={`relative aspect-[3/4] sm:aspect-square mx-auto w-full max-w-sm rounded-[1.5rem] md:rounded-card bg-secondary/20 border-4 border-primary/5 overflow-hidden group shadow-inner`}>
                        {/* Video Feed */}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                        />

                        {/* Error Overlay */}
                        {scanStatus === 'error' && (
                            <div className="absolute inset-0 bg-red-500/90 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-fade-in p-6 text-center">
                                <AlertCircle className="w-12 h-12 md:w-16 md:h-16 mb-4" />
                                <h4 className="text-lg md:text-xl font-black">Akses Kamera Gagal</h4>
                                <p className="px-4 mt-2 text-xs md:text-sm font-medium opacity-80">{cameraError}</p>
                                <button
                                    onClick={startCamera}
                                    className="mt-6 px-6 py-2.5 bg-white text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        )}

                        {/* Initializing Overlay */}
                        {scanStatus === 'initializing' && (
                            <div className="absolute inset-0 bg-secondary flex flex-col items-center justify-center text-primary/40">
                                <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin mb-4" />
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Menyiapkan Kamera...</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-6 md:mt-8">
                        {scanStatus === 'ready' && (
                            <button
                                onClick={takePicture}
                                className="w-full flex justify-center items-center py-4 bg-primary text-secondary rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                            >
                                <Camera className="w-5 h-5 mr-3" />
                                Jepret Foto
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    , document.body);
};

export default CameraCaptureModal;
