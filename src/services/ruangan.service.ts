import api from "@/lib/api";

export const getRuangan = async () => {
  const res = await api.get("/ruangan");
  return res.data;
};

export const createRuangan = async (data: {
  id_gedung: number;
  nama_ruangan: string;
  lantai?: number;
  kapasitas?: number;
  aktif?: boolean;
}) => {
  return api.post("/ruangan", data);
};
