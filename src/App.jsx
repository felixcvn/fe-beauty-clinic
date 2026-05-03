// File: src/App.jsx (atau App.js)

import React from 'react';
import { Analytics } from "@vercel/analytics/react"
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import PatientList from './pages/MedicalRecords/PatientList';

import { MockDataProvider } from './context/MockDataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';


import PatientDetail from './pages/MedicalRecords/PatientDetail';


import PatientsPage from './pages/Patients/PatientsPage';
import PatientDetailPage from './pages/Patients/PatientDetailPage'; 

import PatientForm from './pages/Patients/PatientForm';
import Login from './pages/Auth/Login';
import SalesPage from './pages/Sales/SalesPage';
import AttendancePage from './pages/Attendance/AttendancePage';
import ReportsPage from './pages/Reports/ReportsPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import StaffPage from './pages/Staff/StaffPage';
import POSPage from './pages/Sales/POSPage';
import ProfilePage from './pages/Profile/ProfilePage';

import WarehouseDashboard from './pages/Warehouse/WarehouseDashboard';
import ItemManagementPage from './pages/Warehouse/ItemManagementPage';
import ApotekerInventoryPage from './pages/Warehouse/ApotekerInventoryPage';
import PromoManagementPage from './pages/Promos/PromoManagementPage';
import ReservationsPage from './pages/Reservations/ReservationsPage';
import OwnerDashboard from './pages/Dashboard/OwnerDashboard';
import SuperAdminInventoryPage from './pages/Warehouse/SuperAdminInventoryPage';
import ApotekerDashboard from './pages/Warehouse/ApotekerDashboard';
import DoctorDashboard from './pages/Dashboard/DoctorDashboard';
import CSDashboard from './pages/Dashboard/CSDashboard';
import HRDashboard from './pages/Dashboard/HRDashboard';
import TreatmentDashboard from './pages/Dashboard/TreatmentDashboard';
import MarketingDashboard from './pages/Dashboard/MarketingDashboard';
import SimpleStaffDashboard from './pages/Dashboard/SimpleStaffDashboard';

import { hasPermission } from './utils/rbac';

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

const RoleProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!hasPermission(user?.role, location.pathname)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

const DashboardSwitcher = () => {
    const { user } = useAuth();
    
    // Normalisasi role untuk perbandingan yang lebih aman (case-insensitive)
    const role = user?.role?.toLowerCase().trim();
    
    switch (role) {
        case 'gudang umum':
            return <WarehouseDashboard />;
        
        case 'apoteker':
        case 'asisten apoteker':
            return <ApotekerDashboard />;
        
        case 'owner':
        case 'komisaris':
        case 'super admin':
            return <OwnerDashboard />;
        
        case 'dokter':
            return <DoctorDashboard />;
        
        case 'customer service':
            return <CSDashboard />;
        
        case 'hrd':
            return <HRDashboard />;
        
        case 'supervisor treatment':
        case 'asisten supervisor treatment':
            return <TreatmentDashboard />;
        
        case 'manajer marketing of sales':
        case 'marketing of sales':
            return <MarketingDashboard />;
        
        case 'staff ob':
        case 'staff satpam':
            return <SimpleStaffDashboard />;
            
        default:
            return <Dashboard />;
    }
};

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <MockDataProvider>
                    <Router>

                        <Routes>
                            <Route path="/login" element={<Login />} />

                            <Route path="/*" element={
                                <PrivateRoute>
                                    <MainLayout>
                                        <Routes>
                                            <Route path="/" element={<RoleProtectedRoute><DashboardSwitcher /></RoleProtectedRoute>} />
                                            <Route path="/medical-records" element={<RoleProtectedRoute><PatientList /></RoleProtectedRoute>} />
                                            <Route path="/medical-records/:id" element={<RoleProtectedRoute><PatientDetail /></RoleProtectedRoute>} />
                                            <Route path="/patients" element={<RoleProtectedRoute><PatientsPage /></RoleProtectedRoute>} />
                                            <Route path="/patients/new" element={<RoleProtectedRoute><PatientForm /></RoleProtectedRoute>} />
                                            <Route path="/patients/detail/:id" element={<RoleProtectedRoute><PatientDetailPage /></RoleProtectedRoute>} />
                                            <Route path="/staff" element={<RoleProtectedRoute><StaffPage /></RoleProtectedRoute>} />
                                            <Route path="/sales" element={<RoleProtectedRoute><SalesPage /></RoleProtectedRoute>} />
                                            <Route path="/sales/pos" element={<RoleProtectedRoute><POSPage /></RoleProtectedRoute>} />
                                            <Route path="/promos" element={<RoleProtectedRoute><PromoManagementPage /></RoleProtectedRoute>} />
                                            <Route path="/attendance" element={<RoleProtectedRoute><AttendancePage /></RoleProtectedRoute>} />
                                            <Route path="/reservations" element={<RoleProtectedRoute><ReservationsPage /></RoleProtectedRoute>} />
                                            <Route path="/reports" element={<RoleProtectedRoute><ReportsPage /></RoleProtectedRoute>} />
                                            <Route path="/notifications" element={<RoleProtectedRoute><NotificationsPage /></RoleProtectedRoute>} />
                                            <Route path="/management" element={<RoleProtectedRoute><ItemManagementPage /></RoleProtectedRoute>} />
                                            <Route path="/cs-products" element={<RoleProtectedRoute><ItemManagementPage fixedFilter="product" fixedTitle="Stok" /></RoleProtectedRoute>} />
                                            <Route path="/apotek-inventory" element={<RoleProtectedRoute><ApotekerInventoryPage /></RoleProtectedRoute>} />
                                            <Route path="/cs-treatments" element={<RoleProtectedRoute><ItemManagementPage fixedFilter="treatment" fixedTitle="Treatment" /></RoleProtectedRoute>} />
                                            <Route path="/superadmin-inventory" element={<RoleProtectedRoute><SuperAdminInventoryPage /></RoleProtectedRoute>} />
                                            <Route path="/profile" element={<ProfilePage />} />
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