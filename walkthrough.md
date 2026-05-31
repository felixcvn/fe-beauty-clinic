# Walkthrough: Integrasi Reservasi, Multi-Treatment, Pembuatan Pasien & Rekam Medis Otomatis

Kita telah sukses menyelesaikan implementasi fitur alur kerja Reservasi dan Rekam Medis sesuai dengan rencana aksi yang telah disetujui. 

Berikut adalah rangkuman dari apa yang telah kita lakukan beserta panduan verifikasinya.

---

## Rangkuman Perubahan

### 1. Database & Migrasi
- **File Migrasi:** [2026_05_31_164000_update_reservasis_and_rekam_medis_tables.php](file:///d:/PBICS/backend/database/migrations/2026_05_31_164000_update_reservasis_and_rekam_medis_tables.php)
- **Tabel `rekam_medis`:** Kolom `tekanan_darah` dan `keluhan_pasien` diubah menjadi `nullable()`.
- **Tabel `reservasis`:** Ditambahkan kolom `rekam_medis_id` (foreign key ke `rekam_medis.id`, nullable).
- **Tabel Pivot Baru:**
  - `reservasi_treatments` (relasi Many-to-Many ke `treatments`).
  - `reservasi_paket_treatments` (relasi Many-to-Many ke `paket_treatments`).

### 2. Pembaruan Model
- **[Reservasi.php](file:///d:/PBICS/backend/app/Models/Reservasi.php):**
  - Menambahkan `rekam_medis_id` ke fillable.
  - Menambahkan relasi `rekamMedis()`, `treatments()`, dan `paketTreatments()`.
  - Memperbarui accessor `getNamaTreatmentAttribute()` untuk menggabungkan nama dari banyak treatment & paket yang dipilih (contoh: *"Treatment Acne, Treatment Laser"*).
- **[RekamMedis.php](file:///d:/PBICS/backend/app/Models/RekamMedis.php):**
  - Menambahkan relasi `reservasi()` (`hasOne`).

### 3. Pembaruan Controller
- **[RekamMedisController.php](file:///d:/PBICS/backend/app/Http/Controllers/RekamMedisController.php):**
  - Validasi untuk `tekanan_darah` diubah menjadi `nullable` di method `store` dan `update`.
- **[ReservasiController.php](file:///d:/PBICS/backend/app/Http/Controllers/ReservasiController.php):**
  - **`store()`**: Menerapkan `DB::transaction`. Jika `register_pasien => true`, maka otomatis membuat data pasien baru (dengan no_RM dan Kode Customer auto-generate). Selanjutnya, membuat data rekam medis kosong yang otomatis tersambung, mensinkronisasikan multi-treatment ke pivot rekam medis dan reservasi, serta menyimpan data reservasi.
  - **`update()`**: Mensinkronisasikan data pivot, serta meng-update/sinkron data rekam medis terhubung jika `pasien_id` atau data lainnya berubah.
  - **`destroy()`**: Menggunakan `DB::transaction` untuk menghapus rekam medis kosong yang terhubung saat reservasi tersebut dihapus (tidak meninggalkan data sampah).
  - **Eager Loading**: Method `index()`, `show()`, `store()`, dan `update()` sekarang memuat relasi lengkap: `pasien`, `karyawan`, `treatment`, `paketTreatment`, `treatments`, `paketTreatments`, dan `rekamMedis`.

---

## Panduan Verifikasi Manual (Postman / Frontend)

### Skenario 1: Membuat Reservasi dengan Pasien Lama + Memilih Banyak Treatment
Kirim request `POST` ke `/api/reservasi`:
- **Payload:**
  ```json
  {
      "Tanggal_reservasi": "2026-06-01",
      "Jam_reservasi": "10:30",
      "pasien_id": "PASTE_PASIEN_UUID_DISINI",
      "No_Telp": "08123456789",
      "karyawan_id": "PASTE_KARYAWAN_UUID_DISINI",
      "treatment_ids": [1, 2],
      "Keterangan": "Ingin perawatan kulit sensitif"
  }
  ```
- **Ekspektasi Hasil:**
  - Response `201 Created`.
  - Terbentuk data rekam medis kosong baru dengan `tanggal_kunjungan: "2026-06-01"`, `tekanan_darah: null`, dan `keluhan_pasien: "Ingin perawatan kulit sensitif"`.
  - Pivot table `rekam_medis_treatments` berisi treatment `1` dan `2`.
  - Reservasi menyimpan `rekam_medis_id` yang benar.

### Skenario 2: Membuat Reservasi + Registrasi Pasien Baru Sekaligus
Kirim request `POST` ke `/api/reservasi`:
- **Payload:**
  ```json
  {
      "Tanggal_reservasi": "2026-06-02",
      "Jam_reservasi": "14:00",
      "register_pasien": true,
      "Nama_pasien": "Andi Wijaya",
      "No_Telp": "08987654321",
      "karyawan_id": "PASTE_KARYAWAN_UUID_DISINI",
      "no_Identitas": "3201010101010001",
      "Tempat_Lahir": "Jakarta",
      "Tanggal_Lahir": "1995-05-15",
      "Jenis_Kelamin": "Laki-laki",
      "Email": "andi@example.com",
      "Alamat": "Jl. Mawar No. 12",
      "KabKota_id": 1,
      "Kec_id": 1,
      "treatment_ids": [1]
  }
  ```
- **Ekspektasi Hasil:**
  - Pasien baru bernama "Andi Wijaya" otomatis terbuat di database dengan `no_RM` dan `kode_Customer` resmi.
  - Rekam medis kosong terbuat untuk Andi.
  - Reservasi terbuat dengan `pasien_id` Andi dan `rekam_medis_id` baru tersebut.

### Skenario 3: Dokter Mengupdate Rekam Medis saat Pasien Datang
Kirim request `PUT` ke `/api/rekam-medis/{rekam_medis_id}`:
- **Payload:**
  ```json
  {
      "data_pasien_id": "PASTE_PASIEN_UUID_DISINI",
      "tanggal_kunjungan": "2026-06-01",
      "dokter_id": "PASTE_DOKTER_UUID_DISINI",
      "tekanan_darah": "120/80",
      "riwayat_penyakit": "Tidak ada",
      "keluhan_pasien": "Kulit kemerahan",
      "diagnosa": "Iritasi ringan",
      "catatan_tindakan": "Diberikan krim penenang kulit",
      "treatments": [1, 2]
  }
  ```
- **Ekspektasi Hasil:**
  - Data Rekam Medis berhasil dilengkapi dengan tekanan darah, diagnosa, dan dokter pemeriksa.
