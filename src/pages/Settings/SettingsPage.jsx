import React from 'react';
import { ToggleLeft, Bell, Lock, User, Palette } from 'lucide-react';

const SettingsPage = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold text-primary">Settings</h2>
                <p className="text-primary-light mt-1">Manage application preferences</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-secondary-dark/20 divide-y divide-secondary-dark/10">
                {/* Appearance */}
                <div className="p-6 flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="p-3 bg-secondary-light rounded-xl text-primary">
                            <Palette className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-primary">Appearance</h3>
                            <p className="text-sm text-primary-light">Customize the look and feel (Dark mode coming soon)</p>
                        </div>
                    </div>
                    <button className="bg-secondary text-primary px-4 py-2 rounded-lg text-sm font-bold">Manage</button>
                </div>

                {/* Notifications */}
                <div className="p-6 flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="p-3 bg-secondary-light rounded-xl text-primary">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-primary">Notifications</h3>
                            <p className="text-sm text-primary-light">Email and push notification settings</p>
                        </div>
                    </div>
                    <ToggleLeft className="w-10 h-10 text-primary cursor-pointer" />
                </div>

                {/* Security */}
                <div className="p-6 flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="p-3 bg-secondary-light rounded-xl text-primary">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-primary">Security</h3>
                            <p className="text-sm text-primary-light">Password, 2FA, and sessions</p>
                        </div>
                    </div>
                    <button className="bg-secondary text-primary px-4 py-2 rounded-lg text-sm font-bold">Manage</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
