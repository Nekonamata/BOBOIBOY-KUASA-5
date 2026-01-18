import api from "@/lib/api";
import { StatusRiwayatPeminjaman } from "@/types/peminjaman";

export interface CreatePeminjamanData {
  id_user: number;
  id_ruangan: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  nama_pengguna: string;
  keperluan: string;
}

export interface PeminjamanData {
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
  ruangan?: {
    id_ruangan: number;
    nama_ruangan: string;
    gedung: {
      nama_gedung: string;
    };
  };
  user?: {
    id_user: number;
    nama: string;
  };
  riwayat?: RiwayatPeminjamanData[];
}

export interface RiwayatPeminjamanData {
  id_riwayat: number;
  id_peminjaman: number;
  status_sebelumnya: StatusRiwayatPeminjaman | null;
  status_baru: StatusRiwayatPeminjaman;
  keterangan: string | null;
  created_at: string;
}

export interface CreateRiwayatData {
  id_peminjaman: number;
  status_sebelumnya?: StatusRiwayatPeminjaman | null;
  status_baru: StatusRiwayatPeminjaman;
  keterangan?: string;
}

export const createPeminjaman = async (data: CreatePeminjamanData): Promise<PeminjamanData> => {
  const response = await api.post("/peminjaman", data);
  return response.data;
};

export const getRiwayatPeminjaman = async (): Promise<PeminjamanData[]> => {
  const response = await api.get("/peminjaman");
  return response.data;
};

export const updateStatusPeminjaman = async (id: number, status: PeminjamanData['status']): Promise<PeminjamanData> => {
  const response = await api.put(`/peminjaman/${id}/status`, { status });
  return response.data;
};

export const deletePeminjaman = async (id: number): Promise<void> => {
  await api.delete(`/peminjaman/${id}`);
};

// Riwayat Peminjaman functions
export const createRiwayatPeminjaman = async (data: CreateRiwayatData): Promise<RiwayatPeminjamanData> => {
  const response = await api.post("/riwayat-peminjaman", data);
  return response.data;
};

export const getRiwayatPeminjamanById = async (idPeminjaman: number): Promise<RiwayatPeminjamanData[]> => {
  const response = await api.get(`/riwayat-peminjaman/${idPeminjaman}`);
  return response.data;
};

export const getAllRiwayatPeminjaman = async (): Promise<RiwayatPeminjamanData[]> => {
  const response = await api.get("/riwayat-peminjaman");
  return response.data;
};
