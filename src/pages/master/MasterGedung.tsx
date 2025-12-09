import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Building2, Search } from 'lucide-react';
import { gedungList, Gedung } from '@/data/rooms';
import { toast } from 'sonner';

const MasterGedung = () => {
  const [gedungs, setGedungs] = useState<Gedung[]>(gedungList);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGedung, setEditingGedung] = useState<Gedung | null>(null);
  const [formData, setFormData] = useState({ name: '', zonas: '' });

  const filteredGedungs = gedungs.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Nama gedung harus diisi');
      return;
    }

    const zonasArray = formData.zonas.split(',').map(z => z.trim()).filter(z => z);

    if (editingGedung) {
      setGedungs(prev =>
        prev.map(g =>
          g.id === editingGedung.id
            ? { ...g, name: formData.name, zonas: zonasArray }
            : g
        )
      );
      toast.success('Gedung berhasil diperbarui');
    } else {
      const newGedung: Gedung = {
        id: `g${Date.now()}`,
        name: formData.name,
        zonas: zonasArray,
      };
      setGedungs(prev => [...prev, newGedung]);
      toast.success('Gedung berhasil ditambahkan');
    }

    resetForm();
  };

  const handleEdit = (gedung: Gedung) => {
    setEditingGedung(gedung);
    setFormData({ name: gedung.name, zonas: gedung.zonas.join(', ') });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setGedungs(prev => prev.filter(g => g.id !== id));
    toast.success('Gedung berhasil dihapus');
  };

  const resetForm = () => {
    setFormData({ name: '', zonas: '' });
    setEditingGedung(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            Master Gedung
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola data gedung yang tersedia di kampus
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium">Daftar Gedung</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari gedung..."
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
                    Tambah Gedung
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingGedung ? 'Edit Gedung' : 'Tambah Gedung Baru'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nama Gedung</Label>
                      <Input
                        id="name"
                        placeholder="Contoh: Gedung A - Rektorat"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="zonas">Zona (pisahkan dengan koma)</Label>
                      <Input
                        id="zonas"
                        placeholder="Contoh: Zona Utara, Zona Selatan"
                        value={formData.zonas}
                        onChange={(e) => setFormData(prev => ({ ...prev, zonas: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={resetForm}>Batal</Button>
                    <Button onClick={handleSubmit}>
                      {editingGedung ? 'Simpan Perubahan' : 'Tambah Gedung'}
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
                  <TableHead>Nama Gedung</TableHead>
                  <TableHead>Zona</TableHead>
                  <TableHead className="w-32 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGedungs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Tidak ada data gedung
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGedungs.map((gedung, index) => (
                    <TableRow key={gedung.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{gedung.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {gedung.zonas.map((zona, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {zona}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(gedung)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(gedung.id)}
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

export default MasterGedung;
