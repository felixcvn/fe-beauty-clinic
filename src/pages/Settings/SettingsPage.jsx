import React from 'react';
import { ToggleLeft, Bell, Lock, User, Palette } from 'lucide-react';

const SettingsPage = () => {
    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">Settings</h2>
                    <p className="text-primary/40 mt-2 md:mt-3 font-bold text-sm">Manage application preferences and clinic configurations</p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="divide-y divide-primary/5">
                    {/* Appearance */}
                    <div className="p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group hover:bg-primary/5 transition-all duration-500">
                        <div className="flex gap-4 md:gap-6 items-center">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-secondary shadow-sm rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-secondary group-hover:rotate-3 transition-all duration-500 shrink-0">
                                <Palette className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div>
                                <h3 className="text-base md:text-lg font-black text-primary tracking-tight">Appearance</h3>
                                <p className="text-xs md:text-sm text-primary/40 font-bold">Customize the look and feel (Dark mode coming soon)</p>
                            </div>
                        </div>
                        <button className="w-full sm:w-auto px-6 py-2.5 bg-primary text-secondary rounded-xl font-bold text-xs shadow-lg shadow-primary/10 hover:scale-105 active:scale-95 transition-all duration-300">
                            Configure
                        </button>
                    </div>

                    {/* Notifications */}
                    <div className="p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group hover:bg-primary/5 transition-all duration-500">
                        <div className="flex gap-4 md:gap-6 items-center">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-secondary shadow-sm rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-secondary group-hover:-rotate-3 transition-all duration-500 shrink-0">
                                <Bell className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div>
                                <h3 className="text-base md:text-lg font-black text-primary tracking-tight">Notifications</h3>
                                <p className="text-xs md:text-sm text-primary/40 font-bold">Email, push, and patient reminder settings</p>
                            </div>
                        </div>
                        <div className="w-12 h-6 bg-primary/20 rounded-full p-1 cursor-pointer flex items-center justify-start group">
                            <div className="w-4 h-4 bg-primary rounded-full shadow-sm group-hover:translate-x-6 transition-transform duration-300" />
                        </div>
                    </div>

                    {/* Security */}
                    <div className="p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group hover:bg-primary/5 transition-all duration-500">
                        <div className="flex gap-4 md:gap-6 items-center">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-secondary shadow-sm rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-secondary group-hover:scale-110 transition-all duration-500 shrink-0">
                                <Lock className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div>
                                <h3 className="text-base md:text-lg font-black text-primary tracking-tight">Security</h3>
                                <p className="text-xs md:text-sm text-primary/40 font-bold">Password, sessions, and two-factor authentication</p>
                            </div>
                        </div>
                        <button className="w-full sm:w-auto px-6 py-2.5 bg-primary text-secondary rounded-xl font-bold text-xs shadow-lg shadow-primary/10 hover:scale-105 active:scale-95 transition-all duration-300">
                            Updates
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
