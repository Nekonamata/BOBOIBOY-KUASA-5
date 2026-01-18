import { Gedung } from './gedung';

export interface Ruangan {
  id_ruangan: number;
  id_gedung: number;
  nama_ruangan: string;
  lantai?: number;
  kapasitas?: number;
  aktif: boolean;

  gedung: Gedung;

  created_at?: string;
  updated_at?: string;
}
