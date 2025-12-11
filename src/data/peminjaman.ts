export interface Peminjaman {
  id: string;
  roomId: string;
  roomName: string;
  gedung: string;
  lantai: number;
  peminjam: string;
  tipePeminjam: 'mahasiswa' | 'dosen' | 'staff' | 'eksternal';
  tanggalPinjam: string;
  jamMulai: string;
  jamSelesai: string;
  keperluan: string;
  status: 'pending' | 'disetujui' | 'ditolak' | 'selesai';
  createdAt: string;
}

// Generate mock data for the past year
const generateMockPeminjaman = (): Peminjaman[] => {
  const peminjamanList: Peminjaman[] = [];
  const rooms = [
    { id: 'r1', name: 'Aula Utama', gedung: 'Gedung A - Rektorat', lantai: 1 },
    { id: 'r2', name: 'Ruang Rapat A1', gedung: 'Gedung A - Rektorat', lantai: 2 },
    { id: 'r3', name: 'Lab Anatomi', gedung: 'Gedung B - Fakultas Kedokteran', lantai: 1 },
    { id: 'r4', name: 'Ruang Kuliah B201', gedung: 'Gedung B - Fakultas Kedokteran', lantai: 2 },
    { id: 'r5', name: 'Lab Komputer C1', gedung: 'Gedung C - Fakultas Teknik', lantai: 1 },
    { id: 'r6', name: 'Workshop Mesin', gedung: 'Gedung C - Fakultas Teknik', lantai: 1 },
    { id: 'r7', name: 'Auditorium Ekonomi', gedung: 'Gedung D - Fakultas Ekonomi', lantai: 3 },
    { id: 'r8', name: 'Ruang Seminar D2', gedung: 'Gedung D - Fakultas Ekonomi', lantai: 2 },
    { id: 'r9', name: 'Ruang Baca Utama', gedung: 'Gedung E - Perpustakaan', lantai: 1 },
    { id: 'r10', name: 'Ruang Diskusi E1', gedung: 'Gedung E - Perpustakaan', lantai: 2 },
  ];

  const keperluanList = [
    'Kuliah Umum',
    'Rapat Jurusan',
    'Seminar Nasional',
    'Workshop',
    'Ujian Skripsi',
    'Praktikum',
    'Rapat Organisasi',
    'Pelatihan',
    'Diskusi Kelompok',
    'Bimbingan',
  ];

  const peminjamList = [
    { nama: 'Dr. Ahmad Fauzi', tipe: 'dosen' as const },
    { nama: 'Budi Santoso', tipe: 'mahasiswa' as const },
    { nama: 'Siti Rahayu', tipe: 'staff' as const },
    { nama: 'PT. Mitra Jaya', tipe: 'eksternal' as const },
    { nama: 'Dewi Lestari', tipe: 'mahasiswa' as const },
    { nama: 'Prof. Hendra Wijaya', tipe: 'dosen' as const },
    { nama: 'Rina Wulandari', tipe: 'staff' as const },
    { nama: 'Yayasan Pendidikan', tipe: 'eksternal' as const },
    { nama: 'Agus Pratama', tipe: 'mahasiswa' as const },
    { nama: 'Dr. Maya Sari', tipe: 'dosen' as const },
  ];

  const statusList: Peminjaman['status'][] = ['pending', 'disetujui', 'ditolak', 'selesai'];
  const jamMulaiList = ['07:00', '08:00', '09:00', '10:00', '13:00', '14:00', '15:00', '16:00'];
  const jamSelesaiList = ['09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00', '18:00'];

  // Generate data for the past 12 months
  const today = new Date();
  for (let i = 0; i < 500; i++) {
    const randomDays = Math.floor(Math.random() * 365);
    const date = new Date(today);
    date.setDate(date.getDate() - randomDays);

    const room = rooms[Math.floor(Math.random() * rooms.length)];
    const peminjam = peminjamList[Math.floor(Math.random() * peminjamList.length)];
    const jamIndex = Math.floor(Math.random() * jamMulaiList.length);

    peminjamanList.push({
      id: `p${i + 1}`,
      roomId: room.id,
      roomName: room.name,
      gedung: room.gedung,
      lantai: room.lantai,
      peminjam: peminjam.nama,
      tipePeminjam: peminjam.tipe,
      tanggalPinjam: date.toISOString().split('T')[0],
      jamMulai: jamMulaiList[jamIndex],
      jamSelesai: jamSelesaiList[jamIndex],
      keperluan: keperluanList[Math.floor(Math.random() * keperluanList.length)],
      status: statusList[Math.floor(Math.random() * statusList.length)],
      createdAt: date.toISOString(),
    });
  }

  return peminjamanList.sort((a, b) => new Date(b.tanggalPinjam).getTime() - new Date(a.tanggalPinjam).getTime());
};

export const peminjamanData = generateMockPeminjaman();
