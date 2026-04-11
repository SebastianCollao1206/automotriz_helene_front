import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, interval } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { DetalleNotificacionResponse } from '../../../models/notificacion';

@Injectable({
  providedIn: 'root'
})
export class Notificacion {

  private readonly API_URL = `${environment.apiUrl}/notificaciones`;

  private notificacionesSubject = new BehaviorSubject<DetalleNotificacionResponse[]>([]);
  private contadorNoLeidasSubject = new BehaviorSubject<number>(0);

  public notificaciones$ = this.notificacionesSubject.asObservable();
  public contadorNoLeidas$ = this.contadorNoLeidasSubject.asObservable();

  constructor(private http: HttpClient) {
    this.iniciarActualizacionAutomatica();
  }

  private iniciarActualizacionAutomatica(): void {
    interval(30000).pipe(
      switchMap(() => this.listarTodas())
    ).subscribe();
  }

  listarTodas(): Observable<DetalleNotificacionResponse[]> {
    return this.http.get<DetalleNotificacionResponse[]>(this.API_URL).pipe(
      tap(notificaciones => {
        this.notificacionesSubject.next(notificaciones);
        this.actualizarContador(notificaciones);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  listarNoLeidas(): Observable<DetalleNotificacionResponse[]> {
    return this.http.get<DetalleNotificacionResponse[]>(`${this.API_URL}/no-leidas`).pipe(
      tap(notificaciones => {
        this.notificacionesSubject.next(notificaciones);
        this.actualizarContador(notificaciones);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  contarNoLeidas(): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/contar-no-leidas`).pipe(
      tap(cantidad => this.contadorNoLeidasSubject.next(cantidad)),
      catchError(this.handleError.bind(this))
    );
  }

  marcarComoLeida(id: number): Observable<DetalleNotificacionResponse> {
    return this.http.put<DetalleNotificacionResponse>(`${this.API_URL}/${id}/marcar-leida`, null).pipe(
      tap(() => {
        const notificaciones = this.notificacionesSubject.value.map(n =>
          n.id === id ? { ...n, estado: 'LEIDA' as any } : n
        );
        this.notificacionesSubject.next(notificaciones);
        this.actualizarContador(notificaciones);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  marcarTodasComoLeidas(): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/marcar-todas-leidas`, null).pipe(
      tap(() => {
        const notificaciones = this.notificacionesSubject.value.map(n =>
          ({ ...n, estado: 'LEIDA' as any })
        );
        this.notificacionesSubject.next(notificaciones);
        this.contadorNoLeidasSubject.next(0);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  cargarNotificacionesNoLeidas(): Observable<DetalleNotificacionResponse[]> {
    return this.listarNoLeidas();
  }

  private actualizarContador(notificaciones: DetalleNotificacionResponse[]): void {
    const noLeidas = notificaciones.filter(n => n.estado === 'NO_LEIDA').length;
    this.contadorNoLeidasSubject.next(noLeidas);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let mensajeError = 'Ha ocurrido un error inesperado';

    if (error.status === 0) {
      mensajeError = 'No se pudo conectar con el servidor';
    } else if (error.error) {
      if (error.error.detalle) {
        mensajeError = error.error.detalle;
      } else if (typeof error.error === 'string') {
        mensajeError = error.error;
      } else if (error.error.message) {
        mensajeError = error.error.message;
      }
    }

    console.error('Error HTTP en Notificaciones:', error);
    return throwError(() => error);
  }

}
