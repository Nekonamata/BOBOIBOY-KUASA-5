import { Search, CalendarCheck, Clock, Shield, BarChart3, Bell } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Pencarian Mudah',
    description: 'Filter ruangan berdasarkan gedung, zona, lantai, dan kapasitas sesuai kebutuhan Anda.',
  },
  {
    icon: CalendarCheck,
    title: 'Booking Online',
    description: 'Ajukan peminjaman ruangan secara online kapan saja dan dimana saja.',
  },
  {
    icon: Clock,
    title: 'Real-time Status',
    description: 'Pantau ketersediaan ruangan dan status peminjaman secara real-time.',
  },
  {
    icon: Shield,
    title: 'Validasi Cepat',
    description: 'Proses validasi peminjaman oleh admin Rumah Tangga yang cepat dan transparan.',
  },
  {
    icon: BarChart3,
    title: 'Laporan Lengkap',
    description: 'Dashboard dan laporan peminjaman untuk monitoring dan evaluasi penggunaan ruang.',
  },
  {
    icon: Bell,
    title: 'Notifikasi',
    description: 'Dapatkan notifikasi untuk setiap update status peminjaman Anda.',
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Fitur Unggulan SIPRUS
          </h2>
          <p className="text-muted-foreground">
            Sistem peminjaman ruang yang dirancang untuk memudahkan seluruh civitas akademika Unimus
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary mb-4 group-hover:shadow-glow transition-all duration-300">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
