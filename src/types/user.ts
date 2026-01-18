export type RoleUser = 'mahasiswa' | 'admin_rt' | 'kepala_rt';

export interface User {
  id_user: number;
  nama: string;
  role: RoleUser;
  aktif: boolean;
  created_at?: string;
  updated_at?: string;
}
