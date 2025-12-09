export interface Room {
  id: string;
  name: string;
  gedung: string;
  zona: string;
  lantai: number;
  kapasitas: number;
  fasilitas: string[];
  status: 'tersedia' | 'terpakai' | 'maintenance';
  image?: string;
}

export interface Gedung {
  id: string;
  name: string;
  zonas: string[];
}

export const gedungList: Gedung[] = [
  { id: 'g1', name: 'Gedung A - Rektorat', zonas: ['Zona Utara', 'Zona Selatan'] },
  { id: 'g2', name: 'Gedung B - Fakultas Kedokteran', zonas: ['Zona Utara', 'Zona Tengah', 'Zona Selatan'] },
  { id: 'g3', name: 'Gedung C - Fakultas Teknik', zonas: ['Zona Utara', 'Zona Selatan'] },
  { id: 'g4', name: 'Gedung D - Fakultas Ekonomi', zonas: ['Zona Utara', 'Zona Tengah'] },
  { id: 'g5', name: 'Gedung E - Perpustakaan', zonas: ['Zona Utara'] },
];

export const lantaiOptions = [1, 2, 3, 4, 5];

export const rooms: Room[] = [
  {
    id: 'r1',
    name: 'Aula Utama',
    gedung: 'Gedung A - Rektorat',
    zona: 'Zona Utara',
    lantai: 1,
    kapasitas: 500,
    fasilitas: ['Proyektor', 'Sound System', 'AC', 'Podium', 'Mic Wireless'],
    status: 'tersedia',
  },
  {
    id: 'r2',
    name: 'Ruang Rapat A1',
    gedung: 'Gedung A - Rektorat',
    zona: 'Zona Selatan',
    lantai: 2,
    kapasitas: 30,
    fasilitas: ['Proyektor', 'AC', 'Whiteboard', 'Video Conference'],
    status: 'tersedia',
  },
  {
    id: 'r3',
    name: 'Lab Anatomi',
    gedung: 'Gedung B - Fakultas Kedokteran',
    zona: 'Zona Utara',
    lantai: 1,
    kapasitas: 40,
    fasilitas: ['Meja Lab', 'AC', 'Proyektor', 'Model Anatomi'],
    status: 'terpakai',
  },
  {
    id: 'r4',
    name: 'Ruang Kuliah B201',
    gedung: 'Gedung B - Fakultas Kedokteran',
    zona: 'Zona Tengah',
    lantai: 2,
    kapasitas: 80,
    fasilitas: ['Proyektor', 'AC', 'Whiteboard', 'Sound System'],
    status: 'tersedia',
  },
  {
    id: 'r5',
    name: 'Lab Komputer C1',
    gedung: 'Gedung C - Fakultas Teknik',
    zona: 'Zona Utara',
    lantai: 1,
    kapasitas: 45,
    fasilitas: ['Komputer 45 Unit', 'AC', 'Proyektor', 'Internet'],
    status: 'maintenance',
  },
  {
    id: 'r6',
    name: 'Workshop Mesin',
    gedung: 'Gedung C - Fakultas Teknik',
    zona: 'Zona Selatan',
    lantai: 1,
    kapasitas: 30,
    fasilitas: ['Mesin CNC', 'Mesin Las', 'AC', 'Safety Equipment'],
    status: 'tersedia',
  },
  {
    id: 'r7',
    name: 'Auditorium Ekonomi',
    gedung: 'Gedung D - Fakultas Ekonomi',
    zona: 'Zona Utara',
    lantai: 3,
    kapasitas: 200,
    fasilitas: ['Proyektor', 'Sound System', 'AC', 'Panggung'],
    status: 'tersedia',
  },
  {
    id: 'r8',
    name: 'Ruang Seminar D2',
    gedung: 'Gedung D - Fakultas Ekonomi',
    zona: 'Zona Tengah',
    lantai: 2,
    kapasitas: 60,
    fasilitas: ['Proyektor', 'AC', 'Whiteboard', 'Mic'],
    status: 'terpakai',
  },
  {
    id: 'r9',
    name: 'Ruang Baca Utama',
    gedung: 'Gedung E - Perpustakaan',
    zona: 'Zona Utara',
    lantai: 1,
    kapasitas: 100,
    fasilitas: ['AC', 'WiFi', 'Stop Kontak', 'Meja Baca'],
    status: 'tersedia',
  },
  {
    id: 'r10',
    name: 'Ruang Diskusi E1',
    gedung: 'Gedung E - Perpustakaan',
    zona: 'Zona Utara',
    lantai: 2,
    kapasitas: 15,
    fasilitas: ['AC', 'Whiteboard', 'TV', 'WiFi'],
    status: 'tersedia',
  },
  {
    id: 'r11',
    name: 'Lab Simulasi Klinik',
    gedung: 'Gedung B - Fakultas Kedokteran',
    zona: 'Zona Selatan',
    lantai: 3,
    kapasitas: 25,
    fasilitas: ['Bed Pasien', 'Manekin', 'AC', 'Alat Medis'],
    status: 'tersedia',
  },
  {
    id: 'r12',
    name: 'Studio Multimedia',
    gedung: 'Gedung C - Fakultas Teknik',
    zona: 'Zona Utara',
    lantai: 4,
    kapasitas: 20,
    fasilitas: ['Green Screen', 'Kamera', 'Lighting', 'AC', 'Sound Proof'],
    status: 'tersedia',
  },
];
