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
  gedung_id?: string;
  description?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  operating_hours?: string;
  booking_rules?: string[];
  equipment?: string[];
}

export interface Gedung {
  id: string;
  name: string;
  zonas: string[];
  total_rooms: number;
  available_rooms: number;
  address?: string;
  phone?: string;
  email?: string;
}

export const gedungList: Gedung[] = [
  { 
    id: 'g1', 
    name: 'Gedung A - Rektorat', 
    zonas: ['Zona Utara', 'Zona Selatan'],
    total_rooms: 8,
    available_rooms: 6
  },
  { 
    id: 'g2', 
    name: 'Gedung B - Fakultas Kedokteran', 
    zonas: ['Zona Utara', 'Zona Tengah', 'Zona Selatan'],
    total_rooms: 12,
    available_rooms: 9
  },
  { 
    id: 'g3', 
    name: 'Gedung C - Fakultas Teknik', 
    zonas: ['Zona Utara', 'Zona Selatan'],
    total_rooms: 10,
    available_rooms: 7
  },
  { 
    id: 'g4', 
    name: 'Gedung D - Fakultas Ekonomi', 
    zonas: ['Zona Utara', 'Zona Tengah'],
    total_rooms: 6,
    available_rooms: 4
  },
  { 
    id: 'g5', 
    name: 'Gedung E - Perpustakaan', 
    zonas: ['Zona Utara'],
    total_rooms: 5,
    available_rooms: 5
  },
];

export const lantaiOptions = [1, 2, 3, 4, 5];

export const facilitiesList = [
  'AC', 'WiFi', 'Proyektor', 'Sound System', 'Whiteboard', 
  'TV', 'Komputer', 'Kamera', 'Green Screen', 'Mesin CNC',
  'Mesin Las', 'Alat Medis', 'Model Anatomi', 'Bed Pasien',
  'Manekin', 'Video Conference', 'Mic Wireless', 'Podium',
  'Panggung', 'Sound Proof', 'Safety Equipment', 'Internet',
  'Stop Kontak', 'Meja Baca', 'Meja Lab', 'Lighting'
];

export const zonesList = ['Zona Utara', 'Zona Selatan', 'Zona Tengah'];

export const rooms: Room[] = [
  {
    id: 'r1',
    name: 'Aula Utama',
    gedung: 'Gedung A - Rektorat',
    gedung_id: 'g1',
    zona: 'Zona Utara',
    lantai: 1,
    kapasitas: 500,
    fasilitas: ['Proyektor', 'Sound System', 'AC', 'Podium', 'Mic Wireless', 'Video Conference', 'Panggung'],
    status: 'tersedia',
    description: 'Aula utama gedung rektorat, cocok untuk acara besar seperti wisuda, seminar nasional, dan konferensi.',
    contact_person: 'Bapak Andi',
    phone: '(024) 1234567',
    email: 'aula@unimus.ac.id',
    operating_hours: '07:00 - 21:00',
    booking_rules: ['Minimal 100 peserta', 'Booking minimal 7 hari sebelumnya', 'Deposit Rp 2.000.000'],
    equipment: ['Proyektor 5000 lumens', 'Sound system 5000W', 'Mic wireless 8 unit', 'Panggung 8x4 meter']
  },
  {
    id: 'r2',
    name: 'Ruang Rapat A1',
    gedung: 'Gedung A - Rektorat',
    gedung_id: 'g1',
    zona: 'Zona Selatan',
    lantai: 2,
    kapasitas: 30,
    fasilitas: ['Proyektor', 'AC', 'Whiteboard', 'Video Conference', 'TV', 'WiFi'],
    status: 'tersedia',
    description: 'Ruang rapat eksekutif dengan fasilitas video conference, cocok untuk rapat penting.',
    contact_person: 'Ibu Sari',
    phone: '(024) 1234568',
    email: 'rapat@unimus.ac.id',
    operating_hours: '08:00 - 17:00',
    booking_rules: ['Booking minimal 3 hari sebelumnya', 'Maksimal 4 jam per peminjaman']
  },
  {
    id: 'r3',
    name: 'Lab Anatomi',
    gedung: 'Gedung B - Fakultas Kedokteran',
    gedung_id: 'g2',
    zona: 'Zona Utara',
    lantai: 1,
    kapasitas: 40,
    fasilitas: ['Meja Lab', 'AC', 'Proyektor', 'Model Anatomi', 'Alat Medis'],
    status: 'terpakai',
    description: 'Laboratorium anatomi dengan model anatomi lengkap untuk praktikum kedokteran.',
    contact_person: 'Dr. Budi',
    phone: '(024) 1234569',
    email: 'anatomilab@unimus.ac.id',
    operating_hours: '08:00 - 16:00',
    booking_rules: ['Hanya untuk keperluan akademik', 'Harus didampingi dosen']
  },
  {
    id: 'r4',
    name: 'Ruang Kuliah B201',
    gedung: 'Gedung B - Fakultas Kedokteran',
    gedung_id: 'g2',
    zona: 'Zona Tengah',
    lantai: 2,
    kapasitas: 80,
    fasilitas: ['Proyektor', 'AC', 'Whiteboard', 'Sound System', 'WiFi'],
    status: 'tersedia',
    description: 'Ruang kuliah besar dengan sound system yang baik, cocok untuk kuliah umum.',
    contact_person: 'Ibu Ratna',
    phone: '(024) 1234570',
    email: 'kuliah@unimus.ac.id',
    operating_hours: '07:00 - 20:00'
  },
  {
    id: 'r5',
    name: 'Lab Komputer C1',
    gedung: 'Gedung C - Fakultas Teknik',
    gedung_id: 'g3',
    zona: 'Zona Utara',
    lantai: 1,
    kapasitas: 45,
    fasilitas: ['Komputer 45 Unit', 'AC', 'Proyektor', 'Internet', 'Stop Kontak'],
    status: 'maintenance',
    description: 'Laboratorium komputer dengan 45 unit PC spesifikasi tinggi untuk praktikum programming.',
    contact_person: 'Pak Agus',
    phone: '(024) 1234571',
    email: 'komlab@unimus.ac.id',
    operating_hours: '08:00 - 17:00',
    booking_rules: ['Hanya untuk praktikum', 'Tidak boleh install software']
  },
  {
    id: 'r6',
    name: 'Workshop Mesin',
    gedung: 'Gedung C - Fakultas Teknik',
    gedung_id: 'g3',
    zona: 'Zona Selatan',
    lantai: 1,
    kapasitas: 30,
    fasilitas: ['Mesin CNC', 'Mesin Las', 'AC', 'Safety Equipment', 'Whiteboard'],
    status: 'tersedia',
    description: 'Workshop lengkap dengan mesin CNC dan las untuk praktikum teknik mesin.',
    contact_person: 'Pak Joko',
    phone: '(024) 1234572',
    email: 'workshop@unimus.ac.id',
    operating_hours: '08:00 - 16:00',
    booking_rules: ['Harus menggunakan APD', 'Hanya untuk mahasiswa teknik'],
    equipment: ['Mesin CNC 3 axis', 'Mesin las 200A', 'Grinder', 'Drill press']
  },
  {
    id: 'r7',
    name: 'Auditorium Ekonomi',
    gedung: 'Gedung D - Fakultas Ekonomi',
    gedung_id: 'g4',
    zona: 'Zona Utara',
    lantai: 3,
    kapasitas: 200,
    fasilitas: ['Proyektor', 'Sound System', 'AC', 'Panggung', 'WiFi'],
    status: 'tersedia',
    description: 'Auditorium modern dengan kapasitas 200 orang, cocok untuk seminar dan presentasi.',
    contact_person: 'Ibu Maya',
    phone: '(024) 1234573',
    email: 'auditorium@unimus.ac.id',
    operating_hours: '08:00 - 21:00',
    booking_rules: ['Minimal 50 peserta', 'Booking minimal 5 hari sebelumnya']
  },
  {
    id: 'r8',
    name: 'Ruang Seminar D2',
    gedung: 'Gedung D - Fakultas Ekonomi',
    gedung_id: 'g4',
    zona: 'Zona Tengah',
    lantai: 2,
    kapasitas: 60,
    fasilitas: ['Proyektor', 'AC', 'Whiteboard', 'Mic', 'WiFi'],
    status: 'terpakai',
    description: 'Ruang seminar dengan desain modern, cocok untuk workshop dan pelatihan.',
    contact_person: 'Pak Rudi',
    phone: '(024) 1234574',
    email: 'seminar@unimus.ac.id',
    operating_hours: '08:00 - 18:00'
  },
  {
    id: 'r9',
    name: 'Ruang Baca Utama',
    gedung: 'Gedung E - Perpustakaan',
    gedung_id: 'g5',
    zona: 'Zona Utara',
    lantai: 1,
    kapasitas: 100,
    fasilitas: ['AC', 'WiFi', 'Stop Kontak', 'Meja Baca', 'Pojok Diskusi'],
    status: 'tersedia',
    description: 'Ruang baca utama perpustakaan dengan suasana tenang dan nyaman.',
    contact_person: 'Ibu Lina',
    phone: '(024) 1234575',
    email: 'perpus@unimus.ac.id',
    operating_hours: '08:00 - 21:00',
    booking_rules: ['Tidak boleh berisik', 'Tidak boleh makan']
  },
  {
    id: 'r10',
    name: 'Ruang Diskusi E1',
    gedung: 'Gedung E - Perpustakaan',
    gedung_id: 'g5',
    zona: 'Zona Utara',
    lantai: 2,
    kapasitas: 15,
    fasilitas: ['AC', 'Whiteboard', 'TV', 'WiFi', 'Meja Diskusi'],
    status: 'tersedia',
    description: 'Ruang diskusi kecil untuk kelompok belajar atau meeting kecil.',
    contact_person: 'Ibu Lina',
    phone: '(024) 1234575',
    email: 'perpus@unimus.ac.id',
    operating_hours: '08:00 - 21:00',
    booking_rules: ['Maksimal 2 jam', 'Maksimal 15 orang']
  },
  {
    id: 'r11',
    name: 'Lab Simulasi Klinik',
    gedung: 'Gedung B - Fakultas Kedokteran',
    gedung_id: 'g2',
    zona: 'Zona Selatan',
    lantai: 3,
    kapasitas: 25,
    fasilitas: ['Bed Pasien', 'Manekin', 'AC', 'Alat Medis', 'Proyektor'],
    status: 'tersedia',
    description: 'Laboratorium simulasi klinik untuk praktik kedokteran dengan peralatan medis lengkap.',
    contact_person: 'Dr. Surya',
    phone: '(024) 1234576',
    email: 'simklinik@unimus.ac.id',
    operating_hours: '08:00 - 16:00',
    booking_rules: ['Hanya untuk mahasiswa kedokteran', 'Harus didampingi instruktur']
  },
  {
    id: 'r12',
    name: 'Studio Multimedia',
    gedung: 'Gedung C - Fakultas Teknik',
    gedung_id: 'g3',
    zona: 'Zona Utara',
    lantai: 4,
    kapasitas: 20,
    fasilitas: ['Green Screen', 'Kamera', 'Lighting', 'AC', 'Sound Proof', 'Komputer Editing'],
    status: 'tersedia',
    description: 'Studio multimedia profesional untuk produksi video, fotografi, dan editing.',
    contact_person: 'Pak Hendra',
    phone: '(024) 1234577',
    email: 'studio@unimus.ac.id',
    operating_hours: '09:00 - 17:00',
    booking_rules: ['Harus memiliki skill editing', 'Perlu training sebelum menggunakan'],
    equipment: ['Kamera Sony A7III', 'Lighting kit 3 point', 'Green screen 3x4m', 'PC editing i7']
  },
  {
    id: 'r13',
    name: 'Ruang Yoga dan Meditasi',
    gedung: 'Gedung A - Rektorat',
    gedung_id: 'g1',
    zona: 'Zona Utara',
    lantai: 3,
    kapasitas: 25,
    fasilitas: ['AC', 'Sound System', 'Matras', 'Speaker Bluetooth', 'Pencahayaan LED'],
    status: 'tersedia',
    description: 'Ruang khusus untuk yoga, meditasi, dan kegiatan relaksasi.',
    contact_person: 'Ibu Dewi',
    phone: '(024) 1234578',
    operating_hours: '06:00 - 20:00',
    booking_rules: ['Harus bawa matras sendiri', 'Tidak boleh berisik']
  },
  {
    id: 'r14',
    name: 'Ruang Sidang Skripsi',
    gedung: 'Gedung B - Fakultas Kedokteran',
    gedung_id: 'g2',
    zona: 'Zona Tengah',
    lantai: 4,
    kapasitas: 20,
    fasilitas: ['Proyektor', 'AC', 'Meja Panel', 'Sound System', 'Recording Equipment'],
    status: 'tersedia',
    description: 'Ruang sidang khusus untuk ujian skripsi dengan peralatan recording.',
    contact_person: 'Ibu Rina',
    phone: '(024) 1234579',
    email: 'sidang@unimus.ac.id',
    operating_hours: '08:00 - 17:00',
    booking_rules: ['Hanya untuk ujian skripsi', 'Booking melalui akademik']
  },
  {
    id: 'r15',
    name: 'Lab Bahasa',
    gedung: 'Gedung D - Fakultas Ekonomi',
    gedung_id: 'g4',
    zona: 'Zona Utara',
    lantai: 1,
    kapasitas: 35,
    fasilitas: ['Headset 35 unit', 'AC', 'Komputer Tutor', 'Software Bahasa', 'Proyektor'],
    status: 'tersedia',
    description: 'Laboratorium bahasa dengan headset individual untuk pembelajaran bahasa.',
    contact_person: 'Pak Anton',
    phone: '(024) 1234580',
    email: 'lab_bahasa@unimus.ac.id',
    operating_hours: '08:00 - 17:00',
    booking_rules: ['Hanya untuk kelas bahasa', 'Tidak boleh bawa makanan']
  }
];

// Helper functions
export const getRoomById = (id: string): Room | undefined => {
  return rooms.find(room => room.id === id);
};

export const getRoomsByGedung = (gedungId: string): Room[] => {
  return rooms.filter(room => room.gedung_id === gedungId);
};

export const getRoomsByStatus = (status: Room['status']): Room[] => {
  return rooms.filter(room => room.status === status);
};

export const getAvailableRooms = (): Room[] => {
  return getRoomsByStatus('tersedia');
};

export const getRoomsByFacility = (facility: string): Room[] => {
  return rooms.filter(room => 
    room.fasilitas.some(f => f.toLowerCase().includes(facility.toLowerCase()))
  );
};

export const searchRooms = (query: string): Room[] => {
  const lowerQuery = query.toLowerCase();
  return rooms.filter(room => 
    room.name.toLowerCase().includes(lowerQuery) ||
    room.gedung.toLowerCase().includes(lowerQuery) ||
    room.description?.toLowerCase().includes(lowerQuery) ||
    room.fasilitas.some(f => f.toLowerCase().includes(lowerQuery))
  );
};

export const getGedungById = (id: string): Gedung | undefined => {
  return gedungList.find(gedung => gedung.id === id);
};

export const getZonasByGedung = (gedungName: string): string[] => {
  const gedung = gedungList.find(g => g.name === gedungName);
  return gedung ? gedung.zonas : [];
};

export const getGedungStats = () => {
  return gedungList.map(gedung => {
    const roomsInGedung = getRoomsByGedung(gedung.id);
    const available = roomsInGedung.filter(r => r.status === 'tersedia').length;
    const occupied = roomsInGedung.filter(r => r.status === 'terpakai').length;
    const maintenance = roomsInGedung.filter(r => r.status === 'maintenance').length;
    
    return {
      ...gedung,
      available,
      occupied,
      maintenance,
      utilization: Math.round((occupied / roomsInGedung.length) * 100)
    };
  });
};