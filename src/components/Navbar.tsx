// src/components/Navbar.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  Menu,
  X,
  User,
  ChevronDown,
  DoorOpen,
  Settings,
  FileText,
  Home,
  Info,
  Bell,
  Check,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import LoginModal from './LoginModal';
import UserDropdown from './UserDropdown';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Tipe untuk notifikasi
interface Notification {
  id: number;
  relatedId?: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  read: boolean;
  date: Date;
}

// Tipe untuk peminjaman
interface Peminjaman {
  id: string | number;
  ruangan: string;
  keperluan: string;
  status: 'menunggu' | 'disetujui' | 'ditolak';
  tanggalPengajuan: string | Date;
  tanggalDisetujui?: string;
  nomorSurat?: string;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const { isAuthenticated, loading, user } = useAuth();
  
  const isAdmin = user?.role === 'admin';

  // Load notifikasi dan pending count
  useEffect(() => {
    const loadNotifications = () => {
      if (isAuthenticated) {
        const storedNotifications = localStorage.getItem('user_notifications');
        const storedPeminjaman = localStorage.getItem('user_peminjaman');
        
        let notifications: Notification[] = [];
        
        if (storedNotifications) {
          try {
            const parsed = JSON.parse(storedNotifications);
            notifications = parsed.map((notif: any) => ({
              ...notif,
              date: new Date(notif.date)
            }));
          } catch (error) {
            console.error('Error parsing notifications:', error);
            notifications = [];
          }
        }
        
        if (storedPeminjaman) {
          try {
            const peminjamanData: Peminjaman[] = JSON.parse(storedPeminjaman);
            
            peminjamanData.sort((a, b) => {
              const dateA = new Date(a.tanggalPengajuan).getTime();
              const dateB = new Date(b.tanggalPengajuan).getTime();
              return dateB - dateA;
            });
            
            // Hitung pending (menunggu) untuk admin
            const pendingItems = peminjamanData.filter(p => p.status === 'menunggu');
            setPendingCount(pendingItems.length);
            
            const existingNotificationIds = notifications
              .map(n => n.relatedId)
              .filter(id => id) as string[];
            
            peminjamanData.forEach((p) => {
              const notificationId = `peminjaman_${p.id}`;
              
              if (!existingNotificationIds.includes(notificationId)) {
                let notificationType: 'success' | 'error' | 'info' | 'warning' = 'info';
                let notificationTitle = 'Peminjaman Diajukan';
                let notificationMessage = `Peminjaman ${p.ruangan} untuk ${p.keperluan} sedang menunggu persetujuan`;
                
                if (p.status === 'disetujui') {
                  notificationType = 'success';
                  notificationTitle = '✅ Peminjaman Disetujui';
                  notificationMessage = `Peminjaman ${p.ruangan} untuk ${p.keperluan} telah disetujui`;
                } else if (p.status === 'ditolak') {
                  notificationType = 'error';
                  notificationTitle = '❌ Peminjaman Ditolak';
                  notificationMessage = `Peminjaman ${p.ruangan} untuk ${p.keperluan} ditolak`;
                }
                
                notifications.unshift({
                  id: Date.now() + Math.random(),
                  relatedId: notificationId,
                  title: notificationTitle,
                  message: notificationMessage,
                  type: notificationType,
                  read: p.status !== 'menunggu',
                  date: new Date(p.tanggalPengajuan),
                });
              }
            });
            
            localStorage.setItem('user_notifications', JSON.stringify(notifications));
          } catch (error) {
            console.error('Error processing peminjaman data:', error);
          }
        }
        
        if (notifications.length === 0) {
          const mockNotifications: Notification[] = [
            {
              id: 1,
              title: '✅ Peminjaman Disetujui',
              message: 'Peminjaman ruang A101 untuk rapat disetujui',
              type: 'success',
              read: false,
              date: new Date(Date.now() - 1000 * 60 * 30),
            },
            {
              id: 2,
              title: '❌ Peminjaman Ditolak',
              message: 'Peminjaman ruang B202 untuk seminar ditolak karena jadwal bentrok',
              type: 'error',
              read: false,
              date: new Date(Date.now() - 1000 * 60 * 60 * 2),
            },
            {
              id: 3,
              title: '⏰ Pengingat',
              message: 'Peminjaman ruang C303 akan dimulai besok pukul 09:00',
              type: 'warning',
              read: true,
              date: new Date(Date.now() - 1000 * 60 * 60 * 24),
            },
            {
              id: 4,
              title: '📢 Pembaruan Sistem',
              message: 'Sistem akan mengalami maintenance pada Minggu, 02:00-04:00',
              type: 'info',
              read: true,
              date: new Date(Date.now() - 1000 * 60 * 60 * 48),
            },
          ];
          notifications = mockNotifications;
          localStorage.setItem('user_notifications', JSON.stringify(notifications));
        }
        
        setNotifications(notifications);
        setUnreadCount(notifications.filter(n => !n.read).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
        setPendingCount(0);
      }
    };

    loadNotifications();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_notifications' || e.key === 'user_peminjaman') {
        loadNotifications();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    const interval = setInterval(() => {
      if (isAuthenticated) {
        const storedPeminjaman = localStorage.getItem('user_peminjaman');
        if (storedPeminjaman) {
          try {
            const peminjamanData: Peminjaman[] = JSON.parse(storedPeminjaman);
            const updated = peminjamanData.map((p) => {
              if (p.status === 'menunggu' && Math.random() > 0.8) {
                const isApproved = Math.random() > 0.3;
                const newStatus = isApproved ? 'disetujui' : 'ditolak';
                
                const notifs = JSON.parse(localStorage.getItem('user_notifications') || '[]');
                notifs.unshift({
                  id: Date.now(),
                  relatedId: `peminjaman_${p.id}`,
                  title: isApproved ? '✅ Peminjaman Disetujui' : '❌ Peminjaman Ditolak',
                  message: isApproved 
                    ? `Peminjaman ${p.ruangan} untuk ${p.keperluan} telah disetujui`
                    : `Peminjaman ${p.ruangan} untuk ${p.keperluan} ditolak`,
                  type: isApproved ? 'success' : 'error',
                  read: false,
                  date: new Date(),
                });
                localStorage.setItem('user_notifications', JSON.stringify(notifs));
                
                const updatedPeminjaman = {
                  ...p,
                  status: newStatus,
                  tanggalDisetujui: newStatus === 'disetujui' ? new Date().toLocaleDateString('id-ID') : undefined,
                  nomorSurat: newStatus === 'disetujui' ? `UNMS/${Math.floor(Math.random() * 1000)}/SPR/I/2024` : undefined
                };
                
                window.dispatchEvent(new Event('storage'));
                return updatedPeminjaman;
              }
              return p;
            });
            
            localStorage.setItem('user_peminjaman', JSON.stringify(updated));
            // Update pending count
            setPendingCount(updated.filter((p: Peminjaman) => p.status === 'menunggu').length);
          } catch (error) {
            console.error('Error updating peminjaman status:', error);
          }
        }
      }
    }, 30000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  const markAsRead = (id: number) => {
    const updated = notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updated);
    localStorage.setItem('user_notifications', JSON.stringify(updated));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(notif => ({ ...notif, read: true }));
    setNotifications(updated);
    localStorage.setItem('user_notifications', JSON.stringify(updated));
    setUnreadCount(0);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    return format(date, 'dd MMM yyyy', { locale: id });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <Check className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-amber-600" />;
      default: return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  const getUserName = () => {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.name || user?.name || 'Pengguna';
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return user?.name || 'Pengguna';
  };

  const handleMobileLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_peminjaman');
    localStorage.removeItem('user_notifications');
    window.location.href = '/';
    setIsOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg group-hover:shadow-orange-500/30 transition-all duration-300">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">SIPRUS</span>
                <span className="text-xs text-gray-500 -mt-1">Sistem Peminjaman Ruang Unimus</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-orange-600 transition-colors">
                <Home className="h-4 w-4" /> Beranda
              </Link>

              {/* Daftar Ruangan - hanya non-admin */}
              {!isAdmin && (
                <Link to="/ruangan" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">
                  <DoorOpen className="h-4 w-4" /> Daftar Ruangan
                </Link>
              )}
              
              {/* Master Dropdown - hanya admin */}
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors outline-none">
                    <Settings className="h-4 w-4" /> Master <ChevronDown className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 bg-white border border-gray-200 shadow-lg">
                    <DropdownMenuItem asChild>
                      <Link to="/master/gedung" className="flex items-center gap-2 cursor-pointer w-full">
                        <Building2 className="h-4 w-4" /> Master Gedung
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/master/ruangan" className="flex items-center gap-2 cursor-pointer w-full">
                        <DoorOpen className="h-4 w-4" /> Master Ruangan
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Laporan - hanya admin */}
              {isAdmin && (
                <Link to="/laporan" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">
                  <FileText className="h-4 w-4" /> Laporan
                </Link>
              )}

              {/* ✅ VALIDASI - hanya admin */}
              {isAdmin && (
                <Link to="/validasi" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors relative">
                  <CheckCircle2 className="h-4 w-4" /> Validasi
                  {pendingCount > 0 && (
                    <Badge className="absolute -top-2 -right-6 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </Badge>
                  )}
                </Link>
              )}

              <Link to="/tentang" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">
                <Info className="h-4 w-4" /> Tentang
              </Link>
            </div>

            {/* Auth Buttons & Notification */}
            <div className="hidden md:flex items-center gap-3 relative z-[100]">
              {isAuthenticated && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative hover:bg-orange-50 hover:text-orange-600 transition-colors">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs border-2 border-white bg-orange-500 text-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-96 max-h-[70vh] overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl">
                    <div className="p-4 border-b border-gray-200 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                            <Bell className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">Notifikasi</h3>
                            {unreadCount > 0 && (
                              <p className="text-xs text-gray-500">{unreadCount} belum dibaca</p>
                            )}
                          </div>
                        </div>
                        {unreadCount > 0 && (
                          <Button variant="ghost" size="sm" className="h-auto px-3 py-1.5 text-xs hover:bg-orange-50 hover:text-orange-600 text-orange-600" onClick={markAllAsRead}>
                            Tandai semua dibaca
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-2">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <DropdownMenuItem
                            key={notification.id}
                            className={`flex items-start gap-3 p-3 cursor-pointer transition-all ${
                              !notification.read ? 'border-l-4 border-orange-500 bg-orange-50' : 'border-l-4 border-transparent'
                            } rounded-lg mb-1`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              <div className={`p-2 rounded-lg ${
                                notification.type === 'success' ? 'bg-green-50 border border-green-100' : 
                                notification.type === 'error' ? 'bg-red-50 border border-red-100' : 
                                notification.type === 'warning' ? 'bg-amber-50 border border-amber-100' : 
                                'bg-blue-50 border border-blue-100'
                              }`}>
                                {getNotificationIcon(notification.type)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p className="text-sm font-semibold text-gray-900 truncate">{notification.title}</p>
                                {!notification.read && <div className="h-2 w-2 rounded-full bg-orange-500 flex-shrink-0" />}
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{formatTimeAgo(notification.date)}</span>
                              </div>
                            </div>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 px-4">
                          <div className="p-4 rounded-full mb-3 bg-gray-100 border border-gray-200">
                            <Bell className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="font-medium text-gray-900 mb-1">Tidak ada notifikasi</p>
                          <p className="text-sm text-gray-600 text-center">Semua notifikasi akan muncul di sini</p>
                        </div>
                      )}
                    </div>
                    
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-200 bg-gray-50">
                        <Button variant="ghost" className="w-full hover:bg-white transition-colors text-orange-600 font-medium" asChild>
                          <Link to="/notifikasi" className="flex items-center justify-center gap-2">
                            Lihat semua notifikasi <ChevronDown className="h-4 w-4 -rotate-90" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {loading ? (
                <div className="h-9 w-20 bg-gray-200 rounded-md animate-pulse" />
              ) : isAuthenticated ? (
                <UserDropdown />
              ) : (
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-gray-100 hover:text-gray-900 text-gray-700" onClick={() => setIsLoginModalOpen(true)}>
                  <User className="h-4 w-4" /> Masuk
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
              {isOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 animate-in slide-in-from-top">
              <div className="flex flex-col gap-1">
                <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg" onClick={() => setIsOpen(false)}>
                  <Home className="h-4 w-4" /> Beranda
                </Link>

                {!isAdmin && (
                  <Link to="/ruangan" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setIsOpen(false)}>
                    <DoorOpen className="h-4 w-4" /> Daftar Ruangan
                  </Link>
                )}
                
                {isAdmin && (
                  <>
                    <div className="px-4 py-2 mt-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Master Data</span>
                    </div>
                    <Link to="/master/gedung" className="flex items-center gap-3 px-4 py-3 pl-8 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setIsOpen(false)}>
                      <Building2 className="h-4 w-4" /> Master Gedung
                    </Link>
                    <Link to="/master/ruangan" className="flex items-center gap-3 px-4 py-3 pl-8 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setIsOpen(false)}>
                      <DoorOpen className="h-4 w-4" /> Master Ruangan
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <Link to="/laporan" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setIsOpen(false)}>
                    <FileText className="h-4 w-4" /> Laporan
                  </Link>
                )}

                {/* ✅ VALIDASI MOBILE - hanya admin */}
                {isAdmin && (
                  <Link to="/validasi" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-600 rounded-lg" onClick={() => setIsOpen(false)}>
                    <CheckCircle2 className="h-4 w-4" /> Validasi
                    {pendingCount > 0 && (
                      <Badge className="ml-auto bg-red-500 text-white h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {pendingCount > 9 ? '9+' : pendingCount}
                      </Badge>
                    )}
                  </Link>
                )}

                <Link to="/tentang" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setIsOpen(false)}>
                  <Info className="h-4 w-4" /> Tentang
                </Link>
                
                {isAuthenticated && (
                  <>
                    <div className="px-4 py-2 mt-2 border-t border-gray-200">
                      <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Notifikasi</span>
                    </div>
                    {notifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className={`flex items-center gap-3 px-4 py-3 text-sm ${
                        !notification.read ? 'border-l-4 border-orange-500 bg-orange-50' : 'border-l-4 border-transparent bg-white'
                      } rounded-lg mx-2 mb-2 border border-gray-200`} onClick={() => markAsRead(notification.id)}>
                        <div className="flex-shrink-0">
                          <div className={`p-1.5 rounded-lg ${
                            notification.type === 'success' ? 'bg-green-50 border border-green-100' : 
                            notification.type === 'error' ? 'bg-red-50 border border-red-100' : 
                            notification.type === 'warning' ? 'bg-amber-50 border border-amber-100' : 
                            'bg-blue-50 border border-blue-100'
                          }`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm mb-0.5 text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-700 truncate mb-1">{notification.message}</p>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{formatTimeAgo(notification.date)}</span>
                          </div>
                        </div>
                        {!notification.read && <div className="h-2 w-2 rounded-full bg-orange-500 flex-shrink-0" />}
                      </div>
                    ))}
                    {notifications.length > 3 && (
                      <Link to="/notifikasi" className="flex items-center justify-center gap-2 px-4 py-2 text-sm mx-2 rounded-xl hover:bg-gray-50 text-orange-600 border border-gray-200 mt-2 bg-white" onClick={() => setIsOpen(false)}>
                        Lihat semua notifikasi <ChevronDown className="h-4 w-4 -rotate-90" />
                      </Link>
                    )}
                  </>
                )}
                
                <div className="pt-4 mt-2 border-t border-gray-200">
                  {loading ? (
                    <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
                  ) : isAuthenticated ? (
                    <div className="flex flex-col w-full gap-3">
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-lg">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{getUserName()}</p>
                          <p className="text-xs text-gray-600 truncate">Lihat profil</p>
                        </div>
                        {unreadCount > 0 && (
                          <Badge className="h-6 w-6 flex items-center justify-center p-0 text-xs border-2 border-white bg-orange-500 text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="w-full hover:bg-gray-100 text-gray-700 border-gray-300" asChild onClick={() => setIsOpen(false)}>
                          <Link to="/profil">Profil</Link>
                        </Button>
                        <Button variant="destructive" size="sm" className="w-full bg-red-500 hover:bg-red-600 text-white" onClick={handleMobileLogout}>
                          Keluar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="default" size="sm" className="w-full gap-2 bg-gradient-to-br from-orange-500 to-red-500 hover:opacity-90 text-white" onClick={() => { setIsLoginModalOpen(true); setIsOpen(false); }}>
                      <User className="h-4 w-4" /> Masuk ke SIPRUS
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLoginSuccess={handleLoginSuccess} />
    </>
  );
};

export default Navbar;