import { useEffect, useMemo, useState } from 'react';
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
  Clock, CheckCircle2, XCircle, AlertCircle
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

  // Filter peminjaman hari ini dengan status disetujui/diproses
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
  const { user } = useAuth();
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

  /* ================== FETCH API ================== */
  useEffect(() => {
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
  }, []);

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

    if (user && user.role === 'mahasiswa') {
      data = data.filter(r => r.id_user === parseInt(user.id));
    }

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
    selectedDay,
    user
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

  const resetFilter = () => {
    setSelectedGedung('all');
    setSelectedLantai('all');
    setSelectedRuangan('all');
    setSelectedStatus('all');
  };

  const statusBadge = (status: string) => {
    if (status === 'N/A') return <Badge variant="outline">{status}</Badge>;
    const map: any = {
      draft: 'bg-gray-100 text-gray-800',
      locked: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      menunggu: 'bg-yellow-100 text-yellow-800',
      disetujui: 'bg-green-100 text-green-800',
      ditolak: 'bg-red-100 text-red-800',
      diproses: 'bg-orange-100 text-orange-800',
      selesai: 'bg-blue-100 text-blue-800',
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
        {/* Header dengan Toggle Sidebar */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText /> Laporan Peminjaman
          </h1>
          <Button
            variant="outline"
            onClick={() => setShowSidebar(!showSidebar)}
            className="flex items-center gap-2"
          >
            <Info className="h-4 w-4" />
            {showSidebar ? 'Sembunyikan' : 'Tampilkan'} Ketersediaan Hari Ini
          </Button>
        </div>

        <div className="flex gap-6">
          {/* MAIN CONTENT - KIRI */}
          <div className={`flex-1 ${showSidebar ? 'lg:w-2/3' : 'w-full'}`}>
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
                      <TableHead>ID Peminjaman</TableHead>
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
                    {filteredData.map((r, i) => (
                      <TableRow key={r.id_laporan}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{r.id_peminjaman}</TableCell>
                        <TableCell>{format(parseISO(r.created_at), 'dd MMM yyyy HH:mm', { locale: id })}</TableCell>
                        <TableCell>{statusBadge(r.status)}</TableCell>
                        <TableCell>{r.nama_ruangan}</TableCell>
                        <TableCell>{r.nama_gedung}</TableCell>
                        <TableCell>{r.lantai}</TableCell>
                        <TableCell>{r.nama_user}</TableCell>
                        <TableCell>{`${r.jam_mulai} - ${r.jam_selesai}`}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* SIDEBAR KANAN - KETERSEDIAAN HARI INI */}
          {showSidebar && (
            <div className="hidden lg:block w-1/3 xl:w-1/4">
              <Card className="sticky top-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Ketersediaan Hari Ini
                  </CardTitle>
                  <p className="text-xs text-gray-500">
                    {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id })}
                  </p>
                </CardHeader>
                <CardContent className="max-h-[70vh] overflow-y-auto">
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