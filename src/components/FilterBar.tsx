import { useEffect, useState } from 'react';
import api from '@/lib/api';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Building2, MapPinned, Layers, RotateCcw } from 'lucide-react';

/* ================= TYPES ================= */
interface Gedung {
  id_gedung: number;
  nama_gedung: string;
  zona: string;
}

interface FilterBarProps {
  selectedGedung: string;
  selectedZona: string;
  selectedLantai: string;
  onGedungChange: (value: string) => void;
  onZonaChange: (value: string) => void;
  onLantaiChange: (value: string) => void;
  onReset: () => void;
}

/* ================= COMPONENT ================= */
const FilterBar = ({
  selectedGedung,
  selectedZona,
  selectedLantai,
  onGedungChange,
  onZonaChange,
  onLantaiChange,
  onReset,
}: FilterBarProps) => {
  const [gedungList, setGedungList] = useState<Gedung[]>([]);
  const lantaiOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  /* ===== Fetch Gedung ===== */
  useEffect(() => {
    api.get('/gedung')
      .then((res) => setGedungList(res.data.data))
      .catch((err) => console.error('Gagal load gedung:', err));
  }, []);

  /* ===== Zona berdasarkan Gedung terpilih ===== */
  const zonaOptions = selectedGedung === 'all'
    ? Array.from(new Set(gedungList.map((g) => g.zona)))
    : Array.from(
        new Set(
          gedungList
            .filter((g) => g.nama_gedung === selectedGedung)
            .map((g) => g.zona)
        )
      );

  const hasActiveFilters =
    (selectedGedung !== '' && selectedGedung !== 'all') ||
    (selectedZona !== '' && selectedZona !== 'all') ||
    (selectedLantai !== '' && selectedLantai !== 'all');

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4 md:p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center gap-4">

        {/* ================= GEDUNG ================= */}
        <div className="flex-1">
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Building2 className="h-4 w-4 text-primary" />
            Gedung
          </label>
          <Select value={selectedGedung} onValueChange={onGedungChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih Gedung" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Gedung</SelectItem>
              {Array.from(new Set(gedungList.map(g => g.nama_gedung))).map((namaGedung) => (
                <SelectItem key={namaGedung} value={namaGedung}>
                  {namaGedung}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ================= ZONA ================= */}
        <div className="flex-1">
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <MapPinned className="h-4 w-4 text-primary" />
            Zona
          </label>
          <Select
            value={selectedZona}
            onValueChange={onZonaChange}
            disabled={!selectedGedung}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  selectedGedung
                    ? 'Pilih Zona'
                    : 'Pilih gedung terlebih dahulu'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {selectedGedung && <SelectItem value="all">Semua Zona</SelectItem>}
              {zonaOptions.map((zona) => (
                <SelectItem key={zona} value={zona}>
                  {zona}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ================= LANTAI ================= */}
        <div className="flex-1">
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Layers className="h-4 w-4 text-primary" />
            Lantai
          </label>
          <Select value={selectedLantai} onValueChange={onLantaiChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih Lantai" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Lantai</SelectItem>
              {lantaiOptions.map((lantai) => (
                <SelectItem key={lantai} value={lantai.toString()}>
                  Lantai {lantai}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ================= RESET ================= */}
        <div className="flex items-end">
          <Button
            variant="outline"
            size="icon"
            onClick={onReset}
            disabled={!hasActiveFilters}
            className="h-10 w-10 shrink-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

      </div>
    </div>
  );
};

export default FilterBar;
