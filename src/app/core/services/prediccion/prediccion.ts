import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { NotificacionSweet } from '../notificacion-sweet/notificacion-sweet';
import { PrediccionResponse, GraficoProductoResponse, GraficoGeneralResponse } from '../../../models/prediccion';

@Injectable({
  providedIn: 'root'
})
export class Prediccion {
  private readonly API_URL = `${environment.apiUrl}/prediccion`;

  constructor(private http: HttpClient) { }

  listarTodas(): Observable<{ success: boolean; total: number; predicciones: PrediccionResponse[] }> {
    return this.http.get<{ success: boolean; total: number; predicciones: PrediccionResponse[] }>(`${this.API_URL}/listar`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  buscarPorId(id: number): Observable<{ success: boolean; prediccion: PrediccionResponse }> {
    if (!id || id <= 0) {
      return throwError(() => new Error('ID de predicción inválido'));
    }

    return this.http.get<{ success: boolean; prediccion: PrediccionResponse }>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  obtenerGraficoProducto(productoId: number): Observable<{ success: boolean; datos: GraficoProductoResponse }> {
    if (!productoId || productoId <= 0) {
      return throwError(() => new Error('ID de producto inválido'));
    }

    return this.http.get<{ success: boolean; datos: GraficoProductoResponse }>(`${this.API_URL}/grafico/producto/${productoId}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  obtenerGraficoGeneral(): Observable<{ success: boolean; datos: GraficoGeneralResponse }> {
    return this.http.get<{ success: boolean; datos: GraficoGeneralResponse }>(`${this.API_URL}/grafico/general`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let mensajeError = 'Ha ocurrido un error inesperado';

    if (error.status === 0) {
      mensajeError = 'No se pudo conectar con el servidor';
    } else if (error.error) {
      if (error.error.mensaje) {
        mensajeError = error.error.mensaje;
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

    console.error('Error HTTP en Predicciones:', error);

    NotificacionSweet.hideLoading();
    NotificacionSweet.showError('Error', mensajeError);

    return throwError(() => error);
  }
}
