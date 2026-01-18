import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import RoomCard from './RoomCard';
import FilterBar from './FilterBar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

import { Ruangan, StatusRuangan } from '@/types/ruangan';
import { RoomCardData } from '@/types/room-card';
import { ApiResponse } from '@/types/api';

const RoomListSection = () => {
  const { isAuthenticated, user, tambahPeminjaman } = useAuth();

  const [rooms, setRooms] = useState<Ruangan[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedGedung, setSelectedGedung] = useState('');
  const [selectedZona, setSelectedZona] = useState('');
  const [selectedLantai, setSelectedLantai] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Ruangan | null>(null);

  const [formData, setFormData] = useState({
    tanggal: '',
    jam_mulai: '08:00',
    jam_selesai: '10:00',
    keperluan: '',
  });

  // ================= FETCH RUANGAN =================
  const fetchRooms = async () => {
    try {
      const res = await api.get<Ruangan[]>('/ruangan');
      // Map API response to match Ruangan type
      const mappedRooms = res.data.map(room => ({
        ...room,
        status: room.aktif === 1 ? 'tersedia' : 'maintenance' as StatusRuangan
      }));
      setRooms(mappedRooms);
    } catch {
      toast.error('Gagal memuat data ruangan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // ================= FILTER =================
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      return (
        (selectedGedung === 'all' || !selectedGedung || r.gedung.nama_gedung === selectedGedung) &&
        (selectedZona === 'all' || !selectedZona || r.gedung.zona === selectedZona) &&
        (selectedLantai === 'all' || !selectedLantai || r.lantai === Number(selectedLantai)) &&
        (!searchQuery ||
          r.nama_ruangan.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [rooms, selectedGedung, selectedZona, selectedLantai, searchQuery]);

  // ================= AJUKAN =================
  const handleAjukan = (room: Ruangan) => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu');
      return;
    }
    setSelectedRoom(room);
    setShowForm(true);
  };

  // ================= SUBMIT PEMINJAMAN =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !user) return;

    try {
      await tambahPeminjaman({
        ruanganId: selectedRoom.id_ruangan.toString(),
        namaRuangan: selectedRoom.nama_ruangan,
        gedung: selectedRoom.gedung.nama_gedung,
        tanggal: formData.tanggal,
        waktuMulai: formData.jam_mulai,
        waktuSelesai: formData.jam_selesai,
        keperluan: formData.keperluan,
      });

      toast.success('Peminjaman berhasil diajukan');
      setShowForm(false);
      fetchRooms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengajukan peminjaman');
    }
  };

  if (loading) {
    return <p className="text-center py-10">Loading...</p>;
  }

  return (
    <>
      <section className="container mx-auto px-4 py-10">
        <Input
          placeholder="Cari ruangan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md mb-6"
        />

        <FilterBar
          selectedGedung={selectedGedung}
          selectedZona={selectedZona}
          selectedLantai={selectedLantai}
          onGedungChange={setSelectedGedung}
          onZonaChange={setSelectedZona}
          onLantaiChange={setSelectedLantai}
          onReset={() => {
            setSelectedGedung('');
            setSelectedZona('');
            setSelectedLantai('');
            setSearchQuery('');
          }}
        />

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {filteredRooms.map((room) => {
            const roomCardData: RoomCardData = {
              id: room.id_ruangan,
              name: room.nama_ruangan,
              gedung: {
                nama_gedung: room.gedung.nama_gedung,
                zona: room.gedung.zona,
              },
              lantai: room.lantai,
              kapasitas: room.kapasitas,
              status: room.status,
            };

            return (
              <RoomCard
                key={roomCardData.id}
                room={roomCardData}
                onAjukanPeminjaman={() => handleAjukan(room)}
              />
            );
          })}
        </div>
      </section>

      {/* MODAL PEMINJAMAN */}
      {showForm && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg w-full max-w-md"
          >
            <h2 className="font-bold mb-4">
              Peminjaman {selectedRoom.nama_ruangan}
            </h2>

            <Label>Tanggal</Label>
            <Input
              type="date"
              value={formData.tanggal}
              onChange={(e) =>
                setFormData({ ...formData, tanggal: e.target.value })
              }
              required
            />

            <Label className="mt-3">Keperluan</Label>
            <Textarea
              value={formData.keperluan}
              onChange={(e) =>
                setFormData({ ...formData, keperluan: e.target.value })
              }
              required
            />

            <div className="flex justify-end gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Batal
              </Button>
              <Button type="submit">Ajukan</Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default RoomListSection;
