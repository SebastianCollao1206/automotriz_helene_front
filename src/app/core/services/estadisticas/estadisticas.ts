import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificacionSweet } from '../notificacion-sweet/notificacion-sweet';
import { EstadisticasDTO } from '../../../models/estadisticas';

@Injectable({
  providedIn: 'root'
})
export class Estadisticas {

  private readonly API_URL = `${environment.apiUrl}/estadisticas`;

  constructor(private http: HttpClient) { }

  obtenerEstadisticasMensuales(anio?: number, mes?: number): Observable<EstadisticasDTO> {
    let params = new HttpParams();

    if (anio !== undefined) {
      params = params.set('anio', anio.toString());
    }
    if (mes !== undefined) {
      params = params.set('mes', mes.toString());
    }

    return this.http.get<EstadisticasDTO>(`${this.API_URL}/mensuales`, { params }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  obtenerEstadisticasTrimestrales(anio?: number, trimestre?: number): Observable<EstadisticasDTO> {
    let params = new HttpParams();

    if (anio !== undefined) {
      params = params.set('anio', anio.toString());
    }
    if (trimestre !== undefined) {
      params = params.set('trimestre', trimestre.toString());
    }

    return this.http.get<EstadisticasDTO>(`${this.API_URL}/trimestrales`, { params }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  obtenerEstadisticasAnuales(anio?: number): Observable<EstadisticasDTO> {
    let params = new HttpParams();

    if (anio !== undefined) {
      params = params.set('anio', anio.toString());
    }

    return this.http.get<EstadisticasDTO>(`${this.API_URL}/anuales`, { params }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

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
