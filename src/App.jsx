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

// Protected Route Component
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-secondary-light text-primary">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
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
                                            <Route path="/" element={<Dashboard />} />
                                            <Route path="/medical-records" element={<PatientList />} />
                                            <Route path="/medical-records/new" element={<RecordForm />} />
                                            <Route path="/medical-records/:id" element={<PatientDetail />} />
                                            <Route path="/patients" element={<PatientsPage />} />
                                            <Route path="/patients/new" element={<PatientForm />} />
                                            <Route path="/settings" element={<SettingsPage />} />
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
