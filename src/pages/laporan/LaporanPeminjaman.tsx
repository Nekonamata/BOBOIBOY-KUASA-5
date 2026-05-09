// src/pages/laporan/LaporanPeminjaman.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { getAllLaporanPeminjaman, LaporanPeminjamanData } from '@/services/peminjaman.service';

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
  Calendar, RotateCcw, Filter,
  ChevronDown, ChevronUp, Info,
  Clock, CheckCircle2, XCircle, AlertCircle,
  ArrowLeft, ShieldAlert, Download, Printer
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

type PeriodeType = 'harian' | 'bulanan' | 'tahunan' | 'all';
type StatusFilter = 'all' | 'draft' | 'locked' | 'confirmed' | 'expired';

/* ================== HELPER: WAKTU SEKARANG ================== */
const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;
};

/* ================== HELPER: CEK KETERSEDIAAN HARI INI ================== */
interface RoomAvailability {
  id_ruangan: number;
  nama_ruangan: string;
  lantai: number;
  nama_gedung: string;
  status: 'available' | 'in_use' | 'upcoming';
  currentBooking?: {
    jam_mulai: string;
    jam_selesai: string;
    peminjam: string;
    status: string;
  };
  nextBooking?: {
    jam_mulai: string;
    jam_selesai: string;
    peminjam: string;
  };
  totalToday: number;
}

const getRoomAvailability = (
  ruanganList: Ruangan[],
  laporanList: LaporanPeminjamanData[]
): RoomAvailability[] => {
  const now = getCurrentTime();
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const todayBookings = laporanList.filter(l => {
    const bookingDate = l.created_at?.split(' ')[0];
    return bookingDate === todayStr && 
           ['disetujui', 'diproses'].includes(l.status);
  });

  return ruanganList.map(ruangan => {
    const ruanganBookings = todayBookings
      .filter(b => b.id_ruangan === ruangan.id_ruangan)
      .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));

    const currentBooking = ruanganBookings.find(
      b => b.jam_mulai <= now && b.jam_selesai >= now
    );

    const nextBooking = ruanganBookings.find(
      b => b.jam_mulai > now
    );

    let status: RoomAvailability['status'];
    if (currentBooking) {
      status = 'in_use';
    } else if (nextBooking) {
      status = 'upcoming';
    } else {
      status = 'available';
    }

    return {
      id_ruangan: ruangan.id_ruangan,
      nama_ruangan: ruangan.nama_ruangan,
      lantai: ruangan.lantai,
      nama_gedung: ruangan.gedung.nama_gedung,
      status,
      currentBooking: currentBooking ? {
        jam_mulai: currentBooking.jam_mulai,
        jam_selesai: currentBooking.jam_selesai,
        peminjam: currentBooking.nama_user,
        status: currentBooking.status
      } : undefined,
      nextBooking: nextBooking ? {
        jam_mulai: nextBooking.jam_mulai,
        jam_selesai: nextBooking.jam_selesai,
        peminjam: nextBooking.nama_user
      } : undefined,
      totalToday: ruanganBookings.length
    };
  });
};

/* ================== COMPONENT ================== */
const LaporanPeminjaman = () => {
  const { user, loading: authLoading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [gedungList, setGedungList] = useState<Gedung[]>([]);
  const [ruanganList, setRuanganList] = useState<Ruangan[]>([]);
  const [laporanList, setLaporanList] = useState<LaporanPeminjamanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [periodeType, setPeriodeType] = useState<PeriodeType>('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedDay, setSelectedDay] = useState(new Date().getDate().toString().padStart(2, '0'));
  const [selectedGedung, setSelectedGedung] = useState('all');
  const [selectedLantai, setSelectedLantai] = useState('all');
  const [selectedRuangan, setSelectedRuangan] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');

  // State untuk sidebar kanan
  const [showSidebar, setShowSidebar] = useState(false);
  const [expandedGedung, setExpandedGedung] = useState<number | null>(null);

  /* ================== PROTEKSI ADMIN ================== */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/', { replace: true });
    }
    if (!authLoading && isAuthenticated && !isAdmin) {
      navigate('/', { replace: true });
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate]);

  /* ================== FETCH API ================== */
  useEffect(() => {
    // Hanya fetch jika admin
    if (!isAdmin) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [gedungRes, ruanganRes, laporanRes] = await Promise.all([
          api.get('/gedung'),
          api.get('/ruangan'),
          getAllLaporanPeminjaman()
        ]);

        setGedungList(gedungRes.data?.data || []);
        setRuanganList(ruanganRes.data?.data || []);
        setLaporanList(laporanRes);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat data. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  /* ================== FILTER RUANGAN ================== */
  const filteredRuangan = useMemo(() => {
    return ruanganList.filter(r => {
      if (selectedGedung !== 'all' && r.gedung.nama_gedung !== selectedGedung) return false;
      if (selectedLantai !== 'all' && r.lantai !== Number(selectedLantai)) return false;
      return true;
    });
  }, [ruanganList, selectedGedung, selectedLantai]);

  /* ================== FILTER LAPORAN ================== */
  const filteredData = useMemo(() => {
    let data = laporanList;

    if (selectedGedung !== 'all') {
      data = data.filter(r => r.nama_gedung === selectedGedung);
    }
    if (selectedLantai !== 'all') {
      data = data.filter(r => r.lantai === Number(selectedLantai));
    }
    if (selectedRuangan !== 'all') {
      data = data.filter(r => r.id_ruangan.toString() === selectedRuangan);
    }
    if (selectedStatus !== 'all') {
      data = data.filter(r => r.status === selectedStatus);
    }

    if (periodeType !== 'all') {
      data = data.filter(r => {
        const date = parseISO(r.created_at);

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

        return r.created_at.startsWith(`${selectedYear}-${selectedMonth}-${selectedDay}`);
      });
    }

    return data;
  }, [
    laporanList,
    selectedGedung,
    selectedLantai,
    selectedRuangan,
    selectedStatus,
    periodeType,
    selectedYear,
    selectedMonth,
    selectedDay
  ]);

  // Ketersediaan ruangan hari ini
  const roomAvailability = useMemo(() => {
    return getRoomAvailability(ruanganList, laporanList);
  }, [ruanganList, laporanList]);

  // Statistik hari ini
  const todayStats = useMemo(() => {
    const available = roomAvailability.filter(r => r.status === 'available').length;
    const inUse = roomAvailability.filter(r => r.status === 'in_use').length;
    const upcoming = roomAvailability.filter(r => r.status === 'upcoming').length;
    
    return { available, inUse, upcoming, total: roomAvailability.length };
  }, [roomAvailability]);

  // Group by gedung untuk sidebar
  const roomAvailabilityByGedung = useMemo(() => {
    const grouped: Record<string, RoomAvailability[]> = {};
    
    roomAvailability.forEach(room => {
      if (!grouped[room.nama_gedung]) {
        grouped[room.nama_gedung] = [];
      }
      grouped[room.nama_gedung].push(room);
    });

    return grouped;
  }, [roomAvailability]);

  // Statistik laporan
 const laporanStats = useMemo(() => {
  const total = laporanList.length;
  // Konversi status ke string dulu
  const disetujui = laporanList.filter(r => String(r.status) === 'disetujui' || String(r.status) === 'confirmed').length;
  const ditolak = laporanList.filter(r => String(r.status) === 'ditolak' || String(r.status) === 'expired').length;
  const menunggu = laporanList.filter(r => String(r.status) === 'menunggu' || String(r.status) === 'draft' || String(r.status) === 'locked').length;
  const diproses = laporanList.filter(r => String(r.status) === 'diproses').length;
  
  return { total, disetujui, ditolak, menunggu, diproses };
}, [laporanList]);

  const resetFilter = () => {
    setSelectedGedung('all');
    setSelectedLantai('all');
    setSelectedRuangan('all');
    setSelectedStatus('all');
    setPeriodeType('all');
  };

  const statusBadge = (status: string) => {
    if (status === 'N/A') return <Badge variant="outline">{status}</Badge>;
    const map: any = {
      draft: 'bg-gray-100 text-gray-800 border-gray-300',
      locked: 'bg-blue-100 text-blue-800 border-blue-300',
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      expired: 'bg-red-100 text-red-800 border-red-300',
      menunggu: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      disetujui: 'bg-green-100 text-green-800 border-green-300',
      ditolak: 'bg-red-100 text-red-800 border-red-300',
      diproses: 'bg-orange-100 text-orange-800 border-orange-300',
      selesai: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return <Badge className={map[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  const availabilityBadge = (status: RoomAvailability['status']) => {
    switch (status) {
      case 'available':
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Tersedia
          </Badge>
        );
      case 'in_use':
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Dipakai
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Akan Dipakai
          </Badge>
        );
    }
  };

  /* ================== LOADING STATE ================== */
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

  /* ================== PROTEKSI: BUKAN ADMIN ================== */
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 mx-auto mb-6">
              <ShieldAlert className="h-10 w-10 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Akses Terbatas
            </h1>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Halaman Laporan Peminjaman hanya tersedia untuk Administrator. 
              Silakan gunakan menu Daftar Ruangan untuk mengajukan peminjaman.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
              <Link to="/">
                <Button className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <Building2 className="h-4 w-4" />
                  Beranda
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ================== ERROR STATE ================== */
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Gagal Memuat Data
            </h1>
            <p className="text-red-500 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Coba Lagi
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ================== RENDER UTAMA (ADMIN) ================== */
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header dengan Toggle Sidebar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText /> Laporan Peminjaman
            </h1>
            <p className="text-gray-500 mt-1">
              Total {laporanList.length} laporan peminjaman
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <Printer className="h-4 w-4" />
              Cetak
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSidebar(!showSidebar)}
              className="flex items-center gap-2"
            >
              <Info className="h-4 w-4" />
              {showSidebar ? 'Sembunyikan' : 'Tampilkan'} Ketersediaan
            </Button>
          </div>
        </div>

        {/* Statistik Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-blue-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-blue-700">{laporanStats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-green-600 font-medium">Disetujui</p>
              <p className="text-2xl font-bold text-green-700">{laporanStats.disetujui}</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-yellow-600 font-medium">Menunggu</p>
              <p className="text-2xl font-bold text-yellow-700">{laporanStats.menunggu}</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-red-600 font-medium">Ditolak</p>
              <p className="text-2xl font-bold text-red-700">{laporanStats.ditolak}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-6">
          {/* MAIN CONTENT - KIRI */}
          <div className={`flex-1 ${showSidebar ? 'lg:w-2/3' : 'w-full'}`}>
            {/* FILTER */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filter
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={resetFilter} className="gap-1">
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={selectedGedung} onValueChange={v => {
                  setSelectedGedung(v);
                  setSelectedRuangan('all');
                }}>
                  <SelectTrigger><SelectValue placeholder="Gedung" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Gedung</SelectItem>
                    {Array.from(new Set(gedungList.map(g => g.nama_gedung))).map((namaGedung) => (
                      <SelectItem key={namaGedung} value={namaGedung}>
                        {namaGedung}
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

                <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as StatusFilter)}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="locked">Locked</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* TABLE */}
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Tanggal Dibuat</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ruangan</TableHead>
                      <TableHead>Gedung</TableHead>
                      <TableHead>Lantai</TableHead>
                      <TableHead>Peminjam</TableHead>
                      <TableHead>Jam</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length > 0 ? (
                      filteredData.map((r, i) => (
                        <TableRow key={r.id_laporan} className="hover:bg-gray-50">
                          <TableCell>{i + 1}</TableCell>
                          <TableCell className="font-mono text-xs">{r.id_peminjaman}</TableCell>
                          <TableCell className="text-sm whitespace-nowrap">
                            {format(parseISO(r.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
                          </TableCell>
                          <TableCell>{statusBadge(r.status)}</TableCell>
                          <TableCell className="font-medium">{r.nama_ruangan}</TableCell>
                          <TableCell>{r.nama_gedung}</TableCell>
                          <TableCell>{r.lantai}</TableCell>
                          <TableCell>{r.nama_user}</TableCell>
                          <TableCell className="whitespace-nowrap text-sm">
                            {`${r.jam_mulai} - ${r.jam_selesai}`}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          Tidak ada data laporan
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* SIDEBAR KANAN - KETERSEDIAAN HARI INI */}
          {showSidebar && (
            <div className="hidden lg:block w-1/3 xl:w-1/4">
              <Card className="sticky top-20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Ketersediaan Hari Ini
                  </CardTitle>
                  <p className="text-xs text-gray-500">
                    {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id })}
                  </p>
                </CardHeader>
                <CardContent className="max-h-[60vh] overflow-y-auto">
                  {/* Ringkasan Statistik */}
                  <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Tersedia</p>
                      <p className="text-lg font-bold text-green-600">{todayStats.available}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Dipakai</p>
                      <p className="text-lg font-bold text-red-600">{todayStats.inUse}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Akan</p>
                      <p className="text-lg font-bold text-yellow-600">{todayStats.upcoming}</p>
                    </div>
                  </div>

                  {/* List per Gedung */}
                  <div className="space-y-2">
                    {Object.entries(roomAvailabilityByGedung).map(([namaGedung, rooms]) => {
                      const gedungId = rooms[0]?.id_ruangan || 0;
                      const availableCount = rooms.filter(r => r.status === 'available').length;
                      const inUseCount = rooms.filter(r => r.status === 'in_use').length;
                      
                      return (
                        <div key={namaGedung} className="border rounded-lg overflow-hidden">
                          <button
                            onClick={() => setExpandedGedung(expandedGedung === gedungId ? null : gedungId)}
                            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-blue-500" />
                              <span className="font-medium text-sm">{namaGedung}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-green-600">{availableCount} tersedia</span>
                              {inUseCount > 0 && (
                                <span className="text-xs text-red-600">{inUseCount} dipakai</span>
                              )}
                              {expandedGedung === gedungId ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </div>
                          </button>

                          {expandedGedung === gedungId && (
                            <div className="p-2 space-y-1">
                              {rooms
                                .sort((a, b) => a.lantai - b.lantai || a.nama_ruangan.localeCompare(b.nama_ruangan))
                                .map((room) => (
                                  <div
                                    key={room.id_ruangan}
                                    className={`p-3 rounded transition-colors ${
                                      room.status === 'available' 
                                        ? 'bg-green-50 hover:bg-green-100' 
                                        : room.status === 'in_use'
                                        ? 'bg-red-50 hover:bg-red-100'
                                        : 'bg-yellow-50 hover:bg-yellow-100'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center gap-2">
                                        <DoorOpen className="h-3 w-3 text-gray-500" />
                                        <span className="font-medium text-sm">{room.nama_ruangan}</span>
                                        <Badge variant="outline" className="text-xs">
                                          Lt. {room.lantai}
                                        </Badge>
                                      </div>
                                      {availabilityBadge(room.status)}
                                    </div>
                                    
                                    {room.status === 'in_use' && room.currentBooking && (
                                      <div className="text-xs text-gray-600 mt-1 pl-5">
                                        <p>
                                          <span className="font-medium">Dipakai:</span> {room.currentBooking.peminjam}
                                        </p>
                                        <p>
                                          <span className="font-medium">Jam:</span> {room.currentBooking.jam_mulai} - {room.currentBooking.jam_selesai}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {room.status === 'upcoming' && room.nextBooking && (
                                      <div className="text-xs text-gray-600 mt-1 pl-5">
                                        <p>
                                          <span className="font-medium">Berikutnya:</span> {room.nextBooking.peminjam}
                                        </p>
                                        <p>
                                          <span className="font-medium">Jam:</span> {room.nextBooking.jam_mulai} - {room.nextBooking.jam_selesai}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {room.status === 'available' && (
                                      <div className="text-xs text-green-600 mt-1 pl-5">
                                        Tidak ada peminjaman saat ini
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {Object.keys(roomAvailabilityByGedung).length === 0 && (
                    <p className="text-center text-gray-500 py-4">Belum ada data ruangan</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LaporanPeminjaman;