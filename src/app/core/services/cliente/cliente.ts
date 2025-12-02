import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificacionSweet } from '../notificacion-sweet/notificacion-sweet';
import { ClienteResponse } from '../../../models/cliente';

@Injectable({
  providedIn: 'root'
})
export class Cliente {

  private readonly API_URL = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<ClienteResponse[]> {
    return this.http.get<ClienteResponse[]>(this.API_URL).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  buscarPorId(id: number): Observable<ClienteResponse> {
    return this.http.get<ClienteResponse>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  buscarPorDni(dni: string): Observable<ClienteResponse> {
    return this.http.get<ClienteResponse>(`${this.API_URL}/dni/${dni}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  buscarPorRuc(ruc: string): Observable<ClienteResponse> {
    return this.http.get<ClienteResponse>(`${this.API_URL}/ruc/${ruc}`).pipe(
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
    //NotificacionSweet.showError('Error', mensajeError);

    return throwError(() => error);
  }

}
