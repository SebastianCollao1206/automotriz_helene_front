import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TipoProductoModal } from '../../components/tipo-producto-modal/tipo-producto-modal';
import { TipoProductoTable } from '../../components/tipo-producto-table/tipo-producto-table';
import { TipoProducto } from '../../../../core/services/tipo-producto/tipo-producto';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { TipoProductoResponse, CrearTipoProductoRequest, ActualizarTipoProductoRequest } from '../../../../models/tipo-producto';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-lista-tipo-producto',
  imports: [CommonModule, FormsModule, TipoProductoModal, TipoProductoTable],
  templateUrl: './lista-tipo-producto.html',
  styleUrl: './lista-tipo-producto.css'
})
export class ListaTipoProducto implements OnInit{

  @ViewChild(TipoProductoModal) modalHijo!: TipoProductoModal;

  filtrosVisibles = false;
  cargandoDatos = false;

  tiposProducto: TipoProductoResponse[] = [];
  tiposProductoFiltrados: TipoProductoResponse[] = [];

  filtroNombre = '';
  filtroEstado = '';

  paginaActual = 1;
  itemsPorPagina = 6;
  totalPaginas = 0;

  mostrarModal = false;
  modoEdicion = false;
  tipoProductoSeleccionado?: TipoProductoResponse;

  Math = Math;

  get tiposProductoPaginados(): TipoProductoResponse[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.tiposProductoFiltrados.slice(inicio, fin);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  constructor(
    private tipoProductoService: TipoProducto,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarTiposProducto();
  }

  private cargarTiposProducto(): void {
    this.cargandoDatos = true;

    this.tipoProductoService.listarTodos()
      .pipe(
        finalize(() => {
          this.cargandoDatos = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (tiposProducto) => {
          this.tiposProducto = tiposProducto || [];
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
    this.tiposProductoFiltrados = this.tiposProducto.filter(tipoProducto => {
      const cumpleNombre = !this.filtroNombre ||
        tipoProducto.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());

      const cumpleEstado = !this.filtroEstado ||
        tipoProducto.enabled.toString() === this.filtroEstado;

      return cumpleNombre && cumpleEstado;
    });

    this.calcularPaginacion();
    this.ajustarPaginaActual();
    this.cdr.detectChanges();
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroEstado = '';
    this.aplicarFiltros();
  }

  private calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.tiposProductoFiltrados.length / this.itemsPorPagina);
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

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.tipoProductoSeleccionado = undefined;
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  abrirModalEditar(tipoProducto: TipoProductoResponse): void {
    this.modoEdicion = true;
    this.tipoProductoSeleccionado = tipoProducto;
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.modoEdicion = false;
    this.tipoProductoSeleccionado = undefined;
    this.cdr.detectChanges();
  }

  onEditarTipoProducto(tipoProducto: TipoProductoResponse): void {
    this.abrirModalEditar(tipoProducto);
  }

  onGuardarTipoProducto(evento: { data: CrearTipoProductoRequest | ActualizarTipoProductoRequest, id?: number }): void {
    if (this.modoEdicion && evento.id) {
      this.actualizarTipoProducto(evento.id, evento.data as ActualizarTipoProductoRequest);
    } else {
      this.crearTipoProducto(evento.data as CrearTipoProductoRequest);
    }
  }

  private crearTipoProducto(request: CrearTipoProductoRequest): void {
    NotificacionSweet.showLoading('Creando tipo de producto...');

    this.tipoProductoService.crear(request)
      .pipe(
        finalize(() => {
          this.modalHijo?.restablecerEstadoEnvio();
        })
      )
      .subscribe({
        next: (response) => {
          NotificacionSweet.hideLoading();
          NotificacionSweet.showSuccess(
            '¡Éxito!',
            `Tipo de producto "${response.nombre}" creado correctamente`
          );
          this.cerrarModal();
          setTimeout(() => {
            this.cargarTiposProducto();
          }, 100);
        },
        error: (error) => {
          console.error('Error al crear tipo de producto:', error);
        }
      });
  }

  private actualizarTipoProducto(id: number, request: ActualizarTipoProductoRequest): void {
    NotificacionSweet.showLoading('Actualizando tipo de producto...');

    this.tipoProductoService.actualizar(id, request)
      .pipe(
        finalize(() => {
          this.modalHijo?.restablecerEstadoEnvio();
        })
      )
      .subscribe({
        next: (response) => {
          NotificacionSweet.hideLoading();
          NotificacionSweet.showSuccess(
            '¡Éxito!',
            `Tipo de producto "${response.nombre}" actualizado correctamente`
          );
          this.cerrarModal();
          setTimeout(() => {
            this.cargarTiposProducto();
          }, 100);
        },
        error: (error) => {
          console.error('Error al actualizar tipo de producto:', error);
        }
      });
  }

  onCambiarEstado(evento: { id: number; enabled: boolean }): void {
    const tipoProducto = this.tiposProducto.find(c => c.id === evento.id);
    if (!tipoProducto) {
      NotificacionSweet.showError('Error', 'Tipo de producto no encontrado');
      return;
    }

    const mensajeAccion = evento.enabled ? 'activar' : 'desactivar';

    NotificacionSweet.showConfirmation(
      '¿Estás seguro?',
      `¿Deseas ${mensajeAccion} el tipo de producto "${tipoProducto.nombre}"?`,
      `Sí, ${mensajeAccion}`,
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.cambiarEstadoTipoProducto(evento.id, evento.enabled);
      }
    });
  }

  private cambiarEstadoTipoProducto(id: number, enabled: boolean): void {
    const accion = enabled ? 'Activando' : 'Desactivando';
    NotificacionSweet.showLoading(`${accion} tipo de producto...`);

    this.tipoProductoService.cambiarEstado(id, enabled).subscribe({
      next: (tipoProductoActualizado: TipoProductoResponse) => {
        this.actualizarTipoProductoEnListas(tipoProductoActualizado);
        this.cdr.detectChanges();
        NotificacionSweet.hideLoading();
        NotificacionSweet.showSuccess(
          '¡Éxito!',
          `Tipo de producto ${tipoProductoActualizado.enabled ? 'activado' : 'desactivado'} correctamente`
        );
      },
      error: (error) => {
        NotificacionSweet.hideLoading();
        NotificacionSweet.handleBackendError(error);
      }
    });
  }

  private actualizarTipoProductoEnListas(tipoProductoActualizado: TipoProductoResponse): void {
    const indiceTipos = this.tiposProducto.findIndex(c => c.id === tipoProductoActualizado.id);
    if (indiceTipos !== -1) {
      this.tiposProducto[indiceTipos] = { ...tipoProductoActualizado };
    }

    const indiceFiltradas = this.tiposProductoFiltrados.findIndex(c => c.id === tipoProductoActualizado.id);
    if (indiceFiltradas !== -1) {
      this.tiposProductoFiltrados[indiceFiltradas] = { ...tipoProductoActualizado };
    }

    this.calcularPaginacion();
  }

}
