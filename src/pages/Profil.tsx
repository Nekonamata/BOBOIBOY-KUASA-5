// src/pages/Profil.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Calendar, History, Settings, Printer, X, Download, CheckCircle, Clock, AlertCircle, Plus, Search, Filter, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getRiwayatPeminjaman, PeminjamanData as ApiPeminjamanData } from '@/services/peminjaman.service';
import api from '@/lib/api';
import jsPDF from 'jspdf';
import { safeDateFormatWithWeekday, safeDateTimeFormat } from '@/lib/date-utils';

// Interface untuk data peminjaman (frontend format)
interface PeminjamanData {
  id: string;
  ruangan: string;
  gedung: string;
  tanggal: string;
  waktu: string;
  durasi: number;
  keperluan: string;
  status: 'disetujui' | 'ditolak' | 'menunggu' | 'diproses' | 'selesai';
  tanggalPengajuan: string;
  tanggalDisetujui?: string;
  nomorSurat?: string;
  jumlahPeserta: number;
  catatan?: string;
}

const Profil = () => {
  const { user, tambahPeminjaman } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profil';
  const [selectedPeminjaman, setSelectedPeminjaman] = useState<PeminjamanData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPeminjamanModal, setShowPeminjamanModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    ruangan: '',
    gedung: '',
    tanggal: '',
    waktuMulai: '08:00',
    waktuSelesai: '10:00',
    keperluan: '',
    jumlahPeserta: 1,
    catatan: ''
  });



  // Fungsi untuk mengajukan peminjaman baru
  const handleAjukanPeminjaman = async () => {
    // Validasi
    if (!formData.ruangan || !formData.gedung || !formData.tanggal || !formData.keperluan) {
      toast({
        title: "Form tidak lengkap",
        description: "Harap isi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    // Hitung durasi
    const waktuMulai = parseInt(formData.waktuMulai.split(':')[0]);
    const waktuSelesai = parseInt(formData.waktuSelesai.split(':')[0]);
    const durasi = waktuSelesai - waktuMulai;

    if (durasi <= 0) {
      toast({
        title: "Waktu tidak valid",
        description: "Waktu selesai harus lebih besar dari waktu mulai",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Find room ID from available rooms
      const selectedRoom = availableRooms.find(room => room.name === formData.ruangan);
      console.log('Available rooms:', availableRooms);
      console.log('Selected room name:', formData.ruangan);
      console.log('Found selected room:', selectedRoom);

      if (!selectedRoom) {
        toast({
          title: "Ruangan tidak ditemukan",
          description: "Ruangan yang dipilih tidak valid",
          variant: "destructive",
        });
        return;
      }

      console.log('Selected room ID:', selectedRoom.id);
      console.log('Selected room ID type:', typeof selectedRoom.id);

      if (!selectedRoom.id) {
        console.error('ERROR: selectedRoom.id is null/undefined!');
        console.error('selectedRoom object:', selectedRoom);
        throw new Error('ID ruangan tidak ditemukan. Silakan refresh halaman dan coba lagi.');
      }

      // Submit via API
      await tambahPeminjaman({
        ruanganId: selectedRoom.id.toString(),
        namaRuangan: formData.ruangan,
        gedung: formData.gedung,
        tanggal: formData.tanggal,
        waktuMulai: formData.waktuMulai,
        waktuSelesai: formData.waktuSelesai,
        keperluan: formData.keperluan,
      });

      // Show success toast
      toast({
        title: "Peminjaman Diajukan",
        description: `Permohonan peminjaman ${formData.ruangan} berhasil diajukan. Menunggu persetujuan.`,
      });

      // Reset form
      setFormData({
        ruangan: '',
        gedung: '',
        tanggal: '',
        waktuMulai: '08:00',
        waktuSelesai: '10:00',
        keperluan: '',
        jumlahPeserta: 1,
        catatan: ''
      });

      // Close modal
      setShowPeminjamanModal(false);
    } catch (error) {
      console.error('Error submitting peminjaman:', error);
      toast({
        title: "Gagal Mengajukan Peminjaman",
        description: "Terjadi kesalahan saat mengajukan peminjaman. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Use riwayatPeminjaman from useAuth hook
  const riwayatPeminjaman = useAuth().riwayatPeminjaman;



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

  // Filter dan search
  const filteredPeminjaman = riwayatPeminjaman.filter(peminjaman => {
    const matchesSearch = peminjaman.ruangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         peminjaman.keperluan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         peminjaman.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'semua' || peminjaman.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const cetakSuratPDF = (peminjaman: PeminjamanData) => {
    try {
      toast({
        title: "Membuat PDF",
        description: `File PDF untuk peminjaman ${peminjaman.id} sedang dibuat...`,
      });

      const doc = new jsPDF();

      // Set font
      doc.setFont('helvetica', 'normal');

      // Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SURAT PENGGUNAAN RUANGAN', 105, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Universitas Muhammadiyah Semarang', 105, 30, { align: 'center' });

      // Garis horizontal
      doc.line(20, 35, 190, 35);

      let yPosition = 50;

      // Nomor Surat
      if (peminjaman.nomorSurat) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`No. Surat: ${peminjaman.nomorSurat}`, 20, yPosition);
        yPosition += 10;
      }

      // ID Peminjaman
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`ID Peminjaman: ${peminjaman.id}`, 20, yPosition);
      yPosition += 15;

      // Detail Peminjaman Header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DETAIL PEMINJAMAN:', 20, yPosition);
      yPosition += 10;

      // Detail items
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const details = [
        { label: 'Peminjam', value: user?.name || 'Tidak diketahui' },
        { label: 'Ruangan', value: peminjaman.ruangan },
        { label: 'Gedung', value: peminjaman.gedung },
        { label: 'Tanggal', value: peminjaman.tanggal },
        { label: 'Waktu', value: peminjaman.waktu },
        { label: 'Durasi', value: `${peminjaman.durasi} jam` },
        { label: 'Jumlah Peserta', value: `${peminjaman.jumlahPeserta} orang` },
        { label: 'Keperluan', value: peminjaman.keperluan },
        { label: 'Status', value: peminjaman.status.toUpperCase() },
        { label: 'Tanggal Pengajuan', value: peminjaman.tanggalPengajuan },
      ];

      if (peminjaman.tanggalDisetujui) {
        details.push({ label: 'Tanggal Disetujui', value: peminjaman.tanggalDisetujui });
      }

      details.forEach(detail => {
        doc.text(`${detail.label}: ${detail.value}`, 25, yPosition);
        yPosition += 8;
      });

      // Catatan
      if (peminjaman.catatan) {
        yPosition += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('Catatan:', 20, yPosition);
        yPosition += 8;
        doc.setFont('helvetica', 'normal');

        // Handle long text wrapping
        const splitCatatan = doc.splitTextToSize(peminjaman.catatan, 150);
        doc.text(splitCatatan, 25, yPosition);
        yPosition += splitCatatan.length * 5;
      }

      // Footer
      yPosition += 10;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`Dicetak pada: ${safeDateTimeFormat(new Date().toISOString())}`, 20, yPosition);

      // Save the PDF
      doc.save(`surat-peminjaman-${peminjaman.id}.pdf`);

      toast({
        title: "PDF Berhasil Dibuat",
        description: `Surat peminjaman ${peminjaman.id} telah diunduh`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Gagal membuat file PDF. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

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



  // Daftar ruangan tersedia (akan diambil dari API)
  const [availableRooms, setAvailableRooms] = useState<Array<{id: number, name: string, building: string}>>([]);

  // Load available rooms
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const response = await api.get('/ruangan');
        const rooms = response.data.map((room: any) => ({
          id: room.id_ruangan,
          name: room.nama_ruangan,
          building: `${room.gedung.nama_gedung} Lantai ${room.lantai}`
        }));
        setAvailableRooms(rooms);
      } catch (error) {
        console.error('Error loading rooms:', error);
        // Fallback to empty array
        setAvailableRooms([]);
      }
    };

    loadRooms();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
        <p className="text-gray-600 mt-2">Kelola informasi profil dan aktivitas Anda</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tab Navigation */}
        <div className="lg:w-64">
          <Card className="sticky top-24 border border-gray-200">
            <CardContent className="p-4">
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
          <Card className="border border-gray-200">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl text-gray-900">
                    {tabs.find(tab => tab.id === activeTab)?.label || 'Profil'}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {activeTab === 'profil' && 'Kelola informasi profil pribadi Anda'}
                    {activeTab === 'peminjaman' && 'Ajukan peminjaman ruangan untuk keperluan akademik'}
                    {activeTab === 'riwayat' && 'Lihat riwayat peminjaman ruangan yang telah dilakukan'}
                    {activeTab === 'settings' && 'Pengaturan akun dan preferensi sistem'}
                  </CardDescription>
                </div>
                {activeTab === 'peminjaman' && (
                  <Button
                    onClick={() => setShowPeminjamanModal(true)}
                    className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Ajukan Peminjaman
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === 'profil' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Informasi Pribadi</h3>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <p className="text-gray-600 mb-4">
                      Halaman profil Anda sedang dalam pengembangan. Fitur ini akan segera hadir dalam update berikutnya.
                    </p>
                    <Button variant="outline" disabled>
                      Update Profil (Segera Hadir)
                    </Button>
                  </div>
                </div>
              )}
              
              {activeTab === 'peminjaman' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Ajukan Peminjaman Ruangan</h3>
                        <p className="text-gray-600">
                          Gunakan form di bawah ini untuk mengajukan peminjaman ruangan di Unimus.
                          Setelah pengajuan, Anda akan menerima notifikasi tentang status peminjaman.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowPeminjamanModal(true)}
                      className="mt-4 gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Ajukan Peminjaman Baru
                    </Button>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Instruksi Pengajuan:</h4>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                      <li>Pilih ruangan yang tersedia dari daftar</li>
                      <li>Tentukan tanggal dan waktu peminjaman</li>
                      <li>Isi keperluan dan jumlah peserta</li>
                      <li>Ajukan permohonan dan tunggu notifikasi persetujuan</li>
                      <li>Cek status pengajuan di tab "Riwayat Saya"</li>
                    </ol>
                  </div>
                </div>
              )}
              
              {activeTab === 'riwayat' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Riwayat Peminjaman</h3>
                      <p className="text-sm text-gray-600">
                        Anda akan menerima notifikasi ketika status peminjaman berubah
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Total: {riwayatPeminjaman.length} peminjaman
                      </span>
                    </div>
                  </div>
                  
                  {/* Filter dan Search */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Cari ruangan, keperluan, atau ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 border-gray-300"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px] border-gray-300">
                          <Filter className="h-4 w-4 mr-2 text-gray-500" />
                          <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="semua">Semua Status</SelectItem>
                          <SelectItem value="menunggu">Menunggu</SelectItem>
                          <SelectItem value="disetujui">Disetujui</SelectItem>
                          <SelectItem value="ditolak">Ditolak</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.location.reload()}
                        title="Refresh data"
                        className="border-gray-300 hover:bg-gray-100"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Daftar Riwayat */}
                  <div className="space-y-4">
                    {filteredPeminjaman.length === 0 ? (
                      <div className="text-center py-12 border border-gray-200 rounded-lg">
                        <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                          {searchTerm || statusFilter !== 'semua' 
                            ? 'Tidak ada riwayat peminjaman yang sesuai dengan filter' 
                            : 'Belum ada riwayat peminjaman'}
                        </p>
                        {!searchTerm && statusFilter === 'semua' && (
                          <Button
                            variant="outline"
                            className="mt-4 border-gray-300 hover:bg-gray-100"
                            onClick={() => setShowPeminjamanModal(true)}
                          >
                            Ajukan Peminjaman Pertama
                          </Button>
                        )}
                      </div>
                    ) : (
                      filteredPeminjaman.map((peminjaman) => (
                        <Card 
                          key={peminjaman.id} 
                          className="cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border border-gray-200 hover:border-orange-300"
                          onClick={() => handleDetailClick(peminjaman)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold text-gray-900">
                                    {peminjaman.ruangan} - {peminjaman.gedung}
                                  </h4>
                                  {getStatusBadge(peminjaman.status)}
                                </div>
                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>Peminjam: {user?.name || 'Tidak diketahui'}</span>
                                  </div>
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
                                  <div>
                                    <span>Peserta: {peminjaman.jumlahPeserta} orang</span>
                                  </div>
                                </div>
                                <p className="mt-3 text-sm text-gray-700">
                                  <span className="font-medium text-gray-900">Keperluan:</span> {peminjaman.keperluan}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500 font-mono">ID: {peminjaman.id}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Diajukan: {peminjaman.tanggalPengajuan}
                                </p>
                                {peminjaman.nomorSurat && (
                                  <p className="text-xs text-green-600 mt-1 font-medium">
                                    {peminjaman.nomorSurat}
                                  </p>
                                )}
                                {peminjaman.tanggalDisetujui && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Disetujui: {peminjaman.tanggalDisetujui}
                                  </p>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-2 text-xs hover:bg-gray-100 text-gray-700"
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
                      ))
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Pengaturan Akun</h3>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <p className="text-gray-600 mb-4">
                      Fitur pengaturan akun sedang dalam pengembangan dan akan segera hadir.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <span className="text-gray-700">Notifikasi Email</span>
                        <Badge className="bg-gray-100 text-gray-700">Segera Hadir</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <span className="text-gray-700">Ubah Password</span>
                        <Badge className="bg-gray-100 text-gray-700">Segera Hadir</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <span className="text-gray-700">Preferensi Bahasa</span>
                        <Badge className="bg-gray-100 text-gray-700">Segera Hadir</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Ajukan Peminjaman */}
      <Dialog open={showPeminjamanModal} onOpenChange={setShowPeminjamanModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gray-900">Ajukan Peminjaman Ruangan</DialogTitle>
            <DialogDescription className="text-gray-600">
              Isi form di bawah ini untuk mengajukan peminjaman ruangan. Anda akan menerima notifikasi tentang status pengajuan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Pilih Ruangan */}
            <div className="space-y-2">
              <Label htmlFor="ruangan" className="text-gray-700">Pilih Ruangan *</Label>
              <Select 
                value={formData.ruangan} 
                onValueChange={(value) => {
                  const selectedRoom = availableRooms.find(room => room.name === value);
                  setFormData({
                    ...formData,
                    ruangan: value,
                    gedung: selectedRoom?.building || ''
                  });
                }}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Pilih ruangan" />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.map((room) => (
                    <SelectItem key={room.id} value={room.name}>
                      {room.name} - {room.building}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gedung (auto-filled) */}
            <div className="space-y-2">
              <Label htmlFor="gedung" className="text-gray-700">Gedung</Label>
              <Input
                id="gedung"
                value={formData.gedung}
                readOnly
                className="bg-gray-50 border-gray-300 text-gray-600"
              />
            </div>

            {/* Tanggal */}
            <div className="space-y-2">
              <Label htmlFor="tanggal" className="text-gray-700">Tanggal Peminjaman *</Label>
              <Input
                id="tanggal"
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                className="border-gray-300"
              />
            </div>

            {/* Waktu */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="waktuMulai" className="text-gray-700">Waktu Mulai *</Label>
                <Select 
                  value={formData.waktuMulai} 
                  onValueChange={(value) => setFormData({...formData, waktuMulai: value})}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 13 }, (_, i) => {
                      const hour = i + 7; // 07:00 to 19:00
                      return (
                        <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                          {hour.toString().padStart(2, '0')}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="waktuSelesai" className="text-gray-700">Waktu Selesai *</Label>
                <Select 
                  value={formData.waktuSelesai} 
                  onValueChange={(value) => setFormData({...formData, waktuSelesai: value})}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 13 }, (_, i) => {
                      const hour = i + 8; // 08:00 to 20:00
                      return (
                        <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                          {hour.toString().padStart(2, '0')}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Jumlah Peserta */}
            <div className="space-y-2">
              <Label htmlFor="jumlahPeserta" className="text-gray-700">Jumlah Peserta *</Label>
              <Input
                id="jumlahPeserta"
                type="number"
                min="1"
                max="200"
                value={formData.jumlahPeserta}
                onChange={(e) => setFormData({...formData, jumlahPeserta: parseInt(e.target.value) || 1})}
                className="border-gray-300"
              />
            </div>

            {/* Keperluan */}
            <div className="space-y-2">
              <Label htmlFor="keperluan" className="text-gray-700">Keperluan Kegiatan *</Label>
              <Textarea
                id="keperluan"
                placeholder="Contoh: Seminar Proposal, Rapat Koordinasi, Workshop, dll."
                value={formData.keperluan}
                onChange={(e) => setFormData({...formData, keperluan: e.target.value})}
                rows={3}
                className="border-gray-300"
              />
            </div>

            {/* Catatan Tambahan */}
            <div className="space-y-2">
              <Label htmlFor="catatan" className="text-gray-700">Catatan Tambahan (Opsional)</Label>
              <Textarea
                id="catatan"
                placeholder="Catatan khusus atau permintaan tambahan..."
                value={formData.catatan}
                onChange={(e) => setFormData({...formData, catatan: e.target.value})}
                rows={2}
                className="border-gray-300"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowPeminjamanModal(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Batal
            </Button>
            <Button 
              onClick={handleAjukanPeminjaman}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white"
            >
              Ajukan Peminjaman
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Detail Peminjaman */}
      {showDetailModal && selectedPeminjaman && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-200"
            onClick={closeModal}
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 animate-in fade-in-0 zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Detail Peminjaman Ruangan
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    ID: {selectedPeminjaman.id}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeModal}
                  className="h-10 w-10 hover:bg-gray-100 text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
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
                      <h3 className="font-semibold text-lg text-gray-900">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500">Ruangan</p>
                    <p className="font-medium text-gray-900">{selectedPeminjaman.ruangan}</p>
                  </div>
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500">Gedung</p>
                    <p className="font-medium text-gray-900">{selectedPeminjaman.gedung}</p>
                  </div>
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500">Tanggal</p>
                    <p className="font-medium text-gray-900">{selectedPeminjaman.tanggal}</p>
                  </div>
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500">Waktu</p>
                    <p className="font-medium text-gray-900">{selectedPeminjaman.waktu}</p>
                  </div>
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500">Durasi</p>
                    <p className="font-medium text-gray-900">{selectedPeminjaman.durasi} jam</p>
                  </div>
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500">Jumlah Peserta</p>
                    <p className="font-medium text-gray-900">{selectedPeminjaman.jumlahPeserta} orang</p>
                  </div>
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500">Tanggal Pengajuan</p>
                    <p className="font-medium text-gray-900">{selectedPeminjaman.tanggalPengajuan}</p>
                  </div>
                  {selectedPeminjaman.tanggalDisetujui && (
                    <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500">Tanggal Disetujui</p>
                      <p className="font-medium text-gray-900">{selectedPeminjaman.tanggalDisetujui}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 font-medium">Keperluan Kegiatan</p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900">{selectedPeminjaman.keperluan}</p>
                  </div>
                </div>
                
                {selectedPeminjaman.catatan && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 font-medium">Catatan Tambahan</p>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-gray-900">{selectedPeminjaman.catatan}</p>
                    </div>
                  </div>
                )}
                
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
                          Permohonan Anda sedang dalam proses peninjauan. Anda akan menerima notifikasi ketika status berubah.
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
                          Anda dapat menggunakan ruangan sesuai jadwal yang telah ditentukan. 
                          Notifikasi telah dikirim ke email dan dashboard Anda.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex flex-col sm:flex-row gap-3 justify-end z-10">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Tutup
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    cetakSuratPDF(selectedPeminjaman);
                  }}
                  className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-100"
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