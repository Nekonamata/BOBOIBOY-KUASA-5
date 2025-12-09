import { gedungList, lantaiOptions } from '@/data/rooms';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Building2, MapPinned, Layers, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  selectedGedung: string;
  selectedZona: string;
  selectedLantai: string;
  onGedungChange: (value: string) => void;
  onZonaChange: (value: string) => void;
  onLantaiChange: (value: string) => void;
  onReset: () => void;
}

const FilterBar = ({
  selectedGedung,
  selectedZona,
  selectedLantai,
  onGedungChange,
  onZonaChange,
  onLantaiChange,
  onReset,
}: FilterBarProps) => {
  const selectedGedungData = gedungList.find((g) => g.name === selectedGedung);
  const zonas = selectedGedungData?.zonas || [];

  const hasActiveFilters = selectedGedung || selectedZona || selectedLantai;

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4 md:p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Gedung Filter */}
        <div className="flex-1">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <Building2 className="h-4 w-4 text-primary" />
            Gedung
          </label>
          <Select value={selectedGedung} onValueChange={onGedungChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih Gedung" />
            </SelectTrigger>
            <SelectContent>
              {gedungList.map((gedung) => (
                <SelectItem key={gedung.id} value={gedung.name}>
                  {gedung.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Zona Filter */}
        <div className="flex-1">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <MapPinned className="h-4 w-4 text-primary" />
            Zona
          </label>
          <Select
            value={selectedZona}
            onValueChange={onZonaChange}
            disabled={!selectedGedung}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={selectedGedung ? "Pilih Zona" : "Pilih gedung terlebih dahulu"} />
            </SelectTrigger>
            <SelectContent>
              {zonas.map((zona) => (
                <SelectItem key={zona} value={zona}>
                  {zona}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lantai Filter */}
        <div className="flex-1">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <Layers className="h-4 w-4 text-primary" />
            Lantai
          </label>
          <Select value={selectedLantai} onValueChange={onLantaiChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih Lantai" />
            </SelectTrigger>
            <SelectContent>
              {lantaiOptions.map((lantai) => (
                <SelectItem key={lantai} value={lantai.toString()}>
                  Lantai {lantai}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
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
