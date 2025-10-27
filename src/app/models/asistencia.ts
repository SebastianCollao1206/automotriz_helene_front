export interface ReconocimientoResponse {
  success: boolean;
  userId: number;
  nombre: string;
  email: string;
  confianza: number;
  mensaje: string;
}

export interface ParpadeoResponse {
  success: boolean;
  parpadeo: boolean;
  mensaje: string;
}

export interface AsistenciaResponse {
  success: boolean;
  asistencia?: {
    id: number;
    nombreUsuario: string;
    horaEntrada: string;
    estado: string;
    mensaje: string;
  };
  mensaje?: string;
}