import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLocation } from 'react-router-dom';

const MainLayout = ({ children }) => {
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const location = useLocation();

    const toggleSidebar = () => {
        if (window.innerWidth < 768) {
            setIsMobileOpen(!isMobileOpen);
        } else {
            setIsDesktopCollapsed(!isDesktopCollapsed);
        }
    };

    return (
        <div className="flex min-h-screen bg-secondary-light">
            <Sidebar 
                isOpen={isMobileOpen} 
                toggle={toggleSidebar} 
                isCollapsed={isDesktopCollapsed}
                setIsCollapsed={setIsDesktopCollapsed}
                isHovered={isHovered}
                setIsHovered={setIsHovered}
            />
            <div className={`flex-1 flex flex-col min-h-screen relative z-10 transition-all duration-500 ${isDesktopCollapsed && !isHovered ? 'md:ml-[88px]' : 'ml-0 md:ml-64'}`}>
                <Header toggleSidebar={toggleSidebar} />
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div 
                        key={location.key}
                        className="max-w-7xl mx-auto animate-page-in"
                    >
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
