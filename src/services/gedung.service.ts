import api from "@/lib/api";

export const getGedung = async () => {
  const res = await api.get("/gedung");
  return res.data;
};

export const createGedung = async (data: { nama_gedung: string; zona?: string }) => {
  return api.post("/gedung", data);
};
