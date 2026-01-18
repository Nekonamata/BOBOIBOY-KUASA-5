import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  MapPin,
  Layers,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

import { RoomCardData } from '@/types/room-card';

/* ================= PROPS ================= */
interface RoomCardProps {
  room: RoomCardData;
  onAjukanPeminjaman?: () => void;
}

/* ================= STATUS CONFIG ================= */
const statusConfig: Record<
  RoomCardData['status'],
  { label: string; className: string }
> = {
  tersedia: {
    label: 'Tersedia',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  terpakai: {
    label: 'Terpakai',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  maintenance: {
    label: 'Maintenance',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
};

/* ================= COMPONENT ================= */
const RoomCard = ({ room, onAjukanPeminjaman }: RoomCardProps) => {
  const { isAuthenticated } = useAuth();
  const status = statusConfig[room.status];

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">

      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100" />

      <div className="p-6">
        {/* ================= HEADER ================= */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600">
              {room.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-600">
              <MapPin className="h-3.5 w-3.5" />
              <span>{room.gedung.nama_gedung}</span>
            </div>
          </div>

          <Badge variant="outline" className={`border ${status.className}`}>
            {status.label}
          </Badge>
        </div>

        {/* ================= DETAIL ================= */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
              <Users className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Kapasitas</p>
              <p className="font-semibold text-gray-900">
                {room.kapasitas} orang
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
              <Layers className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Lantai</p>
              <p className="font-semibold text-gray-900">
                Lantai {room.lantai}
              </p>
            </div>
          </div>
        </div>

        {/* ================= ZONA ================= */}
        <div className="mb-4">
          <Badge
            variant="secondary"
            className="text-xs bg-blue-100 text-blue-800"
          >
            Zona {room.gedung.zona}
          </Badge>
        </div>

        {/* ================= ACTION ================= */}
        <Button
          className={`w-full gap-2 ${
            room.status === 'tersedia' && isAuthenticated
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
              : 'bg-gray-100 text-gray-500 cursor-not-allowed'
          }`}
          disabled={room.status !== 'tersedia' || !isAuthenticated}
          onClick={
            room.status === 'tersedia' && isAuthenticated
              ? onAjukanPeminjaman
              : undefined
          }
        >
          <Calendar className="h-4 w-4" />
          {!isAuthenticated
            ? 'Login untuk Meminjam'
            : room.status === 'tersedia'
            ? 'Ajukan Peminjaman'
            : room.status === 'terpakai'
            ? 'Sedang Digunakan'
            : 'Dalam Perbaikan'}
        </Button>

        {/* ================= INFO ================= */}
        {!isAuthenticated && room.status === 'tersedia' && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 bg-yellow-50 p-2 rounded-lg border border-yellow-100">
            <AlertCircle className="h-3 w-3 text-yellow-600" />
            <span>Silakan login untuk mengajukan peminjaman</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomCard;
