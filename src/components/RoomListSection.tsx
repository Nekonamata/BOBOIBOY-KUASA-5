import { useState, useMemo } from 'react';
import { rooms } from '@/data/rooms';
import { peminjamanData } from '@/data/peminjaman';
import FilterBar from './FilterBar';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const RoomListSection = () => {
  const [selectedGedung, setSelectedGedung] = useState('');
  const [selectedZona, setSelectedZona] = useState('');
  const [selectedLantai, setSelectedLantai] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // State untuk modal peminjaman
  const [showPeminjamanForm, setShowPeminjamanForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // State untuk modal daftar ruangan per tanggal
  const [showDateRoomsModal, setShowDateRoomsModal] = useState(false);
  const [selectedDateRooms, setSelectedDateRooms] = useState<any[]>([]);
  const [selectedDateLabel, setSelectedDateLabel] = useState<string>('');
  const [selectedModalDate, setSelectedModalDate] = useState<Date | null>(null);

  // State untuk filter modal
  const [modalSelectedGedung, setModalSelectedGedung] = useState('');
  const [modalSelectedZona, setModalSelectedZona] = useState('');
  const [modalSelectedLantai, setModalSelectedLantai] = useState('');
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  // State untuk form data
  const [formData, setFormData] = useState({
    peminjam_id_peminjam: '',
    tanggal_pinjam: '',
    jam_mulai: '',
    jam_selesai: '',
    keperluan: '',
    status_peminjaman: 'pending',
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

  // Generate dates for next 7 days
  const dates = useMemo(() => {
    const dateList = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dateList.push(date);
    }
    return dateList;
  }, []);

  // Function to check if room is available on a specific date
  const isRoomAvailable = (roomId: string, date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const bookings = peminjamanData.filter(
      booking => booking.roomId === roomId &&
                 booking.tanggalPinjam === dateString &&
                 (booking.status === 'disetujui' || booking.status === 'pending')
    );
    return bookings.length === 0;
  };

  // Get available rooms for each date
  const availabilityData = useMemo(() => {
    return dates.map(date => {
      const availableRooms = filteredRooms.filter(room =>
        room.status === 'tersedia' && isRoomAvailable(room.id, date)
      );
      return {
        date,
        rooms: availableRooms
      };
    });
  }, [dates, filteredRooms]);

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

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hari Ini';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Besok';
    } else {
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // Handler untuk membuka form peminjaman
  const handleAjukanPeminjaman = (room: any, date: Date) => {
    console.log('Opening form for room:', room, 'date:', date);
    setSelectedRoom(room);
    setSelectedDate(date.toISOString().split('T')[0]);
    setFormData({
      ...formData,
      tanggal_pinjam: date.toISOString().split('T')[0],
    });
    setShowPeminjamanForm(true);
  };

  // Handler untuk menutup form
  const handleCloseForm = () => {
    setShowPeminjamanForm(false);
    setSelectedRoom(null);
    setSelectedDate('');
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
      gedung_id_gedung: selectedRoom?.gedung_id,
      update_at: new Date().toISOString(),
    };

    console.log('Data peminjaman:', peminjamanData);

    // TODO: Implement API call here
    // Contoh:
    // await api.post('/peminjaman', peminjamanData);

    // Reset dan tutup form
    setSelectedRoom(null);
    setFormData({
      peminjam_id_peminjam: '',
      tanggal_pinjam: '',
      jam_mulai: '',
      jam_selesai: '',
      keperluan: '',
      status_peminjaman: 'pending',
    });
    alert('Peminjaman berhasil diajukan!');
  };

  // Handler untuk menampilkan modal daftar ruangan per tanggal
  const handleShowDateRooms = (date: Date, rooms: any[]) => {
    setSelectedDateLabel(formatDate(date));
    setSelectedDateRooms(rooms);
    setSelectedModalDate(date);
    setShowDateRoomsModal(true);
  };

  // Filtered rooms for modal
  const modalFilteredRooms = useMemo(() => {
    return selectedDateRooms.filter((room) => {
      const matchesGedung = !modalSelectedGedung || room.gedung === modalSelectedGedung;
      const matchesZona = !modalSelectedZona || room.zona === modalSelectedZona;
      const matchesLantai = !modalSelectedLantai || room.lantai === parseInt(modalSelectedLantai);
      const matchesSearch =
        !modalSearchQuery ||
        room.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
        room.gedung.toLowerCase().includes(modalSearchQuery.toLowerCase());

      return matchesGedung && matchesZona && matchesLantai && matchesSearch;
    });
  }, [selectedDateRooms, modalSelectedGedung, modalSelectedZona, modalSelectedLantai, modalSearchQuery]);

  // Handler untuk filter modal
  const handleModalGedungChange = (value: string) => {
    setModalSelectedGedung(value);
    setModalSelectedZona(''); // Reset zona when gedung changes
  };

  const handleModalReset = () => {
    setModalSelectedGedung('');
    setModalSelectedZona('');
    setModalSelectedLantai('');
    setModalSearchQuery('');
  };

  // Handler untuk menutup modal daftar ruangan
  const handleCloseDateRoomsModal = () => {
    setShowDateRoomsModal(false);
    setSelectedDateRooms([]);
    setSelectedDateLabel('');
    setSelectedModalDate(null);
    // Reset modal filters
    setModalSelectedGedung('');
    setModalSelectedZona('');
    setModalSelectedLantai('');
    setModalSearchQuery('');
  };

  return (
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

        {/* Availability Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-700">
                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Tanggal</TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Ruangan Tersedia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availabilityData.map((item, index) => (
                <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <TableCell className="font-medium cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => handleShowDateRooms(item.date, item.rooms)}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {formatDate(item.date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.rooms.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {item.rooms.map((room) => (
                          <button
                            key={room.id}
                            onClick={() => handleAjukanPeminjaman(room, item.date)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 cursor-pointer transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                          >
                            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                            {room.name}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 italic">Tidak ada ruangan tersedia</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal/Pop-up Form Peminjaman */}
      {showPeminjamanForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-t-2xl">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Ajukan Peminjaman</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">{selectedRoom?.name}</span>
                  <span className="text-gray-400">•</span>
                  <span>Gedung {selectedRoom?.gedung}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{new Date(selectedDate).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
              <button
                onClick={handleCloseForm}
                className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors group"
              >
                <X className="h-5 w-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitPeminjaman} className="animate-in slide-in-from-bottom-4 duration-300">
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* ID Peminjam */}
                <div className="space-y-3">
                  <label htmlFor="peminjam_id_peminjam" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    ID Peminjam
                  </label>
                  <Input
                    id="peminjam_id_peminjam"
                    name="peminjam_id_peminjam"
                    value={formData.peminjam_id_peminjam}
                    onChange={handleInputChange}
                    placeholder="Masukkan ID peminjam"
                    required
                    className="rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-md">
                    💡 ID ini biasanya diisi otomatis dari data login
                  </p>
                </div>

                {/* Tanggal Pinjam */}
                <div className="space-y-3">
                  <label htmlFor="tanggal_pinjam" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Tanggal Pinjam
                  </label>
                  <Input
                    id="tanggal_pinjam"
                    name="tanggal_pinjam"
                    type="date"
                    value={formData.tanggal_pinjam}
                    onChange={handleInputChange}
                    required
                    disabled
                    className="rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                  />
                </div>

                {/* Jam Mulai & Selesai */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label htmlFor="jam_mulai" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      Jam Mulai
                    </label>
                    <Input
                      id="jam_mulai"
                      name="jam_mulai"
                      type="time"
                      value={formData.jam_mulai}
                      onChange={handleInputChange}
                      required
                      className="rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="jam_selesai" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                      Jam Selesai
                    </label>
                    <Input
                      id="jam_selesai"
                      name="jam_selesai"
                      type="time"
                      value={formData.jam_selesai}
                      onChange={handleInputChange}
                      required
                      className="rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Keperluan */}
                <div className="space-y-3">
                  <label htmlFor="keperluan" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    Keperluan
                  </label>
                  <textarea
                    id="keperluan"
                    name="keperluan"
                    value={formData.keperluan}
                    onChange={handleInputChange}
                    placeholder="Deskripsikan keperluan peminjaman ruangan secara detail..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                    required
                  />
                </div>

                {/* Status Peminjaman */}
                <div className="space-y-3">
                  <label htmlFor="status_peminjaman" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                    Status Peminjaman
                  </label>
                  <Input
                    id="status_peminjaman"
                    name="status_peminjaman"
                    value={formData.status_peminjaman}
                    onChange={handleInputChange}
                    disabled
                    className="rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                  />
                  <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-md">
                    ℹ️ Status akan otomatis "pending" saat pengajuan
                  </p>
                </div>
              </div>

              {/* Footer/Buttons */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Ajukan Peminjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Daftar Ruangan per Tanggal */}
      {showDateRoomsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-t-2xl">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Ruangan Tersedia</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="font-medium">{selectedDateLabel}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{selectedDateRooms.length} ruangan tersedia</span>
                </div>
              </div>
              <button
                onClick={handleCloseDateRoomsModal}
                className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors group"
              >
                <X className="h-5 w-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Modal Search Bar */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari ruangan..."
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Modal Filter Bar */}
              <FilterBar
                selectedGedung={modalSelectedGedung}
                selectedZona={modalSelectedZona}
                selectedLantai={modalSelectedLantai}
                onGedungChange={handleModalGedungChange}
                onZonaChange={setModalSelectedZona}
                onLantaiChange={setModalSelectedLantai}
                onReset={handleModalReset}
              />

              {/* Modal Results Count */}
              <div className="mt-6 mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Menampilkan <span className="font-semibold text-foreground">{modalFilteredRooms.length}</span> dari <span className="font-semibold text-foreground">{selectedDateRooms.length}</span> ruangan tersedia
                </p>
              </div>

              {modalFilteredRooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {modalFilteredRooms.map((room) => (
                    <div
                      key={room.id}
                      className="group relative p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-emerald-300 dark:hover:border-emerald-600 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {room.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1.5 rounded-full font-medium shadow-sm">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          Tersedia
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">Gedung:</span>
                          <span>{room.gedung}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                          <span className="font-medium">Lantai:</span>
                          <span>{room.lantai}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                          <span className="font-medium">Zona:</span>
                          <span>{room.zona}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                          <span className="font-medium">Kapasitas:</span>
                          <span>{room.kapasitas} orang</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          handleAjukanPeminjaman(room, selectedModalDate!);
                          handleCloseDateRoomsModal();
                        }}
                        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl group-hover:shadow-blue-500/25"
                      >
                        Ajukan Peminjaman
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tidak Ada Ruangan Tersedia</h3>
                  <p className="text-gray-500 dark:text-gray-400">Maaf, tidak ada ruangan yang tersedia untuk tanggal ini.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
              <button
                onClick={handleCloseDateRoomsModal}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RoomListSection;