import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

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

@Injectable({
  providedIn: 'root'
})
export class Asistencia {
  
  // private apiUrl = 'http://localhost:8080/api/asistencia';

  private readonly API_URL = `${environment.apiUrl}/asistencia`;

  constructor(private http: HttpClient) {}

  /**
   * PASO 1 y 3: Reconocimiento facial
   */
  reconocerRostro(imagenBase64: string): Observable<ReconocimientoResponse> {
    return this.http.post<ReconocimientoResponse>(`${this.API_URL}/reconocer`, {
      imagen: imagenBase64
    });
  }

  /**
   * PASO 2: Verificar parpadeo
   */
  verificarParpadeo(imagenBase64: string): Observable<ParpadeoResponse> {
    return this.http.post<ParpadeoResponse>(`${this.API_URL}/verificar-parpadeo`, {
      imagen: imagenBase64
    });
  }

  /**
   * Registrar asistencia
   */
  registrarAsistencia(userId: number): Observable<AsistenciaResponse> {
    return this.http.post<AsistenciaResponse>(`${this.API_URL}/registrar`, {
      userId: userId
    });
  }

  /**
   * Reiniciar contador de parpadeos
   */
  reiniciarParpadeos(): Observable<any> {
    return this.http.post(`${this.API_URL}/reiniciar-parpadeos`, {});
  }
  
}
