// src/components/UserDropdown.tsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ChevronDown, User, Calendar, History, LogOut, Settings } from 'lucide-react';

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Tombol trigger - PERBAIKI hover color */}
      <button 
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors" /* UBAH: hover:bg-accent */
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-sm font-medium text-foreground">{user?.name || 'Admin'}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu - PERBAIKI hover color */}
      <div 
        className={`
          absolute right-0 top-full mt-1 w-64 bg-popover rounded-lg shadow-lg 
          border border-border overflow-hidden z-50
          transition-all duration-200 ease-out origin-top
          ${isOpen 
            ? 'opacity-100 scale-y-100 translate-y-0 visible' 
            : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none invisible'
          }
        `}
      >
        <div className="p-4 border-b border-border">
          <p className="font-semibold text-foreground">{user?.name || 'Administrator SIPRUS'}</p>
          <p className="text-sm text-muted-foreground">{user?.email || 'admin@unimus.ac.id'}</p>
        </div>

        <div className="py-1">
          <Link
            to="/profil"
            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <User className="h-4 w-4" />
            <span>Profil Saya</span>
          </Link>
          <Link
            to="/profil?tab=riwayat"
            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <History className="h-4 w-4" />
            <span>Riwayat Saya</span>
          </Link>
        </div>

        <div className="border-t border-border py-1">
          <Link 
            to="/profil?tab=settings" 
            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="h-4 w-4" />
            <span>Pengaturan</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDropdown;