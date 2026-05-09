// src/pages/master/Index.tsx
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import RoomListSection from '@/components/RoomListSection';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Building2,
  Users,
  DoorOpen,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Settings,
  Layers,
  LayoutDashboard,
  Calendar,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const Index = () => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-500">Memuat...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ==================== TAMPILAN ADMIN ====================
  if (isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          {/* Header Admin */}
          <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-orange-100 mb-1">
                    {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id })}
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    Selamat Datang, Administrator!
                  </h1>
                  <p className="text-orange-100 mt-2">
                    Kelola data ruangan dan pantau peminjaman dengan mudah
                  </p>
                </div>
                {user && (
                  <Card className="bg-white/20 backdrop-blur border-white/30 text-white">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-orange-600 font-bold text-lg">
                        {user.name?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <Badge className="bg-white/30 text-white border-0 text-xs">
                          Administrator
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </section>

          {/* Statistik Cards */}
          <section className="py-8 bg-gray-50 border-b">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pengguna</p>
                      <p className="text-2xl font-bold text-gray-900">60</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                      <Layers className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tipe Ruangan</p>
                      <p className="text-2xl font-bold text-gray-900">23</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                      <DoorOpen className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ruangan</p>
                      <p className="text-2xl font-bold text-gray-900">25</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                      <FileText className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Peminjaman</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Menu Cepat Admin */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6 text-orange-500" />
                Menu Cepat
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/master/gedung" className="group">
                  <Card className="h-full hover:shadow-lg hover:border-orange-300 transition-all cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors mb-4">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">Master Gedung</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Kelola data gedung, tambah, edit, atau hapus gedung
                      </p>
                      <div className="flex items-center text-orange-500 group-hover:gap-2 transition-all">
                        <span className="text-sm font-medium">Kelola</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link to="/master/ruangan" className="group">
                  <Card className="h-full hover:shadow-lg hover:border-orange-300 transition-all cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 group-hover:bg-green-200 transition-colors mb-4">
                        <DoorOpen className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">Master Ruangan</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Kelola data ruangan, atur kapasitas dan fasilitas
                      </p>
                      <div className="flex items-center text-orange-500 group-hover:gap-2 transition-all">
                        <span className="text-sm font-medium">Kelola</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link to="/laporan" className="group">
                  <Card className="h-full hover:shadow-lg hover:border-orange-300 transition-all cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 group-hover:bg-purple-200 transition-colors mb-4">
                        <BarChart3 className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">Laporan</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Lihat laporan peminjaman dan ketersediaan ruangan
                      </p>
                      <div className="flex items-center text-orange-500 group-hover:gap-2 transition-all">
                        <span className="text-sm font-medium">Lihat</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </section>

          {/* Info Cepat */}
          <section className="py-8 bg-gray-50 border-t">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6 flex items-start gap-4">
                    <Clock className="h-8 w-8 text-blue-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Akses Cepat</h3>
                      <p className="text-sm text-gray-500">
                        Pinjam ruangan mudah dan cepat! Klik menu Master untuk kelola data, 
                        atau Laporan untuk pantau status peminjaman.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex items-start gap-4">
                    <CheckCircle2 className="h-8 w-8 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Status Sistem</h3>
                      <p className="text-sm text-gray-500">
                        Sistem berjalan normal. Total 25 ruangan terdaftar, 
                        0 peminjaman aktif hari ini.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // ==================== TAMPILAN USER ====================
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Daftar Ruangan Tersedia
              </h2>
              <p className="text-muted-foreground">
                Temukan ruangan yang sesuai dengan kebutuhan Anda. Filter berdasarkan gedung, zona, dan lantai.
              </p>
              
              {/* CTA untuk user yang belum login */}
              {!isAuthenticated && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg inline-block">
                  <p className="text-sm text-blue-700 mb-2">
                    Masuk untuk mengajukan peminjaman ruangan
                  </p>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Login diperlukan untuk meminjam
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <RoomListSection />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;