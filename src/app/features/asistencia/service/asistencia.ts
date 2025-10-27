import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse,HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ReconocimientoResponse, ParpadeoResponse, AsistenciaResponse } from '../../../models/asistencia';
import { NotificacionSweet } from '../../../core/services/notificacion-sweet/notificacion-sweet';

@Injectable({
  providedIn: 'root'
})
export class Asistencia {
  
  private readonly API_URL = `${environment.apiUrl}/asistencia`;

  constructor(private http: HttpClient) {}

  reconocerRostro(imagenBase64: string): Observable<ReconocimientoResponse> {
    return this.http.post<ReconocimientoResponse>(`${this.API_URL}/reconocer`, {
      imagen: imagenBase64
    });
  }

  verificarParpadeo(imagenBase64: string): Observable<ParpadeoResponse> {
    return this.http.post<ParpadeoResponse>(`${this.API_URL}/verificar-parpadeo`, {
      imagen: imagenBase64
    });
  }

  registrarAsistencia(userId: number): Observable<AsistenciaResponse> {
    return this.http.post<AsistenciaResponse>(`${this.API_URL}/registrar`, {
      userId: userId
    });
  }

  reiniciarParpadeos(): Observable<any> {
    return this.http.post(`${this.API_URL}/reiniciar-parpadeos`, {});
  }
  
  //Manejo de errores
  private handleError(error: HttpErrorResponse): Observable<never> {
    let mensajeError = 'Ha ocurrido un error inesperado';

    if (error.status === 0) {
      mensajeError = 'No se pudo conectar con el servidor';
    } else if (error.error) {
      if (error.error.detalle) {
        mensajeError = error.error.detalle;
      }
      else if (typeof error.error === 'string') {
        mensajeError = error.error;
      }
      else if (error.error.message) {
        mensajeError = error.error.message;
      }
      else if (error.error.errors) {
        const errors = error.error.errors;
        mensajeError = Object.values(errors).join('\n');
      }
    }
    else if (error.message) {
      mensajeError = error.message;
    }

    console.error('Error HTTP:', error);

    NotificacionSweet.hideLoading();
    NotificacionSweet.showError('Error', mensajeError);

    return throwError(() => error);
  }
}
