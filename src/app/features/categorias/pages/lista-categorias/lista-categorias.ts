import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriasTable } from '../../components/categorias-table/categorias-table';
import { CategoriasModal } from '../../components/categorias-modal/categorias-modal';
import { Categoria } from '../../../../core/services/categoria/categoria';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { CategoriaResponse, CrearCategoriaRequest, ActualizarCategoriaRequest } from '../../../../models/categoria';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-lista-categorias',
  imports: [CommonModule, FormsModule, CategoriasTable, CategoriasModal],
  templateUrl: './lista-categorias.html',
  styleUrl: './lista-categorias.css'
})
export class ListaCategorias implements OnInit {

  @ViewChild(CategoriasModal) modalHijo!: CategoriasModal;

  filtrosVisibles = false;
  cargandoDatos = false;

  categorias: CategoriaResponse[] = [];
  categoriasFiltradas: CategoriaResponse[] = [];

  filtroNombre = '';
  filtroEstado = '';

  paginaActual = 1;
  itemsPorPagina = 6;
  totalPaginas = 0;

  mostrarModal = false;
  modoEdicion = false;
  categoriaSeleccionada?: CategoriaResponse;

  Math = Math;

  get categoriasPaginadas(): CategoriaResponse[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.categoriasFiltradas.slice(inicio, fin);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  constructor(
    private categoriaService: Categoria,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  private cargarCategorias(): void {
    this.cargandoDatos = true;

    this.categoriaService.listarTodos()
      .pipe(
        finalize(() => {
          this.cargandoDatos = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (categorias) => {
          this.categorias = categorias || [];
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
    this.categoriasFiltradas = this.categorias.filter(categoria => {
      const cumpleNombre = !this.filtroNombre ||
        categoria.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());

      const cumpleEstado = !this.filtroEstado ||
        categoria.enabled.toString() === this.filtroEstado;

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
    this.totalPaginas = Math.ceil(this.categoriasFiltradas.length / this.itemsPorPagina);
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
    this.categoriaSeleccionada = undefined;
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  abrirModalEditar(categoria: CategoriaResponse): void {
    this.modoEdicion = true;
    this.categoriaSeleccionada = categoria;
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.modoEdicion = false;
    this.categoriaSeleccionada = undefined;
    this.cdr.detectChanges();
  }

  onEditarCategoria(categoria: CategoriaResponse): void {
    this.abrirModalEditar(categoria);
  }

  onGuardarCategoria(evento: { data: CrearCategoriaRequest | ActualizarCategoriaRequest, id?: number }): void {
    if (this.modoEdicion && evento.id) {
      this.actualizarCategoria(evento.id, evento.data as ActualizarCategoriaRequest);
    } else {
      this.crearCategoria(evento.data as CrearCategoriaRequest);
    }
  }

  private crearCategoria(request: CrearCategoriaRequest): void {
    NotificacionSweet.showLoading('Creando categoría...');

    this.categoriaService.crear(request)
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
            `Categoría "${response.nombre}" creada correctamente`
          );
          this.cerrarModal();
          setTimeout(() => {
            this.cargarCategorias();
          }, 100);
        },
        error: (error) => {
          console.error('Error al crear categoría:', error);
        }
      });
  }

  private actualizarCategoria(id: number, request: ActualizarCategoriaRequest): void {
    NotificacionSweet.showLoading('Actualizando categoría...');

    this.categoriaService.actualizar(id, request)
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
            `Categoría "${response.nombre}" actualizada correctamente`
          );
          this.cerrarModal();
          setTimeout(() => {
            this.cargarCategorias();
          }, 100);
        },
        error: (error) => {
          console.error('Error al actualizar categoría:', error);
        }
      });
  }

  onCambiarEstado(evento: { id: number; enabled: boolean }): void {
    const categoria = this.categorias.find(c => c.id === evento.id);
    if (!categoria) {
      NotificacionSweet.showError('Error', 'Categoría no encontrada');
      return;
    }

    const mensajeAccion = evento.enabled ? 'activar' : 'desactivar';

    NotificacionSweet.showConfirmation(
      '¿Estás seguro?',
      `¿Deseas ${mensajeAccion} la categoría "${categoria.nombre}"?`,
      `Sí, ${mensajeAccion}`,
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.cambiarEstadoCategoria(evento.id, evento.enabled);
      }
    });
  }

  private cambiarEstadoCategoria(id: number, enabled: boolean): void {
    const accion = enabled ? 'Activando' : 'Desactivando';
    NotificacionSweet.showLoading(`${accion} categoría...`);

    this.categoriaService.cambiarEstado(id, enabled).subscribe({
      next: (categoriaActualizada: CategoriaResponse) => {
        this.actualizarCategoriaEnListas(categoriaActualizada);
        this.cdr.detectChanges();
        NotificacionSweet.hideLoading();
        NotificacionSweet.showSuccess(
          '¡Éxito!',
          `Categoría ${categoriaActualizada.enabled ? 'activada' : 'desactivada'} correctamente`
        );
      },
      error: (error) => {
        NotificacionSweet.hideLoading();
        NotificacionSweet.handleBackendError(error);
      }
    });
  }

  private actualizarCategoriaEnListas(categoriaActualizada: CategoriaResponse): void {
    const indiceCategorias = this.categorias.findIndex(c => c.id === categoriaActualizada.id);
    if (indiceCategorias !== -1) {
      this.categorias[indiceCategorias] = { ...categoriaActualizada };
    }

    const indiceFiltradas = this.categoriasFiltradas.findIndex(c => c.id === categoriaActualizada.id);
    if (indiceFiltradas !== -1) {
      this.categoriasFiltradas[indiceFiltradas] = { ...categoriaActualizada };
    }

    this.calcularPaginacion();
  }

}
