import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersTable } from '../../components/users-table/users-table';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../core/services/user/user';
import { Role } from '../../../../core/services/role/role';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { UserResponse } from '../../../../models/user';
import { RoleModel } from '../../../../models/role';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { ROLE_NAMES } from '../../../../core/constants/roles-constants';
import { Router } from '@angular/router';
import { FormDataLoader } from '../../../../core/services/loaders/form-data-loader';
import { Paginacion, ResultadoPaginacion } from '../../../../core/services/paginacion/paginacion';

@Component({
  selector: 'app-lista-usuarios',
  imports: [CommonModule, FormsModule, UsersTable],
  templateUrl: './lista-usuarios.html',
  styleUrl: './lista-usuarios.css'
})
export class ListaUsuarios implements OnInit {

  filtrosVisibles = false;
  cargandoDatos = false;

  usuarios: UserResponse[] = [];
  usuariosFiltrados: UserResponse[] = [];
  roles: RoleModel[] = [];

  filtroNombre = '';
  filtroEstado = '';
  filtroRol = '';

  paginaActual = 1;
  itemsPorPagina = 6;
  totalPaginas = 0;

  Math = Math;

  get usuariosPaginados(): UserResponse[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.usuariosFiltrados.slice(inicio, fin);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  constructor(
    private userService: User,
    private formDataLoader: FormDataLoader,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.cargandoDatos = true;

    forkJoin({
      usuarios: this.userService.listarTodos(),
      roles: this.formDataLoader.cargarRoles()
    })
      .pipe(
        finalize(() => {
          this.cargandoDatos = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: ({ usuarios, roles }) => {
          this.usuarios = usuarios || [];
          this.roles = roles || [];
          this.aplicarFiltros();
          this.cdr.detectChanges();
        },
        error: (error) => {
          NotificacionSweet.handleBackendError(error);
        }
      });
  }

  alternarFiltros(): void {
    this.filtrosVisibles = !this.filtrosVisibles;
  }

  aplicarFiltros(): void {
    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      const cumpleNombre = !this.filtroNombre ||
        usuario.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());

      const cumpleEstado = !this.filtroEstado ||
        usuario.enabled.toString() === this.filtroEstado;

      const cumpleRol = !this.filtroRol ||
        usuario.roles.includes(this.filtroRol);

      return cumpleNombre && cumpleEstado && cumpleRol;
    });

    this.calcularPaginacion();
    this.ajustarPaginaActual();
    this.cdr.detectChanges();
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroEstado = '';
    this.filtroRol = '';
    this.aplicarFiltros();
  }

  private calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.usuariosFiltrados.length / this.itemsPorPagina);
  }

  private ajustarPaginaActual(): void {
    if (this.paginaActual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaActual = this.totalPaginas;
    } else if (this.totalPaginas === 0) {
      this.paginaActual = 1;
    }
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.cdr.detectChanges();
    }
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.cambiarPagina(this.paginaActual - 1);
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.cambiarPagina(this.paginaActual + 1);
    }
  }

  onEditarUsuario(id: number): void {
    this.router.navigate(['/usuario/editar', id]);
  }

  onCambiarEstado(evento: { id: number; enabled: boolean }): void {
    const usuario = this.usuarios.find(u => u.id === evento.id);
    if (!usuario) {
      NotificacionSweet.showError('Error', 'Usuario no encontrado');
      return;
    }

    const mensajeAccion = evento.enabled ? 'activar' : 'desactivar';

    NotificacionSweet.showConfirmation(
      '¿Estás seguro?',
      `¿Deseas ${mensajeAccion} al usuario ${usuario.nombre}?`,
      `Sí, ${mensajeAccion}`,
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.cambiarEstadoUsuario(evento.id, evento.enabled);
      }
    });
  }

  private cambiarEstadoUsuario(id: number, enabled: boolean): void {
    const accion = enabled ? 'Activando' : 'Desactivando';
    NotificacionSweet.showLoading(`${accion} usuario...`);

    this.userService.cambiarEstado(id, enabled).subscribe({
      next: (usuarioActualizado: UserResponse) => {
        this.actualizarUsuarioEnListas(usuarioActualizado);
        this.cdr.detectChanges();
        NotificacionSweet.hideLoading();
        NotificacionSweet.showSuccess(
          '¡Éxito!',
          `Usuario ${usuarioActualizado.enabled ? 'activado' : 'desactivado'} correctamente`
        );
      },
      error: (error) => {
        NotificacionSweet.hideLoading();
        NotificacionSweet.handleBackendError(error);
      }
    });
  }

  private actualizarUsuarioEnListas(usuarioActualizado: UserResponse): void {
    const indiceUsuarios = this.usuarios.findIndex(u => u.id === usuarioActualizado.id);
    if (indiceUsuarios !== -1) {
      this.usuarios[indiceUsuarios] = { ...usuarioActualizado };
    }

    const indiceFiltrados = this.usuariosFiltrados.findIndex(u => u.id === usuarioActualizado.id);
    if (indiceFiltrados !== -1) {
      this.usuariosFiltrados[indiceFiltrados] = { ...usuarioActualizado };
    }

    this.calcularPaginacion();
  }

  getRoleName(role: string): string {
    return ROLE_NAMES[role] || role.replace('ROLE_', '');
  }
}
