// src/pages/Profil.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Calendar, History, Settings, Printer, X, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Interface untuk data peminjaman
interface PeminjamanData {
  id: string;
  ruangan: string;
  gedung: string;
  tanggal: string;
  waktu: string;
  durasi: number;
  keperluan: string;
  status: 'disetujui' | 'ditolak' | 'menunggu';
  tanggalPengajuan: string;
  nomorSurat?: string;
}

const Profil = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profil';
  const [selectedPeminjaman, setSelectedPeminjaman] = useState<PeminjamanData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Data dummy riwayat peminjaman
  const [riwayatPeminjaman] = useState<PeminjamanData[]>([
    {
      id: 'PINJ-001',
      ruangan: 'Ruang Seminar',
      gedung: 'Gedung A Lantai 3',
      tanggal: '15 Januari 2024',
      waktu: '09:00 - 12:00',
      durasi: 3,
      keperluan: 'Seminar Proposal Skripsi',
      status: 'disetujui',
      tanggalPengajuan: '10 Januari 2024',
      nomorSurat: 'UNMS/001/SPR/I/2024'
    },
    {
      id: 'PINJ-002',
      ruangan: 'Lab Komputer',
      gedung: 'Gedung B Lantai 2',
      tanggal: '18 Januari 2024',
      waktu: '13:00 - 15:00',
      durasi: 2,
      keperluan: 'Pelatihan Programming',
      status: 'menunggu',
      tanggalPengajuan: '12 Januari 2024'
    },
    {
      id: 'PINJ-003',
      ruangan: 'Auditorium',
      gedung: 'Gedung Utama',
      tanggal: '20 Januari 2024',
      waktu: '08:00 - 17:00',
      durasi: 9,
      keperluan: 'Workshop Nasional',
      status: 'disetujui',
      tanggalPengajuan: '05 Januari 2024',
      nomorSurat: 'UNMS/003/SPR/I/2024'
    },
    {
      id: 'PINJ-004',
      ruangan: 'Ruang Rapat',
      gedung: 'Gedung C Lantai 1',
      tanggal: '22 Januari 2024',
      waktu: '10:00 - 11:30',
      durasi: 1.5,
      keperluan: 'Rapat Koordinasi',
      status: 'ditolak',
      tanggalPengajuan: '18 Januari 2024'
    },
    {
      id: 'PINJ-005',
      ruangan: 'Studio Multimedia',
      gedung: 'Gedung D Lantai 4',
      tanggal: '25 Januari 2024',
      waktu: '14:00 - 16:00',
      durasi: 2,
      keperluan: 'Pembuatan Konten Video',
      status: 'disetujui',
      tanggalPengajuan: '20 Januari 2024',
      nomorSurat: 'UNMS/005/SPR/I/2024'
    }
  ]);

  const tabs = [
    { id: 'profil', label: 'Profil Saya', icon: <User className="h-4 w-4" /> },
    { id: 'peminjaman', label: 'Pinjam Ruangan', icon: <Calendar className="h-4 w-4" /> },
    { id: 'riwayat', label: 'Riwayat Saya', icon: <History className="h-4 w-4" /> },
    { id: 'settings', label: 'Pengaturan', icon: <Settings className="h-4 w-4" /> },
  ];

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const handleDetailClick = (peminjaman: PeminjamanData) => {
    setSelectedPeminjaman(peminjaman);
    setShowDetailModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedPeminjaman(null);
    document.body.style.overflow = 'auto';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disetujui':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Disetujui
          </Badge>
        );
      case 'ditolak':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Ditolak
          </Badge>
        );
      case 'menunggu':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Menunggu
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Fungsi untuk mencetak PDF (placeholder untuk sementara)
  const cetakSuratPDF = (peminjaman: PeminjamanData) => {
    // Simulasi pembuatan PDF
    alert(`Fitur cetak PDF untuk peminjaman ${peminjaman.id} akan tersedia setelah instalasi jspdf\n\nSilakan jalankan: npm install jspdf jspdf-autotable`);
    
    // Atau buka window baru dengan data
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Surat Peminjaman ${peminjaman.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .title { font-size: 24px; font-weight: bold; }
              .subtitle { font-size: 16px; margin-top: 10px; }
              .section { margin: 20px 0; }
              .label { font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">UNIVERSITAS MUHAMMADIYAH SEMARANG</div>
              <div class="subtitle">SURAT PEMINJAMAN RUANGAN</div>
            </div>
            
            <div class="section">
              <p><span class="label">Nomor Surat:</span> ${peminjaman.nomorSurat || '-'}</p>
              <p><span class="label">Tanggal:</span> ${new Date().toLocaleDateString('id-ID')}</p>
            </div>
            
            <div class="section">
              <h3>DATA PEMINJAMAN</h3>
              <p><span class="label">ID Peminjaman:</span> ${peminjaman.id}</p>
              <p><span class="label">Ruangan:</span> ${peminjaman.ruangan}</p>
              <p><span class="label">Gedung:</span> ${peminjaman.gedung}</p>
              <p><span class="label">Tanggal:</span> ${peminjaman.tanggal}</p>
              <p><span class="label">Waktu:</span> ${peminjaman.waktu}</p>
              <p><span class="label">Durasi:</span> ${peminjaman.durasi} jam</p>
              <p><span class="label">Keperluan:</span> ${peminjaman.keperluan}</p>
              <p><span class="label">Status:</span> ${peminjaman.status.charAt(0).toUpperCase() + peminjaman.status.slice(1)}</p>
              <p><span class="label">Tanggal Pengajuan:</span> ${peminjaman.tanggalPengajuan}</p>
            </div>
            
            <div class="section">
              <h3>PESERTA KEGIATAN</h3>
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama</th>
                    <th>NIM</th>
                    <th>Prodi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>1</td><td>John Doe</td><td>12345678</td><td>Teknik Informatika</td></tr>
                  <tr><td>2</td><td>Jane Smith</td><td>87654321</td><td>Sistem Informasi</td></tr>
                  <tr><td>3</td><td>Bob Johnson</td><td>11223344</td><td>Ilmu Komputer</td></tr>
                </tbody>
              </table>
            </div>
            
            <div class="section">
              <p><em>Dicetak dari Sistem Peminjaman Ruangan Unimus</em></p>
              <p><em>Tanggal Cetak: ${new Date().toLocaleString('id-ID')}</em></p>
            </div>
            
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => window.close(), 1000);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Effect untuk menutup modal dengan Escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDetailModal) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [showDetailModal]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Profil</h1>
        <p className="text-muted-foreground mt-2">Kelola informasi profil dan aktivitas Anda</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tab Navigation */}
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
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
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
                </div>
              )}
              
              {activeTab === 'peminjaman' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground">Form Peminjaman Ruangan</h3>
                  <p className="text-muted-foreground">
                    Gunakan form ini untuk mengajukan peminjaman ruangan di Unimus.
                  </p>
                </div>
              )}
              
              {activeTab === 'riwayat' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-foreground">Riwayat Peminjaman</h3>
                    <span className="text-sm text-muted-foreground">
                      Total: {riwayatPeminjaman.length} peminjaman
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {riwayatPeminjaman.map((peminjaman) => (
                      <Card 
                        key={peminjaman.id} 
                        className="cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border hover:border-primary/30"
                        onClick={() => handleDetailClick(peminjaman)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-foreground">
                                  {peminjaman.ruangan} - {peminjaman.gedung}
                                </h4>
                                {getStatusBadge(peminjaman.status)}
                              </div>
                              <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{peminjaman.tanggal}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{peminjaman.waktu}</span>
                                </div>
                                <div>
                                  <span>Durasi: {peminjaman.durasi} jam</span>
                                </div>
                              </div>
                              <p className="mt-3 text-sm text-foreground/80">
                                <span className="font-medium">Keperluan:</span> {peminjaman.keperluan}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground font-mono">ID: {peminjaman.id}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Diajukan: {peminjaman.tanggalPengajuan}
                              </p>
                              {peminjaman.nomorSurat && (
                                <p className="text-xs text-green-600 mt-1 font-medium">
                                  {peminjaman.nomorSurat}
                                </p>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 text-xs hover:bg-secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDetailClick(peminjaman);
                                }}
                              >
                                Lihat Detail
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground">Pengaturan Akun</h3>
                  <p className="text-muted-foreground">
                    Kelola pengaturan akun dan preferensi sistem Anda.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Detail Peminjaman */}
      {showDetailModal && selectedPeminjaman && (
        <>
          {/* Background Overlay dengan blur */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-200"
            onClick={closeModal}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="bg-background rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border animate-in fade-in-0 zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className="sticky top-0 bg-background border-b p-6 flex justify-between items-start z-10">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Detail Peminjaman Ruangan
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    ID: {selectedPeminjaman.id}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeModal}
                  className="h-10 w-10 hover:bg-secondary"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Content Modal */}
              <div className="p-6 space-y-6">
                {/* Status dan Info Utama */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      selectedPeminjaman.status === 'disetujui' ? 'bg-green-100' :
                      selectedPeminjaman.status === 'ditolak' ? 'bg-red-100' :
                      'bg-yellow-100'
                    }`}>
                      {selectedPeminjaman.status === 'disetujui' && <CheckCircle className="h-6 w-6 text-green-600" />}
                      {selectedPeminjaman.status === 'ditolak' && <AlertCircle className="h-6 w-6 text-red-600" />}
                      {selectedPeminjaman.status === 'menunggu' && <Clock className="h-6 w-6 text-yellow-600" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        {selectedPeminjaman.status.charAt(0).toUpperCase() + selectedPeminjaman.status.slice(1)}
                      </h3>
                      {selectedPeminjaman.nomorSurat && (
                        <p className="text-sm text-green-600 font-medium">
                          No. Surat: {selectedPeminjaman.nomorSurat}
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(selectedPeminjaman.status)}
                </div>
                
                {/* Grid Detail */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Ruangan</p>
                    <p className="font-medium text-foreground">{selectedPeminjaman.ruangan}</p>
                  </div>
                  <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Gedung</p>
                    <p className="font-medium text-foreground">{selectedPeminjaman.gedung}</p>
                  </div>
                  <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Tanggal</p>
                    <p className="font-medium text-foreground">{selectedPeminjaman.tanggal}</p>
                  </div>
                  <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Waktu</p>
                    <p className="font-medium text-foreground">{selectedPeminjaman.waktu}</p>
                  </div>
                  <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Durasi</p>
                    <p className="font-medium text-foreground">{selectedPeminjaman.durasi} jam</p>
                  </div>
                  <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Tanggal Pengajuan</p>
                    <p className="font-medium text-foreground">{selectedPeminjaman.tanggalPengajuan}</p>
                  </div>
                </div>
                
                {/* Keperluan */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Keperluan Kegiatan</p>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-foreground">{selectedPeminjaman.keperluan}</p>
                  </div>
                </div>
                
                {/* Catatan Khusus untuk Status Tertentu */}
                {selectedPeminjaman.status === 'ditolak' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">
                          Peminjaman ditolak
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                          Silakan ajukan permohonan ulang dengan informasi yang lengkap atau hubungi administrator.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedPeminjaman.status === 'menunggu' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          Permohonan dalam proses
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Permohonan Anda sedang dalam proses peninjauan. Harap menunggu konfirmasi dalam 1-3 hari kerja.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedPeminjaman.status === 'disetujui' && selectedPeminjaman.nomorSurat && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Peminjaman telah disetujui
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          Anda dapat menggunakan ruangan sesuai jadwal yang telah ditentukan. Jangan lupa membawa surat ini saat menggunakan ruangan.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer Modal dengan Tombol Aksi */}
              <div className="sticky bottom-0 bg-background border-t p-6 flex flex-col sm:flex-row gap-3 justify-end z-10">
                <Button
                  variant="outline"
                  onClick={closeModal}
                >
                  Tutup
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    cetakSuratPDF(selectedPeminjaman);
                  }}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Simpan/Cetak PDF
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Profil;