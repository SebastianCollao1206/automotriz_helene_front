import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserResponse, ActualizarUsuarioRequest, CrearUsuarioRequest } from '../../../models/user';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { NotificacionSweet } from '../notificacion-sweet/notificacion-sweet';

@Injectable({
  providedIn: 'root'
})
export class User {
  private readonly API_URL = `${environment.apiUrl}/users`;
  private readonly FILES_URL = `${environment.apiUrl}/files`;

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.API_URL).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  buscarPorId(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  crearUsuario(request: CrearUsuarioRequest, imagen: File): Observable<UserResponse> {
    if (!imagen) {
      return throwError(() => new Error('La imagen es obligatoria'));
    }

    const formData = new FormData();

    const usuarioBlob = new Blob([JSON.stringify(request)], {
      type: 'application/json'
    });
    formData.append('usuario', usuarioBlob);

    formData.append('imagen', imagen);

    return this.http.post<UserResponse>(`${this.API_URL}/crear`, formData).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  actualizarUsuario(
    id: number,
    request: ActualizarUsuarioRequest,
    imagen?: File
  ): Observable<UserResponse> {
    if (!id || id <= 0) {
      return throwError(() => new Error('ID de usuario inválido'));
    }

    const formData = new FormData();

    const usuarioBlob = new Blob([JSON.stringify(request)], {
      type: 'application/json'
    });
    formData.append('usuario', usuarioBlob);

    if (imagen) {
      formData.append('imagen', imagen);
    }

    return this.http.patch<UserResponse>(
      `${this.API_URL}/actualizar/${id}`,
      formData
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  cambiarEstado(id: number, enabled: boolean): Observable<UserResponse> {
    if (!id || id <= 0) {
      return throwError(() => new Error('ID de usuario inválido'));
    }

    const params = new HttpParams().set('enabled', enabled.toString());

    return this.http.patch<UserResponse>(
      `${this.API_URL}/cambiar-estado/${id}`,
      null,
      { params }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  obtenerUrlImagen(nombreArchivo: string | undefined): string {
    if (!nombreArchivo) {
      return 'assets/images/default-user.png';
    }
    return `${this.FILES_URL}/images/${nombreArchivo}`;
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
