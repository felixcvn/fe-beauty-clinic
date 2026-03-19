import React from 'react';
import {
    Squares2X2Icon,
    DocumentTextIcon,
    UserIcon,
    UsersIcon,
    ShoppingCartIcon,
    CalendarDaysIcon,
    ChartBarIcon,
    BellIcon,
    Cog6ToothIcon,
    ArrowRightStartOnRectangleIcon,
    KeyIcon,
    XMarkIcon,
} from '@heroicons/react/24/solid';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/logo.png';
import logo1 from '../../assets/logo-1.png';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/rbac';

const Sidebar = ({ isOpen, toggle }) => {
    const { logout, user } = useAuth();

    const allNavItems = [
        { icon: Squares2X2Icon, label: 'Dashboard', path: '/' },
        { icon: DocumentTextIcon, label: 'Rekam Medis', path: '/medical-records' },
        { icon: UserIcon, label: 'Pasien', path: '/patients' },
        { icon: UsersIcon, label: 'Manajemen Pegawai', path: '/staff' },
        { icon: ShoppingCartIcon, label: 'Penjualan', path: '/sales' },
        { icon: CalendarDaysIcon, label: 'Absensi', path: '/attendance' },
        { icon: ChartBarIcon, label: 'Laporan', path: '/reports' },
        { icon: Cog6ToothIcon, label: 'Pengaturan', path: '/settings' },
    ];

    const navItems = allNavItems.filter(item => hasPermission(user?.role, item.path));

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[45] md:hidden animate-fade-in"
                    onClick={toggle}
                />
            )}

            <aside className={`fixed left-0 top-0 h-screen w-64 bg-white flex flex-col justify-between z-50 border-r border-gray-200 transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

                {/* ── Dark Green Logo Header ── */}
                <div>
                    <div className="bg-primary px-6 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden border border-white/20">
                                <img src={logo} alt="Personal Beauty Logo" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <img src={logo1} alt="Personal Beauty Logo" className="w-36 h-full object-cover" />
                            </div>
                        </div>
                        {/* Mobile Close Button */}
                        <button onClick={toggle} className="md:hidden p-2 text-white/50 hover:text-white transition-colors">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* ── White Navigation Area ── */}
                    <nav className="px-3 py-8 space-y-2 overflow-y-auto max-h-[calc(100vh-210px)] scrollbar-hide">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 768 && toggle()}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'text-gray-100 font-semibold bg-primary'
                                        : 'text-gray-500 hover:text-primary hover:bg-primary/5'
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-medium">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* ── White Bottom Section ── */}
                <div className="border-t border-gray-100 px-3 py-4 space-y-0.5">
                    <NavLink
                        to="/change-password"
                        onClick={() => window.innerWidth < 768 && toggle()}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${isActive
                                ? 'text-primary font-semibold bg-primary/10'
                                : 'text-gray-500 hover:text-primary hover:bg-primary/5'
                            }`
                        }
                    >
                        <KeyIcon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">Ganti Password</span>
                    </NavLink>

                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-500 hover:text-primary hover:bg-primary/5 transition-all duration-200"
                    >
                        <ArrowRightStartOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
