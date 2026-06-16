import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Camera } from 'lucide-react';

const ImageUpload = ({ label, onImageChange, initialPreview = null }) => {
    const [preview, setPreview] = useState(initialPreview);
    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

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

    const handleImage = (file) => {
        if (file.type.startsWith('image/')) {
            const previewUrl = URL.createObjectURL(file);
            setPreview(previewUrl);
            if (onImageChange) onImageChange(file);
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
                    relative w-full aspect-square rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 overflow-hidden group
                    ${isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-secondary-dark/40 hover:border-primary/50 bg-white'
                    }
                `}
            >
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
                    <div className="flex flex-col items-center justify-center p-4">
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => cameraInputRef.current?.click()}
                                className="flex flex-col items-center justify-center p-4 w-28 h-28 rounded-2xl border border-primary/10 bg-primary/5 hover:bg-primary/10 hover:border-primary/20 text-primary transition-all duration-300 group/btn shadow-sm"
                            >
                                <Camera className="w-6 h-6 mb-2 text-primary/60 group-hover/btn:scale-110 group-hover/btn:text-primary transition-all" />
                                <span className="text-[9px] font-black uppercase tracking-wider text-center leading-tight">Ambil Foto</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => galleryInputRef.current?.click()}
                                className="flex flex-col items-center justify-center p-4 w-28 h-28 rounded-2xl border border-primary/10 bg-primary/5 hover:bg-primary/10 hover:border-primary/20 text-primary transition-all duration-300 group/btn shadow-sm"
                            >
                                <Upload className="w-6 h-6 mb-2 text-primary/60 group-hover/btn:scale-110 group-hover/btn:text-primary transition-all" />
                                <span className="text-[9px] font-black uppercase tracking-wider text-center leading-tight">Buka Galeri</span>
                            </button>
                        </div>
                        <p className="text-[9px] font-black text-primary/30 uppercase tracking-[0.2em] text-center mt-4">Atau drag foto ke sini</p>
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
        </div>
    );
};

export default ImageUpload;
