import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, DoorOpen } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

/* ================== TYPES ================== */
export interface Room {
  id: number;
  nama_ruangan: string;
  gedung_id: number;
  lantai: number;
  kapasitas: number;
  status: "tersedia" | "terpakai" | "maintenance";
  gedung?: {
    id: number;
    nama_gedung: string;
  };
}

/* ================== COMPONENT ================== */
const MasterRuangan = () => {
  const [ruangans, setRuangans] = useState<Room[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    nama_ruangan: "",
    gedung_id: "",
    lantai: "",
    kapasitas: "",
    status: "tersedia",
  });

  /* ================== FETCH DATA ================== */
  const fetchRuangans = async () => {
    try {
      const res = await api.get("/ruangan");
      setRuangans(res.data.data);
    } catch {
      toast.error("Gagal mengambil data ruangan");
    }
  };

  useEffect(() => {
    fetchRuangans();
  }, []);

  /* ================== SUBMIT ================== */
  const handleSubmit = async () => {
    try {
      if (editingId) {
        await api.put(`/ruangan/${editingId}`, form);
        toast.success("Ruangan berhasil diperbarui");
      } else {
        await api.post("/ruangan", form);
        toast.success("Ruangan berhasil ditambahkan");
      }
      resetForm();
      fetchRuangans();
    } catch {
      toast.error("Gagal menyimpan data");
    }
  };

  /* ================== EDIT ================== */
  const handleEdit = (r: Room) => {
    setEditingId(r.id);
    setForm({
      nama_ruangan: r.nama_ruangan,
      gedung_id: r.gedung_id.toString(),
      lantai: r.lantai.toString(),
      kapasitas: r.kapasitas.toString(),
      status: r.status,
    });
    setIsDialogOpen(true);
  };

  /* ================== DELETE ================== */
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus ruangan?")) return;
    try {
      await api.delete(`/ruangan/${id}`);
      toast.success("Ruangan dihapus");
      fetchRuangans();
    } catch {
      toast.error("Gagal menghapus");
    }
  };

  const resetForm = () => {
    setForm({
      nama_ruangan: "",
      gedung_id: "",
      lantai: "",
      kapasitas: "",
      status: "tersedia",
    });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  /* ================== UI ================== */
  return (
    <div className="min-h-screen">
      <main className="container py-8">
        <h1 className="text-3xl font-bold flex gap-2 mb-6">
          <DoorOpen /> Master Ruangan
        </h1>

        <Card>
          <CardHeader className="flex justify-between flex-row">
            <CardTitle>Daftar Ruangan</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Tambah
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Edit Ruangan" : "Tambah Ruangan"}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                  <div>
                    <Label>Nama Ruangan</Label>
                    <Input
                      value={form.nama_ruangan}
                      onChange={(e) =>
                        setForm({ ...form, nama_ruangan: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>ID Gedung</Label>
                    <Input
                      type="number"
                      value={form.gedung_id}
                      onChange={(e) =>
                        setForm({ ...form, gedung_id: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Lantai</Label>
                      <Input
                        type="number"
                        value={form.lantai}
                        onChange={(e) =>
                          setForm({ ...form, lantai: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label>Kapasitas</Label>
                      <Input
                        type="number"
                        value={form.kapasitas}
                        onChange={(e) =>
                          setForm({ ...form, kapasitas: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) =>
                        setForm({ ...form, status: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tersedia">Tersedia</SelectItem>
                        <SelectItem value="terpakai">Terpakai</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={resetForm}>
                    Batal
                  </Button>
                  <Button onClick={handleSubmit}>
                    Simpan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Gedung</TableHead>
                  <TableHead>Lantai</TableHead>
                  <TableHead>Kapasitas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {ruangans.map((r, i) => (
                  <TableRow key={r.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{r.nama_ruangan}</TableCell>
                    <TableCell>{r.gedung?.nama_gedung}</TableCell>
                    <TableCell>{r.lantai}</TableCell>
                    <TableCell>{r.kapasitas}</TableCell>
                    <TableCell>
                      <Badge>{r.status}</Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(r)}>
                        <Pencil size={16} />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(r.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default MasterRuangan;
