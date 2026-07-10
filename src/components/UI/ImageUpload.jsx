import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Camera } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import CameraCaptureModal from './CameraCaptureModal';

const compressImage = (file, maxWidth = 2048, maxHeight = 2048, quality = 0.85) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const originalName = file.name;
                        const newName = originalName.replace(/\.[^/.]+$/, "") + ".webp";
                        const compressedFile = new File([blob], newName, {
                            type: 'image/webp',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error('Canvas to Blob failed'));
                    }
                }, 'image/webp', quality);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

const ImageUpload = ({ label, onImageChange, initialPreview = null }) => {
    const [preview, setPreview] = useState(initialPreview);
    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const { showToast } = useToast();

    React.useEffect(() => {
        if (initialPreview) {
            setPreview(initialPreview);
        }
    }, [initialPreview]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImage(file);
        }
    };

    const handleImage = async (file) => {
        if (file.type.startsWith('image/')) {
            setIsCompressing(true);
            try {
                if (file.size > 15 * 1024 * 1024) {
                    if (showToast) showToast('File terlalu besar, maksimal 15MB sebelum dikompres!', 'error');
                    else alert('File terlalu besar, maksimal 15MB sebelum dikompres!');
                    setIsCompressing(false);
                    return;
                }

                const compressedFile = await compressImage(file, 2048, 2048, 0.85);
                
                console.log(`[Image Compression] Original: ${(file.size / 1024 / 1024).toFixed(2)} MB (${file.type}) => Compressed: ${(compressedFile.size / 1024).toFixed(2)} KB (${compressedFile.type})`);
                
                if (compressedFile.size > 2 * 1024 * 1024) {
                    if (showToast) showToast('Ukuran gambar masih melebihi 2MB setelah dikompres. Silakan pilih gambar lain.', 'error');
                    else alert('Ukuran gambar masih melebihi 2MB setelah dikompres. Silakan pilih gambar lain.');
                    setIsCompressing(false);
                    return;
                }

                const previewUrl = URL.createObjectURL(compressedFile);
                setPreview(previewUrl);
                if (onImageChange) onImageChange(compressedFile);
            } catch (error) {
                console.error('Error compressing image:', error);
                if (showToast) showToast('Gagal memproses gambar.', 'error');
                else alert('Gagal memproses gambar.');
            } finally {
                setIsCompressing(false);
            }
        } else {
            if (showToast) showToast('Format file tidak didukung. Harap pilih gambar.', 'error');
            else alert('Format file tidak didukung. Harap pilih gambar.');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleImage(file);
        }
    };

    const clearImage = (e) => {
        e.stopPropagation();
        setPreview(null);
        if (cameraInputRef.current) cameraInputRef.current.value = '';
        if (galleryInputRef.current) galleryInputRef.current.value = '';
        if (onImageChange) onImageChange(null);
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-primary block">{label}</label>

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative w-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 overflow-hidden group
                    ${preview ? 'aspect-square' : 'min-h-[190px] py-6'}
                    ${isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-secondary-dark/40 hover:border-primary/50 bg-white'
                    }
                `}
            >
                {isCompressing && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}
                {preview ? (
                    <>
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={clearImage}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center p-4 w-full">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full justify-center px-4">
                            <button
                                type="button"
                                onClick={() => setIsCameraModalOpen(true)}
                                className="flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-0 p-3 sm:p-4 w-full sm:w-28 h-auto sm:h-28 rounded-2xl border border-primary/10 bg-primary/5 hover:bg-primary/10 hover:border-primary/20 text-primary transition-all duration-300 group/btn shadow-sm"
                            >
                                <Camera className="w-5 h-5 sm:w-6 sm:h-6 sm:mb-2 text-primary/60 group-hover/btn:scale-110 group-hover/btn:text-primary transition-all shrink-0" />
                                <span className="text-[10px] font-black uppercase tracking-wider text-center leading-tight">Ambil Foto</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => galleryInputRef.current?.click()}
                                className="flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-0 p-3 sm:p-4 w-full sm:w-28 h-auto sm:h-28 rounded-2xl border border-primary/10 bg-primary/5 hover:bg-primary/10 hover:border-primary/20 text-primary transition-all duration-300 group/btn shadow-sm"
                            >
                                <Upload className="w-5 h-5 sm:w-6 sm:h-6 sm:mb-2 text-primary/60 group-hover/btn:scale-110 group-hover/btn:text-primary transition-all shrink-0" />
                                <span className="text-[10px] font-black uppercase tracking-wider text-center leading-tight">Buka Galeri</span>
                            </button>
                        </div>
                        <p className="text-[9px] font-black text-primary/30 uppercase tracking-[0.2em] text-center mt-4 hidden sm:block">Atau drag foto ke sini</p>
                    </div>
                )}

                <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                />

                <input
                    type="file"
                    ref={galleryInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                />
            </div>

            <CameraCaptureModal
                isOpen={isCameraModalOpen}
                onClose={() => setIsCameraModalOpen(false)}
                onCapture={(file, dataUrl) => {
                    handleImage(file);
                }}
                facingMode="environment"
            />
        </div>
    );
};

export default ImageUpload;
