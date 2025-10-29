import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth-service';
import { Subscription } from 'rxjs';

interface AccesoRapido {
  titulo: string;
  descripcion: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-bienvenida',
  imports: [CommonModule, RouterModule],
  templateUrl: './bienvenida.html',
  styleUrl: './bienvenida.css'
})
export class Bienvenida implements OnInit, OnDestroy {

  nombreUsuario: string = '';
  rolPrincipal: string = '';
  imagenUsuario: string = '';
  fechaActual: string = '';
  horaActual: string = '';

  accesosRapidos: AccesoRapido[] = [];

  private intervaloHora?: any;
  private subscriptions: Subscription[] = [];

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.configurarAccesosRapidos();
    this.actualizarFechaHora();

    // Actualizar hora cada minuto
    this.intervaloHora = setInterval(() => {
      this.actualizarFechaHora();
    }, 60000);

    const sub = this.authService.usuarioActual$.subscribe(() => {
      this.cargarDatosUsuario();
      this.configurarAccesosRapidos();
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    if (this.intervaloHora) {
      clearInterval(this.intervaloHora);
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarDatosUsuario(): void {
    this.nombreUsuario = this.authService.obtenerNombreUsuario();
    this.rolPrincipal = this.authService.obtenerRolPrincipal();

    const usuario = this.authService.obtenerUsuarioActual();
    this.imagenUsuario = usuario?.imagenOriginal ||
      'https://www.pngkey.com/png/full/12-123249_teacher-teacher-login.png';
  }

  configurarAccesosRapidos(): void {
    const accesos: AccesoRapido[] = [];

    if (this.authService.puedeGestionarProductos()) {
      accesos.push({
        titulo: 'Productos',
        descripcion: 'Gestionar inventario de productos',
        icon: 'fas fa-box',
        route: '/productos'
      });
    }

    if (this.authService.puedeGestionarUsuarios()) {
      accesos.push({
        titulo: 'Usuarios',
        descripcion: 'Administrar usuarios del sistema',
        icon: 'fas fa-users',
        route: '/usuarios'
      });
    }

    if (this.authService.puedeGestionarProveedores()) {
      accesos.push({
        titulo: 'Proveedores',
        descripcion: 'Gestionar proveedores',
        icon: 'fas fa-truck',
        route: '/proveedores'
      });
    }

    if (this.authService.puedeGestionarCategorias()) {
      accesos.push({
        titulo: 'Categorías',
        descripcion: 'Administrar categorías',
        icon: 'fas fa-tags',
        route: '/categorias'
      });
      accesos.push({
        titulo: 'Marcas',
        descripcion: 'Gestionar marcas',
        icon: 'fas fa-trademark',
        route: '/marcas'
      });
    }

    if (this.authService.puedeVerAsistencia()) {
      accesos.push({
        titulo: 'Asistencia',
        descripcion: 'Ver registros de asistencia',
        icon: 'fas fa-calendar-check',
        route: '/asistencia/diaria'
      });
    }

    this.accesosRapidos = accesos;
  }

  actualizarFechaHora(): void {
    const ahora = new Date();

    this.fechaActual = ahora.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    this.horaActual = ahora.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

}
