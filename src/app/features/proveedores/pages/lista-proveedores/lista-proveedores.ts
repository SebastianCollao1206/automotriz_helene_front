import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProveedorTable } from '../../components/proveedor-table/proveedor-table';
import { FormsModule } from '@angular/forms';
import { Proveedor } from '../../../../core/services/proveedor/proveedor';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { ProveedorResponse } from '../../../../models/proveedor';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-proveedores',
  imports: [CommonModule, FormsModule, ProveedorTable],
  templateUrl: './lista-proveedores.html',
  styleUrl: './lista-proveedores.css'
})
export class ListaProveedores implements OnInit {

  filtrosVisibles = false;
  cargandoDatos = false;

  proveedores: ProveedorResponse[] = [];
  proveedoresFiltrados: ProveedorResponse[] = [];

  filtroNombre = '';
  filtroRuc = '';
  filtroEstado = '';

  paginaActual = 1;
  itemsPorPagina = 6;
  totalPaginas = 0;

  Math = Math;

  get proveedoresPaginados(): ProveedorResponse[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.proveedoresFiltrados.slice(inicio, fin);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  constructor(
    private proveedorService: Proveedor,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.cargandoDatos = true;

    this.proveedorService.listarTodos()
      .pipe(
        finalize(() => {
          this.cargandoDatos = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (proveedores) => {
          this.proveedores = proveedores || [];
          this.aplicarFiltros();
          this.cdr.detectChanges();
        },
        error: (error) => {
          NotificacionSweet.handleBackendError(error);
        }
      });
  }

  onAgregarProveedor(): void {
    this.router.navigate(['/proveedores/agregar']);
  }

  alternarFiltros(): void {
    this.filtrosVisibles = !this.filtrosVisibles;
  }

  aplicarFiltros(): void {
    this.proveedoresFiltrados = this.proveedores.filter(proveedor => {
      const cumpleNombre = !this.filtroNombre ||
        proveedor.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());

      const cumpleRuc = !this.filtroRuc ||
        proveedor.ruc.includes(this.filtroRuc);

      const cumpleEstado = !this.filtroEstado ||
        proveedor.enabled.toString() === this.filtroEstado;

      return cumpleNombre && cumpleRuc && cumpleEstado;
    });

    this.calcularPaginacion();
    this.ajustarPaginaActual();
    this.cdr.detectChanges();
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroRuc = '';
    this.filtroEstado = '';
    this.aplicarFiltros();
  }

  private calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.proveedoresFiltrados.length / this.itemsPorPagina);
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

  onEditarProveedor(id: number): void {
    this.router.navigate(['/proveedores/editar', id]);
  }

  onCambiarEstado(evento: { id: number; enabled: boolean }): void {
    const proveedor = this.proveedores.find(p => p.id === evento.id);
    if (!proveedor) {
      NotificacionSweet.showError('Error', 'Proveedor no encontrado');
      return;
    }

    const mensajeAccion = evento.enabled ? 'activar' : 'desactivar';

    NotificacionSweet.showConfirmation(
      '¿Estás seguro?',
      `¿Deseas ${mensajeAccion} al proveedor ${proveedor.nombre}?`,
      `Sí, ${mensajeAccion}`,
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.cambiarEstadoProveedor(evento.id, evento.enabled);
      }
    });
  }

  private cambiarEstadoProveedor(id: number, enabled: boolean): void {
    const accion = enabled ? 'Activando' : 'Desactivando';
    NotificacionSweet.showLoading(`${accion} proveedor...`);

    this.proveedorService.cambiarEstado(id, enabled).subscribe({
      next: (proveedorActualizado: ProveedorResponse) => {
        this.actualizarProveedorEnListas(proveedorActualizado);
        this.cdr.detectChanges();
        NotificacionSweet.hideLoading();
        NotificacionSweet.showSuccess(
          '¡Éxito!',
          `Proveedor ${proveedorActualizado.enabled ? 'activado' : 'desactivado'} correctamente`
        );
      },
      error: (error) => {
        NotificacionSweet.hideLoading();
        NotificacionSweet.handleBackendError(error);
      }
    });
  }

  private actualizarProveedorEnListas(proveedorActualizado: ProveedorResponse): void {
    const indiceProveedores = this.proveedores.findIndex(p => p.id === proveedorActualizado.id);
    if (indiceProveedores !== -1) {
      this.proveedores[indiceProveedores] = { ...proveedorActualizado };
    }

    const indiceFiltrados = this.proveedoresFiltrados.findIndex(p => p.id === proveedorActualizado.id);
    if (indiceFiltrados !== -1) {
      this.proveedoresFiltrados[indiceFiltrados] = { ...proveedorActualizado };
    }

    this.calcularPaginacion();
  }

}
