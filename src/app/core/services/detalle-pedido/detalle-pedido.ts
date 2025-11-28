import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { NotificacionSweet } from '../notificacion-sweet/notificacion-sweet';
import {
  DetallePedidoResponse,
  CrearDetallePedidoRequest,
  RecibirDetalleRequest
} from '../../../models/detalle-pedido';

@Injectable({
  providedIn: 'root'
})
export class DetallePedido {

  private readonly API_URL = `${environment.apiUrl}/detalles-pedido`;

  constructor(private http: HttpClient) { }

  listarPorPedido(pedidoId: number): Observable<DetallePedidoResponse[]> {
    return this.http.get<DetallePedidoResponse[]>(`${this.API_URL}/pedido/${pedidoId}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  buscarPorId(id: number): Observable<DetallePedidoResponse> {
    return this.http.get<DetallePedidoResponse>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  recibirProductos(pedidoId: number, request: RecibirDetalleRequest): Observable<DetallePedidoResponse[]> {
    if (!pedidoId || pedidoId <= 0) {
      return throwError(() => new Error('ID de pedido inválido'));
    }

    if (!request.detalles || request.detalles.length === 0) {
      return throwError(() => new Error('Debe incluir al menos un producto para recibir'));
    }

    return this.http.patch<DetallePedidoResponse[]>(
      `${this.API_URL}/pedido/${pedidoId}/recibir`,
      request
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  agregarDetalle(pedidoId: number, request: CrearDetallePedidoRequest): Observable<DetallePedidoResponse> {
    if (!pedidoId || pedidoId <= 0) {
      return throwError(() => new Error('ID de pedido inválido'));
    }

    return this.http.post<DetallePedidoResponse>(
      `${this.API_URL}/pedido/${pedidoId}`,
      request
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  actualizarDetalle(id: number, request: CrearDetallePedidoRequest): Observable<DetallePedidoResponse> {
    if (!id || id <= 0) {
      return throwError(() => new Error('ID de detalle inválido'));
    }

    return this.http.put<DetallePedidoResponse>(`${this.API_URL}/${id}`, request).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  eliminarDetalle(id: number): Observable<void> {
    if (!id || id <= 0) {
      return throwError(() => new Error('ID de detalle inválido'));
    }

    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
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

    console.error('Error HTTP en Detalles de Pedido:', error);

    NotificacionSweet.hideLoading();
    NotificacionSweet.showError('Error', mensajeError);

    return throwError(() => error);
  }

}
