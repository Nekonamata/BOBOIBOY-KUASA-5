// src/pages/admin/ValidasiPeminjaman.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { getAllLaporanPeminjaman, LaporanPeminjamanData } from '@/services/peminjaman.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ShieldAlert,
  ArrowLeft,
  User,
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

interface PendingPeminjaman {
  id_peminjaman: number;
  id_user: number;
  nama_user: string;
  nama_ruangan: string;
  nama_gedung: string;
  lantai: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  keperluan: string;
  status: string;
  created_at: string;
}

const ValidasiPeminjaman = () => {
  const { user, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [pendingList, setPendingList] = useState<PendingPeminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState<PendingPeminjaman | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject'>('approve');
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Proteksi admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/', { replace: true });
    }
  }, [authLoading, isAdmin, navigate]);

  // Fetch data pending
  useEffect(() => {
    if (!isAdmin) return;

    const fetchPending = async () => {
      try {
        setLoading(true);
        const response = await api.get('/peminjaman');
        const allData = response.data || [];
        
        // Filter hanya yang menunggu/draft/locked
        const pending = allData.filter((item: any) => 
          ['menunggu', 'draft', 'locked'].includes(item.status)
        );
        
        setPendingList(pending);
      } catch (error) {
        console.error('Error fetching pending:', error);
        // Data dummy untuk demo
        const dummyPending: PendingPeminjaman[] = [
          {
            id_peminjaman: 101,
            id_user: 2,
            nama_user: 'Mahasiswa Demo',
            nama_ruangan: 'R.203',
            nama_gedung: 'GKB2',
            lantai: 2,
            tanggal: '2026-05-10',
            jam_mulai: '09:00:00',
            jam_selesai: '11:00:00',
            keperluan: 'Diskusi Skripsi',
            status: 'menunggu',
            created_at: '2026-05-09 08:30:00'
          },
          {
            id_peminjaman: 102,
            id_user: 3,
            nama_user: 'Dosen Demo',
            nama_ruangan: 'Aula Utama',
            nama_gedung: 'GKB1',
            lantai: 1,
            tanggal: '2026-05-11',
            jam_mulai: '13:00:00',
            jam_selesai: '15:00:00',
            keperluan: 'Seminar Proposal',
            status: 'draft',
            created_at: '2026-05-09 09:15:00'
          },
        ];
        setPendingList(dummyPending);
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, [isAdmin]);

  // Hitung statistik
  const stats = useMemo(() => {
    const total = pendingList.length;
    const menunggu = pendingList.filter(p => p.status === 'menunggu').length;
    const draft = pendingList.filter(p => p.status === 'draft').length;
    const locked = pendingList.filter(p => p.status === 'locked').length;
    return { total, menunggu, draft, locked };
  }, [pendingList]);

  // Handle open dialog
  const openApproveDialog = (item: PendingPeminjaman) => {
    setSelectedPeminjaman(item);
    setDialogAction('approve');
    setDialogOpen(true);
  };

  const openRejectDialog = (item: PendingPeminjaman) => {
    setSelectedPeminjaman(item);
    setDialogAction('reject');
    setDialogOpen(true);
  };

  // Handle validasi
  const handleValidation = async () => {
    if (!selectedPeminjaman) return;

    setProcessing(true);
    try {
      const newStatus = dialogAction === 'approve' ? 'disetujui' : 'ditolak';
      
      // Update via API
      await api.put(`/peminjaman/${selectedPeminjaman.id_peminjaman}/status`, {
        status: dialogAction === 'approve' ? 'confirmed' : 'expired'
      });

      // Hapus dari list pending
      setPendingList(prev => 
        prev.filter(p => p.id_peminjaman !== selectedPeminjaman.id_peminjaman)
      );

      // Buat notifikasi untuk user yang mengajukan
      const userNotifications = JSON.parse(
        localStorage.getItem(`user_notifications_${selectedPeminjaman.id_user}`) || '[]'
      );

      userNotifications.unshift({
        id: Date.now(),
        title: dialogAction === 'approve' ? 'Peminjaman Disetujui ✅' : 'Peminjaman Ditolak ❌',
        message: dialogAction === 'approve'
          ? `Peminjaman ${selectedPeminjaman.nama_ruangan} untuk ${selectedPeminjaman.keperluan} telah DISETUJUI`
          : `Peminjaman ${selectedPeminjaman.nama_ruangan} untuk ${selectedPeminjaman.keperluan} DITOLAK`,
        type: dialogAction === 'approve' ? 'success' : 'error',
        read: false,
        date: new Date().toISOString()
      });

      localStorage.setItem(`user_notifications_${selectedPeminjaman.id_user}`, JSON.stringify(userNotifications));

      // Trigger storage event untuk notifikasi real-time
      window.dispatchEvent(new StorageEvent('storage', {
        key: `user_notifications_${selectedPeminjaman.id_user}`,
        newValue: JSON.stringify(userNotifications),
        url: window.location.href,
        storageArea: localStorage
      }));

      setSuccessMessage(
        `Peminjaman ${dialogAction === 'approve' ? 'disetujui' : 'ditolak'} berhasil!`
      );
      
      setTimeout(() => setSuccessMessage(null), 3000);
      setDialogOpen(false);

    } catch (error) {
      console.error('Error validating:', error);
      alert('Gagal memproses validasi');
    } finally {
      setProcessing(false);
    }
  };

  // Loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-500">Memuat data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Bukan admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <ShieldAlert className="h-16 w-16 mx-auto text-orange-500 mb-4" />
            <h1 className="text-2xl font-bold">Akses Terbatas</h1>
            <p className="text-gray-500 mt-2">Hanya Administrator yang dapat mengakses halaman ini</p>
            <Link to="/">
              <Button className="mt-4 gap-2">
                <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              Validasi Peminjaman
            </h1>
            <p className="text-gray-500 mt-1">
              Setujui atau tolak pengajuan peminjaman ruangan
            </p>
          </div>
          <Link to="/laporan">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Lihat Laporan
            </Button>
          </Link>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            {successMessage}
          </div>
        )}

        {/* Statistik */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Menunggu</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.menunggu}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Draft</p>
              <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Locked</p>
              <p className="text-2xl font-bold text-blue-600">{stats.locked}</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Peminjam</TableHead>
                  <TableHead>Ruangan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jam</TableHead>
                  <TableHead>Keperluan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingList.length > 0 ? (
                  pendingList.map((item, index) => (
                    <TableRow key={item.id_peminjaman}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {item.nama_user}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.nama_ruangan}</p>
                          <p className="text-xs text-gray-500">{item.nama_gedung} - Lt. {item.lantai}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {format(new Date(item.tanggal), 'dd MMM yyyy', { locale: id })}
                        </div>
                      </TableCell>
                      <TableCell>{item.jam_mulai?.slice(0,5)} - {item.jam_selesai?.slice(0,5)}</TableCell>
                      <TableCell>{item.keperluan || '-'}</TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white gap-1"
                            onClick={() => openApproveDialog(item)}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                            onClick={() => openRejectDialog(item)}
                          >
                            <XCircle className="h-3 w-3" />
                            Tolak
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-300" />
                      Tidak ada pengajuan yang perlu divalidasi 🎉
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog Validasi */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {dialogAction === 'approve' ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
                {dialogAction === 'approve' ? 'Setujui Peminjaman' : 'Tolak Peminjaman'}
              </DialogTitle>
              <DialogDescription>
                {dialogAction === 'approve'
                  ? 'Anda akan menyetujui peminjaman berikut:'
                  : 'Anda akan menolak peminjaman berikut:'}
              </DialogDescription>
            </DialogHeader>

            {selectedPeminjaman && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Peminjam:</span>
                  <span className="text-sm font-medium">{selectedPeminjaman.nama_user}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Ruangan:</span>
                  <span className="text-sm font-medium">{selectedPeminjaman.nama_ruangan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Tanggal:</span>
                  <span className="text-sm font-medium">
                    {format(new Date(selectedPeminjaman.tanggal), 'dd MMMM yyyy', { locale: id })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Jam:</span>
                  <span className="text-sm font-medium">
                    {selectedPeminjaman.jam_mulai?.slice(0,5)} - {selectedPeminjaman.jam_selesai?.slice(0,5)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Keperluan:</span>
                  <span className="text-sm font-medium">{selectedPeminjaman.keperluan || '-'}</span>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={processing}
              >
                Batal
              </Button>
              <Button
                className={dialogAction === 'approve' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-red-500 hover:bg-red-600'}
                onClick={handleValidation}
                disabled={processing}
              >
                {processing ? (
                  'Memproses...'
                ) : dialogAction === 'approve' ? (
                  'Setujui'
                ) : (
                  'Tolak'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default ValidasiPeminjaman;