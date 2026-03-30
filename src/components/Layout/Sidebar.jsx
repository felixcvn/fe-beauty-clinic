import React, { useState } from 'react';
import {
    Squares2X2Icon,
    DocumentTextIcon,
    UserIcon,
    UsersIcon,
    ShoppingCartIcon,
    CalendarDaysIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowRightStartOnRectangleIcon,
    KeyIcon,
    XMarkIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    TagIcon,
    ArchiveBoxIcon,
} from '@heroicons/react/24/solid';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/logo.png';
import logo1 from '../../assets/logo-1.png';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/rbac';

const ALL_NAV_ITEMS = [
    { icon: Squares2X2Icon, label: 'Dashboard', path: '/' },
    { icon: DocumentTextIcon, label: 'Rekam Medis', path: '/medical-records' },
    { icon: UserIcon, label: 'Pasien', path: '/patients' },
    { icon: UsersIcon, label: 'Manajemen Karyawan', path: '/staff' },
    { 
        icon: ArchiveBoxIcon, 
        label: 'Produk', 
        path: '/management'
    },
    { icon: ShoppingCartIcon, label: 'Transaksi', path: '/sales' },
    { icon: CalendarDaysIcon, label: 'Absensi', path: '/attendance' },
    { icon: TagIcon, label: 'Promo', path: '/promos' },
    { icon: ChartBarIcon, label: 'Laporan', path: '/reports' },
    { icon: Cog6ToothIcon, label: 'Pengaturan', path: '/settings' },
];

const Sidebar = ({ isOpen, toggle }) => {
    const { logout, user } = useAuth();
    const [openMenu, setOpenMenu] = useState(null);

    const toggleMenu = (label) => {
        setOpenMenu(prev => prev === label ? null : label);
    };

    const handleItemClick = () => {
        if (window.innerWidth < 768 && isOpen) {
            toggle();
        }
    };

    const navItems = ALL_NAV_ITEMS.filter(item => {
        if (item.subItems && item.subItems.length > 0) {
            return item.subItems.some(sub => hasPermission(user?.role, sub.path));
        }
        return hasPermission(user?.role, item.path);
    }).map(item => {
        if (item.path === '/staff' && (user?.role === 'Owner' || user?.role === 'HRD')) {
            return { ...item, label: 'Data Karyawan' };
        }
        return item;
    });

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[45] md:hidden" onClick={toggle} />
            )}

            {/* UBAH STRUKTUR KELAS ASIDE DI SINI */}
            <aside className={`fixed left-0 top-0 h-screen w-64 bg-white flex flex-col z-50 border-r border-gray-200 transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                
                {/* 1. HEADER (Fixed/Tetap di atas) */}
                <div className="bg-primary px-6 py-2 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden border border-white/20">
                            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <img src={logo1} alt="Logo Text" className="w-36 h-full object-cover" />
                    </div>
                    <button onClick={toggle} className="md:hidden p-2 text-white/50 hover:text-white transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* 2. NAV ITEMS (Bisa di-scroll, menggunakan flex-1) */}
                <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto scrollbar-hide">
                    {navItems.length === 0 && (
                        <div className="text-center p-3 mb-2 rounded-lg bg-red-50 text-red-500 text-xs font-bold border border-red-200">
                            Error: Role "{user?.role}" tidak punya izin akses.
                        </div>
                    )}

                    {navItems.map((item) => {
                        const isExpanded = openMenu === item.label;
                        const hasSubs = item.subItems && item.subItems.length > 0;
                        const allowedSubs = hasSubs ? item.subItems.filter(s => hasPermission(user?.role, s.path)) : [];

                        if (hasSubs && allowedSubs.length > 0) {
                            return (
                                <div key={item.label} className="space-y-1">
                                    <button
                                        onClick={() => toggleMenu(item.label)}
                                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-gray-500 hover:text-primary hover:bg-primary/5"
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className="w-5 h-5 flex-shrink-0" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </div>
                                        {isExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                                    </button>
                                    
                                    {isExpanded && (
                                        <div className="ml-9 space-y-1 border-l border-gray-100 pl-2">
                                            {allowedSubs.map((sub) => (
                                                <NavLink
                                                    key={sub.path}
                                                    to={sub.path}
                                                    onClick={handleItemClick}
                                                    className={({ isActive }) =>
                                                        `flex items-center px-4 py-2 rounded-lg text-xs font-semibold transition-all ${isActive ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-primary hover:bg-primary/5'}`
                                                    }
                                                >
                                                    {sub.label}
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        if (!hasSubs) {
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={handleItemClick}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'text-white bg-primary shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-primary hover:bg-primary/5'}`
                                    }
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </NavLink>
                            );
                        }
                        return null;
                    })}
                </nav>

                {/* 3. FOOTER (Fixed/Tetap di bawah berkat flex-col & shrink-0) */}
                <div className="border-t border-gray-100 px-3 py-4 space-y-0.5 shrink-0 bg-white">
                    <NavLink 
                        to="/change-password" 
                        onClick={handleItemClick}
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'text-primary bg-primary/10' : 'text-gray-500 hover:text-primary hover:bg-primary/5'}`}>
                        <KeyIcon className="w-5 h-5 flex-shrink-0" />
                        <span>Ganti Password</span>
                    </NavLink>
                    <button 
                        onClick={() => {
                            logout();
                            handleItemClick();
                        }} 
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-500 hover:text-primary hover:bg-primary/5 transition-all">
                        <ArrowRightStartOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">Keluar</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
