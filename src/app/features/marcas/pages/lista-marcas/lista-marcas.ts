import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { MarcasModal } from '../../components/marcas-modal/marcas-modal';
import { MarcasTable } from '../../components/marcas-table/marcas-table';
import { Marca } from '../../../../core/services/marca/marca';
import { MarcaResponse, CrearMarcaRequest, ActualizarMarcaRequest } from '../../../../models/marca';

@Component({
  selector: 'app-lista-marcas',
  imports: [CommonModule, FormsModule, MarcasModal, MarcasTable],
  templateUrl: './lista-marcas.html',
  styleUrl: './lista-marcas.css'
})
export class ListaMarcas implements OnInit {

  @ViewChild(MarcasModal) modalHijo!: MarcasModal;

  filtrosVisibles = false;
  cargandoDatos = false;

  marcas: MarcaResponse[] = [];
  marcasFiltradas: MarcaResponse[] = [];

  filtroNombre = '';
  filtroEstado = '';

  paginaActual = 1;
  itemsPorPagina = 6;
  totalPaginas = 0;

  mostrarModal = false;
  modoEdicion = false;
  marcaSeleccionada?: MarcaResponse;

  Math = Math;

  get marcasPaginadas(): MarcaResponse[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.marcasFiltradas.slice(inicio, fin);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  constructor(
    private marcaService: Marca,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarMarcas();
  }

  private cargarMarcas(): void {
    this.cargandoDatos = true;

    this.marcaService.listarTodos()
      .pipe(
        finalize(() => {
          this.cargandoDatos = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (marcas) => {
          this.marcas = marcas || [];
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
    this.marcasFiltradas = this.marcas.filter(marca => {
      const cumpleNombre = !this.filtroNombre ||
        marca.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());

      const cumpleEstado = !this.filtroEstado ||
        marca.enabled.toString() === this.filtroEstado;

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
    this.totalPaginas = Math.ceil(this.marcasFiltradas.length / this.itemsPorPagina);
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
    this.marcaSeleccionada = undefined;
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  abrirModalEditar(marca: MarcaResponse): void {
    this.modoEdicion = true;
    this.marcaSeleccionada = marca;
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.modoEdicion = false;
    this.marcaSeleccionada = undefined;
    this.cdr.detectChanges();
  }

  onEditarMarca(marca: MarcaResponse): void {
    this.abrirModalEditar(marca);
  }

  onGuardarMarca(evento: { data: CrearMarcaRequest | ActualizarMarcaRequest, id?: number }): void {
    if (this.modoEdicion && evento.id) {
      this.actualizarMarca(evento.id, evento.data as ActualizarMarcaRequest);
    } else {
      this.crearMarca(evento.data as CrearMarcaRequest);
    }
  }

  private crearMarca(request: CrearMarcaRequest): void {
    NotificacionSweet.showLoading('Creando marca...');

    this.marcaService.crear(request)
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
            `Marca "${response.nombre}" creada correctamente`
          );
          this.cerrarModal();
          setTimeout(() => {
            this.cargarMarcas();
          }, 100);
        },
        error: (error) => {
          console.error('Error al crear marca:', error);
        }
      });
  }

  private actualizarMarca(id: number, request: ActualizarMarcaRequest): void {
    NotificacionSweet.showLoading('Actualizando marca...');

    this.marcaService.actualizar(id, request)
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
            `Marca "${response.nombre}" actualizada correctamente`
          );
          this.cerrarModal();
          setTimeout(() => {
            this.cargarMarcas();
          }, 100);
        },
        error: (error) => {
          console.error('Error al actualizar marca:', error);
        }
      });
  }

  onCambiarEstado(evento: { id: number; enabled: boolean }): void {
    const marca = this.marcas.find(m => m.id === evento.id);
    if (!marca) {
      NotificacionSweet.showError('Error', 'Marca no encontrada');
      return;
    }

    const mensajeAccion = evento.enabled ? 'activar' : 'desactivar';

    NotificacionSweet.showConfirmation(
      '¿Estás seguro?',
      `¿Deseas ${mensajeAccion} la marca "${marca.nombre}"?`,
      `Sí, ${mensajeAccion}`,
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.cambiarEstadoMarca(evento.id, evento.enabled);
      }
    });
  }

  private cambiarEstadoMarca(id: number, enabled: boolean): void {
    const accion = enabled ? 'Activando' : 'Desactivando';
    NotificacionSweet.showLoading(`${accion} marca...`);

    this.marcaService.cambiarEstado(id, enabled).subscribe({
      next: (marcaActualizada: MarcaResponse) => {
        this.actualizarMarcaEnListas(marcaActualizada);
        this.cdr.detectChanges();
        NotificacionSweet.hideLoading();
        NotificacionSweet.showSuccess(
          '¡Éxito!',
          `Marca ${marcaActualizada.enabled ? 'activada' : 'desactivada'} correctamente`
        );
      },
      error: (error) => {
        NotificacionSweet.hideLoading();
        NotificacionSweet.handleBackendError(error);
      }
    });
  }

  private actualizarMarcaEnListas(marcaActualizada: MarcaResponse): void {
    const indiceMarcas = this.marcas.findIndex(m => m.id === marcaActualizada.id);
    if (indiceMarcas !== -1) {
      this.marcas[indiceMarcas] = { ...marcaActualizada };
    }

    const indiceFiltradas = this.marcasFiltradas.findIndex(m => m.id === marcaActualizada.id);
    if (indiceFiltradas !== -1) {
      this.marcasFiltradas[indiceFiltradas] = { ...marcaActualizada };
    }

    this.calcularPaginacion();
  }

}
