import { BellIcon, Bars3Icon, UserCircleIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/rbac';

const Header = ({ toggleSidebar }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <header className="h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 bg-primary shadow-md">
            <div className="flex items-center gap-3">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all md:hidden"
                >
                    <Bars3Icon className="w-5 h-5" />
                </button>
            </div>

            <div className="flex items-center gap-3 md:gap-4 ml-auto">
                {/* Bell Notification */}
                {hasPermission(user?.role, '/notifications') && (
                    <button 
                        onClick={() => navigate('/notifications')}
                        className="relative p-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 active:scale-90"
                    >
                        <BellIcon className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-accent-gold rounded-full border-2 border-primary animate-pulse"></span>
                    </button>
                )}

                {/* Divider */}
                <div className="w-px h-8 bg-white/15"></div>

                {/* User Info */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-white leading-none">{user?.name || 'Astuti Setiawan'}</p>
                        <p className="text-xs text-white/50 mt-0.5">{user?.email || 'astuti@gmail.com'}</p>
                    </div>
                    <div
                        onClick={() => navigate('/profile')}
                        className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center hover:bg-white/25 transition-all duration-200 cursor-pointer overflow-hidden"
                    >
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <UserCircleIcon className="w-5 h-5 md:w-6 md:h-6 text-white/80" />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
