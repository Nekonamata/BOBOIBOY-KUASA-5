import { useState, useMemo } from 'react';
import { rooms } from '@/data/rooms';
import RoomCard from './RoomCard';
import FilterBar from './FilterBar';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const RoomListSection = () => {
  const [selectedGedung, setSelectedGedung] = useState('');
  const [selectedZona, setSelectedZona] = useState('');
  const [selectedLantai, setSelectedLantai] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

        {/* Room Grid */}
        {filteredRooms.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRooms.map((room, index) => (
              <div
                key={room.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <RoomCard room={room} />
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
  );
};

export default RoomListSection;
