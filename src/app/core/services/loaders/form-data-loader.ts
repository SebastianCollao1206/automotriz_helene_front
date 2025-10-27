import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Role } from '../role/role';
import { RoleModel } from '../../../models/role';

export interface FormDataCache {
  roles: RoleModel[];
  ultimaActualizacion: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FormDataLoader {
  private rolesCache: FormDataCache | null = null;
  private readonly CACHE_DURATION_MS = 10 * 60 * 1000;

  constructor(private roleService: Role) { }

  cargarRoles(forzarRecarga: boolean = false): Observable<RoleModel[]> {
    if (!forzarRecarga && this.rolesCache && this.esCacheValido(this.rolesCache.ultimaActualizacion)) {
      return of(this.rolesCache.roles);
    }

    return this.roleService.listarTodos().pipe(
      map(roles => roles
        .filter(role => role.enabled)
        .sort((a, b) => a.id - b.id)
      ),
      tap(roles => {
        this.rolesCache = {
          roles,
          ultimaActualizacion: new Date()
        };
      }),
      catchError(error => {
        if (this.rolesCache) {
          return of(this.rolesCache.roles);
        }
        return of([]);
      })
    );
  }

  cargarDatosFormularioUsuario(): Observable<{ roles: RoleModel[] }> {
    return forkJoin({
      roles: this.cargarRoles()
    });
  }

  limpiarCache(): void {
    this.rolesCache = null;
  }

  limpiarCacheRoles(): void {
    this.rolesCache = null;
  }

  private esCacheValido(fecha: Date): boolean {
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    return diferencia < this.CACHE_DURATION_MS;
  }

  obtenerEstadoCache(): {
    rolesEnCache: boolean;
    rolesUltimaActualizacion: Date | null;
    rolesCantidad: number;
  } {
    return {
      rolesEnCache: this.rolesCache !== null,
      rolesUltimaActualizacion: this.rolesCache?.ultimaActualizacion || null,
      rolesCantidad: this.rolesCache?.roles.length || 0
    };
  }
}
