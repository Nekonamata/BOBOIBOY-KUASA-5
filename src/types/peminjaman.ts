import { Ruangan } from './ruangan';
import { User } from '@/types/user';

export type StatusPeminjaman =
  | 'menunggu'
  | 'disetujui'
  | 'ditolak'
  | 'diproses'
  | 'selesai';

export type StatusRiwayatPeminjaman =
  | 'draft'
  | 'locked'
  | 'confirmed'
  | 'expired';

export interface Peminjaman {
  id_peminjaman: number;
  id_user: number;
  id_ruangan: number;

  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;

  nama_pengguna: string;
  keperluan?: string;
  status: StatusPeminjaman;
  locked_at?: string | null;
  created_at: string;

  ruangan?: Ruangan;
  user?: User;
}

export interface LaporanPeminjamanData {
  id_laporan: number;
  id_peminjaman: number;
  id_user: number;
  id_ruangan: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  nama_pengguna: string;
  keperluan?: string;
  status: StatusRiwayatPeminjaman;
  locked_at?: string | null;
  created_at: string;
  nama_ruangan: string;
  nama_gedung: string;
  lantai: number;
  nama_user: string;
}
