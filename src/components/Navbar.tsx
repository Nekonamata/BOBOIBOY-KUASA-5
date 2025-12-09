import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, Menu, X, User, LogIn } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-md group-hover:shadow-glow transition-all duration-300">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">SIRUS</span>
              <span className="text-xs text-muted-foreground -mt-1">Peminjaman Ruang Unimus</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Beranda
            </Link>
            <Link to="/ruangan" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Daftar Ruangan
            </Link>
            <Link to="/tentang" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Tentang
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              Masuk
            </Button>
            <Button size="sm" className="gap-2">
              <LogIn className="h-4 w-4" />
              Daftar
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Beranda
              </Link>
              <Link
                to="/ruangan"
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Daftar Ruangan
              </Link>
              <Link
                to="/tentang"
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Tentang
              </Link>
              <div className="flex gap-2 px-4 pt-2 border-t border-border mt-2">
                <Button variant="ghost" size="sm" className="flex-1 gap-2">
                  <User className="h-4 w-4" />
                  Masuk
                </Button>
                <Button size="sm" className="flex-1 gap-2">
                  <LogIn className="h-4 w-4" />
                  Daftar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
