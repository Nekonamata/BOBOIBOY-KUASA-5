import { useEffect, useMemo, useState } from 'react';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { getAllRiwayatPeminjaman, RiwayatPeminjamanData } from '@/services/peminjaman.service';

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  FileText, Building2, Layers, DoorOpen,
  Calendar, RotateCcw, Filter
} from 'lucide-react';

import {
  format, parseISO, startOfMonth, endOfMonth,
  startOfYear, endOfYear, isWithinInterval
} from 'date-fns';
import { id } from 'date-fns/locale';

/* ================== TIPE DATA ================== */
interface Gedung {
  id_gedung: number;
  nama_gedung: string;
}

interface Ruangan {
  id_ruangan: number;
  nama_ruangan: string;
  lantai: number;
  gedung: Gedung;
}

interface Peminjaman {
  id_peminjaman: number;
  id_user: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  status: 'menunggu' | 'disetujui' | 'ditolak' | 'diproses' | 'selesai';
  nama_pengguna: string;
  ruangan: Ruangan;
}

type PeriodeType = 'harian' | 'bulanan' | 'tahunan';
type StatusFilter = 'all' | 'pending' | 'disetujui' | 'ditolak' | 'selesai';

/* ================== COMPONENT ================== */
const LaporanPeminjaman = () => {
  const { user } = useAuth();
  const [gedungList, setGedungList] = useState<Gedung[]>([]);
  const [ruanganList, setRuanganList] = useState<Ruangan[]>([]);
  const [peminjamanList, setPeminjamanList] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [periodeType, setPeriodeType] = useState<PeriodeType>('bulanan');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedDay, setSelectedDay] = useState(new Date().getDate().toString().padStart(2, '0'));
  const [selectedGedung, setSelectedGedung] = useState('all');
  const [selectedLantai, setSelectedLantai] = useState('all');
  const [selectedRuangan, setSelectedRuangan] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');

  /* ================== FETCH API ================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [gedungRes, ruanganRes, peminjamanRes] = await Promise.all([
          api.get('/gedung'),
          api.get('/ruangan'),
          api.get('/peminjaman')
        ]);
        setGedungList(gedungRes.data?.data || []);
        setRuanganList(ruanganRes.data?.data || []);
        setPeminjamanList(peminjamanRes.data?.data || []);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat data. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ================== FILTER RUANGAN ================== */
  const filteredRuangan = useMemo(() => {
    return ruanganList.filter(r => {
      if (selectedGedung !== 'all' && r.gedung.nama_gedung !== selectedGedung) return false;
      if (selectedLantai !== 'all' && r.lantai !== Number(selectedLantai)) return false;
      return true;
    });
  }, [ruanganList, selectedGedung, selectedLantai]);

  /* ================== FILTER PEMINJAMAN ================== */
  const filteredData = useMemo(() => {
    let data = peminjamanList;

    // Filter by current user
    if (user) {
      data = data.filter(p => p.id_user === parseInt(user.id));
    }

    if (selectedGedung !== 'all') {
      data = data.filter(p => p.ruangan.gedung.nama_gedung === selectedGedung);
    }
    if (selectedLantai !== 'all') {
      data = data.filter(p => p.ruangan.lantai === Number(selectedLantai));
    }
    if (selectedRuangan !== 'all') {
      data = data.filter(p => p.ruangan.id_ruangan.toString() === selectedRuangan);
    }
    if (selectedStatus !== 'all') {
      data = data.filter(p => p.status === selectedStatus);
    }

    data = data.filter(p => {
      const date = parseISO(p.tanggal);

      if (periodeType === 'tahunan') {
        return isWithinInterval(date, {
          start: startOfYear(new Date(Number(selectedYear), 0)),
          end: endOfYear(new Date(Number(selectedYear), 0))
        });
      }

      if (periodeType === 'bulanan') {
        return isWithinInterval(date, {
          start: startOfMonth(new Date(Number(selectedYear), Number(selectedMonth) - 1)),
          end: endOfMonth(new Date(Number(selectedYear), Number(selectedMonth) - 1))
        });
      }

      return p.tanggal === `${selectedYear}-${selectedMonth}-${selectedDay}`;
    });

    return data;
  }, [
    peminjamanList,
    selectedGedung,
    selectedLantai,
    selectedRuangan,
    selectedStatus,
    periodeType,
    selectedYear,
    selectedMonth,
    selectedDay
  ]);

  const resetFilter = () => {
    setSelectedGedung('all');
    setSelectedLantai('all');
    setSelectedRuangan('all');
    setSelectedStatus('all');
  };

  const statusBadge = (status: string) => {
    const map: any = {
      menunggu: 'bg-yellow-100 text-yellow-800',
      disetujui: 'bg-green-100 text-green-800',
      ditolak: 'bg-red-100 text-red-800',
      diproses: 'bg-orange-100 text-orange-800',
      selesai: 'bg-blue-100 text-blue-800',
    };
    return <Badge className={map[status]}>{status}</Badge>;
  };

  /* ================== RENDER ================== */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6 flex items-center justify-center gap-2">
              <FileText /> Laporan Peminjaman
            </h1>
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6 flex items-center justify-center gap-2">
              <FileText /> Laporan Peminjaman
            </h1>
            <p className="text-red-500">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Coba Lagi
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <FileText /> Laporan Peminjaman
        </h1>

        {/* FILTER */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">

            <Select value={selectedGedung} onValueChange={v => {
              setSelectedGedung(v);
              setSelectedRuangan('all');
            }}>
              <SelectTrigger><SelectValue placeholder="Gedung" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Gedung</SelectItem>
                {gedungList.map(g => (
                  <SelectItem key={g.id_gedung} value={g.nama_gedung}>
                    {g.nama_gedung}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLantai} onValueChange={setSelectedLantai}>
              <SelectTrigger><SelectValue placeholder="Lantai" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Lantai</SelectItem>
                {[1,2,3,4,5].map(l => (
                  <SelectItem key={l} value={l.toString()}>Lantai {l}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRuangan} onValueChange={setSelectedRuangan}>
              <SelectTrigger><SelectValue placeholder="Ruangan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Ruangan</SelectItem>
                {filteredRuangan.map(r => (
                  <SelectItem key={r.id_ruangan} value={r.id_ruangan.toString()}>
                    {r.nama_ruangan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={resetFilter}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>

          </CardContent>
        </Card>

        {/* TABLE */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Ruangan</TableHead>
                  <TableHead>Gedung</TableHead>
                  <TableHead>Lantai</TableHead>
                  <TableHead>Peminjam</TableHead>
                  <TableHead>Jam</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((p, i) => (
                  <TableRow key={p.id_peminjaman}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{format(parseISO(p.tanggal), 'dd MMM yyyy', { locale: id })}</TableCell>
                    <TableCell>{p.ruangan.nama_ruangan}</TableCell>
                    <TableCell>{p.ruangan.gedung.nama_gedung}</TableCell>
                    <TableCell>{p.ruangan.lantai}</TableCell>
                    <TableCell>{p.nama_pengguna}</TableCell>
                    <TableCell>{p.jam_mulai} - {p.jam_selesai}</TableCell>
                    <TableCell>{statusBadge(p.status)}</TableCell>
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

export default LaporanPeminjaman;
