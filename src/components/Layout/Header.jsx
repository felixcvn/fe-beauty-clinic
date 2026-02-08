import { Bell, Search, UserCircle, Menu } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
    return (
        <header className="h-20 md:h-24 px-4 md:px-10 flex items-center justify-between sticky top-0 z-40 bg-secondary-light/60 backdrop-blur-md">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={toggleSidebar}
                    className="p-2.5 rounded-xl bg-white border border-primary/5 text-primary md:hidden shadow-sm hover:bg-primary/5 transition-all"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            <div className="flex items-center gap-4 md:gap-8">
                <button className="relative p-2.5 rounded-xl hover:bg-white/80 text-primary/70 hover:text-primary transition-all duration-300 shadow-sm hover:shadow-md active:scale-90">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent-gold rounded-full border-2 border-white animate-pulse"></span>
                </button>

                <div className="flex items-center gap-3 md:gap-4 pl-4 md:pl-8 border-l border-primary/10">
                    <div className="text-right hidden xs:block">
                        <p className="text-sm font-black text-primary tracking-tight">Dr. Sarah Smith</p>
                        <p className="text-[10px] text-accent-gold font-bold uppercase tracking-widest">Head Dermatologist</p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center border border-white/20 hover:scale-105 transition-transform duration-300 cursor-pointer overflow-hidden p-1">
                        <div className="w-full h-full bg-secondary-light rounded-xl flex items-center justify-center">
                            <UserCircle className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
