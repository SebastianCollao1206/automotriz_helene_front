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
export interface AsistenciaDiariaDTO {
  userId: number;
  nombreUsuario: string;
  fecha: string;
  horaEntrada: string | null;
  estado: string;
}

export interface AsistenciasDiariasResponse {
  success: boolean;
  total: number;
  asistencias: AsistenciaDiariaDTO[];
  mensaje?: string;
}

export interface DetalleAsistenciaDia {
  fecha: string;
  diaSemana: string;
  estado: string; 
}

export interface AsistenciaMensualResponse {
  success: boolean;
  data: {
    nombreUsuario: string;
    mes: number;
    anio: number;
    totalPresente: number;
    totalTardanza: number;
    totalFalta: number;
    porcentajeAsistencia: number;
    detalles: DetalleAsistenciaDia[];
  };
  mensaje?: string;
}