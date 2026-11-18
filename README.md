# titipjualsecond — Minimalist Second-Hand Shop & Admin CMS

Sistem website jual-beli barang second / preloved / vintage dengan 2 antarmuka terintegrasi:
1. **Toko Publik (`index.html`)** bernama **titipjualsecond**: Untuk pengunjung umum melihat katalog terkurasi, detail transparansi, dan checkout via WhatsApp.
2. **CMS Admin Panel (`admin.html`)**: Khusus pemilik/admin untuk memposting barang baru, mengisi detail transparansi kondisi, mengupload foto, mengedit, dan mengubah status stok (Ready vs Terjual).

---

## 🌟 2 Antarmuka Utama

### 1. Toko Publik (`index.html`)
- **Nama Toko**: `titipjualsecond`
- **Fitur untuk Pembeli**:
  - Filter kategori: Kamera & Gadget, Pakaian & Vintage, Sepatu & Tas, Jam & Aksesoris, Dekor & Hobi.
  - Filter Grade Kondisi: Grade S (*Like New*), Grade A (*Sangat Mulus*), Grade B (*Vintage*).
  - Pencarian *live* berdasarkan nama, brand, atau kategori.
  - Laporan Transparansi Kondisi (Fisik, Fungsi, Kelengkapan, Catatan Minus, Histori).
  - Indikator barang eksklusif (*1 Unit Tersedia* atau *TERJUAL / SOLD*).
  - Beli Cepat via WhatsApp & Keranjang Belanja multi-item.
  - Form Titip Jual / Konsinyasi bagi pengunjung yang ingin menitipkan barangnya.
  - Tautan langsung ke panel admin di bagian atas dan bawah halaman.

### 2. Panel Admin CMS (`admin.html`)
- **Fitur untuk Admin / Penjual**:
  - **Ringkasan Inventaris**: Total Barang, Barang Ready, Barang Terjual, dan Total Nilai Aset Inventaris.
  - **Posting Barang Baru**:
    - Nama barang, brand, kategori, ukuran/varian.
    - Harga jual & harga retail toko (otomatis menghitung persentase diskon).
    - Grade kondisi (Grade S, A, B) & persentase skor.
    - **Foto Barang**: Input URL gambar ATAU **Upload langsung dari komputer/HP** (preview otomatis).
    - **Detail Transparansi Barang Second**:
      - Kondisi Fisik Bodi (contoh: *9.5/10*)
      - Kondisi Fungsi Teknis (contoh: *100% normal*)
      - Kelengkapan (Box, Manual, Aksesoris)
      - Catatan Minus / Defect jujur
      - Histori / Asal barang
      - Deskripsi narasi produk
  - **Manajemen Inventaris**:
    - **Tandai Terjual / Ready**: Ubah status ketersediaan barang dengan 1 klik tombol.
    - **Edit Barang**: Perbarui rincian atau harga barang kapan saja.
    - **Hapus Barang**: Hapus barang dari katalog.
    - Pencarian cepat & filter status (Semua / Ready / Terjual).
  - **Sinkronisasi Real-time**: Barang yang baru diposting di CMS Admin langsung tampil seketika di Toko Publik (`index.html`)!

---

## 🚀 Cara Membuka & Mengakses

Semua berkas berada di folder **Documents** Anda:
> `C:\Users\Weltraf-Me\Documents\secondhand-minimalist\`

### Cara Akses:
1. **Buka Toko Publik (titipjualsecond)**:
   - Klik ganda pada file `index.html`, atau buka di browser:
     [index.html](file:///C:/Users/Weltraf-Me/Documents/secondhand-minimalist/index.html)
   - Atau lewat server lokal: `http://localhost:8080/index.html`

2. **Buka Panel Admin CMS (Input Barang)**:
   - Klik ganda pada file `admin.html`, atau buka di browser:
     [admin.html](file:///C:/Users/Weltraf-Me/Documents/secondhand-minimalist/admin.html)
   - Atau lewat server lokal: `http://localhost:8080/admin.html`
