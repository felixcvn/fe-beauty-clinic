// File: src/App.jsx

import React, { lazy, Suspense } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';

import { MockDataProvider } from './context/MockDataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { hasPermission } from './utils/rbac';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
// Auth
const Login = lazy(() => import('./pages/Auth/Login'));

// Dashboards
const Dashboard           = lazy(() => import('./pages/Dashboard/Dashboard'));
const OwnerDashboard      = lazy(() => import('./pages/Dashboard/OwnerDashboard'));
const DoctorDashboard     = lazy(() => import('./pages/Dashboard/DoctorDashboard'));
const CSDashboard         = lazy(() => import('./pages/Dashboard/CSDashboard'));
const HRDashboard         = lazy(() => import('./pages/Dashboard/HRDashboard'));
const TreatmentDashboard  = lazy(() => import('./pages/Dashboard/TreatmentDashboard'));
const MarketingDashboard  = lazy(() => import('./pages/Dashboard/MarketingDashboard'));
const SimpleStaffDashboard= lazy(() => import('./pages/Dashboard/SimpleStaffDashboard'));

// Medical Records
const PatientList   = lazy(() => import('./pages/MedicalRecords/PatientList'));
const PatientDetail = lazy(() => import('./pages/MedicalRecords/PatientDetail'));

// Patients
const PatientsPage      = lazy(() => import('./pages/Patients/PatientsPage'));
const PatientDetailPage = lazy(() => import('./pages/Patients/PatientDetailPage'));
const PatientForm       = lazy(() => import('./pages/Patients/PatientForm'));

// Staff
const StaffPage = lazy(() => import('./pages/Staff/StaffPage'));

// Sales & POS
const SalesPage = lazy(() => import('./pages/Sales/SalesPage'));
const POSPage   = lazy(() => import('./pages/Sales/POSPage'));

// Warehouse / Inventory
const WarehouseDashboard      = lazy(() => import('./pages/Warehouse/WarehouseDashboard'));
const ApotekerDashboard       = lazy(() => import('./pages/Warehouse/ApotekerDashboard'));
const ItemManagementPage      = lazy(() => import('./pages/Warehouse/ItemManagementPage'));
const ApotekerInventoryPage   = lazy(() => import('./pages/Warehouse/ApotekerInventoryPage'));
const SuperAdminInventoryPage = lazy(() => import('./pages/Warehouse/SuperAdminInventoryPage'));
const WarehouseTransactionsPage = lazy(() => import('./pages/Warehouse/WarehouseTransactionsPage'));

// Others
const PromoManagementPage = lazy(() => import('./pages/Promos/PromoManagementPage'));
const ReservationsPage    = lazy(() => import('./pages/Reservations/ReservationsPage'));
const AttendancePage      = lazy(() => import('./pages/Attendance/AttendancePage'));
const AttendanceSettingsPage = lazy(() => import('./pages/Attendance/AttendanceSettingsPage'));
const ReportsPage         = lazy(() => import('./pages/Reports/ReportsPage'));
const NotificationsPage   = lazy(() => import('./pages/Notifications/NotificationsPage'));
const ProfilePage         = lazy(() => import('./pages/Profile/ProfilePage'));
const ActivityLogPage     = lazy(() => import('./pages/Logs/ActivityLogPage'));

// ── Page loader (fallback Suspense) ──────────────────────────────────────────
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-secondary-light">
        <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-primary/40 font-black text-xs uppercase tracking-widest">Memuat...</p>
        </div>
    </div>
);

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
                        <Suspense fallback={<PageLoader />}>
                            <Routes>
                                <Route path="/login" element={<Login />} />

                                <Route path="/*" element={
                                    <PrivateRoute>
                                        <MainLayout>
                                            <Suspense fallback={<PageLoader />}>
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
                                                    <Route path="/attendance/settings" element={<RoleProtectedRoute><AttendanceSettingsPage /></RoleProtectedRoute>} />
                                                    <Route path="/reservations" element={<RoleProtectedRoute><ReservationsPage /></RoleProtectedRoute>} />
                                                    <Route path="/reports" element={<RoleProtectedRoute><ReportsPage /></RoleProtectedRoute>} />
                                                    <Route path="/activity-logs" element={<RoleProtectedRoute><ActivityLogPage /></RoleProtectedRoute>} />
                                                    <Route path="/notifications" element={<RoleProtectedRoute><NotificationsPage /></RoleProtectedRoute>} />
                                                    <Route path="/warehouse-transactions" element={<RoleProtectedRoute><WarehouseTransactionsPage /></RoleProtectedRoute>} />
                                                    <Route path="/management" element={<RoleProtectedRoute><ItemManagementPage /></RoleProtectedRoute>} />
                                                    <Route path="/cs-products" element={<RoleProtectedRoute><ItemManagementPage fixedFilter="product" fixedTitle="Stok" /></RoleProtectedRoute>} />
                                                    <Route path="/apotek-inventory" element={<RoleProtectedRoute><ApotekerInventoryPage /></RoleProtectedRoute>} />
                                                    <Route path="/cs-treatments" element={<RoleProtectedRoute><ItemManagementPage fixedFilter="treatment" fixedTitle="Treatment" /></RoleProtectedRoute>} />
                                                    <Route path="/superadmin-inventory" element={<RoleProtectedRoute><SuperAdminInventoryPage /></RoleProtectedRoute>} />
                                                    <Route path="/profile" element={<ProfilePage />} />
                                                </Routes>
                                            </Suspense>
                                        </MainLayout>
                                    </PrivateRoute>
                                } />
                            </Routes>
                        </Suspense>
                    </Router>
                </MockDataProvider>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;