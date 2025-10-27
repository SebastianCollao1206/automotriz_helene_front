import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface DatosEmpresa {
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  direccion: string;
  telefono?: string;
  estado: string;
  condicion: string;
}

@Injectable({
  providedIn: 'root'
})
export class SunatService {
  private readonly API_URL = 'https://apiperu.dev/api/ruc';
  private readonly API_TOKEN = 'f3dc3bdb2de4fd456a681730b96bff1c73e1495b7824f472a48d73b0c3d14b25';

  private cache = new Map<string, DatosEmpresa>();

  constructor(private http: HttpClient) { }

  buscarPorRuc(ruc: string): Observable<DatosEmpresa> {
    if (!ruc || ruc.length !== 11 || !/^\d{11}$/.test(ruc)) {
      return throwError(() => ({
        code: 'INVALID_RUC',
        message: 'El RUC debe tener exactamente 11 dígitos numéricos'
      }));
    }

    if (this.cache.has(ruc)) {
      return of(this.cache.get(ruc)!);
    }

    const url = `${this.API_URL}/${ruc}?api_token=${this.API_TOKEN}`;

    return this.http.get<any>(url).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw {
            code: 'NOT_FOUND',
            message: 'No se encontró información para este RUC'
          };
        }

        const datos: DatosEmpresa = {
          ruc: ruc,
          razonSocial: this.formatearTexto(response.data.nombre_o_razon_social),
          nombreComercial: response.data.nombre_comercial
            ? this.formatearTexto(response.data.nombre_comercial)
            : undefined,
          direccion: this.formatearDireccion(response.data.direccion_completa),
          telefono: response.data.telefono || undefined,
          estado: response.data.estado || 'DESCONOCIDO',
          condicion: response.data.condicion || 'DESCONOCIDO'
        };

        return datos;
      }),
      tap(datos => {
        this.cache.set(ruc, datos);
      }),
      catchError(this.handleError)
    );
  }

  limpiarCache(): void {
    this.cache.clear();
  }

  private formatearTexto(texto: string): string {
    if (!texto) return '';

    return texto
      .toLowerCase()
      .split(' ')
      .map(palabra => {
        const palabrasEspeciales = ['sac', 'srl', 'sa', 'eirl', 'saa'];
        if (palabrasEspeciales.includes(palabra.toLowerCase())) {
          return palabra.toUpperCase();
        }
        return palabra.charAt(0).toUpperCase() + palabra.slice(1);
      })
      .join(' ');
  }

  private formatearDireccion(direccion: string): string {
    if (!direccion) return '';
    return this.formatearTexto(direccion);
  }

  private handleError(error: any): Observable<never> {

    let errorMessage = {
      code: 'UNKNOWN_ERROR',
      message: 'Error al consultar el servicio de RUC'
    };

    if (error.code) {
      errorMessage = error;
    } else if (error.status === 0) {
      errorMessage = {
        code: 'NO_CONNECTION',
        message: 'No se pudo conectar con el servicio de RUC'
      };
    } else if (error.status === 404) {
      errorMessage = {
        code: 'NOT_FOUND',
        message: 'RUC no encontrado en la base de datos'
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
