import React, { useState, useRef } from 'react';
import {
    UserCircleIcon,
    PencilSquareIcon,
    CheckIcon,
    XMarkIcon,
    EnvelopeIcon,
    PhoneIcon,
    BriefcaseIcon,
    CalendarDaysIcon,
    MapPinIcon,
    CameraIcon,
} from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import CustomDatePicker from '../../components/UI/CustomDatePicker';
import ConfirmModal from '../../components/UI/ConfirmModal';


const roleBadgeColor = {
    Dokter: 'bg-blue-100 text-blue-600',
    'Customer Service': 'bg-emerald-100 text-emerald-600',
    HRD: 'bg-violet-100 text-violet-600',
    'Supervisor Treatment': 'bg-amber-100 text-amber-600',
    'Manajer Marketing of Sales': 'bg-amber-100 text-amber-600',
    'Marketing of Sales': 'bg-amber-100 text-amber-600',
};

const InfoRow = ({ icon: Icon, label, field, type = 'text', isEditing, form, handleChange, setForm, readOnly }) => (
    <div className="flex items-start gap-4 py-4 border-b border-primary/5 last:border-0">
        <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0 mt-0.5">
            <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-1">{label}</p>
            {isEditing && !readOnly ? (
                type === 'date' ? (
                    <CustomDatePicker
                        value={form[field]}
                        onChange={(val) => setForm(prev => ({ ...prev, [field]: val }))}
                        className="-ml-4 -mt-2"
                    />
                ) : (
                    <input
                        name={field}
                        type={type}
                        value={form[field]}
                        onChange={handleChange}
                        className="w-full text-sm font-semibold text-primary bg-secondary/60 border border-primary/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                    />
                )
            ) : (
                <p className="text-sm font-semibold text-primary truncate">{form[field] || <span className="text-primary/30 italic">Belum diatur</span>}</p>
            )}
        </div>
    </div>
);

const ProfilePage = () => {
    const { user, updateProfile } = useAuth();
    const { showToast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        position: user?.position || user?.role || '',
        joinDate: user?.joinDate || '2023-01-01',
        address: user?.address || '',
        bio: user?.bio || '',
        avatar: user?.avatar || null,
    });
    const [preview, setPreview] = useState(user?.avatar || null);
    const [confirmConfig, setConfirmConfig] = useState(null);
    const fileRef = useRef();


    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setPreview(ev.target.result);
            setForm((prev) => ({ ...prev, avatar: ev.target.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        // Enforce @gmail.com validation
        if (form.email && !form.email.endsWith('@gmail.com')) {
            showToast('Email harus menggunakan format @gmail.com', 'error');
            return;
        }

        setConfirmConfig({
            icon: 'save',
            header: 'Simpan Profil?',
            message: 'Yakin ingin menyimpan perubahan profil Anda?',
            acceptLabel: 'Ya, Simpan',
            onAccept: async () => {
                if (updateProfile) {
                    const res = await updateProfile(form);
                    if (res && !res.success) {
                        showToast(res.message || 'Gagal memperbarui profil', 'error');
                        return;
                    }
                    showToast('Profil Anda berhasil diperbarui!', 'success');
                }
                setIsEditing(false);
            }
        });
    };


    const handleCancel = () => {
        setForm({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            position: user?.position || user?.role || '',
            joinDate: user?.joinDate || '2023-01-01',
            address: user?.address || '',
            bio: user?.bio || '',
            avatar: user?.avatar || null,
        });
        setPreview(user?.avatar || null);
        setIsEditing(false);
    };

    const badgeClass = roleBadgeColor[user?.role] || 'bg-gray-100 text-gray-600';


    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Profil Saya</h2>
                    <p className="text-primary/40 mt-2 md:mt-3 font-bold text-sm">Kelola Informasi Pribadi Anda</p>
                </div>

                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary/15 text-primary/60 font-bold text-xs hover:bg-primary/5 active:scale-95 transition-all duration-200"
                            >
                                <XMarkIcon className="w-4 h-4" />Batal</button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300"
                            >
                                <CheckIcon className="w-4 h-4" />
                                Simpan Perubahan
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-xs shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300"
                        >
                            <PencilSquareIcon className="w-4 h-4" />
                            Edit Profil
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Avatar Card */}
                <div className="bg-white rounded-card border border-primary/10 shadow-[0_10px_35px_rgba(0,0,0,0.08)] p-8 flex flex-col items-center text-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-primary/10 overflow-hidden bg-secondary flex items-center justify-center">
                            {preview ? (
                                <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircleIcon className="w-20 h-20 text-primary/30" />
                            )}
                        </div>
                    </div>

                    {/* Name & Role */}
                    {isEditing ? (
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="text-center w-full text-xl font-black text-primary bg-secondary/60 border border-primary/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                        />
                    ) : (
                        <h3 className="text-xl font-black text-primary tracking-tight">{form.name}</h3>
                    )}

                    <span className={`inline-flex items-center px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest ${badgeClass}`}>
                        {user?.role}
                    </span>

                    <div className="w-full mt-6 pt-6 border-t border-primary/5 space-y-3 text-left">
                        <div className="flex justify-between items-center bg-secondary/30 px-4 py-3 rounded-2xl">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">Status</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-green-50 text-green-700 border border-green-200">Aktif</span>
                        </div>
                        <div className="flex justify-between items-center bg-secondary/30 px-4 py-3 rounded-2xl">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">Lokasi Cabang</span>
                            <span className="text-[11px] font-black text-primary uppercase tracking-wider">{user?.cabang || 'Jember'}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Info Card */}
                <div className="lg:col-span-2 bg-white rounded-card border border-primary/10 shadow-[0_10px_35px_rgba(0,0,0,0.08)] p-8">
                    <h4 className="text-lg font-black text-primary tracking-tight mb-2">Informasi Pribadi</h4>
                    <p className="text-xs font-bold text-primary/30 mb-6">Detail kontak dan informasi tempat kerja Anda</p>

                    <div className="divide-y divide-primary/5">
                        <InfoRow icon={EnvelopeIcon} label="Alamat Email" field="email" type="email" isEditing={isEditing} form={form} handleChange={handleChange} setForm={setForm} />
                        <InfoRow icon={PhoneIcon} label="Nomor Telepon" field="phone" type="tel" isEditing={isEditing} form={form} handleChange={handleChange} setForm={setForm} />
                        <InfoRow icon={BriefcaseIcon} label="Posisi / Jabatan" field="position" isEditing={isEditing} form={form} handleChange={handleChange} setForm={setForm} readOnly={true} />
                        <InfoRow icon={CalendarDaysIcon} label="Tanggal Bergabung" field="joinDate" type="date" isEditing={isEditing} form={form} handleChange={handleChange} setForm={setForm} />
                        <InfoRow icon={MapPinIcon} label="Alamat" field="address" isEditing={isEditing} form={form} handleChange={handleChange} setForm={setForm} />
                    </div>
                </div>
            </div>
            <ConfirmModal
                config={confirmConfig}
                onClose={() => setConfirmConfig(null)}
            />
        </div>
    );
};



export default ProfilePage;
