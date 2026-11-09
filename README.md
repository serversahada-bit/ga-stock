# GA Stock — versi Next.js

Hasil porting aplikasi **GA Stock** (manajemen stok gudang) dari Laravel ke
**Next.js 16 (App Router) + TypeScript + Prisma + Tailwind CSS v4**.

Aplikasi ini **full-stack**: UI, API (lewat Server Actions), dan akses database
ditangani langsung oleh Next.js. Tidak membutuhkan backend Laravel.

> Versi Laravel aslinya tetap utuh di folder `../dashboard-app`. Keduanya
> menunjuk ke database MySQL yang sama (`ga_stock`), sehingga data, produk, dan
> akun login identik.

## Stack

| Bagian        | Teknologi                               |
| ------------- | --------------------------------------- |
| Framework     | Next.js 16 (App Router), React 19       |
| Bahasa        | TypeScript                              |
| Database/ORM  | MySQL + Prisma 6                         |
| Styling       | Tailwind CSS v4 (sistem desain sendiri) |
| Auth          | Session cookie (JWT via `jose`) + bcrypt|
| Chart         | Recharts                                |

## Fitur

- **Login/Logout** — memakai hash bcrypt yang sama dengan Laravel, jadi akun lama
  (mis. `admin@ga.local`) langsung bisa dipakai.
- **Role**: `admin` (akses penuh) & `view` (hanya lihat dashboard stok).
- **Dashboard**: kartu statistik, filter bulan/tahun/kelompok, grafik outbound,
  tabel stok, dan laporan stok keluar per divisi.
- **Produk**: CRUD + pencarian (nama / SKU / kategori), status Low/OK/Nonaktif.
- **Kategori & Divisi**: CRUD inline.
- **Inbound / Outbound**: pencatatan transaksi dengan penyesuaian stok otomatis.
  Outbound menolak bila stok tidak cukup; hapus transaksi mengembalikan stok.
  Operasi stok memakai transaksi + update atomik (aman dari race condition).

## Menjalankan

```bash
# 1. Pasang dependency
npm install

# 2. Siapkan .env (salin dari contoh, lalu sesuaikan)
cp .env.example .env
#   - DATABASE_URL : koneksi MySQL ke database ga_stock
#   - AUTH_SECRET  : node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 3. Generate Prisma Client
npx prisma generate

# 4. Jalankan (mode dev)
npm run dev
# buka http://localhost:3000
```

Build produksi: `npm run build` lalu `npm start`.

## Catatan skema

`prisma/schema.prisma` dipetakan **persis** ke tabel Laravel yang sudah ada
(`@map` ke nama kolom/tabel asli). Prisma hanya **membaca & menulis** data —
tidak membuat atau mengubah struktur tabel. Migrasi skema tetap dikelola di
sisi Laravel.

## Perbaikan dibanding versi Laravel

- Validasi lengkap pada update Produk/Kategori/Divisi (sebelumnya tanpa validasi).
- Filter dashboard mendukung **tahun** (sebelumnya terkunci ke tahun berjalan)
  dan memvalidasi input bulan/tahun.
- Pesan sukses/gagal konsisten di semua operasi.
- Penghapusan dijaga: kategori/produk yang masih punya relasi tidak bisa dihapus
  sembarangan.
