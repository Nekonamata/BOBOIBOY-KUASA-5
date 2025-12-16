import { Button } from '@/components/ui/button';
import { ArrowRight, Building2, Users, Calendar, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { icon: Building2, value: '50+', label: 'Ruangan' },
  { icon: Users, value: '1000+', label: 'Pengguna' },
  { icon: Calendar, value: '500+', label: 'Peminjaman/Bulan' },
];

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <CheckCircle className="h-4 w-4" />
              Sistem Reservasi Ruang Terintegrasi
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
              Peminjaman Ruang{' '}
              <span className="text-gradient">Kampus Unimus</span>{' '}
              Lebih Mudah
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              SIPRUS memudahkan mahasiswa, dosen, dan staff dalam melakukan
              peminjaman ruangan kampus secara online. Cepat, transparan, dan terintegrasi.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/ruangan">
                <Button size="xl" variant="hero" className="w-full sm:w-auto">
                  Lihat Ruangan
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button size="xl" variant="outline" className="w-full sm:w-auto">
                Cara Penggunaan
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Illustration */}
          <div className="relative hidden lg:block animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              {/* Main Card */}
              <div className="rounded-3xl bg-card border border-border/50 p-8 shadow-lg">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">Ruangan Populer</h3>
                    <span className="text-sm text-primary">Lihat Semua</span>
                  </div>

                  {/* Room Preview Cards */}
                  {[
                    { name: 'Aula Utama', gedung: 'Gedung A', status: 'Tersedia' },
                    { name: 'Lab Komputer C1', gedung: 'Gedung C', status: 'Terpakai' },
                    { name: 'Ruang Seminar D2', gedung: 'Gedung D', status: 'Tersedia' },
                  ].map((room, index) => (
                    <div
                      key={room.name}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors animate-fade-in"
                      style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{room.name}</p>
                          <p className="text-sm text-muted-foreground">{room.gedung}</p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          room.status === 'Tersedia'
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {room.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Card */}
              <div className="absolute -right-6 -bottom-6 rounded-2xl bg-card border border-border/50 p-4 shadow-lg animate-float">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">Peminjaman Disetujui!</p>
                    <p className="text-xs text-muted-foreground">Aula Utama - 15 Des 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
