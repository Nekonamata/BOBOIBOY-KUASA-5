import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import RoomListSection from '@/components/RoomListSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
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
