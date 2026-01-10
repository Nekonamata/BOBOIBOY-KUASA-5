import { Room } from '@/data/rooms';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, Layers, Wifi, Monitor, Wind, Calendar, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface RoomCardProps {
  room: Room;
  onAjukanPeminjaman?: (room: Room) => void;
}

const statusConfig = {
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

const facilityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="h-3 w-3" />,
  'Internet': <Wifi className="h-3 w-3" />,
  'Proyektor': <Monitor className="h-3 w-3" />,
  'AC': <Wind className="h-3 w-3" />,
  'Sound System': <Monitor className="h-3 w-3" />,
  'Komputer': <Monitor className="h-3 w-3" />,
  'TV': <Monitor className="h-3 w-3" />,
  'Panggung': <Monitor className="h-3 w-3" />,
};

const RoomCard = ({ room, onAjukanPeminjaman }: RoomCardProps) => {
  const { isAuthenticated, user } = useAuth();
  const status = statusConfig[room.status];

  const handleAjukanClick = () => {
    if (onAjukanPeminjaman) {
      onAjukanPeminjaman(room);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Decorative gradient */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">
              {room.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-600">
              <MapPin className="h-3.5 w-3.5" />
              <span>{room.gedung}</span>
            </div>
          </div>
          <Badge variant="outline" className={`border ${status.className}`}>
            {status.label}
          </Badge>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
              <Users className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Kapasitas</p>
              <p className="font-semibold text-gray-900">{room.kapasitas} orang</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
              <Layers className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Lantai</p>
              <p className="font-semibold text-gray-900">Lantai {room.lantai}</p>
            </div>
          </div>
        </div>

        {/* Zona Badge */}
        <div className="mb-4">
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-100">
            {room.zona}
          </Badge>
        </div>

        {/* Facilities */}
        <div className="mb-5">
          <p className="text-xs text-gray-500 mb-2">Fasilitas:</p>
          <div className="flex flex-wrap gap-1.5">
            {room.fasilitas.slice(0, 4).map((fasilitas) => (
              <span
                key={fasilitas}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded-md text-gray-700"
              >
                {facilityIcons[fasilitas] || <Monitor className="h-3 w-3" />}
                {fasilitas}
              </span>
            ))}
            {room.fasilitas.length > 4 && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 rounded-md text-gray-500">
                +{room.fasilitas.length - 4} lainnya
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button
          className={`w-full gap-2 ${
            room.status === 'tersedia' && isAuthenticated
              ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white'
              : room.status === 'tersedia'
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-gray-100 text-gray-500 cursor-not-allowed'
          }`}
          disabled={room.status !== 'tersedia' || !isAuthenticated}
          onClick={room.status === 'tersedia' && isAuthenticated ? handleAjukanClick : undefined}
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

        {/* Warning messages */}
        {!isAuthenticated && room.status === 'tersedia' && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 bg-yellow-50 p-2 rounded-lg border border-yellow-100">
            <AlertCircle className="h-3 w-3 text-yellow-600" />
            <span>Silakan login untuk mengajukan peminjaman</span>
          </div>
        )}

        {room.status === 'terpakai' && (
          <div className="mt-3 text-xs text-gray-600">
            Ruangan sedang digunakan. Coba lain waktu.
          </div>
        )}

        {room.status === 'maintenance' && (
          <div className="mt-3 text-xs text-gray-600">
            Ruangan sedang dalam perbaikan. Tidak dapat dipinjam sementara.
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomCard;