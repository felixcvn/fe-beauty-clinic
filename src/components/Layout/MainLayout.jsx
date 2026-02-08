import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex min-h-screen bg-secondary-light">
            <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
            <div className={`flex-1 flex flex-col min-h-screen relative z-10 transition-all duration-500 ${isSidebarOpen ? 'md:ml-64' : 'ml-0 md:ml-64'}`}>
                <Header toggleSidebar={toggleSidebar} />
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto animate-fade-in-up">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
