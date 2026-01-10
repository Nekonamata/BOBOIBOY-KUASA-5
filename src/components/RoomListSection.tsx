import { useState, useMemo } from 'react';
import { rooms } from '@/data/rooms';
import RoomCard from './RoomCard';
import FilterBar from './FilterBar';
import { Search, X, Calendar, Clock, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const RoomListSection = () => {
  const [selectedGedung, setSelectedGedung] = useState('');
  const [selectedZona, setSelectedZona] = useState('');
  const [selectedLantai, setSelectedLantai] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { isAuthenticated, user } = useAuth();
  
  // State untuk form peminjaman
  const [showPeminjamanForm, setShowPeminjamanForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  
  // State untuk form data
  const [formData, setFormData] = useState({
    tanggal_pinjam: '',
    jam_mulai: '08:00',
    jam_selesai: '10:00',
    keperluan: '',
    jumlah_peserta: 1,
    catatan: '',
  });

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesGedung = !selectedGedung || room.gedung === selectedGedung;
      const matchesZona = !selectedZona || room.zona === selectedZona;
      const matchesLantai = !selectedLantai || room.lantai === parseInt(selectedLantai);
      const matchesSearch =
        !searchQuery ||
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.gedung.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesGedung && matchesZona && matchesLantai && matchesSearch;
    });
  }, [selectedGedung, selectedZona, selectedLantai, searchQuery]);

  const handleGedungChange = (value: string) => {
    setSelectedGedung(value);
    setSelectedZona(''); // Reset zona when gedung changes
  };

  const handleReset = () => {
    setSelectedGedung('');
    setSelectedZona('');
    setSelectedLantai('');
    setSearchQuery('');
  };

  // Handler untuk membuka form peminjaman
  const handleAjukanPeminjaman = (room: any) => {
    if (!isAuthenticated) {
      toast({
        title: "Login diperlukan",
        description: "Silakan login terlebih dahulu untuk mengajukan peminjaman",
        variant: "destructive",
      });
      return;
    }

    setSelectedRoom(room);
    // Set tanggal default ke besok
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    
    setFormData({
      tanggal_pinjam: formattedDate,
      jam_mulai: '08:00',
      jam_selesai: '10:00',
      keperluan: '',
      jumlah_peserta: 1,
      catatan: '',
    });
    setShowPeminjamanForm(true);
  };

  // Handler untuk menutup form
  const handleCloseForm = () => {
    setShowPeminjamanForm(false);
    setSelectedRoom(null);
    setFormData({
      tanggal_pinjam: '',
      jam_mulai: '08:00',
      jam_selesai: '10:00',
      keperluan: '',
      jumlah_peserta: 1,
      catatan: '',
    });
  };

  // Handler untuk perubahan input form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler untuk select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fungsi untuk menyimpan ke localStorage
  const saveToLocalStorage = (peminjamanData: any) => {
    // Load existing data
    const existingData = JSON.parse(localStorage.getItem('user_peminjaman') || '[]');
    
    // Add new data at the beginning
    existingData.unshift(peminjamanData);
    
    // Save back to localStorage
    localStorage.setItem('user_peminjaman', JSON.stringify(existingData));
    
    return existingData;
  };

  // Fungsi untuk membuat notifikasi
  const createNotification = (title: string, message: string, type: string) => {
    const notification = {
      id: `notif_${Date.now()}`,
      title,
      message,
      type,
      read: false,
      date: new Date(),
    };

    // Save to localStorage
    const existingNotifications = JSON.parse(localStorage.getItem('user_notifications') || '[]');
    existingNotifications.unshift(notification);
    localStorage.setItem('user_notifications', JSON.stringify(existingNotifications));

    // Trigger event for navbar update
    window.dispatchEvent(new Event('storage'));
    
    return notification;
  };

  // Handler untuk submit form
  const handleSubmitPeminjaman = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast({
        title: "Login diperlukan",
        description: "Silakan login terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    // Validasi waktu
    if (formData.jam_mulai >= formData.jam_selesai) {
      toast({
        title: "Waktu tidak valid",
        description: "Jam selesai harus setelah jam mulai",
        variant: "destructive",
      });
      return;
    }

    // Validasi tanggal tidak boleh hari ini atau sebelumnya
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.tanggal_pinjam);
    
    if (selectedDate < today) {
      toast({
        title: "Tanggal tidak valid",
        description: "Tanggal peminjaman tidak boleh hari ini atau sebelumnya",
        variant: "destructive",
      });
      return;
    }

    // Format tanggal Indonesia
    const formattedDate = new Date(formData.tanggal_pinjam).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Hitung durasi
    const jamMulai = parseInt(formData.jam_mulai.split(':')[0]);
    const jamSelesai = parseInt(formData.jam_selesai.split(':')[0]);
    const durasi = jamSelesai - jamMulai;

    // Generate unique ID
    const peminjamanId = `PINJ-${Date.now().toString().slice(-6)}`;
    
    // Buat data peminjaman
    const peminjamanData = {
      id: peminjamanId,
      ruangan: selectedRoom.name,
      gedung: selectedRoom.gedung,
      lantai: selectedRoom.lantai,
      tanggal: formattedDate,
      waktu: `${formData.jam_mulai} - ${formData.jam_selesai}`,
      durasi: durasi,
      keperluan: formData.keperluan,
      status: 'menunggu',
      tanggalPengajuan: new Date().toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      jumlahPeserta: formData.jumlah_peserta,
      catatan: formData.catatan || undefined,
      userId: user.id || 'user-001',
      userName: user.name || 'Pengguna'
    };

    // Simpan ke localStorage
    saveToLocalStorage(peminjamanData);

    // Buat notifikasi
    createNotification(
      'Peminjaman Diajukan',
      `Peminjaman ${selectedRoom.name} untuk ${formData.keperluan} berhasil diajukan. Menunggu persetujuan.`,
      'info'
    );

    // Show success toast
    toast({
      title: "Peminjaman Diajukan",
      description: `Permohonan peminjaman ${selectedRoom.name} berhasil diajukan. ID: ${peminjamanId}`,
    });

    // Reset dan tutup form
    handleCloseForm();
  };

  return (
    <>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari ruangan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar
            selectedGedung={selectedGedung}
            selectedZona={selectedZona}
            selectedLantai={selectedLantai}
            onGedungChange={handleGedungChange}
            onZonaChange={setSelectedZona}
            onLantaiChange={setSelectedLantai}
            onReset={handleReset}
          />

          {/* Results Count */}
          <div className="mt-6 mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Menampilkan <span className="font-semibold text-gray-900">{filteredRooms.length}</span> ruangan
            </p>
          </div>

          {/* Room Grid */}
          {filteredRooms.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRooms.map((room, index) => (
                <div
                  key={room.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <RoomCard 
                    room={room} 
                    onAjukanPeminjaman={() => handleAjukanPeminjaman(room)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada ruangan ditemukan</h3>
              <p className="text-gray-600">Coba ubah filter pencarian Anda</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal/Pop-up Form Peminjaman */}
      {showPeminjamanForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Ajukan Peminjaman</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    {selectedRoom?.gedung}
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedRoom?.name} • Lantai {selectedRoom?.lantai}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseForm}
                className="h-8 w-8 hover:bg-gray-100"
              >
                <X className="h-4 w-4 text-gray-600" />
              </Button>
            </div>

            {/* User Info */}
            <div className="px-6 pt-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Pengguna'}</p>
                  <p className="text-xs text-gray-600">ID: {user?.id || 'user-001'}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitPeminjaman}>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Tanggal Pinjam */}
                <div className="space-y-2">
                  <Label htmlFor="tanggal_pinjam" className="text-gray-700">Tanggal Pinjam *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="tanggal_pinjam"
                      name="tanggal_pinjam"
                      type="date"
                      value={formData.tanggal_pinjam}
                      onChange={handleInputChange}
                      className="pl-10 border-gray-300"
                      min={new Date(new Date().getTime() + 86400000).toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                {/* Jam */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jam_mulai" className="text-gray-700">Jam Mulai *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Select 
                        value={formData.jam_mulai} 
                        onValueChange={(value) => handleSelectChange('jam_mulai', value)}
                      >
                        <SelectTrigger className="pl-10 border-gray-300">
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jam_selesai" className="text-gray-700">Jam Selesai *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Select 
                        value={formData.jam_selesai} 
                        onValueChange={(value) => handleSelectChange('jam_selesai', value)}
                      >
                        <SelectTrigger className="pl-10 border-gray-300">
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
                </div>

                {/* Jumlah Peserta */}
                <div className="space-y-2">
                  <Label htmlFor="jumlah_peserta" className="text-gray-700">Jumlah Peserta *</Label>
                  <Input
                    id="jumlah_peserta"
                    name="jumlah_peserta"
                    type="number"
                    min="1"
                    max="200"
                    value={formData.jumlah_peserta}
                    onChange={handleInputChange}
                    className="border-gray-300"
                    required
                  />
                </div>

                {/* Keperluan */}
                <div className="space-y-2">
                  <Label htmlFor="keperluan" className="text-gray-700">Keperluan *</Label>
                  <Textarea
                    id="keperluan"
                    name="keperluan"
                    value={formData.keperluan}
                    onChange={handleInputChange}
                    placeholder="Contoh: Seminar Proposal, Rapat Koordinasi, Workshop, dll."
                    rows={3}
                    className="border-gray-300"
                    required
                  />
                </div>

                {/* Catatan Tambahan */}
                <div className="space-y-2">
                  <Label htmlFor="catatan" className="text-gray-700">Catatan Tambahan (Opsional)</Label>
                  <Textarea
                    id="catatan"
                    name="catatan"
                    value={formData.catatan}
                    onChange={handleInputChange}
                    placeholder="Catatan khusus atau permintaan tambahan..."
                    rows={2}
                    className="border-gray-300"
                  />
                </div>
              </div>

              {/* Footer/Buttons */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseForm}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Batal
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white"
                >
                  Ajukan Peminjaman
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RoomListSection;