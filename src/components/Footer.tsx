import { Building2, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-bold">SIRUS</span>
                <p className="text-xs text-background/60">Sistem Reservasi Ruang Unimus</p>
              </div>
            </Link>
            <p className="text-background/70 text-sm max-w-md">
              Platform peminjaman ruangan kampus Universitas Muhammadiyah Semarang 
              yang terintegrasi dan mudah digunakan untuk seluruh civitas akademika.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Tautan Cepat</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li>
                <Link to="/" className="hover:text-background transition-colors">Beranda</Link>
              </li>
              <li>
                <Link to="/ruangan" className="hover:text-background transition-colors">Daftar Ruangan</Link>
              </li>
              <li>
                <Link to="/tentang" className="hover:text-background transition-colors">Tentang</Link>
              </li>
              <li>
                <Link to="/bantuan" className="hover:text-background transition-colors">Bantuan</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Kontak</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Jl. Kedungmundu No.18, Semarang</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(024) 76740294</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>rumahtangga@unimus.ac.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 text-center text-sm text-background/50">
          <p>&copy; {new Date().getFullYear()} SIRUS - Universitas Muhammadiyah Semarang. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
