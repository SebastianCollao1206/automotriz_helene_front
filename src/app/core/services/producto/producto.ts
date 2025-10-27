import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificacionSweet } from '../notificacion-sweet/notificacion-sweet';
import { ProductoResponse, CrearProductoRequest, ActualizarProductoRequest } from '../../../models/producto';

@Injectable({
  providedIn: 'root'
})
export class Producto {

  private readonly API_URL = `${environment.apiUrl}/productos`;
  private readonly FILES_URL = `${environment.apiUrl}/files`;

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(this.API_URL).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  listarActivos(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.API_URL}/activos`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  buscarPorId(id: number): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  crear(request: CrearProductoRequest, imagen: File): Observable<ProductoResponse> {
    if (!imagen) {
      return throwError(() => new Error('La imagen es obligatoria'));
    }

    const formData = new FormData();

    const productoBlob = new Blob([JSON.stringify(request)], {
      type: 'application/json'
    });
    formData.append('producto', productoBlob);

    formData.append('imagen', imagen);

    return this.http.post<ProductoResponse>(this.API_URL, formData).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  actualizar(
    id: number,
    request: ActualizarProductoRequest,
    imagen?: File
  ): Observable<ProductoResponse> {
    if (!id || id <= 0) {
      return throwError(() => new Error('ID de producto inválido'));
    }

    const formData = new FormData();

    const productoBlob = new Blob([JSON.stringify(request)], {
      type: 'application/json'
    });
    formData.append('producto', productoBlob);

    if (imagen) {
      formData.append('imagen', imagen);
    }

    return this.http.patch<ProductoResponse>(
      `${this.API_URL}/${id}`,
      formData
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  cambiarEstado(id: number, enabled: boolean): Observable<ProductoResponse> {
    if (!id || id <= 0) {
      return throwError(() => new Error('ID de producto inválido'));
    }

    const params = new HttpParams().set('enabled', enabled.toString());

    return this.http.patch<ProductoResponse>(
      `${this.API_URL}/cambiar-estado/${id}`,
      null,
      { params }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  obtenerUrlImagen(nombreArchivo: string | undefined): string {
    if (!nombreArchivo) {
      return 'assets/images/default-product.png';
    }
    return `${this.FILES_URL}/images/${nombreArchivo}`;
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
