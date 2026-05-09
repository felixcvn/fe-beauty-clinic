/**
 * API Service Layer
 * Menghubungkan frontend ke backend Laravel via ngrok
 */

// Gunakan proxy '/api' saat development untuk menghindari CORS, atau full URL saat production
// Gunakan proxy '/api' agar tidak kena CORS (OPTIONS) saat development
// Gunakan proxy '/api' saat development untuk menghindari CORS
const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]'
);
const BASE_URL = isLocalhost ? '/api' : ' https://composite-footprint-overarch.ngrok-free.dev/api';

// Default headers - wajib ada ngrok-skip-browser-warning agar tidak redirect ke halaman ngrok
const getHeaders = (token = null) => {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

/**
 * AUTH ENDPOINTS
 */
export const authAPI = {
    /**
     * Login ke backend
     * @param {string} usernameOrEmail - bisa username atau email
     * @param {string} password
     * @returns {Promise<{success: boolean, data?: object, message?: string}>}
     */
    login: async (usernameOrEmail, password) => {
        try {
            // Backend expect: 'Username' dan 'Password' (kapital)
            const body = { Username: usernameOrEmail, Password: password };

            console.log('[API] Login payload:', { Username: usernameOrEmail, Password: '***' });

            const response = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(body),
            });

            const data = await response.json();
            console.log('[API] Login response:', response.status, data);

            if (response.ok) {
                return { success: true, data };
            } else {
                // 422 = validasi gagal — tampilkan detail error
                if (response.status === 422 && data.errors) {
                    const firstError = Object.values(data.errors).flat()[0];
                    return { success: false, message: firstError || data.message || 'Data tidak valid' };
                }
                return {
                    success: false,
                    message: data.message || 'Username atau password salah',
                };
            }
        } catch (error) {
            console.error('[API] Login error:', error);
            return {
                success: false,
                message: 'Tidak dapat terhubung ke server. Cek koneksi internet kamu.',
            };
        }
    },

    /**
     * Logout dari backend (invalidate token)
     * @param {string} token
     */
    logout: async (token) => {
        try {
            await fetch(`${BASE_URL}/logout`, {
                method: 'POST',
                headers: getHeaders(token),
            });
        } catch (error) {
            console.error('[API] Logout error:', error);
        }
    },
};

/**
 * KARYAWAN ENDPOINTS
 */
export const karyawanAPI = {
    /**
     * Ambil semua data karyawan (paginated)
     * @param {string} token
     * @param {number} page
     * @returns {Promise<{success: boolean, data?: object, message?: string}>}
     */
    getAll: async (token, page = 1) => {
        try {
            const response = await fetch(`${BASE_URL}/karyawan?page=${page}`, {
                method: 'GET',
                headers: getHeaders(token),
            });

            const json = await response.json();

            if (response.ok) {
                return { success: true, data: json };
            } else {
                return {
                    success: false,
                    message: json.message || 'Gagal mengambil data karyawan',
                };
            }
        } catch (error) {
            console.error('[API] Get karyawan error:', error);
            return {
                success: false,
                message: 'Tidak dapat terhubung ke server.',
            };
        }
    },

    /**
     * Ambil detail karyawan berdasarkan ID
     * @param {string} token
     * @param {string|number} id
     */
    getById: async (token, id) => {
        try {
            const response = await fetch(`${BASE_URL}/karyawan/${id}`, {
                method: 'GET',
                headers: getHeaders(token),
            });

            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json.data || json };
            } else {
                return { success: false, message: json.message || 'Gagal mengambil detail karyawan' };
            }
        } catch (error) {
            console.error('[API] Get detail karyawan error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    /**
     * Tambah data karyawan baru
     * @param {string} token
     * @param {object} data (Data form dari frontend)
     */
    create: async (token, data) => {
        try {
            // Map frontend state to backend expected fields
            const payload = {
                NamaLengkap_karyawan: data.name,
                nama_lengkap: data.name,
                Nomor_Identitas: data.nik,
                nomor_identitas: data.nik,
                nik: data.nik,
                Tanggal_Lahir: data.tanggal_lahir,
                tanggal_lahir: data.tanggal_lahir,
                Tempat_Lahir: data.tempat_lahir || "Tidak Diketahui",
                tempat_lahir: data.tempat_lahir || "Tidak Diketahui",
                Alamat: data.alamat,
                alamat: data.alamat,
                Divisi: data.divisi,
                divisi: data.divisi,
                Jabatan: data.posisi,
                jabatan: data.posisi,
                posisi: data.posisi,
                Cabang: data.cabang,
                cabang: data.cabang,
                Email: data.email,
                email: data.email,
                No_Telp: data.phone,
                no_telp: data.phone,
                Username: data.username,
                username: data.username,
                Password: data.password,
                password: data.password,
                Tanggal_bergabung: data.tanggal_bergabung || new Date().toISOString().split('T')[0],
                tanggal_bergabung: data.tanggal_bergabung || new Date().toISOString().split('T')[0],
            };

            // Logic backend: Owner dan Super Admin tidak punya Jabatan (null)
            if (payload.Divisi === 'Owner' || payload.Divisi === 'Super Admin') {
                payload.Jabatan = null;
                payload.jabatan = null;
                payload.posisi = null;
            }

            const response = await fetch(`${BASE_URL}/karyawan`, {
                method: 'POST',
                headers: getHeaders(token),
                body: JSON.stringify(payload),
            });

            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json };
            } else {
                if (response.status === 422 && json.errors) {
                    const firstError = Object.values(json.errors).flat()[0];
                    return { success: false, message: firstError || json.message || 'Data tidak valid' };
                }
                return { success: false, message: json.message || 'Gagal menambah karyawan' };
            }
        } catch (error) {
            console.error('[API] Create karyawan error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    /**
     * Update data karyawan
     * @param {string} token
     * @param {string|number} id
     * @param {object} data
     */
    update: async (token, id, data) => {
        try {
            // Map frontend state to backend expected fields
            // Gunakan banyak alias agar kompatibel dengan berbagai versi backend
            const payload = {
                _method: 'PUT', // Trik Laravel untuk handle PUT via POST
                NamaLengkap_karyawan: data.name,
                nama_lengkap: data.name,
                Nomor_Identitas: data.nik,
                nomor_identitas: data.nik,
                nik: data.nik,
                Tanggal_Lahir: data.tanggal_lahir,
                tanggal_lahir: data.tanggal_lahir,
                Tempat_Lahir: data.tempat_lahir || "Tidak Diketahui",
                tempat_lahir: data.tempat_lahir || "Tidak Diketahui",
                Alamat: data.alamat,
                alamat: data.alamat,
                Divisi: data.divisi,
                divisi: data.divisi,
                Jabatan: data.posisi,
                jabatan: data.posisi,
                posisi: data.posisi,
                Cabang: data.cabang,
                cabang: data.cabang,
                Email: data.email,
                email: data.email,
                No_Telp: data.phone,
                no_telp: data.phone,
                Username: data.username,
                username: data.username,
                Tanggal_bergabung: data.tanggal_bergabung,
                tanggal_bergabung: data.tanggal_bergabung,
            };

            // Pastikan Jabatan dihapus (null) jika divisi adalah Owner atau Super Admin sesuai logic backend
            if (payload.Divisi === 'Owner' || payload.Divisi === 'Super Admin') {
                payload.Jabatan = null;
                payload.jabatan = null;
                payload.posisi = null;
            }

            // Only send password if it's being updated
            if (data.password && data.password.trim() !== '') {
                payload.Password = data.password;
                payload.password = data.password;
            }

            // Gunakan POST dengan _method: 'PUT' karena lebih stabil di PHP/Laravel
            const response = await fetch(`${BASE_URL}/karyawan/${id}`, {
                method: 'POST',
                headers: getHeaders(token),
                body: JSON.stringify(payload),
            });

            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json };
            } else {
                if (response.status === 422 && json.errors) {
                    const firstError = Object.values(json.errors).flat()[0];
                    return { success: false, message: firstError || json.message || 'Data tidak valid' };
                }
                return { success: false, message: json.message || 'Gagal mengupdate karyawan' };
            }
        } catch (error) {
            console.error('[API] Update karyawan error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    /**
     * Hapus data karyawan
     * @param {string} token
     * @param {string|number} id
     */
    delete: async (token, id) => {
        try {
            const response = await fetch(`${BASE_URL}/karyawan/${id}`, {
                method: 'DELETE',
                headers: getHeaders(token),
            });

            if (response.ok) {
                return { success: true };
            } else {
                const json = await response.json();
                return { success: false, message: json.message || 'Gagal menghapus karyawan' };
            }
        } catch (error) {
            console.error('[API] Delete karyawan error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },
};

/* ─────────────────────────────────────────────────────────────
   Pasien API
───────────────────────────────────────────────────────────── */
export const pasienAPI = {
    getAll: async (token, page = 1) => {
        try {
            const response = await fetch(`${BASE_URL}/pasien?page=${page}`, {
                method: 'GET',
                headers: getHeaders(token),
            });
            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json };
            } else {
                return { success: false, message: json.message || 'Gagal mengambil data pasien' };
            }
        } catch (error) {
            console.error('[API] Get pasien error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    getById: async (token, id) => {
        try {
            const response = await fetch(`${BASE_URL}/pasien/${id}`, {
                method: 'GET',
                headers: getHeaders(token),
            });
            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json.data || json };
            } else {
                return { success: false, message: json.message || 'Gagal mengambil detail pasien' };
            }
        } catch (error) {
            console.error('[API] Get detail pasien error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    getNextNumbers: async (token) => {
        try {
            const response = await fetch(`${BASE_URL}/pasien/next-numbers`, {
                method: 'GET',
                headers: getHeaders(token),
            });
            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json.data || json };
            }
            return { success: false, message: json.message || 'Gagal mengambil nomor otomatis' };
        } catch (error) {
            console.error('[API] Get next numbers error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    create: async (token, data) => {
        try {
            const payload = {
                kode_Customer: data.kodeCustomer || null,
                no_member: data.noMember || null,
                Tipe_member: data.tipeMember || 'Non Member',
                tipe_member: data.tipeMember || 'Non Member',
                Tipe_Member: data.tipeMember || 'Non Member',
                no_RM: data.noRM,
                Nama_pasien: data.namaLengkap,
                no_Identitas: data.noIdentitas,
                No_Identitas: data.noIdentitas,
                Nomor_Identitas: data.noIdentitas,
                no_identitas: data.noIdentitas,
                Tempat_Lahir: data.tempatLahir,
                Tanggal_Lahir: data.tanggalLahir,
                Jenis_Kelamin: data.jenisKelamin,
                jenis_kelamin: data.jenisKelamin,
                Email: data.email || null,
                no_Telp: data.noTelepon,
                Alamat: data.alamat || null,
                KabKota_id: data.kabupatenKota || null,
                Kec_id: data.kecamatan || null,
            };

            const response = await fetch(`${BASE_URL}/pasien`, {
                method: 'POST',
                headers: getHeaders(token),
                body: JSON.stringify(payload),
            });

            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json };
            } else {
                if (response.status === 422 && json.errors) {
                    const firstError = Object.values(json.errors).flat()[0];
                    return { success: false, message: firstError || json.message || 'Data tidak valid' };
                }
                return { success: false, message: json.message || 'Gagal menambah pasien' };
            }
        } catch (error) {
            console.error('[API] Create pasien error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    update: async (token, id, data) => {
        try {
            const payload = {
                _method: 'PUT',
                kode_Customer: data.kodeCustomer || null,
                no_member: data.noMember || null,
                Tipe_member: data.tipeMember || 'Non Member',
                tipe_member: data.tipeMember || 'Non Member',
                Tipe_Member: data.tipeMember || 'Non Member',
                no_RM: data.noRM,
                Nama_pasien: data.namaLengkap,
                nama_pasien: data.namaLengkap,
                no_Identitas: data.noIdentitas,
                No_Identitas: data.noIdentitas,
                Nomor_Identitas: data.noIdentitas,
                no_identitas: data.noIdentitas,
                nik: data.noIdentitas,
                Tempat_Lahir: data.tempatLahir,
                tempat_lahir: data.tempatLahir,
                Tanggal_Lahir: data.tanggalLahir,
                tanggal_lahir: data.tanggal_lahir,
                Jenis_Kelamin: data.jenisKelamin,
                jenis_kelamin: data.jenisKelamin,
                Email: data.email || null,
                email: data.email || null,
                no_Telp: data.noTelepon,
                no_telp: data.noTelepon,
                Alamat: data.alamat || null,
                alamat: data.alamat || null,
                KabKota_id: data.kabupatenKota || null,
                Kec_id: data.kecamatan || null,
            };
            
            const response = await fetch(`${BASE_URL}/pasien/${id}`, {
                method: 'POST',
                headers: getHeaders(token),
                body: JSON.stringify(payload),
            });

            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json };
            } else {
                if (response.status === 422 && json.errors) {
                    const firstError = Object.values(json.errors).flat()[0];
                    return { success: false, message: firstError || json.message || 'Data tidak valid' };
                }
                return { success: false, message: json.message || 'Gagal mengupdate pasien' };
            }
        } catch (error) {
            console.error('[API] Update pasien error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    delete: async (token, id) => {
        try {
            const response = await fetch(`${BASE_URL}/pasien/${id}`, {
                method: 'DELETE',
                headers: getHeaders(token),
            });

            if (response.ok) {
                return { success: true };
            } else {
                const json = await response.json();
                return { success: false, message: json.message || 'Gagal menghapus pasien' };
            }
        } catch (error) {
            console.error('[API] Delete pasien error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },
};

/* ─────────────────────────────────────────────────────────────
   Wilayah API
───────────────────────────────────────────────────────────── */
export const wilayahAPI = {
    getKabKota: async (token) => {
        try {
            const response = await fetch(`${BASE_URL}/wilayah/kabkota`, {
                method: 'GET',
                headers: getHeaders(token),
            });
            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json.data || json };
            }
            return { success: false, message: json.message || 'Gagal mengambil data KabKota' };
        } catch (error) {
            console.error('[API] Get KabKota error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    getKecamatan: async (token, kabKotaId) => {
        try {
            const response = await fetch(`${BASE_URL}/wilayah/kecamatan/${kabKotaId}`, {
                method: 'GET',
                headers: getHeaders(token),
            });
            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json.data || json };
            }
            return { success: false, message: json.message || 'Gagal mengambil data Kecamatan' };
        } catch (error) {
            console.error('[API] Get Kecamatan error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    }
};

/* ─────────────────────────────────────────────────────────────
   Stok Produk API
───────────────────────────────────────────────────────────── */
export const stokProdukAPI = {
    getAll: async (token) => {
        try {
            const response = await fetch(`${BASE_URL}/stok-produk`, {
                method: 'GET',
                headers: getHeaders(token),
            });
            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json.data || json };
            }
            return { success: false, message: json.message || 'Gagal mengambil data stok produk' };
        } catch (error) {
            console.error('[API] Get stok produk error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },
    getNextCode: async (token) => {
        try {
            const response = await fetch(`${BASE_URL}/stok-produk/next-number`, {
                method: 'GET',
                headers: getHeaders(token),
            });
            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json.data || json };
            }
            return { success: false, message: json.message || 'Gagal mengambil kode otomatis' };
        } catch (error) {
            console.error('[API] Get next code error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    getById: async (token, id) => {
        try {
            const response = await fetch(`${BASE_URL}/stok-produk/${id}`, {
                method: 'GET',
                headers: getHeaders(token),
            });
            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json.data || json };
            }
            return { success: false, message: json.message || 'Gagal mengambil detail stok produk' };
        } catch (error) {
            console.error('[API] Get detail stok produk error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    create: async (token, data) => {
        try {
            // Super-Redundant Payload: Kirim SEMUA variasi field agar pasti masuk ke database
            const payload = {
                // Identitas & Nama
                Kode_Produk: data.id,
                Kode_paket: data.id,
                Nama_produk: data.name,
                Nama_paket: data.name,
                Deskripsi: data.description || '',
                Kategori: data.category || (data.isPackage ? 'Paket' : 'Lainnya'),
                
                // Harga
                Harga: data.price || 0,
                Harga_paket: data.price || 0,
                Harga_Distributor: data.priceDistributor || 0,
                harga_distributor: data.priceDistributor || 0,
                Harga_Distributor_paket: data.priceDistributor || 0,
                
                // Stok
                Stok: data.stock || 0,
                stok: data.stock || 0,
                Batas_minimal_stok: data.minStock || 0,
                batas_minimal_stok: data.minStock || 0,
                
                // Flag
                is_package: data.isPackage ? 1 : 0,
                is_paket: data.isPackage ? 1 : 0,

                // Daftar Produk Paket (Kirim dalam berbagai format)
                produks: (data.package_items || []).map(item => ({
                    stok_produk_id: item.id,
                    produk_id: item.id,
                    id: item.id,
                    Jumlah: item.quantity,
                    jumlah: item.quantity,
                    qty: item.quantity
                })),
                produk: (data.package_items || []).map(item => ({
                    stok_produk_id: item.id,
                    produk_id: item.id,
                    id: item.id,
                    Jumlah: item.quantity,
                    jumlah: item.quantity,
                    qty: item.quantity
                })),
                package_items: (data.package_items || []).map(item => ({
                    stok_produk_id: item.id,
                    Jumlah: item.quantity
                })),
                produk_ids: (data.package_items || []).map(item => item.id),
                quantities: (data.package_items || []).map(item => item.quantity)
            };

            const response = await fetch(`${BASE_URL}/stok-produk`, {
                method: 'POST',
                headers: getHeaders(token),
                body: JSON.stringify(payload),
            });

            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json };
            } else {
                if (response.status === 422 && json.errors) {
                    const firstError = Object.values(json.errors).flat()[0];
                    return { success: false, message: firstError || json.message || 'Data tidak valid' };
                }
                return { success: false, message: json.message || 'Gagal menambah stok produk' };
            }
        } catch (error) {
            console.error('[API] Create stok produk error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },

    update: async (token, id, data) => {
        try {
            // Super-Redundant Payload untuk Update
            const payload = {
                _method: 'PUT',
                // Identitas & Nama
                Kode_Produk: data.id,
                Kode_paket: data.id,
                Nama_produk: data.name,
                Nama_paket: data.name,
                Deskripsi: data.description || '',
                Kategori: data.category || (data.isPackage ? 'Paket' : 'Lainnya'),
                
                // Harga
                Harga: data.price || 0,
                Harga_paket: data.price || 0,
                Harga_Distributor: data.priceDistributor || 0,
                harga_distributor: data.priceDistributor || 0,
                Harga_Distributor_paket: data.priceDistributor || 0,
                
                // Stok
                Stok: data.stock || 0,
                stok: data.stock || 0,
                Batas_minimal_stok: data.minStock || 0,
                batas_minimal_stok: data.minStock || 0,
                
                // Flag
                is_package: data.isPackage ? 1 : 0,
                is_paket: data.isPackage ? 1 : 0,

                // Daftar Produk Paket
                produks: (data.package_items || []).map(item => ({
                    stok_produk_id: item.id,
                    produk_id: item.id,
                    id: item.id,
                    Jumlah: item.quantity,
                    jumlah: item.quantity,
                    qty: item.quantity
                })),
                produk: (data.package_items || []).map(item => ({
                    stok_produk_id: item.id,
                    produk_id: item.id,
                    id: item.id,
                    Jumlah: item.quantity,
                    jumlah: item.quantity,
                    qty: item.quantity
                })),
                package_items: (data.package_items || []).map(item => ({
                    stok_produk_id: item.id,
                    Jumlah: item.quantity
                })),
                produk_ids: (data.package_items || []).map(item => item.id),
                quantities: (data.package_items || []).map(item => item.quantity)
            };

            const response = await fetch(`${BASE_URL}/stok-produk/${id}`, {
                method: 'POST',
                headers: getHeaders(token),
                body: JSON.stringify(payload),
            });

            const json = await response.json();
            if (response.ok) {
                return { success: true, data: json };
            } else {
                if (response.status === 422 && json.errors) {
                    const firstError = Object.values(json.errors).flat()[0];
                    return { success: false, message: firstError || json.message || 'Data tidak valid' };
                }
                return { success: false, message: json.message || 'Gagal mengupdate stok produk' };
            }
        } catch (error) {
            console.error('[API] Update stok produk error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },
    
    delete: async (token, id) => {
        try {
            const response = await fetch(`${BASE_URL}/stok-produk/${id}`, {
                method: 'DELETE',
                headers: getHeaders(token),
            });

            if (response.ok) {
                return { success: true };
            } else {
                const json = await response.json();
                return { success: false, message: json.message || 'Gagal menghapus stok produk' };
            }
        } catch (error) {
            console.error('[API] Delete stok produk error:', error);
            return { success: false, message: 'Tidak dapat terhubung ke server.' };
        }
    },
};

/* ─────────────────────────────────────────────────────────────
   Apoteker Inventory APIs
───────────────────────────────────────────────────────────── */
export const bahanTreatmentAPI = {
    getAll: async (token) => {
        try {
            const response = await fetch(`${BASE_URL}/stok-bahan-treatment`, { method: 'GET', headers: getHeaders(token) });
            const json = await response.json();
            if (response.ok) return { success: true, data: json.data || json };
            return { success: false, message: json.message || 'Gagal mengambil data' };
        } catch (error) { return { success: false, message: 'Tidak dapat terhubung ke server.' }; }
    },
    getNextCode: async (token) => {
        try {
            const response = await fetch(`${BASE_URL}/stok-bahan-treatment/next-number`, { method: 'GET', headers: getHeaders(token) });
            const json = await response.json();
            if (response.ok) return { success: true, data: json.data || json };
            return { success: false, message: json.message || 'Gagal mengambil kode otomatis' };
        } catch (error) { return { success: false, message: 'Tidak dapat terhubung ke server.' }; }
    },
    create: async (token, data) => {
        try {
            const payload = {
                Kode_Produk: data.id,
                Nama_produk: data.name,
                Kategori: data.category,
                Harga: data.price || 0,
                Stok: data.stock,
                Batas_minimal_stok: data.minStock,
            };
            const response = await fetch(`${BASE_URL}/stok-bahan-treatment`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(payload) });
            const json = await response.json();
            if (response.ok) return { success: true, data: json };
            if (response.status === 422 && json.errors) return { success: false, message: Object.values(json.errors).flat()[0] || 'Data tidak valid' };
            return { success: false, message: json.message || 'Gagal menambah data' };
        } catch (error) { return { success: false, message: 'Tidak dapat terhubung ke server.' }; }
    },
    update: async (token, id, data) => {
        try {
            const payload = {
                Kode_Produk: data.id,
                Nama_produk: data.name,
                Kategori: data.category,
                Harga: data.price || 0,
                Stok: data.stock,
                Batas_minimal_stok: data.minStock,
            };
            const response = await fetch(`${BASE_URL}/stok-bahan-treatment/${id}`, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify(payload) });
            const json = await response.json();
            if (response.ok) return { success: true, data: json };
            if (response.status === 422 && json.errors) return { success: false, message: Object.values(json.errors).flat()[0] || 'Data tidak valid' };
            return { success: false, message: json.message || 'Gagal mengupdate data' };
        } catch (error) { return { success: false, message: 'Tidak dapat terhubung ke server.' }; }
    }
};

export const bahanMedisAPI = {
    getAll: async (token) => {
        try {
            const response = await fetch(`${BASE_URL}/stok-bahan-medis`, { method: 'GET', headers: getHeaders(token) });
            const json = await response.json();
            if (response.ok) return { success: true, data: json.data || json };
            return { success: false, message: json.message || 'Gagal mengambil data' };
        } catch (error) { return { success: false, message: 'Tidak dapat terhubung ke server.' }; }
    },
    getNextCode: async (token) => {
        try {
            const response = await fetch(`${BASE_URL}/stok-bahan-medis/next-number`, { method: 'GET', headers: getHeaders(token) });
            const json = await response.json();
            if (response.ok) return { success: true, data: json.data || json };
            return { success: false, message: json.message || 'Gagal mengambil kode otomatis' };
        } catch (error) { return { success: false, message: 'Tidak dapat terhubung ke server.' }; }
    },
    create: async (token, data) => {
        try {
            const payload = {
                Kode_Produk: data.id,
                Nama_bahan_medis: data.name,
                Kategori: data.category,
                Stok: data.stock,
                Batas_minimal_stok: data.minStock,
            };
            const response = await fetch(`${BASE_URL}/stok-bahan-medis`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(payload) });
            const json = await response.json();
            if (response.ok) return { success: true, data: json };
            if (response.status === 422 && json.errors) return { success: false, message: Object.values(json.errors).flat()[0] || 'Data tidak valid' };
            return { success: false, message: json.message || 'Gagal menambah data' };
        } catch (error) { return { success: false, message: 'Tidak dapat terhubung ke server.' }; }
    },
    update: async (token, id, data) => {
        try {
            const payload = {
                Kode_Produk: data.id,
                Nama_bahan_medis: data.name,
                Kategori: data.category,
                Stok: data.stock,
                Batas_minimal_stok: data.minStock,
            };
            const response = await fetch(`${BASE_URL}/stok-bahan-medis/${id}`, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify(payload) });
            const json = await response.json();
            if (response.ok) return { success: true, data: json };
            if (response.status === 422 && json.errors) return { success: false, message: Object.values(json.errors).flat()[0] || 'Data tidak valid' };
            return { success: false, message: json.message || 'Gagal mengupdate data' };
        } catch (error) { return { success: false, message: 'Tidak dapat terhubung ke server.' }; }
    }
};

export const bahanInfusAPI = {
    getAll: async (token) => {
        try {
            const response = await fetch(`${BASE_URL}/stok-bahan-infus`, { method: 'GET', headers: getHeaders(token) });
            const json = await response.json();
            if (response.ok) return { success: true, data: json.data || json };
            return { success: false, message: json.message || 'Gagal mengambil data' };
        } catch (error) { return { success: false, message: 'Tidak dapat terhubung ke server.' }; }
    },
    getNextCode: async (token) => {
        try {
            const response = await fetch(`${BASE_URL}/stok-bahan-infus/next-number`, { method: 'GET', headers: getHeaders(token) });
            const json = await response.json();
            if (response.ok) return { success: true, data: json.data || json };
            return { success: false, message: json.message || 'Gagal mengambil kode otomatis' };
        } catch (error) { return { success: false, message: 'Tidak dapat terhubung ke server.' }; }
    },
    create: async (token, data) => {
        try {
            const payload = {
                Kode_Produk: data.id,
                Nama_bahan_infus: data.name,
                Kategori: data.category || null,
                Stok: data.stock,
                Batas_minimal_stok: data.minStock,
            };
            const response = await fetch(`${BASE_URL}/stok-bahan-infus`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(payload) });
            const json = await response.json();
            if (response.ok) return { success: true, data: json };
            if (response.status === 422 && json.errors) return { success: false, message: Object.values(json.errors).flat()[0] || 'Data tidak valid' };
            return { success: false, message: json.message || 'Gagal menambah data' };
        } catch (error) { return { success: false, message: 'Tidak dapat terhubung ke server.' }; }
    },
    update: async (token, id, data) => {
        try {
            const payload = {
                Kode_Produk: data.id,
                Nama_bahan_infus: data.name,
                Kategori: data.category || null,
                Stok: data.stock,
                Batas_minimal_stok: data.minStock,
            };
            const response = await fetch(`${BASE_URL}/stok-bahan-infus/${id}`, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify(payload) });
            const json = await response.json();
            if (response.ok) return { success: true, data: json };
            if (response.status === 422 && json.errors) return { success: false, message: Object.values(json.errors).flat()[0] || 'Data tidak valid' };
            return { success: false, message: json.message || 'Gagal mengupdate data' };
        } catch (error) { return { success: false, message: 'Tidak dapat terhubung ke server.' }; }
    }
};

export const barangApotekAPI = {
    getAll: async (token) => {
        try {
            const response = await fetch(`${BASE_URL}/stok-barang-apotek`, { method: 'GET', headers: getHeaders(token) });
            const json = await response.json();
            if (response.ok) return { success: true, data: json.data || json };
            return { success: false, message: json.message || 'Gagal mengambil data' };
        } catch (error) { return { success: false, message: 'Tidak dapat terhubung ke server.' }; }
    },
    getNextCode: async (token) => {
        try {
            const response = await fetch(`${BASE_URL}/stok-barang-apotek/next-number`, { method: 'GET', headers: getHeaders(token) });
            const json = await response.json();
            if (response.ok) return { success: true, data: json.data || json };
            return { success: false, message: json.message || 'Gagal mengambil kode otomatis' };
        } catch (error) { return { success: false, message: 'Tidak dapat terhubung ke server.' }; }
    },
    create: async (token, data) => {
        try {
            const payload = {
                Kode_Produk: data.id,
                Nama_barang_apotek: data.name,
                Kategori: data.category || null,
                Stok: data.stock,
                Batas_minimal_stok: data.minStock,
            };
            const response = await fetch(`${BASE_URL}/stok-barang-apotek`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(payload) });
            const json = await response.json();
            if (response.ok) return { success: true, data: json };
            if (response.status === 422 && json.errors) return { success: false, message: Object.values(json.errors).flat()[0] || 'Data tidak valid' };
            return { success: false, message: json.message || 'Gagal menambah data' };
        } catch (error) { return { success: false, message: 'Tidak dapat terhubung ke server.' }; }
    },
    update: async (token, id, data) => {
        try {
            const payload = {
                Kode_Produk: data.id,
                Nama_barang_apotek: data.name,
                Kategori: data.category || null,
                Stok: data.stock,
                Batas_minimal_stok: data.minStock,
            };
            const response = await fetch(`${BASE_URL}/stok-barang-apotek/${id}`, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify(payload) });
            const json = await response.json();
            if (response.ok) return { success: true, data: json };
            if (response.status === 422 && json.errors) return { success: false, message: Object.values(json.errors).flat()[0] || 'Data tidak valid' };
            return { success: false, message: json.message || 'Gagal mengupdate data' };
        } catch (error) { return { success: false, message: 'Tidak dapat terhubung ke server.' }; }
    }
};

export default { authAPI, karyawanAPI, pasienAPI, wilayahAPI, stokProdukAPI, bahanTreatmentAPI, bahanMedisAPI, bahanInfusAPI, barangApotekAPI };
