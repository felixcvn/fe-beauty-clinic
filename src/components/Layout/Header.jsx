import { BellIcon, Bars3Icon, UserCircleIcon, ArrowRightStartOnRectangleIcon, UserIcon } from '@heroicons/react/24/solid';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/rbac';
import { useState, useRef, useEffect } from 'react';
import ConfirmModal from '../UI/ConfirmModal';

const Header = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState(null);
    const dropdownRef = useRef(null);

    // Tutup dropdown jika klik di luar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Tutup dropdown saat pindah halaman
    useEffect(() => {
        setDropdownOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        setDropdownOpen(false);
        setConfirmConfig({
            icon: 'delete',
            header: 'Konfirmasi Keluar',
            message: 'Apakah Anda yakin ingin keluar dari sistem? Sesi Anda akan berakhir.',
            acceptLabel: 'Ya, Keluar',
            onAccept: () => logout(),
        });
    };

    const handleViewProfile = () => {
        setDropdownOpen(false);
        navigate('/profile');
    };

    return (
        <>
            <header className="h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 bg-primary shadow-lg border-b border-white/5">
                <div className="flex items-center gap-3">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={toggleSidebar}
                        className="p-2 -ml-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex items-center gap-2 md:gap-4 ml-auto">
                    {/* Bell Notification */}
                    {hasPermission(user?.role, '/notifications') && (
                        <button 
                            onClick={() => navigate('/notifications')}
                            className="relative p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 active:scale-90"
                        >
                            <BellIcon className="w-5 h-5 md:w-6 md:h-6" />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-accent-gold rounded-full border-2 border-primary animate-pulse"></span>
                        </button>
                    )}

                    {/* Divider */}
                    <div className="w-px h-8 bg-white/10 mx-1"></div>

                    {/* User Info + Profile Dropdown */}
                    <div className="relative flex items-center gap-2 md:gap-3" ref={dropdownRef}>
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-white leading-tight tracking-wide">{user?.name || 'User'}</p>
                            <p className="text-[10px] uppercase font-black text-white/30 tracking-[0.15em] mt-0.5">{user?.role || 'Staff'}</p>
                        </div>

                        {/* Profile Icon Button */}
                        <button
                            id="profile-dropdown-btn"
                            onClick={() => setDropdownOpen((prev) => !prev)}
                            className={`w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 border-2 transition-all duration-300 flex items-center justify-center overflow-hidden focus:outline-none hover:shadow-xl ${dropdownOpen ? 'border-accent-gold scale-105 shadow-accent-gold/20' : 'border-white/20 hover:border-white/40'}`}
                        >
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircleIcon className="w-6 h-6 md:w-7 md:h-7 text-white/80" />
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute right-0 top-full mt-3 w-[280px] max-w-[90vw] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden z-50 animate-dropdown-in origin-top-right">
                                {/* Header di dropdown */}
                                <div className="px-6 py-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl border-2 border-primary/5 p-0.5 bg-white shrink-0 shadow-sm">
                                        <div className="w-full h-full rounded-[14px] overflow-hidden">
                                            {user?.avatar ? (
                                                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                                                    <UserIcon className="w-6 h-6 text-primary/30" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-black text-gray-800 truncate leading-tight tracking-tight">{user?.name || 'User'}</p>
                                        <p className="text-[10px] font-bold text-gray-400 truncate mt-1 uppercase tracking-widest">{user?.role || 'Staff'}</p>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="p-2.5 space-y-1">
                                    <button
                                        id="view-profile-btn"
                                        onClick={handleViewProfile}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 group ${location.pathname === '/profile' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-primary/5 hover:text-primary'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${location.pathname === '/profile' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                        <span className="flex-1 text-left">Profil</span>
                                    </button>
                                </div>

                                {/* Sign Out Section */}
                                <div className="p-2.5 border-t border-gray-50 mt-1 bg-gray-50/30">
                                    <button
                                        id="logout-btn"
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all duration-500 group shadow-sm hover:shadow-xl hover:shadow-red-500/30"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-red-100 text-red-500 group-hover:bg-white/20 group-hover:text-white flex items-center justify-center transition-colors">
                                            <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                                        </div>
                                        <span className="flex-1 text-left">Keluar</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <ConfirmModal
                config={confirmConfig}
                onClose={() => setConfirmConfig(null)}
            />
        </>
    );
};

export default Header;
