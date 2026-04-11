import { Component, Injectable, Input, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth-service';
import { Subscription, filter } from 'rxjs';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  baseRoute: string;
  visible: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit, OnDestroy {

  @Input() collapsed = false;
  @Input() showCloseButton = false;
  @Output() close = new EventEmitter<void>();

  nombreCompleto: string = '';
  rolPrincipal: string = '';
  imagenUsuario: string = '';

  menuItems: MenuItem[] = [];
  rutaActual: string = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.configurarMenuItems();
    this.detectarRutaActual();

    const routeSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.detectarRutaActual();
      });
    this.subscriptions.push(routeSub);

    const userSub = this.authService.usuarioActual$.subscribe(() => {
      this.cargarDatosUsuario();
      this.configurarMenuItems();
    });
    this.subscriptions.push(userSub);
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

  configurarMenuItems(): void {
    const items: MenuItem[] = [];

    // Productos - GERENTE o ADMIN
    if (this.authService.puedeGestionarProductos()) {
      items.push({
        label: 'Productos',
        icon: 'fas fa-box',
        route: '/productos',
        baseRoute: 'productos',
        visible: true
      });
    }

    // Usuarios - Solo GERENTE
    if (this.authService.puedeGestionarUsuarios()) {
      items.push({
        label: 'Usuarios',
        icon: 'fas fa-users',
        route: '/usuarios',
        baseRoute: 'usuarios',
        visible: true
      });
    }

    // Categorías, Marcas, Tipos, Unidades - Solo ADMIN
    if (this.authService.puedeGestionarCategorias()) {
      items.push(
        {
          label: 'Categorías',
          icon: 'fas fa-tags',
          route: '/categorias',
          baseRoute: 'categorias',
          visible: true
        },
        {
          label: 'Marcas',
          icon: 'fas fa-trademark',
          route: '/marcas',
          baseRoute: 'marcas',
          visible: true
        },
        {
          label: 'Variantes',
          icon: 'fas fa-list',
          route: '/tipos-producto',
          baseRoute: 'tipos-producto',
          visible: true
        },
        {
          label: 'Medidas',
          icon: 'fas fa-ruler',
          route: '/unidades-medida',
          baseRoute: 'unidades-medida',
          visible: true
        }
      );
    }

    // Proveedores - GERENTE o ADMIN
    if (this.authService.puedeGestionarProveedores()) {
      items.push({
        label: 'Proveedores',
        icon: 'fas fa-truck',
        route: '/proveedores',
        baseRoute: 'proveedores',
        visible: true
      });
    }

    // Asistencia - Solo GERENTE
    if (this.authService.puedeVerAsistencia()) {
      items.push(
        {
          label: 'Asistencia',
          icon: 'fas fa-calendar-check',
          route: '/asistencia/diaria',
          baseRoute: 'asistencia',
          visible: true
        },
      );
    }

    // Pedidos - GERENTE, ADMIN o SELLER
    if (this.authService.puedeVerPedidos()) {
      items.push({
        label: 'Pedidos',
        icon: 'fas fa-box-open',
        route: '/pedidos',
        baseRoute: 'pedidos',
        visible: true
      });
    }

    // Predicciones - GERENTE o ADMIN
    if (this.authService.puedeVerPredicciones()) {
      items.push({
        label: 'Predicciones',
        icon: 'fas fa-chart-line',
        route: '/predicciones',
        baseRoute: 'predicciones',
        visible: true
      });
    }

    //VENTAS - SOLO VENDEDOR
    if (this.authService.puedeRealizarVentas()) {
      items.push({
        label: 'Punto de Venta',
        icon: 'fas fa-shopping-cart',
        route: '/venta',
        baseRoute: 'venta',
        visible: true
      });
    }

    // Historial de Ventas - GERENTE, ADMIN o SELLER
    if (this.authService.puedeVerHistorialVentas()) {
      items.push({
        label: 'Ventas',
        icon: 'fas fa-file-invoice-dollar',
        route: '/ventas/historial',
        baseRoute: 'ventas',
        visible: true
      });
    }

    // Dashboard - Solo GERENTE
    if (this.authService.puedeVerDashboard()) {
      items.push({
        label: 'Dashboard',
        icon: 'fas fa-chart-line',
        route: '/dashboard',
        baseRoute: 'dashboard',
        visible: true
      });
    }

    this.menuItems = items;
  }

  detectarRutaActual(): void {
    this.rutaActual = this.router.url;
  }

  isRouteActive(baseRoute: string): boolean {
    return this.rutaActual.includes(`/${baseRoute}`);
  }

  onClose(): void {
    this.close.emit();
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

}
