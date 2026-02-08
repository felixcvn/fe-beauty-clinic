import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const USER_SEEDER = [
    { email: 'admin@clinic.com', password: 'password123', name: 'Super Admin', role: 'Admin' },
    { email: 'doctor@clinic.com', password: 'password123', name: 'Dr. Sarah Smith', role: 'Dokter' },
    { email: 'pharmacist@clinic.com', password: 'password123', name: 'Budi Santoso', role: 'Apoteker' },
    { email: 'hrd@clinic.com', password: 'password123', name: 'Linda Rahayu', role: 'HRD' },
    { email: 'manager@clinic.com', password: 'password123', name: 'Andi Pratama', role: 'Manager' },
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

    const login = (email, password) => {
        // Mock Login Logic with Seeder
        const foundUser = USER_SEEDER.find(u => u.email === email && u.password === password);

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
        return Promise.resolve({ success: false, message: 'Email atau password salah' });
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
