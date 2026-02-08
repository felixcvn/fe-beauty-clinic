import React from 'react';
import { ToggleLeft, Bell, Lock, User, Palette } from 'lucide-react';

const SettingsPage = () => {
    return (
        <div className="space-y-10 animate-fade-in pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-primary tracking-tighter leading-none">Settings</h2>
                    <p className="text-primary/40 mt-3 font-bold text-sm">Manage application preferences and clinic configurations</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="divide-y divide-primary/5">
                    {/* Appearance */}
                    <div className="p-8 flex items-center justify-between group hover:bg-primary/5 transition-all duration-500">
                        <div className="flex gap-6 items-center">
                            <div className="w-14 h-14 bg-secondary shadow-sm rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-secondary group-hover:rotate-3 transition-all duration-500">
                                <Palette className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-primary tracking-tight">Appearance</h3>
                                <p className="text-sm text-primary/40 font-bold">Customize the look and feel (Dark mode coming soon)</p>
                            </div>
                        </div>
                        <button className="px-6 py-2.5 bg-primary text-secondary rounded-xl font-bold text-xs shadow-lg shadow-primary/10 hover:scale-105 active:scale-95 transition-all duration-300">
                            Configure
                        </button>
                    </div>

                    {/* Notifications */}
                    <div className="p-8 flex items-center justify-between group hover:bg-primary/5 transition-all duration-500">
                        <div className="flex gap-6 items-center">
                            <div className="w-14 h-14 bg-secondary shadow-sm rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-secondary group-hover:-rotate-3 transition-all duration-500">
                                <Bell className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-primary tracking-tight">Notifications</h3>
                                <p className="text-sm text-primary/40 font-bold">Email, push, and patient reminder settings</p>
                            </div>
                        </div>
                        <div className="w-12 h-6 bg-primary/20 rounded-full p-1 cursor-pointer flex items-center justify-start group">
                            <div className="w-4 h-4 bg-primary rounded-full shadow-sm group-hover:translate-x-6 transition-transform duration-300" />
                        </div>
                    </div>

                    {/* Security */}
                    <div className="p-8 flex items-center justify-between group hover:bg-primary/5 transition-all duration-500">
                        <div className="flex gap-6 items-center">
                            <div className="w-14 h-14 bg-secondary shadow-sm rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-secondary group-hover:scale-110 transition-all duration-500">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-primary tracking-tight">Security</h3>
                                <p className="text-sm text-primary/40 font-bold">Password, sessions, and two-factor authentication</p>
                            </div>
                        </div>
                        <button className="px-6 py-2.5 bg-primary text-secondary rounded-xl font-bold text-xs shadow-lg shadow-primary/10 hover:scale-105 active:scale-95 transition-all duration-300">
                            Updates
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
