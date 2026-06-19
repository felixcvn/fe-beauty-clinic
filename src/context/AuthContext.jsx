import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, karyawanAPI } from '../services/api';

const AuthContext = createContext();

// ─── Mock Seeder (Fallback jika API tidak tersedia) ───────────────────────────
const USER_SEEDER = [
    { username: 'superadmin', email: 'superadmin@clinic.com', password: 'password', name: 'Super Admin', role: 'Super Admin', phone: '081234567890', address: 'Jl. Admin No. 1' },
    { username: 'doctor', email: 'doctor@clinic.com', password: 'password', name: 'Dr. Mega Endahlestari', role: 'Dokter', phone: '081987654321', address: 'Jl. Dokter No. 10' },
    { username: 'cs', email: 'cs@clinic.com', password: 'password', name: 'Mba Fia', role: 'Customer Service', phone: '082111111111', address: 'Jl. Customer Service No. 5' },
    { username: 'hrd', email: 'hrd@clinic.com', password: 'password', name: 'Bu Yeyen', role: 'HRD', phone: '082222222222', address: 'Jl. HRD No. 8' },
    { username: 'spv_treatment', email: 'spv.treatment@clinic.com', password: 'password', name: 'Andi Pratama', role: 'Supervisor Treatment', phone: '082333333333', address: 'Jl. Supervisor Treatment No. 3' },
    { username: 'asisten_spv_treatment', email: 'asisten.spv.treatment@clinic.com', password: 'password', name: 'Andi Pratama', role: 'Asisten Supervisor Treatment', phone: '082444444444', address: 'Jl. Asisten Supervisor No. 2' },
    { username: 'spv_produk', email: 'spv.produk@clinic.com', password: 'password', name: 'Budi Santoso', role: 'Manajer Marketing of Sales', phone: '082555555555', address: 'Jl. Produk No. 7' },
    { username: 'gudang', email: 'gudang@clinic.com', password: 'password', name: 'Zulkifli', role: 'Gudang Umum', phone: '082666666666', address: 'Jl. Gudang No. 4' },
    { username: 'owner', email: 'owner@clinic.com', password: 'password', name: 'Nanin Lindiyawati', role: 'Owner', phone: '082777777777', address: 'Jl. Owner No. 1' },
    { username: 'ob', email: 'ob@clinic.com', password: 'password', name: 'Staff OB', role: 'Staff OB', phone: '082888888888', address: 'Jl. OB No. 6' },
    { username: 'satpam', email: 'satpam@clinic.com', password: 'password', name: 'Staff Satpam', role: 'Staff Satpam', phone: '082999999999', address: 'Jl. Satpam No. 9' },
    { username: 'apoteker', email: 'apoteker@clinic.com', password: 'password', name: 'Apoteker', role: 'Apoteker', phone: '083000000000', address: 'Jl. Apotek No. 12' },
    // Akun backend (fallback offline)
    { username: 'admin', email: 'admin@pbics.com', password: 'password123', name: 'Admin Utama', role: 'Super Admin', phone: '083111111111', address: 'Jl. Admin Utama No. 1' },
];

// ─── Helper: mapping role dari divisi + jabatan backend ─────────────────────
// Response API: { jabatan: "Lead", divisi: "Manager" }
const mapToRole = (jabatan = '', divisi = '') => {
    const d = divisi.toLowerCase();
    const j = jabatan.toLowerCase();

    // Mapping untuk Asisten (harus di atas agar tidak tersensor oleh role umum)
    if (d.includes('asisten supervisor treatment') || j.includes('asisten supervisor treatment')) return 'Asisten Supervisor Treatment';
    if (d.includes('asisten apoteker') || j.includes('asisten apoteker')) return 'Asisten Apoteker';
    if (d.includes('asisten') && d.includes('marketing of sales')) return 'Asisten Marketing of Sales';
    if (d.includes('asisten') && d.includes('finance')) return 'Asisten Finance';
    if (d.includes('lead finance')) return 'Lead Finance';

    // Mapping berdasarkan divisi (lebih spesifik)
    if (d.includes('manager') || d.includes('super admin')) return 'Super Admin';
    if (d.includes('dokter'))                               return 'Dokter';
    if (d.includes('kasir') || d.includes('customer service')) return 'Customer Service';
    if (d.includes('hrd'))                                  return 'HRD';
    if (d.includes('supervisor treatment'))                 return 'Supervisor Treatment';
    if (d.includes('supervisor produk') || d.includes('marketing of sales')) return 'Manajer Marketing of Sales';
    if (d.includes('gudang'))                               return 'Gudang Umum';
    if (d.includes('apoteker'))                             return 'Apoteker';
    if (d.includes('perawat'))                              return 'Dokter';
    if (d.includes('owner'))                                return 'Owner';
    if (d.includes('ob'))                                   return 'Staff OB';
    if (d.includes('satpam'))                               return 'Staff Satpam';
    if (d.includes('pantry'))                               return 'Pantry';
    
    // Fallback ke jabatan jika divisi tidak match
    if (j.includes('asisten'))                             return 'Asisten';
    if (j.includes('lead') || j.includes('manager'))       return 'Super Admin';
    return 'Customer Service';
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // ── Restore persisted session on mount ──────────────────────────────────
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    // ── Login: coba API dulu, fallback ke mock ───────────────────────────────
    const login = async (usernameOrEmail, password) => {
        // 1. Coba login ke backend API (kirim input apa adanya, api.js yang handle)
        const apiResult = await authAPI.login(usernameOrEmail, password);

        if (apiResult.success) {
            // ── Parse response: { message, access_token, token_type, data: {...} }
            const { access_token, data: apiUser } = apiResult.data;

            // Jika divisi tidak dikirim terpisah, ambil dari string jabatan (format: "POSISI - DIVISI")
            const fullJabatan = apiUser?.jabatan || '';
            const [extractedPosisi, ...divisiParts] = fullJabatan.split(' - ');
            const extractedDivisi = apiUser?.divisi || divisiParts.join(' - ') || extractedPosisi;

            // Fetch data detail karyawan untuk mendapatkan data lengkap (no_telp, alamat, email, dll)
            let detailData = {};
            if (apiUser?.id) {
                const detailResult = await karyawanAPI.getById(access_token, apiUser.id);
                if (detailResult.success && detailResult.data) {
                    const d = detailResult.data;
                    detailData = {
                        no_telp: d.No_Telp || d.no_telp || '',
                        alamat: d.Alamat || d.alamat || '',
                        email: d.Email || d.email || '',
                        tanggal_bergabung: d.Tanggal_bergabung || d.tanggal_bergabung || '',
                    };
                    console.log('[Auth] Detail karyawan:', detailData);
                }
            }

            const userData = {
                id:       apiUser?.id,
                name:     apiUser?.nama_lengkap || apiUser?.NamaLengkap_karyawan || usernameOrEmail,
                email:    detailData.email || apiUser?.email || apiUser?.Email || '',
                phone:    detailData.no_telp || apiUser?.no_telp || apiUser?.No_Telp || '',
                address:  detailData.alamat || apiUser?.alamat || apiUser?.Alamat || '',
                position: extractedPosisi || extractedDivisi,
                role:     mapToRole(fullJabatan, extractedDivisi),
                jabatan:  fullJabatan,
                divisi:   extractedDivisi,
                cabang:   apiUser?.cabang || apiUser?.Cabang || '',
                joinDate: (detailData.joinDate || detailData.tanggal_bergabung || apiUser?.tanggal_bergabung || apiUser?.Tanggal_bergabung || '').split('T')[0],
                token:    access_token,
                source:   'api',
            };

            console.log('[Auth] User logged in:', userData);
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', access_token);
            return { success: true };
        }

        // 2. Fallback: jika API gagal karena jaringan/server down → coba mock
        //    (Jika API menolak credentials, jangan fallback - langsung return error)
        const isNetworkError = apiResult.message?.includes('terhubung') || apiResult.message?.includes('server');

        if (isNetworkError) {
            console.warn('[Auth] API tidak tersedia, menggunakan data mock...');
            const foundUser = USER_SEEDER.find(
                u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password
            );

            if (foundUser) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const { password: _p, ...userWithoutPassword } = foundUser;
                        setUser(userWithoutPassword);
                        setIsAuthenticated(true);
                        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
                        resolve({ success: true });
                    }, 600);
                });
            }
            return Promise.resolve({ success: false, message: 'Username atau password salah' });
        }

        // API bisa dijangkau tapi credentials salah
        return Promise.resolve({ success: false, message: apiResult.message || 'Username atau password salah' });
    };

    // ── Logout ───────────────────────────────────────────────────────────────
    const logout = async () => {
        const token = user?.token || localStorage.getItem('token');
        if (token) {
            await authAPI.logout(token);
        }
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    // ── Update profil lokal & backend ────────────────────────────────────────
    const updateProfile = async (profileData) => {
        if (user?.source === 'api' && user?.id) {
            const mappedData = {
                name: profileData.name,
                email: profileData.email,
                phone: profileData.phone,
                alamat: profileData.address,
                tanggal_bergabung: profileData.joinDate,
            };
            const result = await karyawanAPI.update(user.token, user.id, mappedData);
            if (!result.success) {
                return result;
            }
        }
        const updated = { ...user, ...profileData };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        return { success: true };
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
