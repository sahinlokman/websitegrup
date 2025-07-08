export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  lastLogin?: Date;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}