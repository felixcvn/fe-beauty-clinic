import React from 'react';
import { Bell, Search, UserCircle } from 'lucide-react';

const Header = () => {
    return (
        <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-40 bg-secondary-light/80 backdrop-blur-sm">
            <div className="flex items-center gap-4 bg-white/50 px-4 py-2 rounded-full border border-secondary-dark/10 w-96 transition-all focus-within:ring-2 focus-within:ring-primary/20">
                <Search className="w-5 h-5 text-primary-light" />
                <input
                    type="text"
                    placeholder="Search patients, records..."
                    className="bg-transparent border-none outline-none text-primary placeholder:text-primary-light/70 w-full font-medium"
                />
            </div>

            <div className="flex items-center gap-6">
                <button className="relative p-2 rounded-full hover:bg-secondary-dark/20 text-primary transition-colors">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-secondary-light"></span>
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-secondary-dark/20">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-primary">Dr. Sarah Smith</p>
                        <p className="text-xs text-primary-light font-medium">Head Dermatologist</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                        <UserCircle className="w-8 h-8 text-primary" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
