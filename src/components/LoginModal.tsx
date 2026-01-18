// src/components/LoginModal.tsx
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Loader2, Mail, Lock, Eye, EyeOff, AlertCircle, User, Shield, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

const LoginModal = ({ isOpen, onClose, onLoginSuccess }: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'mahasiswa' | 'dosen' | null>(null);
  const { login, loading: authLoading } = useAuth();

  // Reset form saat modal dibuka/tutup
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setError('');
      setShowPassword(false);
      setIsLoading(false);
      setSelectedRole(null);
    }
  }, [isOpen]);

  // Demo accounts data
  const demoAccounts = [
    {
      role: 'admin' as const,
      email: 'admin@unimus.ac.id',
      password: 'admin123',
      name: 'Administrator SIPRUS',
      description: 'Akses penuh ke semua fitur sistem',
      icon: <Shield className="h-5 w-5" />
    },
    {
      role: 'mahasiswa' as const,
      email: 'mahasiswa@unimus.ac.id',
      password: 'admin123',
      name: 'Budi Santoso',
      description: 'Mahasiswa Informatika',
      icon: <User className="h-5 w-5" />
    },
    {
      role: 'dosen' as const,
      email: 'dosen@unimus.ac.id',
      password: 'admin123',
      name: 'Dr. Ahmad Wijaya',
      description: 'Dosen Sistem Informasi',
      icon: <Building2 className="h-5 w-5" />
    }
  ];

  // Auto-fill berdasarkan role yang dipilih
  const handleRoleSelect = (role: 'admin' | 'mahasiswa' | 'dosen') => {
    const account = demoAccounts.find(acc => acc.role === role);
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
      setSelectedRole(role);
      setError('');
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validasi input
      if (!email || !password) {
        throw new Error('Email dan password harus diisi');
      }

      if (!email.includes('@')) {
        throw new Error('Format email tidak valid');
      }

      // Gunakan login dari useAuth
      const result = await login(email, password);
      
      if (!result.success) {
        throw new Error(result.message || 'Login gagal');
      }

      // Show success toast
      toast({
        title: "Login Berhasil",
        description: "Selamat datang di Sistem Peminjaman Ruangan Unimus",
      });

      // Reset form
      setEmail('');
      setPassword('');
      setError('');
      
      // Tutup modal dengan delay kecil untuk animasi
      setTimeout(() => {
        onClose();
        
        // Trigger success callback
        if (onLoginSuccess) {
          setTimeout(() => {
            onLoginSuccess();
          }, 100);
        }
      }, 300);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login gagal';
      setError(errorMessage);
      
      // Show error toast
      toast({
        title: "Login Gagal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [email, password, login, onClose, onLoginSuccess]);

  // Handle klik di luar modal
  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  }, [isLoading, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isLoading, onClose]);

  // Auto focus ke email input saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const emailInput = document.getElementById('email');
        emailInput?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      {/* Blur Background */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in-0 duration-300" />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 bg-white/80 backdrop-blur-sm"
          disabled={isLoading || authLoading}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Left Panel - Welcome */}
          <div className="md:w-2/5 bg-gradient-to-br from-orange-500 to-red-600 p-8 text-white flex flex-col">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">SIPRUS</h2>
                  <p className="text-orange-100 text-sm">Sistem Peminjaman Ruangan Unimus</p>
                </div>
              </div>
              
              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4">Selamat Datang!</h3>
                <p className="text-orange-100 mb-6">
                  Akses sistem peminjaman ruangan untuk mengelola kegiatan akademik Anda.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Cek Ketersediaan Ruangan</p>
                      <p className="text-orange-100 text-sm">Lihat jadwal dan status ruangan real-time</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Ajukan Peminjaman</p>
                      <p className="text-orange-100 text-sm">Pinjam ruangan untuk kegiatan akademik</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Kelola Notifikasi</p>
                      <p className="text-orange-100 text-sm">Dapatkan update status peminjaman</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-orange-400/30">
              <p className="text-orange-100 text-sm">
                Butuh bantuan? Hubungi IT Support di{' '}
                <a href="mailto:support@unimus.ac.id" className="underline hover:text-white">
                  support@unimus.ac.id
                </a>
              </p>
            </div>
          </div>
          
          {/* Right Panel - Login Form */}
          <div className="md:w-3/5 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Masuk ke Akun Anda</h2>
              <p className="text-gray-600 mt-1">
                Gunakan kredensial Unimus untuk mengakses sistem
              </p>
            </div>
            
            {/* Quick Login Buttons */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Login cepat dengan akun demo:</p>
              <div className="grid grid-cols-3 gap-3">
                {demoAccounts.map((account) => (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleRoleSelect(account.role)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedRole === account.role
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1 rounded ${
                        selectedRole === account.role
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {account.icon}
                      </div>
                      <span className={`text-xs font-medium ${
                        selectedRole === account.role ? 'text-orange-700' : 'text-gray-700'
                      }`}>
                        {account.role.charAt(0).toUpperCase() + account.role.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">{account.email}</p>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">atau masuk manual</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                {error && (
                  <div className="p-4 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Login Gagal</p>
                      <p className="mt-1">{error}</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900 font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    Email Unimus
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@unimus.ac.id"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setSelectedRole(null);
                    }}
                    disabled={isLoading || authLoading}
                    required
                    className="pl-10 bg-white text-gray-900 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    autoComplete="email"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-900 font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4 text-gray-500" />
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading || authLoading}
                      className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password Anda"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setSelectedRole(null);
                      }}
                      disabled={isLoading || authLoading}
                      required
                      className="pl-10 pr-10 bg-white text-gray-900 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading || authLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                {/* Current Selected Account Info */}
                {selectedRole && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        {demoAccounts.find(acc => acc.role === selectedRole)?.icon}
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">
                          {demoAccounts.find(acc => acc.role === selectedRole)?.name}
                        </p>
                        <p className="text-sm text-blue-700">
                          Login sebagai {selectedRole} • Email: {email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      disabled={isLoading || authLoading}
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                      Ingat saya
                    </label>
                  </div>
                  <a
                    href="#"
                    className="text-sm text-orange-600 hover:text-orange-800 transition-colors font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      toast({
                        title: "Reset Password",
                        description: "Hubungi administrator untuk reset password Anda",
                      });
                    }}
                  >
                    Lupa password?
                  </a>
                </div>
              </div>
              
              <div className="mt-8">
                <Button
                  type="submit"
                  className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium h-11"
                  disabled={isLoading || authLoading}
                >
                  {(isLoading || authLoading) ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memproses Login...
                    </>
                  ) : (
                    'Masuk ke Sistem'
                  )}
                </Button>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Belum memiliki akun?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        toast({
                          title: "Registrasi Akun",
                          description: "Hubungi administrator untuk membuat akun baru",
                        });
                      }}
                      className="font-medium text-orange-600 hover:text-orange-800 transition-colors"
                    >
                      Hubungi Administrator
                    </button>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;