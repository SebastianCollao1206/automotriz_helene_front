import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificacionSweet } from '../notificacion-sweet/notificacion-sweet';
import { CrearMetodoPagoRequest, ActualizarMetodoPagoRequest, MetodoPagoResponse } from '../../../models/metodo-pago';

@Injectable({
  providedIn: 'root'
})
export class MetodoPago {

  private readonly API_URL = `${environment.apiUrl}/metodos-pago`;

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<MetodoPagoResponse[]> {
    return this.http.get<MetodoPagoResponse[]>(this.API_URL).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  listarActivos(): Observable<MetodoPagoResponse[]> {
    return this.http.get<MetodoPagoResponse[]>(`${this.API_URL}/activos`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  buscarPorId(id: number): Observable<MetodoPagoResponse> {
    return this.http.get<MetodoPagoResponse>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  crear(request: CrearMetodoPagoRequest): Observable<MetodoPagoResponse> {
    return this.http.post<MetodoPagoResponse>(this.API_URL, request).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  actualizar(id: number, request: ActualizarMetodoPagoRequest): Observable<MetodoPagoResponse> {
    if (!id || id <= 0) {
      return throwError(() => new Error('ID de método de pago inválido'));
    }

    return this.http.patch<MetodoPagoResponse>(
      `${this.API_URL}/${id}`,
      request
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  cambiarEstado(id: number, enabled: boolean): Observable<MetodoPagoResponse> {
    if (!id || id <= 0) {
      return throwError(() => new Error('ID de método de pago inválido'));
    }

    const params = new HttpParams().set('enabled', enabled.toString());

    return this.http.patch<MetodoPagoResponse>(
      `${this.API_URL}/cambiar-estado/${id}`,
      null,
      { params }
    ).pipe(
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
