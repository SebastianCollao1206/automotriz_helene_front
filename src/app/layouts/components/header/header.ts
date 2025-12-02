import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth-service';
import { Subscription } from 'rxjs';
import { Carrito } from '../../../core/services/carrito/carrito';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
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

  private subscriptions: Subscription[] = [];

  constructor(private authService: AuthService,
    private carritoService: Carrito,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarDatosUsuario();

    const sub = this.authService.usuarioActual$.subscribe(() => {
      this.cargarDatosUsuario();
    });
    this.subscriptions.push(sub);

    const carritoSub = this.carritoService.items$.subscribe(items => {
      this.itemsCarrito = items;
      this.cantidadItemsCarrito = this.carritoService.obtenerCantidadTotal();
    });
    this.subscriptions.push(carritoSub);
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

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    if (this.isNotificationsOpen) {
      this.isLogoutOpen = false;
    }
  }

  closeNotifications() {
    this.isNotificationsOpen = false;
  }

  toggleLogout() {
    this.isLogoutOpen = !this.isLogoutOpen;
    if (this.isLogoutOpen) {
      this.isNotificationsOpen = false;
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
}
