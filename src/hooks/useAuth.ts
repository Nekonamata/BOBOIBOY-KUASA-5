import { useState, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, checkAuth as apiCheckAuth, AuthUser } from '@/services/auth.service';
import { createPeminjaman, CreatePeminjamanData, createRiwayatPeminjaman } from '@/services/peminjaman.service';
import { safeDateFormatWithWeekday, safeDateFormatSimple } from '@/lib/date-utils';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'mahasiswa' | 'dosen';
  fakultas?: string;
  jurusan?: string;
  nim?: string;
  isAuthenticated: boolean;
}

interface Peminjaman {
  id: string;
  ruangan: string;
  gedung: string;
  tanggal: string;
  waktu: string;
  durasi: number;
  keperluan: string;
  status: 'menunggu' | 'disetujui' | 'ditolak' | 'diproses' | 'selesai';
  tanggalPengajuan: string;
  tanggalDisetujui?: string;
  nomorSurat?: string;
  jumlahPeserta: number;
  catatan?: string;
}

export const useAuth = (): {
  user: User | null;
  loading: boolean;
  error: string | null;
  riwayatPeminjaman: Peminjaman[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  tambahPeminjaman: (data: {
    ruanganId: string;
    namaRuangan: string;
    gedung: string;
    tanggal: string;
    waktuMulai: string;
    waktuSelesai: string;
    keperluan: string;
  }) => Promise<Peminjaman>;
  updateStatusPeminjaman: (id: string, status: Peminjaman['status']) => void;
  hapusPeminjaman: (id: string) => void;
  getStatistik: () => { total: number; disetujui: number; diproses: number; selesai: number; ditolak: number };
  hasRole: (roles: ('admin' | 'mahasiswa' | 'dosen')[]) => boolean;
  refreshRiwayat: () => void;
  getPeminjamanAktif: () => Peminjaman[];
  getPeminjamanMendatang: () => Peminjaman[];
  clearError: () => void;
} => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riwayatPeminjaman, setRiwayatPeminjaman] = useState<Peminjaman[]>([]);

  // Mock data riwayat peminjaman per user (ditambah lebih banyak data)
  const mockRiwayat: Record<string, Peminjaman[]> = {
    'admin@unimus.ac.id': [
      {
        id: '1',
        ruangan: 'Aula Utama Gedung A',
        gedung: 'Gedung A',
        tanggal: 'Jumat, 15 Maret 2024',
        waktu: '08:00 - 12:00',
        durasi: 4,
        keperluan: 'Seminar Fakultas Teknologi Informasi',
        status: 'disetujui',
        tanggalPengajuan: '2024-03-10',
        tanggalDisetujui: '2024-03-12',
        nomorSurat: 'UNMS/1/SPR/I/2024',
        jumlahPeserta: 100,
        catatan: 'Persiapan sound system'
      },
      {
        id: '2',
        ruangan: 'Lab Komputer C1',
        gedung: 'Gedung C',
        tanggal: 'Rabu, 20 Maret 2024',
        waktu: '13:00 - 17:00',
        durasi: 4,
        keperluan: 'Praktikum Jaringan Komputer',
        status: 'disetujui',
        tanggalPengajuan: '2024-03-15',
        tanggalDisetujui: '2024-03-18',
        nomorSurat: 'UNMS/2/SPR/I/2024',
        jumlahPeserta: 30
      },
      {
        id: '3',
        ruangan: 'Ruang Rapat B2',
        gedung: 'Gedung B',
        tanggal: 'Senin, 25 Maret 2024',
        waktu: '09:00 - 11:00',
        durasi: 2,
        keperluan: 'Rapat Koordinasi Sistem',
        status: 'menunggu',
        tanggalPengajuan: '2024-03-20',
        jumlahPeserta: 15
      },
      {
        id: '4',
        ruangan: 'Ruang Seminar D3',
        gedung: 'Gedung D',
        tanggal: 'Selasa, 2 April 2024',
        waktu: '14:00 - 16:00',
        durasi: 2,
        keperluan: 'Workshop Pengembangan Sistem',
        status: 'ditolak',
        tanggalPengajuan: '2024-03-25',
        jumlahPeserta: 50,
        catatan: 'Ruangan sudah terbooking'
      }
    ],
    'mahasiswa@unimus.ac.id': [
      {
        id: '5',
        ruangan: 'Ruang Seminar D2',
        gedung: 'Gedung D',
        tanggal: 'Senin, 18 Maret 2024',
        waktu: '09:00 - 12:00',
        durasi: 3,
        keperluan: 'Diskusi Skripsi tentang Machine Learning',
        status: 'disetujui',
        tanggalPengajuan: '2024-03-12',
        tanggalDisetujui: '2024-03-15',
        nomorSurat: 'UNMS/5/SPR/I/2024',
        jumlahPeserta: 5
      },
      {
        id: '6',
        ruangan: 'Ruang Kelas A1',
        gedung: 'Gedung A',
        tanggal: 'Jumat, 22 Maret 2024',
        waktu: '13:00 - 15:00',
        durasi: 2,
        keperluan: 'Belajar Kelompok Matkul Algoritma',
        status: 'disetujui',
        tanggalPengajuan: '2024-03-18',
        tanggalDisetujui: '2024-03-20',
        nomorSurat: 'UNMS/6/SPR/I/2024',
        jumlahPeserta: 8
      },
      {
        id: '7',
        ruangan: 'Lab Programming C1',
        gedung: 'Gedung C',
        tanggal: 'Kamis, 28 Maret 2024',
        waktu: '10:00 - 12:00',
        durasi: 2,
        keperluan: 'Praktikum Pemrograman Web',
        status: 'disetujui',
        tanggalPengajuan: '2024-03-22',
        tanggalDisetujui: '2024-03-25',
        nomorSurat: 'UNMS/7/SPR/I/2024',
        jumlahPeserta: 25
      }
    ],
    'dosen@unimus.ac.id': [
      {
        id: '8',
        ruangan: 'Ruang Rapat B3',
        gedung: 'Gedung B',
        tanggal: 'Jumat, 22 Maret 2024',
        waktu: '10:00 - 12:00',
        durasi: 2,
        keperluan: 'Rapat Jurusan Sistem Informasi',
        status: 'menunggu',
        tanggalPengajuan: '2024-03-18',
        jumlahPeserta: 12
      },
      {
        id: '9',
        ruangan: 'Ruang Kuliah A2',
        gedung: 'Gedung A',
        tanggal: 'Selasa, 19 Maret 2024',
        waktu: '08:00 - 10:00',
        durasi: 2,
        keperluan: 'Kuliah Umum Database Management',
        status: 'disetujui',
        tanggalPengajuan: '2024-03-15',
        tanggalDisetujui: '2024-03-17',
        nomorSurat: 'UNMS/9/SPR/I/2024',
        jumlahPeserta: 80
      },
      {
        id: '10',
        ruangan: 'Auditorium D1',
        gedung: 'Gedung D',
        tanggal: 'Minggu, 30 Maret 2024',
        waktu: '13:00 - 16:00',
        durasi: 3,
        keperluan: 'Seminar Nasional Teknologi Informasi',
        status: 'disetujui',
        tanggalPengajuan: '2024-03-20',
        tanggalDisetujui: '2024-03-25',
        nomorSurat: 'UNMS/10/SPR/I/2024',
        jumlahPeserta: 200,
        catatan: 'Butuh setup proyektor dan sound system'
      }
    ]
  };

  // Cek status autentikasi menggunakan API dengan fallback
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');

      if (token && userData) {
        try {
          // Coba cek autentikasi dengan API
          const authUser = await apiCheckAuth();

          if (authUser) {
            setUser(authUser);

            // Load riwayat peminjaman dari API
            try {
              const { getRiwayatPeminjaman } = await import('@/services/peminjaman.service');
              const response = await getRiwayatPeminjaman();

              // Filter hanya peminjaman milik user yang sedang login
              const userPeminjaman = response.filter(peminjaman => peminjaman.id_user === parseInt(authUser.id));

              // Convert API data to frontend format
              const formattedData: Peminjaman[] = userPeminjaman.map(peminjaman => {
                // Map database status to frontend display status
                let displayStatus: 'menunggu' | 'disetujui' | 'ditolak' | 'diproses' | 'selesai';
                switch (peminjaman.status) {
                  case 'confirmed':
                    displayStatus = 'disetujui';
                    break;
                  case 'expired':
                    displayStatus = 'ditolak';
                    break;
                  case 'draft':
                  case 'locked':
                  default:
                    displayStatus = 'menunggu';
                    break;
                }

                return {
                  id: peminjaman.id_peminjaman.toString(),
                  ruangan: peminjaman.ruangan?.nama_ruangan || 'Ruangan Tidak Ditemukan',
                  gedung: peminjaman.ruangan?.gedung?.nama_gedung || 'Gedung Tidak Ditemukan',
                  tanggal: safeDateFormatWithWeekday(peminjaman.tanggal),
                  waktu: `${peminjaman.jam_mulai} - ${peminjaman.jam_selesai}`,
                  durasi: parseInt(peminjaman.jam_selesai.split(':')[0]) - parseInt(peminjaman.jam_mulai.split(':')[0]),
                  keperluan: peminjaman.keperluan || '',
                  status: displayStatus,
                  tanggalPengajuan: safeDateFormatSimple(peminjaman.created_at),
                  tanggalDisetujui: (peminjaman.status as any) === 'confirmed' ? safeDateFormatSimple(peminjaman.locked_at || peminjaman.created_at) : undefined,
                  nomorSurat: (peminjaman.status as any) === 'confirmed' ? `UNMS/${peminjaman.id_peminjaman}/SPR/I/2024` : undefined,
                  jumlahPeserta: 1, // Default value since not in API
                  catatan: undefined
                };
              });

              // Urutkan berdasarkan tanggal pengajuan (terbaru dulu)
              const sortedData = formattedData.sort((a, b) => {
                try {
                  const dateA = new Date(a.tanggalPengajuan).getTime();
                  const dateB = new Date(b.tanggalPengajuan).getTime();
                  return dateB - dateA;
                } catch (error) {
                  return 0;
                }
              });

              setRiwayatPeminjaman(sortedData);
            } catch (apiError) {
              console.warn('API peminjaman tidak tersedia, menggunakan data localStorage:', apiError);

              // Fallback ke localStorage
              const storedPeminjaman = localStorage.getItem('user_peminjaman');
              let userPeminjaman: Peminjaman[] = [];

              if (storedPeminjaman) {
                try {
                  userPeminjaman = JSON.parse(storedPeminjaman);
                } catch (e) {
                  console.error('Error parsing peminjaman data:', e);
                }
              }

              // Jika tidak ada di localStorage, gunakan mock data
              if (userPeminjaman.length === 0 && authUser.email && mockRiwayat[authUser.email]) {
                userPeminjaman = mockRiwayat[authUser.email];
              }

              setRiwayatPeminjaman(userPeminjaman);
            }

            setError(null);
          } else {
            // Token tidak valid, logout
            console.warn('Token tidak valid, melakukan logout');
            await logout();
          }
        } catch (apiError) {
          console.warn('API tidak tersedia, menggunakan data localStorage:', apiError);

          // Fallback ke localStorage jika API gagal
          try {
            const userObj = JSON.parse(userData);

            // Validasi token sederhana
            if (token.startsWith('siprus-')) {
              const userWithAuth: User = {
                ...userObj,
                isAuthenticated: true
              };

              setUser(userWithAuth);

              // Load riwayat peminjaman dari localStorage
              const storedPeminjaman = localStorage.getItem('user_peminjaman');
              let userPeminjaman: Peminjaman[] = [];

              if (storedPeminjaman) {
                try {
                  userPeminjaman = JSON.parse(storedPeminjaman);
                } catch (e) {
                  console.error('Error parsing peminjaman data:', e);
                }
              }

              // Jika tidak ada di localStorage, gunakan mock data
              if (userPeminjaman.length === 0 && userObj.email && mockRiwayat[userObj.email]) {
                userPeminjaman = mockRiwayat[userObj.email];
              }

              setRiwayatPeminjaman(userPeminjaman);
              setError(null);
            } else {
              await logout();
            }
          } catch (parseError) {
            console.error('Error parsing local user data:', parseError);
            await logout();
          }
        }
      } else {
        setUser(null);
        setRiwayatPeminjaman([]);
      }
    } catch (err) {
      console.error('Error checking auth:', err);
      setError('Gagal memuat data autentikasi');
      // Jika gagal total, set sebagai tidak terautentikasi tapi jangan crash
      setUser(null);
      setRiwayatPeminjaman([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'user_data' || e.key === 'user_peminjaman') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuth]);

  // Login function menggunakan API
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      setError(null);

      // Validasi input
      if (!email || !password) {
        throw new Error('Email dan password harus diisi');
      }

      // Validasi format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Format email tidak valid');
      }

      // Panggil API login
      const result = await apiLogin({ email, password });

      if (!result.success) {
        throw new Error(result.message || 'Login gagal');
      }

      // Simpan token ke localStorage jika ada
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
      }

      // Prepare user data dengan authentication status
      const userWithAuth: User = {
        ...result.user!,
        isAuthenticated: true
      };

      // Simpan user data ke localStorage
      localStorage.setItem('user_data', JSON.stringify(userWithAuth));

      // Load riwayat peminjaman dari localStorage atau mock data
      let userPeminjaman: Peminjaman[] = [];
      const storedPeminjaman = localStorage.getItem('user_peminjaman');

      if (storedPeminjaman) {
        try {
          userPeminjaman = JSON.parse(storedPeminjaman);
        } catch (e) {
          console.error('Error parsing peminjaman data:', e);
        }
      }

      // Jika tidak ada di localStorage, gunakan mock data
      if (userPeminjaman.length === 0 && mockRiwayat[email]) {
        userPeminjaman = mockRiwayat[email];
      }

      // Update state
      setUser(userWithAuth);
      setRiwayatPeminjaman(userPeminjaman);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login gagal';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Call API logout
      await apiLogout();

      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      // Tidak menghapus user_peminjaman agar riwayat tetap tersimpan
      setUser(null);
      setRiwayatPeminjaman([]);
      setError(null);

      // Dispatch event untuk sinkronisasi antar tab
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'auth_token',
        oldValue: localStorage.getItem('auth_token'),
        newValue: null,
        url: window.location.href,
        storageArea: localStorage
      }));

      window.dispatchEvent(new StorageEvent('storage', {
        key: 'user_data',
        oldValue: localStorage.getItem('user_data'),
        newValue: null,
        url: window.location.href,
        storageArea: localStorage
      }));
    } catch (err) {
      console.error('Error during logout:', err);
      setError('Gagal logout');
    }
  };

  // Function untuk tambah riwayat peminjaman menggunakan API
  const tambahPeminjaman = async (data: {
    ruanganId: string;
    namaRuangan: string;
    gedung: string;
    tanggal: string;
    waktuMulai: string;
    waktuSelesai: string;
    keperluan: string;
  }): Promise<Peminjaman> => {
    try {
      if (!user?.id) {
        throw new Error('User tidak terautentikasi');
      }

      console.log('tambahPeminjaman called with data:', data);

      const userId = parseInt(user.id);
      console.log('Parsed userId:', userId, 'from:', user.id);

      if (isNaN(userId) || userId <= 0) {
        throw new Error(`ID user tidak valid: ${user.id}`);
      }

      const ruanganId = parseInt(data.ruanganId);
      if (isNaN(ruanganId) || ruanganId <= 0) {
        throw new Error(`ID ruangan tidak valid: ${data.ruanganId}`);
      }

      const apiData: CreatePeminjamanData = {
        id_user: userId,
        id_ruangan: ruanganId,
        tanggal: data.tanggal,
        jam_mulai: data.waktuMulai,
        jam_selesai: data.waktuSelesai,
        nama_pengguna: user.name,
        keperluan: data.keperluan
      };

      console.log('API data to be sent:', apiData);

      const result = await createPeminjaman(apiData);

      // Map API status to local status
      let localStatus: Peminjaman['status'];
      switch (result.status) {
        case 'confirmed':
          localStatus = 'disetujui';
          break;
        case 'expired':
          localStatus = 'ditolak';
          break;
        case 'draft':
        case 'locked':
        default:
          localStatus = 'menunggu';
          break;
      }

      // Calculate duration
      const startHour = parseInt(data.waktuMulai.split(':')[0]);
      const endHour = parseInt(data.waktuSelesai.split(':')[0]);
      const durasi = endHour - startHour;

      // Convert API response to local format
      const newPeminjaman: Peminjaman = {
        id: result.id_peminjaman.toString(),
        ruangan: result.ruangan?.nama_ruangan || data.namaRuangan,
        gedung: result.ruangan?.gedung?.nama_gedung || data.gedung,
        tanggal: safeDateFormatWithWeekday(result.tanggal),
        waktu: `${result.jam_mulai} - ${result.jam_selesai}`,
        durasi: durasi,
        keperluan: result.keperluan || '',
        status: localStatus,
        tanggalPengajuan: safeDateFormatSimple(result.created_at),
        tanggalDisetujui: result.status === 'confirmed' ? safeDateFormatSimple(result.locked_at || result.created_at) : undefined,
        nomorSurat: result.status === 'confirmed' ? `UNMS/${result.id_peminjaman}/SPR/I/2024` : undefined,
        jumlahPeserta: 1, // Default value since not provided
        catatan: undefined
      };

      // Update state
      setRiwayatPeminjaman(prev => [newPeminjaman, ...prev]);

      // Simpan ke localStorage untuk cache
      const existingPeminjaman = JSON.parse(localStorage.getItem('user_peminjaman') || '[]');
      const updatedPeminjaman = [newPeminjaman, ...existingPeminjaman];
      localStorage.setItem('user_peminjaman', JSON.stringify(updatedPeminjaman));

      return newPeminjaman;
    } catch (error) {
      console.error('Error creating peminjaman:', error);
      throw error;
    }
  };

  // Function untuk update status peminjaman
  const updateStatusPeminjaman = (id: string, status: Peminjaman['status']): void => {
    // Update state
    setRiwayatPeminjaman(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status } : item
      )
    );
    
    // Update localStorage
    const existingPeminjaman = JSON.parse(localStorage.getItem('user_peminjaman') || '[]');
    const updatedPeminjaman = existingPeminjaman.map((item: Peminjaman) =>
      item.id === id ? { ...item, status } : item
    );
    localStorage.setItem('user_peminjaman', JSON.stringify(updatedPeminjaman));
    
    // Trigger storage event
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'user_peminjaman',
      oldValue: localStorage.getItem('user_peminjaman'),
      newValue: JSON.stringify(updatedPeminjaman),
      url: window.location.href,
      storageArea: localStorage
    }));
  };

  // Function untuk hapus peminjaman
  const hapusPeminjaman = (id: string): void => {
    setRiwayatPeminjaman(prev => prev.filter(item => item.id !== id));
    
    const existingPeminjaman = JSON.parse(localStorage.getItem('user_peminjaman') || '[]');
    const updatedPeminjaman = existingPeminjaman.filter((item: Peminjaman) => item.id !== id);
    localStorage.setItem('user_peminjaman', JSON.stringify(updatedPeminjaman));
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'user_peminjaman',
      oldValue: localStorage.getItem('user_peminjaman'),
      newValue: JSON.stringify(updatedPeminjaman),
      url: window.location.href,
      storageArea: localStorage
    }));
  };

  // Function untuk mendapatkan statistik
  const getStatistik = () => {
    const total = riwayatPeminjaman.length;
    const disetujui = riwayatPeminjaman.filter(r => r.status === 'disetujui' || r.status === 'selesai').length;
    const diproses = riwayatPeminjaman.filter(r => r.status === 'diproses').length;
    const selesai = riwayatPeminjaman.filter(r => r.status === 'selesai').length;
    const ditolak = riwayatPeminjaman.filter(r => r.status === 'ditolak').length;
    
    return { total, disetujui, diproses, selesai, ditolak };
  };

  // Function untuk check permission
  const hasRole = (roles: ('admin' | 'mahasiswa' | 'dosen')[]): boolean => {
    if (!user?.role) return false;
    return roles.includes(user.role);
  };

  // Function untuk check jika user adalah admin
  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  // Function untuk refresh riwayat dari localStorage
  const refreshRiwayat = () => {
    checkAuth();
  };

  // Function untuk mendapatkan peminjaman aktif
  const getPeminjamanAktif = () => {
    const today = new Date().toISOString().split('T')[0];
    return riwayatPeminjaman.filter(p => 
      p.status === 'disetujui' && p.tanggal >= today
    );
  };

  // Function untuk mendapatkan peminjaman mendatang
  const getPeminjamanMendatang = () => {
    const today = new Date().toISOString().split('T')[0];
    return riwayatPeminjaman.filter(p =>
      (p.status === 'menunggu' || p.status === 'disetujui') && p.tanggal >= today
    ).slice(0, 5); // Ambil 5 terdekat
  };

  return {
    // State
    user,
    loading,
    error,
    riwayatPeminjaman,
    
    // Status
    isAuthenticated: user?.isAuthenticated || false,
    isAdmin: isAdmin(),
    
    // Functions
    login,
    logout,
    checkAuth,
    tambahPeminjaman,
    updateStatusPeminjaman,
    hapusPeminjaman,
    getStatistik,
    hasRole,
    refreshRiwayat,
    getPeminjamanAktif,
    getPeminjamanMendatang,
    
    // Utility
    clearError: () => setError(null)
  };
};

export type { User, Peminjaman };