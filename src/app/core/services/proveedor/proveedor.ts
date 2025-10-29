import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProveedorResponse, ActualizarProveedorRequest, CrearProveedorRequest } from '../../../models/proveedor';
import { catchError } from 'rxjs/operators';
import { NotificacionSweet } from '../notificacion-sweet/notificacion-sweet';

@Injectable({
  providedIn: 'root'
})
export class Proveedor {

  private readonly API_URL = `${environment.apiUrl}/proveedores`;

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<ProveedorResponse[]> {
    return this.http.get<ProveedorResponse[]>(this.API_URL).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  listarActivos(): Observable<ProveedorResponse[]> {
    return this.http.get<ProveedorResponse[]>(`${this.API_URL}/activos`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  buscarPorId(id: number): Observable<ProveedorResponse> {
    return this.http.get<ProveedorResponse>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  crearProveedor(request: CrearProveedorRequest): Observable<ProveedorResponse> {
    return this.http.post<ProveedorResponse>(`${this.API_URL}/crear`, request).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  actualizarProveedor(
    id: number,
    request: ActualizarProveedorRequest
  ): Observable<ProveedorResponse> {
    if (!id || id <= 0) {
      return throwError(() => new Error('ID de proveedor inválido'));
    }

    return this.http.patch<ProveedorResponse>(
      `${this.API_URL}/actualizar/${id}`,
      request
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  cambiarEstado(id: number, enabled: boolean): Observable<ProveedorResponse> {
    if (!id || id <= 0) {
      return throwError(() => new Error('ID de proveedor inválido'));
    }

    const params = new HttpParams().set('enabled', enabled.toString());

    return this.http.patch<ProveedorResponse>(
      `${this.API_URL}/cambiar-estado/${id}`,
      null,
      { params }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
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
