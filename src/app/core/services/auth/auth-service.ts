import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TokenService } from './token-service';
import { AuthResponse } from '../../../models/auth';
import { LoginRequest } from '../../../models/auth';
import { environment } from '../../../../environments/environment';
import { obtenerRolMayorJerarquia } from '../../constants/roles-constants';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = `${environment.apiUrl}/auth`;

  private estaLogueadoSubject = new BehaviorSubject<boolean>(false);
  private usuarioActualSubject = new BehaviorSubject<AuthResponse | null>(null);

  public estaLogueado$ = this.estaLogueadoSubject.asObservable();
  public usuarioActual$ = this.usuarioActualSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.verificarEstadoAutenticacion();
  }

  private verificarEstadoAutenticacion(): void {
    const tieneToken = this.tokenService.hasToken();
    const usuario = this.tokenService.getUser();

    if (tieneToken && usuario) {
      if (this.puedeAccederSistema(usuario)) {
        this.estaLogueadoSubject.next(true);
        this.usuarioActualSubject.next(usuario);
      } else {
        this.limpiarEstadoAutenticacion();
      }
    } else {
      this.limpiarEstadoAutenticacion();
    }
  }

  private limpiarEstadoAutenticacion(): void {
    this.tokenService.clearStorage();
    this.estaLogueadoSubject.next(false);
    this.usuarioActualSubject.next(null);
  }

  login(credenciales: LoginRequest): Observable<AuthResponse> {
    return new Observable(observer => {
      this.http.post<AuthResponse>(`${this.API_URL}/login`, credenciales)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return throwError(() => this.procesarErrorLogin(error));
          })
        )
        .subscribe({
          next: (respuesta) => {
            if (respuesta.token) {
              if (!this.puedeAccederSistema(respuesta)) {
                observer.error(new Error('Los empleados no tienen acceso al sistema'));
                return;
              }

              this.tokenService.setToken(respuesta.token);
              this.tokenService.setUser(respuesta);

              this.estaLogueadoSubject.next(true);
              this.usuarioActualSubject.next(respuesta);

              observer.next(respuesta);
              observer.complete();
            } else {
              observer.error(new Error('No se recibió token de autenticación'));
            }
          },
          error: (error) => observer.error(error)
        });
    });
  }

  private procesarErrorLogin(error: HttpErrorResponse): Error {
    let mensaje = 'Error al iniciar sesión';
    if (error.status === 400) {
      if (error.error?.detalle) {
        const detalle = error.error.detalle.toLowerCase();
        if (detalle.includes('inactiv') || detalle.includes('desactivad') || detalle.includes('disabled')) {
          mensaje = 'Tu cuenta está inactiva. Por favor, contacta con el gerente para activarla.';
        } else if (detalle.includes('credenciales') || detalle.includes('contraseña') || detalle.includes('password')) {
          mensaje = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
        } else {
          mensaje = error.error.detalle;
        }
      } else if (error.error?.message) {
        mensaje = error.error.message;
      } else if (typeof error.error === 'string') {
        mensaje = error.error;
      }
    }
    else if (error.status === 401) {
      mensaje = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
    }
    else if (error.status === 403) {
      mensaje = 'Tu cuenta está deshabilitada. Contacta con el gerente para más información.';
    }
    else if (error.status === 0) {
      mensaje = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    }
    else if (error.error?.detalle) {
      mensaje = error.error.detalle;
    } else if (error.error?.message) {
      mensaje = error.error.message;
    } else if (error.message) {
      mensaje = error.message;
    }

    return new Error(mensaje);
  }

  logout(): Observable<AuthResponse> {
    return new Observable(observer => {
      this.http.post<AuthResponse>(`${this.API_URL}/logout`, {})
        .subscribe({
          next: (respuesta) => {
            this.realizarLogout();
            observer.next(respuesta);
            observer.complete();
          },
          error: (error) => {
            this.realizarLogout();
            observer.error(error);
          }
        });
    });
  }

  realizarLogout(): void {
    this.tokenService.clearStorage();
    this.estaLogueadoSubject.next(false);
    this.usuarioActualSubject.next(null);
    this.router.navigate(['/login']);
  }

  estaAutenticado(): boolean {
    const tieneToken = this.tokenService.hasToken();
    const usuario = this.tokenService.getUser();
    return tieneToken && usuario !== null && this.puedeAccederSistema(usuario);
  }

  private puedeAccederSistema(usuario: AuthResponse): boolean {
    if (!usuario || !usuario.roles) return false;

    const roles = Array.isArray(usuario.roles) ? usuario.roles : [usuario.roles];

    const esEmpleado = roles.some(rol =>
      rol === 'ROLE_EMPLOYEE' || rol === 'EMPLOYEE' || rol === 'Empleado'
    );

    return !esEmpleado;
  }

  obtenerUsuarioActual(): AuthResponse | null {
    return this.tokenService.getUser();
  }

  obtenerNombreUsuario(): string {
    const usuario = this.obtenerUsuarioActual();
    return usuario?.nombre || '';
  }

  obtenerRolPrincipal(): string {
    const usuario = this.obtenerUsuarioActual();
    if (!usuario || !usuario.roles) return 'Usuario';

    return obtenerRolMayorJerarquia(usuario.roles);
  }

  tieneRol(rol: string): boolean {
    const usuario = this.obtenerUsuarioActual();
    if (!usuario || !usuario.roles) return false;

    const roles = Array.isArray(usuario.roles) ? usuario.roles : [usuario.roles];
    return roles.includes(rol);
  }

  esGerente(): boolean {
    return this.tieneRol('ROLE_MANAGER');
  }

  esAdministrador(): boolean {
    return this.tieneRol('ROLE_ADMIN');
  }

  esVendedor(): boolean {
    return this.tieneRol('ROLE_SELLER');
  }

  esSupervisor(): boolean {
    return this.tieneRol('ROLE_SUPERVISOR');
  }

  // Permisos para rutas específicas
  puedeGestionarUsuarios(): boolean {
    return this.esGerente();
  }

  puedeGestionarProductos(): boolean {
    return this.tieneAlgunRol(['ROLE_MANAGER', 'ROLE_ADMIN']);
  }

  puedeGestionarCategorias(): boolean {
    return this.esAdministrador();
  }

  puedeGestionarProveedores(): boolean {
    return this.tieneAlgunRol(['ROLE_MANAGER', 'ROLE_ADMIN']);
  }

  puedeVerAsistencia(): boolean {
    return this.esGerente();
  }

  //PEDIDOS
  puedeGestionarPedidos(): boolean {
    return this.tieneAlgunRol(['ROLE_MANAGER', 'ROLE_ADMIN']);
  }

  puedeVerPedidos(): boolean {
    return this.tieneAlgunRol(['ROLE_MANAGER', 'ROLE_ADMIN', 'ROLE_SELLER']);
  }

  puedeRecibirPedidos(): boolean {
    return this.esVendedor();
  }

  puedeModificarDetallesPedido(): boolean {
    return this.tieneAlgunRol(['ROLE_MANAGER', 'ROLE_ADMIN']);
  }

  //PARA PREDICCIONES
  puedeVerPredicciones(): boolean {
    return this.tieneAlgunRol(['ROLE_MANAGER', 'ROLE_ADMIN']);
  }

  //RECARGAR ESTADO
  refrescarEstadoAutenticacion(): void {
    this.verificarEstadoAutenticacion();
  }

  tieneAlgunRol(roles: string[]): boolean {
    const usuario = this.obtenerUsuarioActual();
    if (!usuario || !usuario.roles) return false;

    const rolesUsuario = Array.isArray(usuario.roles) ? usuario.roles : [usuario.roles];
    return roles.some(rol => rolesUsuario.includes(rol));
  }

  //VENTAS
  puedeRealizarVentas(): boolean {
    return this.esVendedor();
  }

  puedeVerTodasLasVentas(): boolean {
    return this.tieneAlgunRol(['ROLE_MANAGER', 'ROLE_ADMIN']);
  }
  
  puedeVerHistorialVentas(): boolean {
    return this.tieneAlgunRol(['ROLE_MANAGER', 'ROLE_ADMIN', 'ROLE_SELLER']);
  }

}
