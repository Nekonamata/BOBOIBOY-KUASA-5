import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  Search,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

/* =======================
   TYPE
======================= */
interface Gedung {
  id_gedung: number;
  nama_gedung: string;
  zona: string | null;
}

/* =======================
   COMPONENT
======================= */
const MasterGedung = () => {
  const [gedungs, setGedungs] = useState<Gedung[]>([]);
  const [groupedGedungs, setGroupedGedungs] = useState<Gedung[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [zonaFilter, setZonaFilter] = useState("Semua");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGedung, setEditingGedung] = useState<Gedung | null>(null);
  const [formData, setFormData] = useState({ nama_gedung: "", zona: "" });
  const [loading, setLoading] = useState(true);

  /* =======================
     LOAD DATA
  ======================= */
  const fetchGedung = async () => {
    try {
      const res = await api.get("/gedung");
      const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      setGedungs(data);

      // Group by nama_gedung (case insensitive)
      const grouped = new Map<string, Gedung>();
      data.forEach((g) => {
        const key = g.nama_gedung.toLowerCase();
        if (grouped.has(key)) {
          const existing = grouped.get(key)!;
          const existingZonas = existing.zona ? existing.zona.split(', ') : [];
          const newZonas = g.zona ? g.zona.split(', ') : [];
          const combinedZonas = Array.from(new Set([...existingZonas, ...newZonas]));
          existing.zona = combinedZonas.join(', ');
        } else {
          grouped.set(key, { ...g });
        }
      });
      setGroupedGedungs(Array.from(grouped.values()));
    } catch {
      toast.error("Gagal mengambil data gedung");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGedung();
  }, []);

  /* =======================
     FILTER
  ======================= */
  const zonaOptions = Array.from(
    new Set(
      groupedGedungs.flatMap((g) => g.zona ? g.zona.split(', ') : [])
    )
  ).sort();

  const filteredGedungs = groupedGedungs.filter((g) => {
    const matchesSearch = g.nama_gedung.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZona = zonaFilter === "Semua" || (g.zona && g.zona.split(', ').includes(zonaFilter));
    return matchesSearch && matchesZona;
  });

  /* =======================
     SUBMIT
  ======================= */
  const handleSubmit = async () => {
    if (!formData.nama_gedung.trim()) {
      toast.error("Nama gedung harus diisi");
      return;
    }

    try {
      if (editingGedung) {
        await api.put(`/gedung/${editingGedung.id_gedung}`, {
          nama_gedung: formData.nama_gedung,
          zona: formData.zona || null,
        });
        toast.success("Gedung berhasil diperbarui");
      } else {
        await api.post("/gedung", {
          nama_gedung: formData.nama_gedung,
          zona: formData.zona || null,
        });
        toast.success("Gedung berhasil ditambahkan");
      }

      resetForm();
      fetchGedung();
    } catch {
      toast.error("Gagal menyimpan data gedung");
    }
  };

  /* =======================
     EDIT
  ======================= */
  const handleEdit = (gedung: Gedung) => {
    setEditingGedung(gedung);
    setFormData({
      nama_gedung: gedung.nama_gedung,
      zona: gedung.zona || "",
    });
    setIsDialogOpen(true);
  };

  /* =======================
     DELETE
  ======================= */
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus gedung ini?")) return;

    try {
      await api.delete(`/gedung/${id}`);
      toast.success("Gedung berhasil dihapus");
      fetchGedung();
    } catch {
      toast.error("Gagal menghapus gedung");
    }
  };

  /* =======================
     RESET
  ======================= */
  const resetForm = () => {
    setFormData({ nama_gedung: "", zona: "" });
    setEditingGedung(null);
    setIsDialogOpen(false);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setZonaFilter("Semua");
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            Master Gedung
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola data gedung yang tersedia di kampus
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row justify-between">
            <CardTitle>Daftar Gedung</CardTitle>

            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                <Input
                  placeholder="Cari gedung..."
                  className="pl-9 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={zonaFilter} onValueChange={setZonaFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter Zona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua</SelectItem>
                  {zonaOptions.map((zona) => (
                    <SelectItem key={zona} value={zona}>
                      {zona}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={resetFilters}
                disabled={searchTerm === "" && zonaFilter === "Semua"}
                className="h-10 w-10 shrink-0"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tambah Gedung
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingGedung
                        ? "Edit Gedung"
                        : "Tambah Gedung"}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div>
                      <Label>Nama Gedung</Label>
                      <Input
                        value={formData.nama_gedung}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            nama_gedung: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label>Zona</Label>
                      <Input
                        value={formData.zona}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            zona: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={resetForm}>
                      Batal
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingGedung
                        ? "Simpan Perubahan"
                        : "Tambah Gedung"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama Gedung</TableHead>
                  <TableHead>Zona</TableHead>
                  <TableHead className="text-center">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredGedungs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGedungs.map((g, i) => (
                    <TableRow key={g.id_gedung}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{g.nama_gedung}</TableCell>
                      <TableCell>
                        {g.zona ? (
                          <Badge variant="secondary">
                            {g.zona}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(g)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(g.id_gedung)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default MasterGedung;
