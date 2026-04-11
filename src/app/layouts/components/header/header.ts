import { Component, EventEmitter, Output, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth-service';
import { Subscription } from 'rxjs';
import { Carrito } from '../../../core/services/carrito/carrito';
import { Router } from '@angular/router';
import { Notificacion } from '../../../core/services/notificacion/notificacion';
import { DetalleNotificacionResponse, TipoNotificacion, EntidadTipo } from '../../../models/notificacion';
import { obtenerIconoNotificacion, obtenerColorPrioridad } from '../../../core/constants/notificacion-constants';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class Header implements OnInit, OnDestroy {

  @Output() toggleSidebar = new EventEmitter<void>();

  isNotificationsOpen = false;
  isLogoutOpen = false;

  nombreCompleto: string = '';
  rolPrincipal: string = '';
  imagenUsuario: string = '';

  isCarritoOpen = false;
  cantidadItemsCarrito = 0;
  itemsCarrito: any[] = [];

  notificaciones: DetalleNotificacionResponse[] = [];
  cantidadNotificacionesNoLeidas = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private carritoService: Carrito,
    private router: Router,
    private notificacionService: Notificacion,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarDatosUsuario();

    const sub = this.authService.usuarioActual$.subscribe(() => {
      this.cargarDatosUsuario();
      this.cdr.detectChanges();
    });
    this.subscriptions.push(sub);

    const carritoSub = this.carritoService.items$.subscribe(items => {
      this.itemsCarrito = items;
      this.cantidadItemsCarrito = this.carritoService.obtenerCantidadTotal();
      this.cdr.detectChanges();
    });
    this.subscriptions.push(carritoSub);

    const notifSub = this.notificacionService.notificaciones$.subscribe(notificaciones => {
      this.notificaciones = notificaciones;
      this.cdr.detectChanges();
    });
    this.subscriptions.push(notifSub);

    const contadorSub = this.notificacionService.contadorNoLeidas$.subscribe(cantidad => {
      this.cantidadNotificacionesNoLeidas = cantidad;
      this.cdr.detectChanges();
    });
    this.subscriptions.push(contadorSub);

    this.cargarNotificaciones();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarDatosUsuario(): void {
    this.nombreCompleto = this.authService.obtenerNombreUsuario();
    this.rolPrincipal = this.authService.obtenerRolPrincipal();

    const usuario = this.authService.obtenerUsuarioActual();
    this.imagenUsuario = usuario?.imagenOriginal ||
      'https://www.pngkey.com/png/full/12-123249_teacher-teacher-login.png';
  }

  cargarNotificaciones(): void {
    this.notificacionService.listarTodas().subscribe({
      next: () => {
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar notificaciones:', error);
      }
    });
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    if (this.isNotificationsOpen) {
      this.isLogoutOpen = false;
      this.isCarritoOpen = false;
      this.cargarNotificaciones();
    }
  }

  closeNotifications() {
    this.isNotificationsOpen = false;
  }

  toggleLogout() {
    this.isLogoutOpen = !this.isLogoutOpen;
    if (this.isLogoutOpen) {
      this.isNotificationsOpen = false;
      this.isCarritoOpen = false;
    }
  }

  closeLogout() {
    this.isLogoutOpen = false;
  }

  cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Sesión cerrada exitosamente');
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
      }
    });
  }

  esVendedor(): boolean {
    return this.authService.esVendedor();
  }

  toggleCarrito(): void {
    this.isCarritoOpen = !this.isCarritoOpen;
    if (this.isCarritoOpen) {
      this.isNotificationsOpen = false;
      this.isLogoutOpen = false;
    }
  }

  closeCarrito(): void {
    this.isCarritoOpen = false;
  }

  obtenerSubtotalCarrito(): number {
    return this.carritoService.obtenerSubtotal();
  }

  eliminarDelCarrito(productoId: number): void {
    this.carritoService.eliminarProducto(productoId);
  }

  verCarritoCompleto(): void {
    this.closeCarrito();
    this.router.navigate(['venta/carrito']);
  }

  obtenerNombreProducto(producto: any): string {
    return `${producto.nombre} ${producto.marca} ${producto.tipoProducto} ${producto.cantidadTamanio}${producto.unidadMedida}`;
  }

  // Notis
  marcarNotificacionLeida(notificacion: DetalleNotificacionResponse, event: Event): void {
    event.stopPropagation();

    if (notificacion.estado === 'NO_LEIDA') {
      this.notificacionService.marcarComoLeida(notificacion.id).subscribe({
        next: () => {
          this.cdr.detectChanges();
          this.navegarSegunNotificacion(notificacion);
        },
        error: (error) => {
          console.error('Error al marcar notificación como leída:', error);
        }
      });
    } else {
      this.navegarSegunNotificacion(notificacion);
    }
  }

  marcarTodasLeidas(): void {
    this.notificacionService.marcarTodasComoLeidas().subscribe({
      next: () => {
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al marcar todas como leídas:', error);
      }
    });
  }

  esNotificacionNueva(fecha: string): boolean {
    const fechaNotificacion = new Date(fecha);
    const ahora = new Date();
    const diferenciaHoras = (ahora.getTime() - fechaNotificacion.getTime()) / (1000 * 60 * 60);
    return diferenciaHoras < 24;
  }

  navegarSegunNotificacion(notificacion: DetalleNotificacionResponse): void {
    this.closeNotifications();

    switch (notificacion.entidadTipo) {
      case EntidadTipo.PEDIDO:
        // this.router.navigate(['/pedidos', notificacion.entidadId]);
        this.router.navigate(['/pedidos']);
        break;

      case EntidadTipo.PRODUCTO:
        // this.router.navigate(['/productos', notificacion.entidadId]);
        this.router.navigate(['/productos/editar', notificacion.entidadId]);
        break;

      case EntidadTipo.PREDICCION:
        // this.router.navigate(['/predicciones', notificacion.entidadId]);
        this.router.navigate(['/predicciones']);
        break;

      case EntidadTipo.VENTA:
        // this.router.navigate(['/ventas', notificacion.entidadId]);
        this.router.navigate(['/venta/historial']);
        break;

      default:
        console.warn('Tipo de entidad no reconocido:', notificacion.entidadTipo);
    }
  }

  obtenerIconoNotificacion(tipo: TipoNotificacion): string {
    return obtenerIconoNotificacion(tipo);
  }

  obtenerColorPrioridad(notificacion: DetalleNotificacionResponse): string {
    return obtenerColorPrioridad(notificacion.prioridad);
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const ahora = new Date();
    const diferenciaMilisegundos = ahora.getTime() - date.getTime();
    const diferenciaMinutos = Math.floor(diferenciaMilisegundos / 60000);
    const diferenciaHoras = Math.floor(diferenciaMinutos / 60);
    const diferenciaDias = Math.floor(diferenciaHoras / 24);

    if (diferenciaMinutos < 1) {
      return 'Ahora';
    } else if (diferenciaMinutos < 60) {
      return `Hace ${diferenciaMinutos} min`;
    } else if (diferenciaHoras < 24) {
      return `Hace ${diferenciaHoras} h`;
    } else if (diferenciaDias === 1) {
      return 'Ayer';
    } else if (diferenciaDias < 7) {
      return `Hace ${diferenciaDias} días`;
    } else {
      return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  }
}
