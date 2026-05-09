// src/hooks/useAuth.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
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

  // ✅ PERBAIKAN: Gunakan useMemo agar reactive terhadap perubahan user
  const isAdmin = useMemo(() => {
    return user?.role === 'admin';
  }, [user]);

  // ✅ PERBAIKAN: Gunakan useMemo agar reactive
  const isAuthenticated = useMemo(() => {
    return user?.isAuthenticated || false;
  }, [user]);

  // Mock data riwayat peminjaman per user
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

  // Helper untuk mapping AuthUser ke User
  const mapAuthUserToUser = (authUser: AuthUser): User => {
    return {
      id: authUser.id?.toString() || '',
      email: authUser.email || '',
      name: authUser.name || authUser.name || '',
      role: (authUser.role as 'admin' | 'mahasiswa' | 'dosen') || 'mahasiswa',
      fakultas: (authUser as any).fakultas,
      jurusan: (authUser as any).jurusan,
      nim: (authUser as any).nim,
      isAuthenticated: true
    };
  };

  // Cek status autentikasi menggunakan API dengan fallback
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');

      if (token && userData) {
        try {
          const authUser = await apiCheckAuth();

          if (authUser) {
            const mappedUser = mapAuthUserToUser(authUser);
            setUser(mappedUser);

            // Load riwayat peminjaman dari API
            try {
              const { getRiwayatPeminjaman } = await import('@/services/peminjaman.service');
              const response = await getRiwayatPeminjaman();

              const userPeminjaman = response.filter(
                peminjaman => peminjaman.id_user === parseInt(mappedUser.id)
              );

              const formattedData: Peminjaman[] = userPeminjaman.map(peminjaman => {
                let displayStatus: Peminjaman['status'];
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
                  tanggalDisetujui: peminjaman.status === 'confirmed' 
                    ? safeDateFormatSimple(peminjaman.locked_at || peminjaman.created_at) 
                    : undefined,
                  nomorSurat: peminjaman.status === 'confirmed' 
                    ? `UNMS/${peminjaman.id_peminjaman}/SPR/I/2024` 
                    : undefined,
                  jumlahPeserta: 1,
                  catatan: undefined
                };
              });

              const sortedData = formattedData.sort((a, b) => {
                try {
                  return new Date(b.tanggalPengajuan).getTime() - new Date(a.tanggalPengajuan).getTime();
                } catch {
                  return 0;
                }
              });

              setRiwayatPeminjaman(sortedData);
            } catch (apiError) {
              console.warn('API peminjaman tidak tersedia, menggunakan localStorage:', apiError);

              const storedPeminjaman = localStorage.getItem('user_peminjaman');
              let userPeminjaman: Peminjaman[] = [];

              if (storedPeminjaman) {
                try {
                  userPeminjaman = JSON.parse(storedPeminjaman);
                } catch (e) {
                  console.error('Error parsing peminjaman data:', e);
                }
              }

              if (userPeminjaman.length === 0 && mappedUser.email && mockRiwayat[mappedUser.email]) {
                userPeminjaman = mockRiwayat[mappedUser.email];
              }

              setRiwayatPeminjaman(userPeminjaman);
            }

            setError(null);
          } else {
            console.warn('Token tidak valid, melakukan logout');
            await logout();
          }
        } catch (apiError) {
          console.warn('API tidak tersedia, menggunakan data localStorage:', apiError);

          try {
            const userObj = JSON.parse(userData);

            if (token.startsWith('siprus-')) {
              const userWithAuth: User = {
                id: userObj.id || '',
                email: userObj.email || '',
                name: userObj.name || '',
                role: userObj.role || 'mahasiswa',
                fakultas: userObj.fakultas,
                jurusan: userObj.jurusan,
                nim: userObj.nim,
                isAuthenticated: true
              };

              setUser(userWithAuth);

              const storedPeminjaman = localStorage.getItem('user_peminjaman');
              let userPeminjaman: Peminjaman[] = [];

              if (storedPeminjaman) {
                try {
                  userPeminjaman = JSON.parse(storedPeminjaman);
                } catch (e) {
                  console.error('Error parsing peminjaman data:', e);
                }
              }

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

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      setError(null);

      if (!email || !password) {
        throw new Error('Email dan password harus diisi');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Format email tidak valid');
      }

      const result = await apiLogin({ email, password });

      if (!result.success) {
        throw new Error(result.message || 'Login gagal');
      }

      if (result.token) {
        localStorage.setItem('auth_token', result.token);
      }

      const userWithAuth: User = {
        id: result.user?.id?.toString() || '',
        email: result.user?.email || email,
        name: result.user?.name || result.user?.name || '',
        role: (result.user?.role as 'admin' | 'mahasiswa' | 'dosen') || 'mahasiswa',
        fakultas: (result.user as any)?.fakultas,
        jurusan: (result.user as any)?.jurusan,
        nim: (result.user as any)?.nim,
        isAuthenticated: true
      };

      localStorage.setItem('user_data', JSON.stringify(userWithAuth));

      let userPeminjaman: Peminjaman[] = [];
      const storedPeminjaman = localStorage.getItem('user_peminjaman');

      if (storedPeminjaman) {
        try {
          userPeminjaman = JSON.parse(storedPeminjaman);
        } catch (e) {
          console.error('Error parsing peminjaman data:', e);
        }
      }

      if (userPeminjaman.length === 0 && mockRiwayat[email]) {
        userPeminjaman = mockRiwayat[email];
      }

      setUser(userWithAuth);
      setRiwayatPeminjaman(userPeminjaman);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login gagal';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await apiLogout();
    } catch (err) {
      console.error('Error during API logout:', err);
    }

    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setRiwayatPeminjaman([]);
    setError(null);

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
  };

  // Tambah peminjaman
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

      const userId = parseInt(user.id);
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

      const result = await createPeminjaman(apiData);

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

      const startHour = parseInt(data.waktuMulai.split(':')[0]);
      const endHour = parseInt(data.waktuSelesai.split(':')[0]);
      const durasi = endHour - startHour;

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
        tanggalDisetujui: result.status === 'confirmed' 
          ? safeDateFormatSimple(result.locked_at || result.created_at) 
          : undefined,
        nomorSurat: result.status === 'confirmed' 
          ? `UNMS/${result.id_peminjaman}/SPR/I/2024` 
          : undefined,
        jumlahPeserta: 1,
        catatan: undefined
      };

      setRiwayatPeminjaman(prev => [newPeminjaman, ...prev]);

      const existingPeminjaman = JSON.parse(localStorage.getItem('user_peminjaman') || '[]');
      const updatedPeminjaman = [newPeminjaman, ...existingPeminjaman];
      localStorage.setItem('user_peminjaman', JSON.stringify(updatedPeminjaman));

      return newPeminjaman;
    } catch (error) {
      console.error('Error creating peminjaman:', error);
      throw error;
    }
  };

  // Update status peminjaman
  const updateStatusPeminjaman = (id: string, status: Peminjaman['status']): void => {
    setRiwayatPeminjaman(prev => 
      prev.map(item => item.id === id ? { ...item, status } : item)
    );
    
    const existingPeminjaman = JSON.parse(localStorage.getItem('user_peminjaman') || '[]');
    const updatedPeminjaman = existingPeminjaman.map((item: Peminjaman) =>
      item.id === id ? { ...item, status } : item
    );
    localStorage.setItem('user_peminjaman', JSON.stringify(updatedPeminjaman));
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'user_peminjaman',
      oldValue: localStorage.getItem('user_peminjaman'),
      newValue: JSON.stringify(updatedPeminjaman),
      url: window.location.href,
      storageArea: localStorage
    }));
  };

  // Hapus peminjaman
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

  // Statistik
  const getStatistik = () => {
    const total = riwayatPeminjaman.length;
    const disetujui = riwayatPeminjaman.filter(r => r.status === 'disetujui' || r.status === 'selesai').length;
    const diproses = riwayatPeminjaman.filter(r => r.status === 'diproses').length;
    const selesai = riwayatPeminjaman.filter(r => r.status === 'selesai').length;
    const ditolak = riwayatPeminjaman.filter(r => r.status === 'ditolak').length;
    
    return { total, disetujui, diproses, selesai, ditolak };
  };

  // Check role
  const hasRole = (roles: ('admin' | 'mahasiswa' | 'dosen')[]): boolean => {
    if (!user?.role) return false;
    return roles.includes(user.role);
  };

  // Refresh riwayat
  const refreshRiwayat = () => {
    checkAuth();
  };

  // Peminjaman aktif
  const getPeminjamanAktif = () => {
    const today = new Date().toISOString().split('T')[0];
    return riwayatPeminjaman.filter(p => 
      p.status === 'disetujui' && p.tanggal >= today
    );
  };

  // Peminjaman mendatang
  const getPeminjamanMendatang = () => {
    const today = new Date().toISOString().split('T')[0];
    return riwayatPeminjaman.filter(p =>
      (p.status === 'menunggu' || p.status === 'disetujui') && p.tanggal >= today
    ).slice(0, 5);
  };

  return {
    // State
    user,
    loading,
    error,
    riwayatPeminjaman,
    
    // Status (✅ sekarang reactive)
    isAuthenticated,
    isAdmin,
    
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