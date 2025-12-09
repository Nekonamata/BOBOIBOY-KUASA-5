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
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, DoorOpen, Search } from 'lucide-react';
import { rooms, gedungList, lantaiOptions, Room } from '@/data/rooms';
import { toast } from 'sonner';

const statusColors = {
  tersedia: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  terpakai: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  maintenance: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const statusLabels = {
  tersedia: 'Tersedia',
  terpakai: 'Terpakai',
  maintenance: 'Maintenance',
};

const MasterRuangan = () => {
  const [ruangans, setRuangans] = useState<Room[]>(rooms);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRuangan, setEditingRuangan] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    gedung: '',
    zona: '',
    lantai: '',
    kapasitas: '',
    fasilitas: '',
    status: 'tersedia' as Room['status'],
  });

  const selectedGedung = gedungList.find(g => g.name === formData.gedung);

  const filteredRuangans = ruangans.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.gedung.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.gedung || !formData.zona || !formData.lantai) {
      toast.error('Harap isi semua field yang wajib');
      return;
    }

    const fasilitasArray = formData.fasilitas.split(',').map(f => f.trim()).filter(f => f);

    if (editingRuangan) {
      setRuangans(prev =>
        prev.map(r =>
          r.id === editingRuangan.id
            ? {
                ...r,
                name: formData.name,
                gedung: formData.gedung,
                zona: formData.zona,
                lantai: parseInt(formData.lantai),
                kapasitas: parseInt(formData.kapasitas) || 0,
                fasilitas: fasilitasArray,
                status: formData.status,
              }
            : r
        )
      );
      toast.success('Ruangan berhasil diperbarui');
    } else {
      const newRuangan: Room = {
        id: `r${Date.now()}`,
        name: formData.name,
        gedung: formData.gedung,
        zona: formData.zona,
        lantai: parseInt(formData.lantai),
        kapasitas: parseInt(formData.kapasitas) || 0,
        fasilitas: fasilitasArray,
        status: formData.status,
      };
      setRuangans(prev => [...prev, newRuangan]);
      toast.success('Ruangan berhasil ditambahkan');
    }

    resetForm();
  };

  const handleEdit = (ruangan: Room) => {
    setEditingRuangan(ruangan);
    setFormData({
      name: ruangan.name,
      gedung: ruangan.gedung,
      zona: ruangan.zona,
      lantai: ruangan.lantai.toString(),
      kapasitas: ruangan.kapasitas.toString(),
      fasilitas: ruangan.fasilitas.join(', '),
      status: ruangan.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setRuangans(prev => prev.filter(r => r.id !== id));
    toast.success('Ruangan berhasil dihapus');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      gedung: '',
      zona: '',
      lantai: '',
      kapasitas: '',
      fasilitas: '',
      status: 'tersedia',
    });
    setEditingRuangan(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <DoorOpen className="h-8 w-8 text-primary" />
            Master Ruangan
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola data ruangan yang tersedia untuk dipinjam
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium">Daftar Ruangan</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari ruangan..."
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
                    Tambah Ruangan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {editingRuangan ? 'Edit Ruangan' : 'Tambah Ruangan Baru'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nama Ruangan *</Label>
                      <Input
                        id="name"
                        placeholder="Contoh: Aula Utama"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Gedung *</Label>
                        <Select
                          value={formData.gedung}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, gedung: value, zona: '' }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih gedung" />
                          </SelectTrigger>
                          <SelectContent>
                            {gedungList.map(gedung => (
                              <SelectItem key={gedung.id} value={gedung.name}>
                                {gedung.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Zona *</Label>
                        <Select
                          value={formData.zona}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, zona: value }))}
                          disabled={!selectedGedung}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih zona" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedGedung?.zonas.map(zona => (
                              <SelectItem key={zona} value={zona}>
                                {zona}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Lantai *</Label>
                        <Select
                          value={formData.lantai}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, lantai: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih lantai" />
                          </SelectTrigger>
                          <SelectContent>
                            {lantaiOptions.map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                Lantai {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="kapasitas">Kapasitas</Label>
                        <Input
                          id="kapasitas"
                          type="number"
                          placeholder="0"
                          value={formData.kapasitas}
                          onChange={(e) => setFormData(prev => ({ ...prev, kapasitas: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Room['status'] }))}
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
                    <div className="grid gap-2">
                      <Label htmlFor="fasilitas">Fasilitas (pisahkan dengan koma)</Label>
                      <Input
                        id="fasilitas"
                        placeholder="Contoh: Proyektor, AC, Whiteboard"
                        value={formData.fasilitas}
                        onChange={(e) => setFormData(prev => ({ ...prev, fasilitas: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={resetForm}>Batal</Button>
                    <Button onClick={handleSubmit}>
                      {editingRuangan ? 'Simpan Perubahan' : 'Tambah Ruangan'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Nama Ruangan</TableHead>
                    <TableHead>Gedung</TableHead>
                    <TableHead>Zona</TableHead>
                    <TableHead>Lantai</TableHead>
                    <TableHead>Kapasitas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-32 text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRuangans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Tidak ada data ruangan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRuangans.map((ruangan, index) => (
                      <TableRow key={ruangan.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">{ruangan.name}</TableCell>
                        <TableCell className="text-muted-foreground">{ruangan.gedung}</TableCell>
                        <TableCell className="text-muted-foreground">{ruangan.zona}</TableCell>
                        <TableCell>Lantai {ruangan.lantai}</TableCell>
                        <TableCell>{ruangan.kapasitas} orang</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[ruangan.status]}>
                            {statusLabels[ruangan.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(ruangan)}
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(ruangan.id)}
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
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default MasterRuangan;
