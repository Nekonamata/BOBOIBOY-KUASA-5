import Navbar from '@/components/Navbar';
import RoomListSection from '@/components/RoomListSection';
import Footer from '@/components/Footer';
import { Building2 } from 'lucide-react';

const Ruangan = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-hero py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-md">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Daftar Ruangan
                </h1>
                <p className="text-muted-foreground">
                  Temukan dan ajukan peminjaman ruangan kampus Unimus
                </p>
              </div>
            </div>
          </div>
        </section>

        <RoomListSection />
      </main>
      <Footer />
    </div>
  );
};

export default Ruangan;
