import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface DatosPersona {
  dni: string;
  nombreCompleto: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReniecService {
  private readonly API_URL = 'https://apiperu.dev/api/dni';
  private readonly API_TOKEN = 'f3dc3bdb2de4fd456a681730b96bff1c73e1495b7824f472a48d73b0c3d14b25';

  private cache = new Map<string, DatosPersona>();

  constructor(private http: HttpClient) { }

  buscarPorDni(dni: string): Observable<DatosPersona> {
    if (!dni || dni.length !== 8 || !/^\d{8}$/.test(dni)) {
      return throwError(() => ({
        code: 'INVALID_DNI',
        message: 'El DNI debe tener exactamente 8 dígitos numéricos'
      }));
    }

    if (this.cache.has(dni)) {
      return of(this.cache.get(dni)!);
    }

    const url = `${this.API_URL}/${dni}?api_token=${this.API_TOKEN}`;

    return this.http.get<any>(url).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw {
            code: 'NOT_FOUND',
            message: 'No se encontró información para este DNI'
          };
        }

        const datos: DatosPersona = {
          dni: dni,
          nombreCompleto: this.formatearNombreCompleto(
            response.data.nombres,
            response.data.apellido_paterno,
            response.data.apellido_materno
          ),
          nombres: this.formatearTexto(response.data.nombres),
          apellidoPaterno: this.formatearTexto(response.data.apellido_paterno),
          apellidoMaterno: this.formatearTexto(response.data.apellido_materno)
        };

        return datos;
      }),
      tap(datos => {
        this.cache.set(dni, datos);
      }),
      catchError(this.handleError)
    );
  }

  limpiarCache(): void {
    this.cache.clear();
  }

  private formatearNombreCompleto(nombres: string, paterno: string, materno: string): string {
    const nombreFormateado = `${nombres} ${paterno} ${materno}`;
    return this.formatearTexto(nombreFormateado);
  }

  private formatearTexto(texto: string): string {
    if (!texto) return '';

    return texto
      .toLowerCase()
      .split(' ')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  }

  private handleError(error: any): Observable<never> {

    let errorMessage = {
      code: 'UNKNOWN_ERROR',
      message: 'Error al consultar el servicio de DNI'
    };

    if (error.code) {
      errorMessage = error;
    } else if (error.status === 0) {
      errorMessage = {
        code: 'NO_CONNECTION',
        message: 'No se pudo conectar con el servicio de DNI'
      };
    } else if (error.status === 404) {
      errorMessage = {
        code: 'NOT_FOUND',
        message: 'DNI no encontrado en la base de datos'
      };
    } else if (error.status === 429) {
      errorMessage = {
        code: 'RATE_LIMIT',
        message: 'Demasiadas consultas. Intente nuevamente en unos minutos'
      };
    }

    return throwError(() => errorMessage);
  }
}
