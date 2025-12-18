// src/pages/Profil.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Calendar, History, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Profil = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profil';

  const tabs = [
    { id: 'profil', label: 'Profil Saya', icon: <User className="h-4 w-4" /> },
    { id: 'peminjaman', label: 'Pinjam Ruangan', icon: <Calendar className="h-4 w-4" /> },
    { id: 'riwayat', label: 'Riwayat Saya', icon: <History className="h-4 w-4" /> },
    { id: 'settings', label: 'Pengaturan', icon: <Settings className="h-4 w-4" /> },
  ];

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Profil</h1>
        <p className="text-muted-foreground mt-2">Kelola informasi profil dan aktivitas Anda</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tab Navigation - PERBAIKI hover color */}
        <div className="lg:w-64">
          <Card className="sticky top-24">
            <CardContent className="p-4">
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent' /* UBAH: hover:bg-accent */
                    }`}
                    onClick={() => handleTabChange(tab.id)}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {tabs.find(tab => tab.id === activeTab)?.label || 'Profil'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'profil' && 'Kelola informasi profil pribadi Anda'}
                {activeTab === 'peminjaman' && 'Ajukan peminjaman ruangan untuk keperluan akademik'}
                {activeTab === 'riwayat' && 'Lihat riwayat peminjaman ruangan yang telah dilakukan'}
                {activeTab === 'settings' && 'Pengaturan akun dan preferensi sistem'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === 'profil' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground">Informasi Pribadi</h3>
                  <p className="text-muted-foreground">
                    Halaman profil Anda. Di sini Anda dapat mengupdate informasi pribadi.
                  </p>
                  {/* Tambahkan form atau konten profil di sini */}
                </div>
              )}
              
              {activeTab === 'peminjaman' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground">Form Peminjaman Ruangan</h3>
                  <p className="text-muted-foreground">
                    Gunakan form ini untuk mengajukan peminjaman ruangan di Unimus.
                  </p>
                  {/* Tambahkan form peminjaman di sini */}
                </div>
              )}
              
              {activeTab === 'riwayat' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground">Riwayat Peminjaman</h3>
                  <p className="text-muted-foreground">
                    Berikut adalah riwayat peminjaman ruangan yang telah Anda lakukan.
                  </p>
                  {/* Tambahkan tabel riwayat di sini */}
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground">Pengaturan Akun</h3>
                  <p className="text-muted-foreground">
                    Kelola pengaturan akun dan preferensi sistem Anda.
                  </p>
                  {/* Tambahkan form pengaturan di sini */}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profil;