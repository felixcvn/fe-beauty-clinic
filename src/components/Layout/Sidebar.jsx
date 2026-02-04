import React from 'react';
import { LayoutDashboard, FileText, Settings, LogOut, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: FileText, label: 'Rekam Medis', path: '/medical-records' },
        { icon: User, label: 'Pasien', path: '/patients' }, // Placeholder for now
        { icon: Settings, label: 'Pengaturan', path: '/settings' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white/80 backdrop-blur-md border-r border-secondary-dark/20 flex flex-col justify-between shadow-xl z-50">
            <div>
                <div className="p-8 flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-primary tracking-tight">Personal<span className="text-primary-light">Beauty</span></h1>
                </div>

                <nav className="px-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                    ? 'bg-primary text-secondary shadow-lg shadow-primary/30 translate-x-1'
                                    : 'text-primary-light hover:bg-secondary-dark/30 hover:text-primary'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="p-4 mb-4">
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-primary-light hover:bg-red-50 hover:text-red-500 transition-all font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
