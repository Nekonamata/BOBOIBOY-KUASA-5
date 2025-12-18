import { useState, useEffect, useCallback } from 'react';

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
  ruanganId: string;
  namaRuangan: string;
  gedung: string;
  tanggal: string;
  waktuMulai: string;
  waktuSelesai: string;
  keperluan: string;
  status: 'diproses' | 'disetujui' | 'ditolak' | 'selesai';
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riwayatPeminjaman, setRiwayatPeminjaman] = useState<Peminjaman[]>([]);

  // Mock data riwayat peminjaman per user (ditambah lebih banyak data)
  const mockRiwayat: Record<string, Peminjaman[]> = {
    'admin@unimus.ac.id': [
      {
        id: '1',
        ruanganId: 'A101',
        namaRuangan: 'Aula Utama Gedung A',
        gedung: 'Gedung A',
        tanggal: '2024-03-15',
        waktuMulai: '08:00',
        waktuSelesai: '12:00',
        keperluan: 'Seminar Fakultas Teknologi Informasi',
        status: 'selesai'
      },
      {
        id: '2',
        ruanganId: 'C105',
        namaRuangan: 'Lab Komputer C1',
        gedung: 'Gedung C',
        tanggal: '2024-03-20',
        waktuMulai: '13:00',
        waktuSelesai: '17:00',
        keperluan: 'Praktikum Jaringan Komputer',
        status: 'disetujui'
      },
      {
        id: '3',
        ruanganId: 'B201',
        namaRuangan: 'Ruang Rapat B2',
        gedung: 'Gedung B',
        tanggal: '2024-03-25',
        waktuMulai: '09:00',
        waktuSelesai: '11:00',
        keperluan: 'Rapat Koordinasi Sistem',
        status: 'diproses'
      },
      {
        id: '4',
        ruanganId: 'D301',
        namaRuangan: 'Ruang Seminar D3',
        gedung: 'Gedung D',
        tanggal: '2024-04-02',
        waktuMulai: '14:00',
        waktuSelesai: '16:00',
        keperluan: 'Workshop Pengembangan Sistem',
        status: 'ditolak'
      }
    ],
    'mahasiswa@unimus.ac.id': [
      {
        id: '5',
        ruanganId: 'D201',
        namaRuangan: 'Ruang Seminar D2',
        gedung: 'Gedung D',
        tanggal: '2024-03-18',
        waktuMulai: '09:00',
        waktuSelesai: '12:00',
        keperluan: 'Diskusi Skripsi tentang Machine Learning',
        status: 'selesai'
      },
      {
        id: '6',
        ruanganId: 'A102',
        namaRuangan: 'Ruang Kelas A1',
        gedung: 'Gedung A',
        tanggal: '2024-03-22',
        waktuMulai: '13:00',
        waktuSelesai: '15:00',
        keperluan: 'Belajar Kelompok Matkul Algoritma',
        status: 'selesai'
      },
      {
        id: '7',
        ruanganId: 'C103',
        namaRuangan: 'Lab Programming C1',
        gedung: 'Gedung C',
        tanggal: '2024-03-28',
        waktuMulai: '10:00',
        waktuSelesai: '12:00',
        keperluan: 'Praktikum Pemrograman Web',
        status: 'disetujui'
      }
    ],
    'dosen@unimus.ac.id': [
      {
        id: '8',
        ruanganId: 'B301',
        namaRuangan: 'Ruang Rapat B3',
        gedung: 'Gedung B',
        tanggal: '2024-03-22',
        waktuMulai: '10:00',
        waktuSelesai: '12:00',
        keperluan: 'Rapat Jurusan Sistem Informasi',
        status: 'diproses'
      },
      {
        id: '9',
        ruanganId: 'A202',
        namaRuangan: 'Ruang Kuliah A2',
        gedung: 'Gedung A',
        tanggal: '2024-03-19',
        waktuMulai: '08:00',
        waktuSelesai: '10:00',
        keperluan: 'Kuliah Umum Database Management',
        status: 'selesai'
      },
      {
        id: '10',
        ruanganId: 'D101',
        namaRuangan: 'Auditorium D1',
        gedung: 'Gedung D',
        tanggal: '2024-03-30',
        waktuMulai: '13:00',
        waktuSelesai: '16:00',
        keperluan: 'Seminar Nasional Teknologi Informasi',
        status: 'disetujui'
      }
    ]
  };

  // Cek status autentikasi
  const checkAuth = useCallback(() => {
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        try {
          const userObj = JSON.parse(userData);
          
          // Validasi token sederhana
          if (token.startsWith('siprus-')) {
            const userWithAuth: User = {
              ...userObj,
              isAuthenticated: true
            };
            
            setUser(userWithAuth);
            
            // Load riwayat peminjaman user
            if (userObj.email && mockRiwayat[userObj.email]) {
              setRiwayatPeminjaman(mockRiwayat[userObj.email]);
            } else {
              setRiwayatPeminjaman([]);
            }
            
            setError(null);
          } else {
            logout();
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
          logout();
        }
      } else {
        setUser(null);
        setRiwayatPeminjaman([]);
      }
    } catch (err) {
      console.error('Error checking auth:', err);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuth]);

  // Login function yang lebih sederhana
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

      // Simulasi delay API
      await new Promise(resolve => setTimeout(resolve, 800));

      // Dummy user database
      const dummyUsers = [
        {
          id: '1',
          email: 'admin@unimus.ac.id',
          password: 'admin123',
          name: 'Administrator SIPRUS',
          role: 'admin' as const,
          fakultas: 'Teknologi Informasi',
          jurusan: 'Sistem Informasi'
        },
        {
          id: '2',
          email: 'mahasiswa@unimus.ac.id',
          password: 'admin123',
          name: 'Budi Santoso',
          role: 'mahasiswa' as const,
          fakultas: 'Teknik',
          jurusan: 'Informatika',
          nim: '20210001'
        },
        {
          id: '3',
          email: 'dosen@unimus.ac.id',
          password: 'admin123',
          name: 'Dr. Ahmad Wijaya, M.Kom.',
          role: 'dosen' as const,
          fakultas: 'Teknologi Informasi',
          jurusan: 'Sistem Informasi'
        }
      ];

      // Cari user
      const user = dummyUsers.find(u => u.email === email);
      
      if (!user) {
        throw new Error('Email tidak terdaftar');
      }

      // Bandingkan password
      if (password !== user.password) {
        throw new Error('Password salah');
      }

      // Generate token
      const token = `siprus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Prepare user data (hapus password)
      const { password: _, ...userData } = user;
      const userWithAuth = {
        ...userData,
        loginTime: new Date().toISOString(),
        isAuthenticated: true
      };

      // Simpan ke localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(userWithAuth));

      // Update state
      setUser(userWithAuth);

      // Set riwayat peminjaman
      if (mockRiwayat[email]) {
        setRiwayatPeminjaman(mockRiwayat[email]);
      } else {
        setRiwayatPeminjaman([]);
      }

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
  const logout = (): void => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
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
    } catch (err) {
      console.error('Error during logout:', err);
      setError('Gagal logout');
    }
  };

  // Function untuk tambah riwayat peminjaman (simulasi)
  const tambahPeminjaman = (data: Omit<Peminjaman, 'id' | 'status'>): Peminjaman => {
    const newPeminjaman: Peminjaman = {
      ...data,
      id: Date.now().toString(),
      status: 'diproses' // Default status
    };
    
    // Update state
    setRiwayatPeminjaman(prev => [newPeminjaman, ...prev]);
    
    // Simpan ke mock data (hanya untuk session ini)
    if (user?.email) {
      const currentRiwayat = mockRiwayat[user.email] || [];
      mockRiwayat[user.email] = [newPeminjaman, ...currentRiwayat];
    }
    
    return newPeminjaman;
  };

  // Function untuk update status peminjaman
  const updateStatusPeminjaman = (id: string, status: Peminjaman['status']): void => {
    setRiwayatPeminjaman(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status } : item
      )
    );
    
    // Update mock data juga
    if (user?.email && mockRiwayat[user.email]) {
      mockRiwayat[user.email] = mockRiwayat[user.email].map(item =>
        item.id === id ? { ...item, status } : item
      );
    }
  };

  // Function untuk hapus peminjaman
  const hapusPeminjaman = (id: string): void => {
    setRiwayatPeminjaman(prev => prev.filter(item => item.id !== id));
    
    if (user?.email && mockRiwayat[user.email]) {
      mockRiwayat[user.email] = mockRiwayat[user.email].filter(item => item.id !== id);
    }
  };

  // Function untuk mendapatkan statistik
  const getStatistik = () => {
    const total = riwayatPeminjaman.length;
    const disetujui = riwayatPeminjaman.filter(r => r.status === 'disetujui').length;
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
    
    // Utility
    clearError: () => setError(null)
  };
};

export type { User, Peminjaman };