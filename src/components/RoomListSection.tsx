import { useState, useMemo } from 'react';
import { rooms } from '@/data/rooms';
import RoomCard from './RoomCard';
import FilterBar from './FilterBar';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const RoomListSection = () => {
  const [selectedGedung, setSelectedGedung] = useState('');
  const [selectedZona, setSelectedZona] = useState('');
  const [selectedLantai, setSelectedLantai] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State untuk form peminjaman
  const [showPeminjamanForm, setShowPeminjamanForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  
  // State untuk form data
  const [formData, setFormData] = useState({
    peminjam_id_peminjam: '',
    tanggal_pinjam: '',
    jam_mulai: '',
    jam_selesai: '',
    keperluan: '',
    status_peminjaman: 'pending', // default status
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
    setSelectedRoom(room);
    setFormData({
      ...formData,
      peminjam_id_peminjam: '', // Ini seharusnya diisi dengan ID peminjam dari auth/user context
    });
    setShowPeminjamanForm(true);
  };

  // Handler untuk menutup form
  const handleCloseForm = () => {
    setShowPeminjamanForm(false);
    setSelectedRoom(null);
    setFormData({
      peminjam_id_peminjam: '',
      tanggal_pinjam: '',
      jam_mulai: '',
      jam_selesai: '',
      keperluan: '',
      status_peminjaman: 'pending',
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

  // Handler untuk submit form
  const handleSubmitPeminjaman = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Data yang akan dikirim ke API
    const peminjamanData = {
      ...formData,
      ruangan_id_ruangan: selectedRoom?.id,
      gedung_id_gedung: selectedRoom?.gedung_id, // Anda perlu menambahkan properti ini di data ruangan
      update_at: new Date().toISOString(),
    };

    console.log('Data peminjaman:', peminjamanData);
    
    // TODO: Implement API call here
    // Contoh: 
    // await api.post('/peminjaman', peminjamanData);
    
    // Reset dan tutup form
    handleCloseForm();
    alert('Peminjaman berhasil diajukan!');
  };

  return (
    <>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari ruangan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
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
            <p className="text-sm text-muted-foreground">
              Menampilkan <span className="font-semibold text-foreground">{filteredRooms.length}</span> ruangan
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
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Tidak ada ruangan ditemukan</h3>
              <p className="text-muted-foreground">Coba ubah filter pencarian Anda</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal/Pop-up Form Peminjaman */}
      {showPeminjamanForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold">Ajukan Peminjaman</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedRoom?.name} - Gedung {selectedRoom?.gedung}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseForm}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitPeminjaman}>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* ID Peminjam (biasanya dari auth) */}
                <div className="space-y-2">
                  <Label htmlFor="peminjam_id_peminjam">ID Peminjam</Label>
                  <Input
                    id="peminjam_id_peminjam"
                    name="peminjam_id_peminjam"
                    value={formData.peminjam_id_peminjam}
                    onChange={handleInputChange}
                    placeholder="Masukkan ID peminjam"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    *ID ini biasanya diisi otomatis dari data login
                  </p>
                </div>

                {/* Tanggal Pinjam */}
                <div className="space-y-2">
                  <Label htmlFor="tanggal_pinjam">Tanggal Pinjam</Label>
                  <Input
                    id="tanggal_pinjam"
                    name="tanggal_pinjam"
                    type="date"
                    value={formData.tanggal_pinjam}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Jam Mulai */}
                <div className="space-y-2">
                  <Label htmlFor="jam_mulai">Jam Mulai</Label>
                  <Input
                    id="jam_mulai"
                    name="jam_mulai"
                    type="time"
                    value={formData.jam_mulai}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Jam Selesai */}
                <div className="space-y-2">
                  <Label htmlFor="jam_selesai">Jam Selesai</Label>
                  <Input
                    id="jam_selesai"
                    name="jam_selesai"
                    type="time"
                    value={formData.jam_selesai}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Keperluan */}
                <div className="space-y-2">
                  <Label htmlFor="keperluan">Keperluan</Label>
                  <Textarea
                    id="keperluan"
                    name="keperluan"
                    value={formData.keperluan}
                    onChange={handleInputChange}
                    placeholder="Deskripsikan keperluan peminjaman ruangan"
                    rows={3}
                    required
                  />
                </div>

                {/* Status Peminjaman (biasanya hidden atau readonly) */}
                <div className="space-y-2">
                  <Label htmlFor="status_peminjaman">Status Peminjaman</Label>
                  <Input
                    id="status_peminjaman"
                    name="status_peminjaman"
                    value={formData.status_peminjaman}
                    onChange={handleInputChange}
                    disabled
                    className="bg-gray-100 dark:bg-gray-700"
                  />
                  <p className="text-xs text-muted-foreground">
                    *Status akan otomatis "pending" saat pengajuan
                  </p>
                </div>
              </div>

              {/* Footer/Buttons */}
              <div className="flex justify-end gap-3 p-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseForm}
                >
                  Batal
                </Button>
                <Button type="submit">
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