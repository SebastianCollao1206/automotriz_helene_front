export interface AuthResponse {
  id: number;
  nombre: string;
  email: string;
  imagenOriginal?: string;
  roles: string[];
  token: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}