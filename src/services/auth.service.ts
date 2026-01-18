import api from "@/lib/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'mahasiswa' | 'dosen';
    fakultas?: string;
    jurusan?: string;
    nim?: string;
  };
  token?: string;
  message?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'mahasiswa' | 'dosen';
  fakultas?: string;
  jurusan?: string;
  nim?: string;
  isAuthenticated: boolean;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    // Try the auth endpoint first
    const response = await api.post('/auth/login', data);
    return {
      success: true,
      user: response.data.user,
      token: response.data.token,
    };
  } catch (error: any) {
    // If auth endpoint doesn't exist, use mock authentication for development
    console.warn('Auth endpoint not available, using mock authentication');

    // Mock user data based on email
    const mockUsers: Record<string, AuthUser> = {
      'admin@unimus.ac.id': {
        id: '1',
        email: 'admin@unimus.ac.id',
        name: 'Administrator',
        role: 'admin',
        isAuthenticated: true,
      },
      'mahasiswa@unimus.ac.id': {
        id: '2',
        email: 'mahasiswa@unimus.ac.id',
        name: 'Mahasiswa Test',
        role: 'mahasiswa',
        fakultas: 'Teknologi Informasi',
        jurusan: 'Sistem Informasi',
        nim: '123456789',
        isAuthenticated: true,
      },
      'dosen@unimus.ac.id': {
        id: '3',
        email: 'dosen@unimus.ac.id',
        name: 'Dosen Test',
        role: 'dosen',
        fakultas: 'Teknologi Informasi',
        jurusan: 'Sistem Informasi',
        isAuthenticated: true,
      },
    };

    const user = mockUsers[data.email];
    if (user && data.password === 'admin123') {
      // Generate mock token
      const token = `siprus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));

      return {
        success: true,
        user,
        token,
      };
    }

    return {
      success: false,
      message: 'Email atau password salah',
    };
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Even if logout fails on server (e.g., server not running), we should clear local state
    console.warn('Logout API call failed, clearing local state:', error);
  } finally {
    // Always clear local state regardless of API call result
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }
};

export const checkAuth = async (): Promise<AuthUser | null> => {
  try {
    const response = await api.get('/auth/me');
    return {
      ...response.data.user,
      isAuthenticated: true,
    };
  } catch (error) {
    // If auth endpoint doesn't exist, check localStorage for mock auth
    console.warn('Auth check endpoint not available, checking localStorage');
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData && token.startsWith('siprus-')) {
      try {
        const user = JSON.parse(userData);
        return {
          ...user,
          isAuthenticated: true,
        };
      } catch (parseError) {
        console.error('Error parsing stored user data:', parseError);
        return null;
      }
    }

    return null;
  }
};

export const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await api.post('/auth/refresh');
    return response.data.token;
  } catch (error) {
    return null;
  }
};
