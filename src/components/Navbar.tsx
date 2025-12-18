// src/components/Navbar.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
  Layers
} from 'lucide-react';
import LoginModal from './LoginModal';
import UserDropdown from './UserDropdown';
import { useAuth } from '@/hooks/useAuth';
import { usePreventDuplicateNavbar } from '@/hooks/usePreventDuplicateNavbar';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated, loading, user } = useAuth();
  
  usePreventDuplicateNavbar();
  
  const isAdmin = user?.role === 'admin';

  const handleLoginSuccess = () => {
    console.log('Login berhasil');
    setIsLoginModalOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const getUserName = () => {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.name || 'Pengguna';
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return 'Pengguna';
  };

  const handleMobileLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.reload();
    setIsOpen(false);
  };

  return (
    <>
      <nav 
        data-navbar="main" 
        className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-lg group-hover:shadow-glow transition-all duration-300">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">SIPRUS</span>
                <span className="text-xs text-muted-foreground -mt-1">Sistem Peminjaman Ruang Unimus</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <Home className="h-4 w-4" />
                Beranda
              </Link>
              <Link 
                to="/ruangan" 
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <DoorOpen className="h-4 w-4" />
                Daftar Ruangan
              </Link>
              
              {/* Master Dropdown - hanya untuk admin */}
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors outline-none">
                    <Settings className="h-4 w-4" />
                    Master
                    <ChevronDown className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/master/gedung" className="flex items-center gap-2 cursor-pointer">
                        <Building2 className="h-4 w-4" />
                        Master Gedung
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/master/lantai" className="flex items-center gap-2 cursor-pointer">
                        <Layers className="h-4 w-4" />
                        Master Lantai
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/master/ruangan" className="flex items-center gap-2 cursor-pointer">
                        <DoorOpen className="h-4 w-4" />
                        Master Ruangan
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Laporan - hanya untuk admin */}
              {isAdmin && (
                <Link 
                  to="/laporan" 
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Laporan
                </Link>
              )}

              <Link 
                to="/tentang" 
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <Info className="h-4 w-4" />
                Tentang
              </Link>
            </div>

            {/* Auth Buttons - FIXED: Tombol Masuk dengan hover yang benar */}
            <div className="hidden md:flex items-center gap-3 relative z-[100]">
              {loading ? (
                <div className="h-9 w-20 bg-secondary rounded-md animate-pulse" />
              ) : isAuthenticated ? (
                <UserDropdown />
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 hover:bg-accent hover:text-accent-foreground nav-button-fix" /* UBAH: hover:bg-accent */
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  <User className="h-4 w-4" />
                  Masuk
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors" /* UBAH: hover:bg-accent */
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Navigation - PERBAIKI hover color */}
          {isOpen && (
            <div className="md:hidden py-4 border-t border-border animate-fade-in">
              <div className="flex flex-col gap-1">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition-colors" /* UBAH: hover:bg-accent */
                  onClick={() => setIsOpen(false)}
                >
                  <Home className="h-4 w-4" />
                  Beranda
                </Link>
                <Link
                  to="/ruangan"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent rounded-lg transition-colors" /* UBAH: hover:bg-accent */
                  onClick={() => setIsOpen(false)}
                >
                  <DoorOpen className="h-4 w-4" />
                  Daftar Ruangan
                </Link>
                
                {/* Master Links Mobile - hanya untuk admin */}
                {isAdmin && (
                  <>
                    <div className="px-4 py-2 mt-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Master Data</span>
                    </div>
                    <Link
                      to="/master/gedung"
                      className="flex items-center gap-3 px-4 py-3 pl-8 text-sm font-medium text-muted-foreground hover:bg-accent rounded-lg transition-colors" /* UBAH: hover:bg-accent */
                      onClick={() => setIsOpen(false)}
                    >
                      <Building2 className="h-4 w-4" />
                      Master Gedung
                    </Link>
                    <Link
                      to="/master/lantai"
                      className="flex items-center gap-3 px-4 py-3 pl-8 text-sm font-medium text-muted-foreground hover:bg-accent rounded-lg transition-colors" /* UBAH: hover:bg-accent */
                      onClick={() => setIsOpen(false)}
                    >
                      <Layers className="h-4 w-4" />
                      Master Lantai
                    </Link>
                    <Link
                      to="/master/ruangan"
                      className="flex items-center gap-3 px-4 py-3 pl-8 text-sm font-medium text-muted-foreground hover:bg-accent rounded-lg transition-colors" /* UBAH: hover:bg-accent */
                      onClick={() => setIsOpen(false)}
                    >
                      <DoorOpen className="h-4 w-4" />
                      Master Ruangan
                    </Link>
                  </>
                )}

                {/* Laporan Mobile - hanya untuk admin */}
                {isAdmin && (
                  <Link
                    to="/laporan"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent rounded-lg transition-colors" /* UBAH: hover:bg-accent */
                    onClick={() => setIsOpen(false)}
                  >
                    <FileText className="h-4 w-4" />
                    Laporan
                  </Link>
                )}

                <Link
                  to="/tentang"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent rounded-lg transition-colors" /* UBAH: hover:bg-accent */
                  onClick={() => setIsOpen(false)}
                >
                  <Info className="h-4 w-4" />
                  Tentang
                </Link>
                
                {/* Mobile Auth Buttons - PERBAIKI hover color */}
                <div className="pt-4 mt-2 border-t border-border">
                  {loading ? (
                    <div className="h-12 w-full bg-secondary rounded-lg animate-pulse" />
                  ) : isAuthenticated ? (
                    <div className="flex flex-col w-full gap-3">
                      <div className="flex items-center gap-3 px-4 py-3 bg-secondary/50 rounded-lg">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {getUserName()}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">Lihat profil</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full hover:bg-accent" /* UBAH: hover:bg-accent */
                          asChild
                          onClick={() => setIsOpen(false)}
                        >
                          <Link to="/profil">
                            Profil
                          </Link>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="w-full"
                          onClick={handleMobileLogout}
                        >
                          Keluar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full gap-2 bg-gradient-primary hover:opacity-90"
                      onClick={() => {
                        setIsLoginModalOpen(true);
                        setIsOpen(false);
                      }}
                    >
                      <User className="h-4 w-4" />
                      Masuk ke SIPRUS
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default Navbar;