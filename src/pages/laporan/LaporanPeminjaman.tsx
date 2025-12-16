import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { peminjamanData, Peminjaman } from '@/data/peminjaman';
import { gedungList, lantaiOptions, rooms } from '@/data/rooms';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Building2, 
  Layers, 
  DoorOpen, 
  Calendar, 
  RotateCcw,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO, isWithinInterval } from 'date-fns';
import { id } from 'date-fns/locale';

type PeriodeType = 'harian' | 'bulanan' | 'tahunan';
type StatusFilter = 'all' | 'pending' | 'disetujui' | 'ditolak' | 'selesai';

const LaporanPeminjaman = () => {
  const [periodeType, setPeriodeType] = useState<PeriodeType>('bulanan');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedDay, setSelectedDay] = useState<string>(new Date().getDate().toString().padStart(2, '0'));
  const [selectedGedung, setSelectedGedung] = useState<string>('all');
  const [selectedLantai, setSelectedLantai] = useState<string>('all');
  const [selectedRuangan, setSelectedRuangan] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  }, []);

  const months = [
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  const days = useMemo(() => {
    const daysInMonth = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, '0'));
  }, [selectedYear, selectedMonth]);

  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'disetujui', label: 'Disetujui' },
    { value: 'ditolak', label: 'Ditolak' },
    { value: 'selesai', label: 'Selesai' },
  ];

  const filteredRooms = useMemo(() => {
    let filtered = rooms;
    if (selectedGedung !== 'all') {
      filtered = filtered.filter(r => r.gedung === selectedGedung);
    }
    if (selectedLantai !== 'all') {
      filtered = filtered.filter(r => r.lantai === parseInt(selectedLantai));
    }
    return filtered;
  }, [selectedGedung, selectedLantai]);

  const filteredData = useMemo(() => {
    let data = peminjamanData;

    // Filter by location
    if (selectedGedung !== 'all') {
      data = data.filter(p => p.gedung === selectedGedung);
    }
    if (selectedLantai !== 'all') {
      data = data.filter(p => p.lantai === parseInt(selectedLantai));
    }
    if (selectedRuangan !== 'all') {
      data = data.filter(p => p.roomId === selectedRuangan);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      data = data.filter(p => p.status === selectedStatus);
    }

    // Filter by period
    data = data.filter(p => {
      const date = parseISO(p.tanggalPinjam);
      
      if (periodeType === 'tahunan') {
        const start = startOfYear(new Date(parseInt(selectedYear), 0, 1));
        const end = endOfYear(new Date(parseInt(selectedYear), 0, 1));
        return isWithinInterval(date, { start, end });
      } else if (periodeType === 'bulanan') {
        const start = startOfMonth(new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1));
        const end = endOfMonth(new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1));
        return isWithinInterval(date, { start, end });
      } else {
        const targetDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
        return p.tanggalPinjam === targetDate;
      }
    });

    return data;
  }, [periodeType, selectedYear, selectedMonth, selectedDay, selectedGedung, selectedLantai, selectedRuangan, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredData.length;
    const disetujui = filteredData.filter(p => p.status === 'disetujui').length;
    const selesai = filteredData.filter(p => p.status === 'selesai').length;
    const pending = filteredData.filter(p => p.status === 'pending').length;
    const ditolak = filteredData.filter(p => p.status === 'ditolak').length;
    const uniquePeminjam = new Set(filteredData.map(p => p.peminjam)).size;

    const byGedung = filteredData.reduce((acc, p) => {
      acc[p.gedung] = (acc[p.gedung] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byRuangan = filteredData.reduce((acc, p) => {
      acc[p.roomName] = (acc[p.roomName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = {
      pending,
      disetujui,
      ditolak,
      selesai,
    };

    return { total, disetujui, selesai, pending, ditolak, uniquePeminjam, byGedung, byRuangan, byStatus };
  }, [filteredData]);

  const resetFilters = () => {
    setPeriodeType('bulanan');
    setSelectedYear(new Date().getFullYear().toString());
    setSelectedMonth((new Date().getMonth() + 1).toString().padStart(2, '0'));
    setSelectedDay(new Date().getDate().toString().padStart(2, '0'));
    setSelectedGedung('all');
    setSelectedLantai('all');
    setSelectedRuangan('all');
    setSelectedStatus('all');
  };

  const getStatusBadge = (status: Peminjaman['status']) => {
    const variants: Record<string, { className: string; label: string }> = {
      pending: { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
      disetujui: { className: 'bg-green-100 text-green-800 border-green-200', label: 'Disetujui' },
      ditolak: { className: 'bg-red-100 text-red-800 border-red-200', label: 'Ditolak' },
      selesai: { className: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Selesai' },
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getTipePeminjamBadge = (tipe: Peminjaman['tipePeminjam']) => {
    const variants: Record<string, { className: string; label: string }> = {
      mahasiswa: { className: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Mahasiswa' },
      dosen: { className: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'Dosen' },
      staff: { className: 'bg-teal-100 text-teal-800 border-teal-200', label: 'Staff' },
      eksternal: { className: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Eksternal' },
    };
    const variant = variants[tipe];
    return <Badge variant="outline" className={variant.className}>{variant.label}</Badge>;
  };

  const getPeriodeLabel = () => {
    if (periodeType === 'tahunan') {
      return `Tahun ${selectedYear}`;
    } else if (periodeType === 'bulanan') {
      return format(new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1), 'MMMM yyyy', { locale: id });
    } else {
      return format(new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, parseInt(selectedDay)), 'dd MMMM yyyy', { locale: id });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Laporan Peminjaman</h1>
          </div>
          <p className="text-muted-foreground">
            Lihat dan filter data peminjaman ruangan berdasarkan periode, lokasi, dan status
          </p>
        </div>

        {/* Filter Section */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filter Laporan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Periode Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tipe Periode</label>
                <Select value={periodeType} onValueChange={(v) => setPeriodeType(v as PeriodeType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="harian">Harian</SelectItem>
                    <SelectItem value="bulanan">Bulanan</SelectItem>
                    <SelectItem value="tahunan">Tahunan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Year */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tahun</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Month - only show if not yearly */}
              {periodeType !== 'tahunan' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Bulan</label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Day - only show if daily */}
              {periodeType === 'harian' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tanggal</label>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Gedung */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Gedung
                </label>
                <Select value={selectedGedung} onValueChange={(v) => {
                  setSelectedGedung(v);
                  setSelectedRuangan('all');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Gedung" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Gedung</SelectItem>
                    {gedungList.map(gedung => (
                      <SelectItem key={gedung.id} value={gedung.name}>{gedung.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lantai */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4" /> Lantai
                </label>
                <Select value={selectedLantai} onValueChange={(v) => {
                  setSelectedLantai(v);
                  setSelectedRuangan('all');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Lantai" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Lantai</SelectItem>
                    {lantaiOptions.map(lantai => (
                      <SelectItem key={lantai} value={lantai.toString()}>Lantai {lantai}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ruangan */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <DoorOpen className="h-4 w-4" /> Ruangan
                </label>
                <Select value={selectedRuangan} onValueChange={setSelectedRuangan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Ruangan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Ruangan</SelectItem>
                    {filteredRooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Status
                </label>
                <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as StatusFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Button */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-transparent">Reset</label>
                <Button variant="outline" onClick={resetFilters} className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Peminjaman</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Disetujui</p>
                  <p className="text-2xl font-bold text-green-600">{stats.disetujui}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ditolak</p>
                  <p className="text-2xl font-bold text-red-600">{stats.ditolak}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <Clock className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Selesai</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.selesai}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Period Label */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Data Peminjaman: {getPeriodeLabel()}
            </h2>
            {selectedStatus !== 'all' && (
              <p className="text-sm text-muted-foreground mt-1">
                Filter status: {statusOptions.find(s => s.value === selectedStatus)?.label}
              </p>
            )}
          </div>
          <Badge variant="outline" className="text-base px-4 py-1">
            {filteredData.length} data
          </Badge>
        </div>

        {/* Summary by Gedung */}
        {Object.keys(stats.byGedung).length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ringkasan per Gedung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(stats.byGedung).map(([gedung, count]) => (
                  <div key={gedung} className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground truncate">{gedung}</p>
                    <p className="text-lg font-bold text-foreground">{count} peminjaman</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">No</TableHead>
                    <TableHead className="font-semibold">Tanggal</TableHead>
                    <TableHead className="font-semibold">Ruangan</TableHead>
                    <TableHead className="font-semibold">Gedung</TableHead>
                    <TableHead className="font-semibold">Lantai</TableHead>
                    <TableHead className="font-semibold">Peminjam</TableHead>
                    <TableHead className="font-semibold">Tipe</TableHead>
                    <TableHead className="font-semibold">Jam</TableHead>
                    <TableHead className="font-semibold">Keperluan</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Tidak ada data peminjaman untuk filter yang dipilih</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.slice(0, 50).map((item, index) => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          {format(parseISO(item.tanggalPinjam), 'dd MMM yyyy', { locale: id })}
                        </TableCell>
                        <TableCell className="font-medium">{item.roomName}</TableCell>
                        <TableCell className="text-sm">{item.gedung}</TableCell>
                        <TableCell>Lantai {item.lantai}</TableCell>
                        <TableCell>{item.peminjam}</TableCell>
                        <TableCell>{getTipePeminjamBadge(item.tipePeminjam)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {item.jamMulai} - {item.jamSelesai}
                        </TableCell>
                        <TableCell>{item.keperluan}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {filteredData.length > 50 && (
              <div className="p-4 text-center text-sm text-muted-foreground border-t">
                Menampilkan 50 dari {filteredData.length} data
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default LaporanPeminjaman;