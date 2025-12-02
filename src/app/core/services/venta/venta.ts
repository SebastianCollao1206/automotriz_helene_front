import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificacionSweet } from '../notificacion-sweet/notificacion-sweet';
import { CrearVentaRequest, VentaResponse } from '../../../models/venta';

@Injectable({
  providedIn: 'root'
})
export class Venta {

  private readonly API_URL = `${environment.apiUrl}/ventas`;

  constructor(private http: HttpClient) { }

  listarTodas(): Observable<VentaResponse[]> {
    return this.http.get<VentaResponse[]>(this.API_URL).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  listarPorUsuario(usuarioId: number): Observable<VentaResponse[]> {
    return this.http.get<VentaResponse[]>(`${this.API_URL}/usuario/${usuarioId}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  buscarPorId(id: number): Observable<VentaResponse> {
    return this.http.get<VentaResponse>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  crear(request: CrearVentaRequest): Observable<VentaResponse> {
    return this.http.post<VentaResponse>(this.API_URL, request).pipe(
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
