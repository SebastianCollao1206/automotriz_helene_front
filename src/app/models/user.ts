export interface UserResponse {
  id: number;
  nombre: string;
  email: string;
  dni: string;
  enabled: boolean;
  roles: string[];
  fechaCreacion: string;
  imagenOriginal?: string;
}

export interface CrearUsuarioRequest {
  nombre: string;
  email: string;
  password: string;
  dni: string;
  roleIds: number[];
}

export interface ActualizarUsuarioRequest {
  email?: string;
  password?: string;
  roleIds?: number[];
  enabled?: boolean;
}