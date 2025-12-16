import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Building2, Users, GraduationCap, Briefcase, CheckCircle } from 'lucide-react';

const userRoles = [
  {
    icon: Users,
    title: 'Guest',
    description: 'Pengunjung umum yang dapat melihat daftar ruangan dan ketersediaan tanpa login.',
    features: ['Lihat daftar ruangan', 'Filter berdasarkan gedung/zona/lantai', 'Lihat detail ruangan'],
  },
  {
    icon: GraduationCap,
    title: 'Mahasiswa',
    description: 'Mahasiswa Unimus yang dapat mengajukan peminjaman ruangan untuk kegiatan.',
    features: ['Semua fitur Guest', 'Ajukan peminjaman ruangan', 'Lihat riwayat peminjaman', 'Notifikasi status'],
  },
  {
    icon: Briefcase,
    title: 'Admin Rumah Tangga',
    description: 'Staf bagian Rumah Tangga yang mengelola dan memvalidasi peminjaman ruangan.',
    features: ['Master data gedung & ruang', 'Validasi permohonan', 'Laporan peminjaman', 'Dashboard analitik'],
  },
];

const Tentang = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-hero py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-lg mb-6">
                <Building2 className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Tentang SIPRUS
              </h1>
              <p className="text-lg text-muted-foreground">
                Sistem Peminjaman Ruang Universitas Muhammadiyah Semarang - 
                Platform terpadu untuk peminjaman ruangan kampus yang efisien dan transparan.
              </p>
            </div>
          </div>
        </section>

        {/* About Content */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                Apa itu SIPRUS?
              </h2>
              <div className="prose prs ose-lg text-muted-foreground">
                <p className="mb-4">
                  SIPRUS (Sistem Peminjaman Ruang Unimus) adalah platform digital yang dikembangkan 
                  untuk memudahkan proses peminjaman ruangan di lingkungan kampus Universitas Muhammadiyah Semarang.
                </p>
                <p className="mb-4">
                  Sistem ini memungkinkan mahasiswa, dosen, dan staf untuk melihat ketersediaan ruangan, 
                  mengajukan peminjaman, dan memantau status permohonan secara real-time melalui antarmuka 
                  yang mudah digunakan.
                </p>
                <p>
                  Dengan SIPRUS, proses peminjaman ruangan yang sebelumnya manual dan memakan waktu 
                  kini dapat dilakukan secara online, cepat, dan terorganisir dengan baik.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* User Roles */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Jenis Pengguna
              </h2>
              <p className="text-muted-foreground">
                SIPRUS dirancang untuk melayani berbagai jenis pengguna dengan hak akses yang berbeda
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {userRoles.map((role, index) => (
                <div
                  key={role.title}
                  className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary mb-4">
                    <role.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-xl text-foreground mb-2">{role.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{role.description}</p>
                  <ul className="space-y-2">
                    {role.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle className="h-4 w-4 text-success shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Tentang;
