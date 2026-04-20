import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const USER_SEEDER = [
    { username: 'superadmin', email: 'superadmin@clinic.com', password: 'password123', name: 'Super Admin', role: 'Super Admin' },
    { username: 'doctor', email: 'doctor@clinic.com', password: 'password123', name: 'Dr. Mega Endahlestari', role: 'Dokter' },
    { username: 'cs', email: 'cs@clinic.com', password: 'password123', name: 'Mba Fia', role: 'Customer Service' },
    { username: 'hrd', email: 'hrd@clinic.com', password: 'password123', name: 'Bu Yeyen', role: 'HRD' },
    { username: 'manager', email: 'manager@clinic.com', password: 'password123', name: 'Andi Pratama', role: 'Manager' },
    { username: 'gudang', email: 'gudang@clinic.com', password: 'password123', name: 'Zulkifli', role: 'Gudang Umum' },
    { username: 'owner', email: 'owner@clinic.com', password: 'password123', name: 'Nanin Lindiyawati', role: 'Owner' },
    { username: 'komisaris', email: 'komisaris@clinic.com', password: 'password123', name: 'Komisaris', role: 'Komisaris' },
]; 

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check for persisted session on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = (username, password) => {
        // Mock Login Logic with Seeder
        const foundUser = USER_SEEDER.find(u => u.username === username && u.password === password);

        if (foundUser) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const { password, ...userWithoutPassword } = foundUser;
                    setUser(userWithoutPassword);
                    setIsAuthenticated(true);
                    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
                    resolve({ success: true });
                }, 800);
            });
        }
        return Promise.resolve({ success: false, message: 'Username atau password salah' });
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
    };

    const updateProfile = (profileData) => {
        const updated = { ...user, ...profileData };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
