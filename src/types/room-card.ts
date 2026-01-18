export interface RoomCardData {
  id: number;
  name: string;
  gedung: {
    nama_gedung: string;
    zona: string;
  };
  lantai: number;
  kapasitas: number;
  status: 'tersedia' | 'terpakai' | 'maintenance';
}
