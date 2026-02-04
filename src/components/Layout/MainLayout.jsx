import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-secondary-light">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col min-h-screen relative z-10">
                <Header />
                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto animate-fade-in-up">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
