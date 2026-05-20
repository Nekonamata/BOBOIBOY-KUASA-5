# TODO

- [ ] Verifikasi endpoint backend untuk validasi peminjaman (selesai: route sudah ditemukan)
- [x] Update frontend `src/pages/admin/ValidasiPeminjaman.tsx`:
  - [x] Ganti fetch daftar pending: `GET /peminjaman` + filter -> `GET /admin/peminjaman/pending`
  - [x] Ganti aksi approve/reject: `PUT /peminjaman/{id}/status` -> `POST /peminjaman/{id}/admin-validation` (payload action + note)
- [x] Jalankan build / tes (npm run dev dan cek halaman /validasi)



