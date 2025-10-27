import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificacionSweet } from '../notificacion-sweet/notificacion-sweet';
import { UnidadMedidaResponse, CrearUnidadMedidaRequest, ActualizarUnidadMedidaRequest } from '../../../models/unidad-medida';

@Injectable({
  providedIn: 'root'
})
export class UnidadMedida {

  private readonly API_URL = `${environment.apiUrl}/unidades-medida`;

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<UnidadMedidaResponse[]> {
    return this.http.get<UnidadMedidaResponse[]>(this.API_URL).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  listarActivos(): Observable<UnidadMedidaResponse[]> {
    return this.http.get<UnidadMedidaResponse[]>(`${this.API_URL}/activos`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  buscarPorId(id: number): Observable<UnidadMedidaResponse> {
    return this.http.get<UnidadMedidaResponse>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  crear(request: CrearUnidadMedidaRequest): Observable<UnidadMedidaResponse> {
    return this.http.post<UnidadMedidaResponse>(this.API_URL, request).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  actualizar(id: number, request: ActualizarUnidadMedidaRequest): Observable<UnidadMedidaResponse> {
    if (!id || id <= 0) {
      return throwError(() => new Error('ID de unidad de medida inválido'));
    }

    return this.http.patch<UnidadMedidaResponse>(
      `${this.API_URL}/${id}`,
      request
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  cambiarEstado(id: number, enabled: boolean): Observable<UnidadMedidaResponse> {
    if (!id || id <= 0) {
      return throwError(() => new Error('ID de unidad de medida inválido'));
    }

    const params = new HttpParams().set('enabled', enabled.toString());

    return this.http.patch<UnidadMedidaResponse>(
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
