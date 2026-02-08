import React from 'react';
import { LayoutDashboard, FileText, Settings, LogOut, User, ShoppingCart, CalendarDays, BarChart3, Bell, X, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/rbac';

const Sidebar = ({ isOpen, toggle }) => {
    const { logout, user } = useAuth();

    const allNavItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: FileText, label: 'Rekam Medis', path: '/medical-records' },
        { icon: User, label: 'Pasien', path: '/patients' },
        { icon: Users, label: 'Manajemen Pegawai', path: '/staff' },
        { icon: ShoppingCart, label: 'Penjualan', path: '/sales' },
        { icon: CalendarDays, label: 'Absensi', path: '/attendance' },
        { icon: BarChart3, label: 'Laporan', path: '/reports' },
        { icon: Bell, label: 'Notifikasi', path: '/notifications' },
        { icon: Settings, label: 'Pengaturan', path: '/settings' },
    ];

    const navItems = allNavItems.filter(item => hasPermission(user?.role, item.path));

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-[45] md:hidden animate-fade-in"
                    onClick={toggle}
                />
            )}

            <aside className={`fixed left-0 top-0 h-screen w-64 bg-white/40 backdrop-blur-xl border-r border-primary/5 flex flex-col justify-between shadow-2xl z-50 transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div>
                    <div className="p-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 border border-white/20">
                                <span className="text-secondary font-serif text-2xl font-bold italic tracking-tighter -rotate-3">PB</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-primary tracking-tighter leading-[0.8]">
                                    Personal
                                </h1>
                                <span className="text-accent-gold text-base font-serif italic leading-none">Beauty</span>
                            </div>
                        </div>
                        {/* Mobile Close Button */}
                        <button onClick={toggle} className="md:hidden p-2 text-primary/40 hover:text-primary transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="px-4 space-y-1.5 mt-8 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-hide">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 768 && toggle()}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-500 group relative overflow-hidden ${isActive
                                        ? 'bg-primary text-secondary shadow-xl shadow-primary/20'
                                        : 'text-primary/70 hover:text-primary hover:bg-white/60'
                                    }`
                                }
                            >
                                <item.icon className={`w-5 h-5 transition-transform duration-500 group-hover:scale-110`} />
                                <span className="font-semibold tracking-wide text-sm">{item.label}</span>

                                {/* Subtle hover indicator for non-active items */}
                                <div className="absolute left-0 w-1 h-0 bg-accent-gold transition-all duration-300 group-hover:h-full top-0 opacity-0 group-hover:opacity-100" />
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    <div className="p-4 bg-primary/5 rounded-3xl border border-primary/10 mb-6">
                        <p className="text-[10px] uppercase tracking-widest text-primary/40 font-bold mb-3 px-1">Support</p>
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-primary/60 hover:bg-red-50 hover:text-red-500 transition-all duration-300 font-bold text-sm group"
                        >
                            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-primary/30 font-medium">v1.2.0 • Premium Access</p>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
