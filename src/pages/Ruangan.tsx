// src/pages/Ruangan.tsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RoomListSection from '@/components/RoomListSection';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Building2,
  Clock,
  Filter,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const Ruangan = () => {
  const { user, isAuthenticated, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  // State untuk filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGedung, setSelectedGedung] = useState('all');
  const [selectedLantai, setSelectedLantai] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

  // Data dummy gedung (bisa diganti API)
  const gedungList = ['GKB1', 'GKB2', 'Gedung A', 'Gedung B', 'Gedung C'];
  const lantaiList = ['1', '2', '3', '4', '5'];

  // ✅ PROTEKSI: Redirect admin ke dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && isAdmin) {
      navigate('/', { replace: true });
    }
  }, [loading, isAuthenticated, isAdmin, navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-500">Memuat data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ✅ PROTEKSI: Tampilkan pesan jika admin
  if (isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Akses Terbatas
            </h1>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Halaman Daftar Ruangan hanya tersedia untuk Mahasiswa dan Dosen. 
              Silakan gunakan menu Master untuk mengelola data.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
              <Link to="/">
                <Button className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <Building2 className="h-4 w-4" />
                  Dashboard Admin
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ✅ PROTEKSI: Tampilkan pesan jika belum login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 mx-auto mb-6">
              <Building2 className="h-10 w-10 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Silakan Masuk
            </h1>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Anda perlu masuk terlebih dahulu untuk melihat dan mengajukan peminjaman ruangan.
            </p>
            <Link to="/">
              <Button className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ✅ TAMPILAN UNTUK USER (Mahasiswa/Dosen)
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-r from-orange-50 to-red-50 py-12 md:py-16 border-b border-orange-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Daftar Ruangan
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Temukan dan ajukan peminjaman ruangan kampus Unimus
                  </p>
                </div>
              </div>

              {/* Info User */}
              {user && (
                <Card className="bg-white/80 backdrop-blur border-orange-200">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <Badge variant="outline" className="text-xs capitalize">
                        {user.role === 'mahasiswa' ? 'Mahasiswa' : 'Dosen'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Info Tanggal */}
            <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id })}</span>
            </div>
          </div>
        </section>

        {/* Filter & Search */}
        <section className="border-b border-gray-200 bg-white sticky top-16 z-40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari ruangan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              {/* Filter Button */}
              <Button
                variant="outline"
                onClick={() => setShowFilter(!showFilter)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filter
                {(selectedGedung !== 'all' || selectedLantai !== 'all') && (
                  <Badge className="bg-orange-500 text-white h-5 w-5 p-0 flex items-center justify-center text-xs">
                    !
                  </Badge>
                )}
              </Button>

              {/* Status Info */}
              <div className="hidden md:flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span>Tersedia</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span>Dipakai</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <span>Akan Dipakai</span>
                </div>
              </div>
            </div>

            {/* Expanded Filter */}
            {showFilter && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100">
                <Select value={selectedGedung} onValueChange={setSelectedGedung}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Gedung" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Gedung</SelectItem>
                    {gedungList.map((gedung) => (
                      <SelectItem key={gedung} value={gedung}>
                        {gedung}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLantai} onValueChange={setSelectedLantai}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Lantai" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Lantai</SelectItem>
                    {lantaiList.map((lantai) => (
                      <SelectItem key={lantai} value={lantai}>
                        Lantai {lantai}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedGedung('all');
                    setSelectedLantai('all');
                    setSearchQuery('');
                  }}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Reset Filter
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Room List */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <RoomListSection />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Ruangan;