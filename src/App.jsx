import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import PatientList from './pages/MedicalRecords/PatientList';

import { MockDataProvider } from './context/MockDataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Toast from './components/UI/Toast';

import PatientDetail from './pages/MedicalRecords/PatientDetail';
import RecordForm from './pages/MedicalRecords/RecordForm';
import PatientsPage from './pages/Patients/PatientsPage';
import PatientForm from './pages/Patients/PatientForm';
import SettingsPage from './pages/Settings/SettingsPage';
import Login from './pages/Auth/Login';
import SalesPage from './pages/Sales/SalesPage';
import AttendancePage from './pages/Attendance/AttendancePage';
import ReportsPage from './pages/Reports/ReportsPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import StaffPage from './pages/Staff/StaffPage';
import POSPage from './pages/Sales/POSPage';

import { hasPermission } from './utils/rbac';

// Protected Route Component
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-secondary-light text-primary font-black uppercase tracking-widest animate-pulse">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

// Role-Based Protected Route
const RoleProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!hasPermission(user?.role, location.pathname)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <MockDataProvider>
                    <Router>
                        <Toast />
                        <Routes>
                            <Route path="/login" element={<Login />} />

                            {/* Protected Routes */}
                            <Route path="/*" element={
                                <PrivateRoute>
                                    <MainLayout>
                                        <Routes>
                                            <Route path="/" element={<RoleProtectedRoute><Dashboard /></RoleProtectedRoute>} />
                                            <Route path="/medical-records" element={<RoleProtectedRoute><PatientList /></RoleProtectedRoute>} />
                                            <Route path="/medical-records/new" element={<RoleProtectedRoute><RecordForm /></RoleProtectedRoute>} />
                                            <Route path="/medical-records/:id" element={<RoleProtectedRoute><PatientDetail /></RoleProtectedRoute>} />
                                            <Route path="/patients" element={<RoleProtectedRoute><PatientsPage /></RoleProtectedRoute>} />
                                            <Route path="/patients/new" element={<RoleProtectedRoute><PatientForm /></RoleProtectedRoute>} />
                                            <Route path="/staff" element={<RoleProtectedRoute><StaffPage /></RoleProtectedRoute>} />
                                            <Route path="/sales" element={<RoleProtectedRoute><SalesPage /></RoleProtectedRoute>} />
                                            <Route path="/sales/pos" element={<RoleProtectedRoute><POSPage /></RoleProtectedRoute>} />
                                            <Route path="/attendance" element={<RoleProtectedRoute><AttendancePage /></RoleProtectedRoute>} />
                                            <Route path="/reports" element={<RoleProtectedRoute><ReportsPage /></RoleProtectedRoute>} />
                                            <Route path="/notifications" element={<RoleProtectedRoute><NotificationsPage /></RoleProtectedRoute>} />
                                            <Route path="/settings" element={<RoleProtectedRoute><SettingsPage /></RoleProtectedRoute>} />
                                        </Routes>
                                    </MainLayout>
                                </PrivateRoute>
                            } />
                        </Routes>
                    </Router>
                </MockDataProvider>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
