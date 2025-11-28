import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { NotificacionSweet } from '../notificacion-sweet/notificacion-sweet';
import { 
  PedidoResponse, 
  CrearPedidoRequest, 
  ActualizarPedidoRequest 
} from '../../../models/pedido';

@Injectable({
  providedIn: 'root'
})
export class Pedido {
  
  private readonly API_URL = `${environment.apiUrl}/pedidos`;

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(this.API_URL).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  buscarPorId(id: number): Observable<PedidoResponse> {
    return this.http.get<PedidoResponse>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  crear(request: CrearPedidoRequest): Observable<PedidoResponse> {
    if (!request.detalles || request.detalles.length === 0) {
      return throwError(() => new Error('Debe agregar al menos un producto al pedido'));
    }

    return this.http.post<PedidoResponse>(this.API_URL, request).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  actualizar(id: number, request: ActualizarPedidoRequest): Observable<PedidoResponse> {
    if (!id || id <= 0) {
      return throwError(() => new Error('ID de pedido inválido'));
    }

    if (!request.detalles || request.detalles.length === 0) {
      return throwError(() => new Error('Debe agregar al menos un producto al pedido'));
    }

    return this.http.put<PedidoResponse>(`${this.API_URL}/${id}`, request).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  cancelar(id: number): Observable<PedidoResponse> {
    if (!id || id <= 0) {
      return throwError(() => new Error('ID de pedido inválido'));
    }

    return this.http.patch<PedidoResponse>(`${this.API_URL}/${id}/cancelar`, null).pipe(
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

    console.error('Error HTTP en Pedidos:', error);

    NotificacionSweet.hideLoading();
    NotificacionSweet.showError('Error', mensajeError);

    return throwError(() => error);
  }

}
