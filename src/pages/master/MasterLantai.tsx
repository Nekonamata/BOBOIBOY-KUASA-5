import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Layers, Search } from 'lucide-react';
import { gedungList, lantaiOptions } from '@/data/rooms';
import { toast } from 'sonner';

interface Lantai {
  id: string;
  gedungId: string;
  gedungName: string;
  nomor: number;
  keterangan: string;
}

// Generate initial lantai data from existing data
const generateInitialLantai = (): Lantai[] => {
  const lantais: Lantai[] = [];
  gedungList.forEach(gedung => {
    lantaiOptions.slice(0, 3).forEach(nomor => {
      lantais.push({
        id: `l-${gedung.id}-${nomor}`,
        gedungId: gedung.id,
        gedungName: gedung.name,
        nomor,
        keterangan: `Lantai ${nomor} ${gedung.name}`,
      });
    });
  });
  return lantais;
};

const MasterLantai = () => {
  const [lantais, setLantais] = useState<Lantai[]>(generateInitialLantai());
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLantai, setEditingLantai] = useState<Lantai | null>(null);
  const [formData, setFormData] = useState({ gedungId: '', nomor: '', keterangan: '' });

  const filteredLantais = lantais.filter(l =>
    l.gedungName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.keterangan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    if (!formData.gedungId || !formData.nomor) {
      toast.error('Gedung dan nomor lantai harus diisi');
      return;
    }

    const gedung = gedungList.find(g => g.id === formData.gedungId);
    if (!gedung) return;

    if (editingLantai) {
      setLantais(prev =>
        prev.map(l =>
          l.id === editingLantai.id
            ? {
                ...l,
                gedungId: formData.gedungId,
                gedungName: gedung.name,
                nomor: parseInt(formData.nomor),
                keterangan: formData.keterangan || `Lantai ${formData.nomor} ${gedung.name}`,
              }
            : l
        )
      );
      toast.success('Lantai berhasil diperbarui');
    } else {
      // Check for duplicate
      const exists = lantais.some(
        l => l.gedungId === formData.gedungId && l.nomor === parseInt(formData.nomor)
      );
      if (exists) {
        toast.error('Lantai ini sudah ada di gedung tersebut');
        return;
      }

      const newLantai: Lantai = {
        id: `l-${Date.now()}`,
        gedungId: formData.gedungId,
        gedungName: gedung.name,
        nomor: parseInt(formData.nomor),
        keterangan: formData.keterangan || `Lantai ${formData.nomor} ${gedung.name}`,
      };
      setLantais(prev => [...prev, newLantai]);
      toast.success('Lantai berhasil ditambahkan');
    }

    resetForm();
  };

  const handleEdit = (lantai: Lantai) => {
    setEditingLantai(lantai);
    setFormData({
      gedungId: lantai.gedungId,
      nomor: lantai.nomor.toString(),
      keterangan: lantai.keterangan,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setLantais(prev => prev.filter(l => l.id !== id));
    toast.success('Lantai berhasil dihapus');
  };

  const resetForm = () => {
    setFormData({ gedungId: '', nomor: '', keterangan: '' });
    setEditingLantai(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Layers className="h-8 w-8 text-primary" />
            Master Lantai
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola data lantai untuk setiap gedung
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium">Daftar Lantai</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari lantai..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tambah Lantai
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingLantai ? 'Edit Lantai' : 'Tambah Lantai Baru'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="gedung">Gedung</Label>
                      <Select
                        value={formData.gedungId}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, gedungId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih gedung" />
                        </SelectTrigger>
                        <SelectContent>
                          {gedungList.map(gedung => (
                            <SelectItem key={gedung.id} value={gedung.id}>
                              {gedung.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="nomor">Nomor Lantai</Label>
                      <Select
                        value={formData.nomor}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, nomor: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih lantai" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <SelectItem key={num} value={num.toString()}>
                              Lantai {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="keterangan">Keterangan (opsional)</Label>
                      <Input
                        id="keterangan"
                        placeholder="Contoh: Lantai khusus laboratorium"
                        value={formData.keterangan}
                        onChange={(e) => setFormData(prev => ({ ...prev, keterangan: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={resetForm}>Batal</Button>
                    <Button onClick={handleSubmit}>
                      {editingLantai ? 'Simpan Perubahan' : 'Tambah Lantai'}
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
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Gedung</TableHead>
                  <TableHead>Lantai</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="w-32 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLantais.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Tidak ada data lantai
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLantais.map((lantai, index) => (
                    <TableRow key={lantai.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{lantai.gedungName}</TableCell>
                      <TableCell className="font-medium">Lantai {lantai.nomor}</TableCell>
                      <TableCell className="text-muted-foreground">{lantai.keterangan}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(lantai)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(lantai.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
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

export default MasterLantai;
