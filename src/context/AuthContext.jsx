import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

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
        // Mock Login Logic
        // In a real app, this would be an API call
        if (username && password) {
            // Simulate API delay
            return new Promise((resolve) => {
                setTimeout(() => {
                    const mockUser = { name: 'Dr. Sarah Smith', role: 'Dermatologist', email: username };
                    setUser(mockUser);
                    setIsAuthenticated(true);
                    localStorage.setItem('user', JSON.stringify(mockUser));
                    resolve({ success: true });
                }, 800);
            });
        }
        return Promise.resolve({ success: false, message: 'Invalid credentials' });
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
