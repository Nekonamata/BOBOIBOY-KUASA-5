import { Room } from '@/data/rooms';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, Layers, Wifi, Monitor, Wind, Calendar } from 'lucide-react';

interface RoomCardProps {
  room: Room;
}

const statusConfig = {
  tersedia: {
    label: 'Tersedia',
    className: 'bg-success/10 text-success border-success/20',
  },
  terpakai: {
    label: 'Terpakai',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  maintenance: {
    label: 'Maintenance',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

const facilityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="h-3 w-3" />,
  'Internet': <Wifi className="h-3 w-3" />,
  'Proyektor': <Monitor className="h-3 w-3" />,
  'AC': <Wind className="h-3 w-3" />,
};

const RoomCard = ({ room }: RoomCardProps) => {
  const status = statusConfig[room.status];

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Decorative gradient */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
              {room.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{room.gedung}</span>
            </div>
          </div>
          <Badge variant="outline" className={status.className}>
            {status.label}
          </Badge>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
              <Users className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Kapasitas</p>
              <p className="font-semibold text-foreground">{room.kapasitas} orang</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
              <Layers className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lantai</p>
              <p className="font-semibold text-foreground">Lantai {room.lantai}</p>
            </div>
          </div>
        </div>

        {/* Zona Badge */}
        <div className="mb-4">
          <Badge variant="secondary" className="text-xs">
            {room.zona}
          </Badge>
        </div>

        {/* Facilities */}
        <div className="mb-5">
          <p className="text-xs text-muted-foreground mb-2">Fasilitas:</p>
          <div className="flex flex-wrap gap-1.5">
            {room.fasilitas.slice(0, 4).map((fasilitas) => (
              <span
                key={fasilitas}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary rounded-md text-secondary-foreground"
              >
                {facilityIcons[fasilitas]}
                {fasilitas}
              </span>
            ))}
            {room.fasilitas.length > 4 && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-secondary rounded-md text-muted-foreground">
                +{room.fasilitas.length - 4} lainnya
              </span>
            )}
          </div>
        </div>

        {/* Action */}
        <Button
          className="w-full gap-2"
          variant={room.status === 'tersedia' ? 'default' : 'muted'}
          disabled={room.status !== 'tersedia'}
        >
          <Calendar className="h-4 w-4" />
          {room.status === 'tersedia' ? 'Ajukan Peminjaman' : 'Tidak Tersedia'}
        </Button>
      </div>
    </div>
  );
};

export default RoomCard;
