import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { UnidadesMedidaModal } from '../../components/unidades-medida-modal/unidades-medida-modal';
import { UnidadesMedidaTable } from '../../components/unidades-medida-table/unidades-medida-table';
import { UnidadMedida } from '../../../../core/services/unidad-medida/unidad-medida';
import { UnidadMedidaResponse, CrearUnidadMedidaRequest, ActualizarUnidadMedidaRequest } from '../../../../models/unidad-medida';

@Component({
  selector: 'app-lista-unidades-medida',
  imports: [CommonModule, FormsModule, UnidadesMedidaModal, UnidadesMedidaTable],
  templateUrl: './lista-unidades-medida.html',
  styleUrl: './lista-unidades-medida.css'
})
export class ListaUnidadesMedida implements OnInit {

  @ViewChild(UnidadesMedidaModal) modalHijo!: UnidadesMedidaModal;

  filtrosVisibles = false;
  cargandoDatos = false;

  unidadesMedida: UnidadMedidaResponse[] = [];
  unidadesMedidaFiltradas: UnidadMedidaResponse[] = [];

  filtroNombre = '';
  filtroEstado = '';

  paginaActual = 1;
  itemsPorPagina = 6;
  totalPaginas = 0;

  mostrarModal = false;
  modoEdicion = false;
  unidadMedidaSeleccionada?: UnidadMedidaResponse;

  Math = Math;

  get unidadesMedidaPaginadas(): UnidadMedidaResponse[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.unidadesMedidaFiltradas.slice(inicio, fin);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  constructor(
    private unidadMedidaService: UnidadMedida,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarUnidadesMedida();
  }

  private cargarUnidadesMedida(): void {
    this.cargandoDatos = true;

    this.unidadMedidaService.listarTodos()
      .pipe(
        finalize(() => {
          this.cargandoDatos = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (unidadesMedida) => {
          this.unidadesMedida = unidadesMedida || [];
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
    this.unidadesMedidaFiltradas = this.unidadesMedida.filter(unidad => {
      const cumpleNombre = !this.filtroNombre ||
        unidad.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());

      const cumpleEstado = !this.filtroEstado ||
        unidad.enabled.toString() === this.filtroEstado;

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
    this.totalPaginas = Math.ceil(this.unidadesMedidaFiltradas.length / this.itemsPorPagina);
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
    this.unidadMedidaSeleccionada = undefined;
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  abrirModalEditar(unidad: UnidadMedidaResponse): void {
    this.modoEdicion = true;
    this.unidadMedidaSeleccionada = unidad;
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.modoEdicion = false;
    this.unidadMedidaSeleccionada = undefined;
    this.cdr.detectChanges();
  }

  onEditarUnidadMedida(unidad: UnidadMedidaResponse): void {
    this.abrirModalEditar(unidad);
  }

  onGuardarUnidadMedida(evento: { data: CrearUnidadMedidaRequest | ActualizarUnidadMedidaRequest, id?: number }): void {
    if (this.modoEdicion && evento.id) {
      this.actualizarUnidadMedida(evento.id, evento.data as ActualizarUnidadMedidaRequest);
    } else {
      this.crearUnidadMedida(evento.data as CrearUnidadMedidaRequest);
    }
  }

  private crearUnidadMedida(request: CrearUnidadMedidaRequest): void {
    NotificacionSweet.showLoading('Creando unidad de medida...');

    this.unidadMedidaService.crear(request)
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
            `Unidad de medida "${response.nombre}" creada correctamente`
          );
          this.cerrarModal();
          setTimeout(() => {
            this.cargarUnidadesMedida();
          }, 100);
        },
        error: (error) => {
          console.error('Error al crear unidad de medida:', error);
        }
      });
  }

  private actualizarUnidadMedida(id: number, request: ActualizarUnidadMedidaRequest): void {
    NotificacionSweet.showLoading('Actualizando unidad de medida...');

    this.unidadMedidaService.actualizar(id, request)
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
            `Unidad de medida "${response.nombre}" actualizada correctamente`
          );
          this.cerrarModal();
          setTimeout(() => {
            this.cargarUnidadesMedida();
          }, 100);
        },
        error: (error) => {
          console.error('Error al actualizar unidad de medida:', error);
        }
      });
  }

  onCambiarEstado(evento: { id: number; enabled: boolean }): void {
    const unidad = this.unidadesMedida.find(u => u.id === evento.id);
    if (!unidad) {
      NotificacionSweet.showError('Error', 'Unidad de medida no encontrada');
      return;
    }

    const mensajeAccion = evento.enabled ? 'activar' : 'desactivar';

    NotificacionSweet.showConfirmation(
      '¿Estás seguro?',
      `¿Deseas ${mensajeAccion} la unidad de medida "${unidad.nombre}"?`,
      `Sí, ${mensajeAccion}`,
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.cambiarEstadoUnidadMedida(evento.id, evento.enabled);
      }
    });
  }

  private cambiarEstadoUnidadMedida(id: number, enabled: boolean): void {
    const accion = enabled ? 'Activando' : 'Desactivando';
    NotificacionSweet.showLoading(`${accion} unidad de medida...`);

    this.unidadMedidaService.cambiarEstado(id, enabled).subscribe({
      next: (unidadActualizada: UnidadMedidaResponse) => {
        this.actualizarUnidadMedidaEnListas(unidadActualizada);
        this.cdr.detectChanges();
        NotificacionSweet.hideLoading();
        NotificacionSweet.showSuccess(
          '¡Éxito!',
          `Unidad de medida ${unidadActualizada.enabled ? 'activada' : 'desactivada'} correctamente`
        );
      },
      error: (error) => {
        NotificacionSweet.hideLoading();
        NotificacionSweet.handleBackendError(error);
      }
    });
  }

  private actualizarUnidadMedidaEnListas(unidadActualizada: UnidadMedidaResponse): void {
    const indice = this.unidadesMedida.findIndex(u => u.id === unidadActualizada.id);
    if (indice !== -1) {
      this.unidadesMedida[indice] = { ...unidadActualizada };
    }

    const indiceFiltradas = this.unidadesMedidaFiltradas.findIndex(u => u.id === unidadActualizada.id);
    if (indiceFiltradas !== -1) {
      this.unidadesMedidaFiltradas[indiceFiltradas] = { ...unidadActualizada };
    }

    this.calcularPaginacion();
  }

}
