export interface ProveedorResponse {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  ruc: string;
  enabled: boolean;
  fechaCreacion: string;
}

export interface CrearProveedorRequest {
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  ruc: string;
}

export interface ActualizarProveedorRequest {
  nombre?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  enabled?: boolean;
}