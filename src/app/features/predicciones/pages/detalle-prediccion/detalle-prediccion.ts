import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetallePrediccionTable } from '../../components/detalle-prediccion-table/detalle-prediccion-table';
import { GraficoPediccionProducto } from '../../components/grafico-pediccion-producto/grafico-pediccion-producto';
import { FormsModule } from '@angular/forms';
import { Prediccion } from '../../../../core/services/prediccion/prediccion';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { PrediccionResponse, DetallePrediccionResponse, AccionPrediccion } from '../../../../models/prediccion';
import { AccionPrediccionLabels } from '../../../../core/constants/prediccion-constants';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { GraficoPrediccionGeneral } from '../../components/grafico-prediccion-general/grafico-prediccion-general';
import { GraficoProductosCriticos } from '../../components/grafico-productos-criticos/grafico-productos-criticos';
import { construirNombreProducto } from '../../../../shared/utils/producto-nombre';

interface PrediccionConMetadatos extends PrediccionResponse {
  trimestre: string;
  anio: number;
  diasPeriodo: number;
  tituloFormateado: string;
}

@Component({
  selector: 'app-detalle-prediccion',
  imports: [CommonModule, FormsModule, DetallePrediccionTable, GraficoPediccionProducto, GraficoPrediccionGeneral, GraficoProductosCriticos],
  templateUrl: './detalle-prediccion.html',
  styleUrl: './detalle-prediccion.css'
})
export class DetallePrediccion implements OnInit {

  filtrosVisibles = false;
  cargandoDatos = false;

  prediccion: PrediccionConMetadatos | null = null;
  productosFiltrados: DetallePrediccionResponse[] = [];

  filtroNombre = '';
  filtroCategoria = '';
  filtroAccion = '';

  categoriasDisponibles: string[] = [];
  accionesDisponibles: { valor: string; label: string }[] = [];

  paginaActual = 1;
  itemsPorPagina = 8;
  totalPaginas = 0;

  modalGraficoVisible = false;
  productoIdSeleccionado: number | null = null;
  productoNombreSeleccionado = '';

  Math = Math;

  get productosPaginados(): DetallePrediccionResponse[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.productosFiltrados.slice(inicio, fin);
  }

  get paginasArray(): (number | string)[] {
    const maxPaginasVisibles = 4;
    const paginas: (number | string)[] = [];

    if (this.totalPaginas <= maxPaginasVisibles + 2) {
      return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
    }

    paginas.push(1);

    let inicio: number;
    let fin: number;

    if (this.paginaActual <= Math.ceil(maxPaginasVisibles / 2) + 1) {
      inicio = 2;
      fin = maxPaginasVisibles;

      for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
      }

      if (fin < this.totalPaginas - 1) {
        paginas.push('...');
      }
    } else if (this.paginaActual >= this.totalPaginas - Math.floor(maxPaginasVisibles / 2)) {
      if (this.totalPaginas - maxPaginasVisibles > 1) {
        paginas.push('...');
      }

      inicio = this.totalPaginas - maxPaginasVisibles + 1;
      fin = this.totalPaginas - 1;

      for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
      }
    } else {
      paginas.push('...');

      const mitad = Math.floor(maxPaginasVisibles / 2);
      inicio = this.paginaActual - mitad + 1;
      fin = this.paginaActual + mitad - 1;

      for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
      }

      paginas.push('...');
    }

    if (this.totalPaginas > 1) {
      paginas.push(this.totalPaginas);
    }

    return paginas;
  }

  onClickPagina(pagina: number | string): void {
    if (typeof pagina === 'number') {
      this.cambiarPagina(pagina);
    }
  }

  constructor(
    private prediccionService: Prediccion,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarDatos(+id);
    } else {
      NotificacionSweet.showError('Error', 'ID de predicción no válido');
      this.router.navigate(['/predicciones']);
    }
  }

  private cargarDatos(id: number): void {
    this.cargandoDatos = true;

    this.prediccionService.buscarPorId(id)
      .pipe(
        finalize(() => {
          this.cargandoDatos = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.prediccion = this.procesarPrediccion(response.prediccion);
          this.extraerCategoriasYAcciones();
          this.aplicarFiltros();
          this.cdr.detectChanges();
        },
        error: (error) => {
          NotificacionSweet.handleBackendError(error);
          this.router.navigate(['/predicciones']);
        }
      });
  }

  private procesarPrediccion(prediccion: PrediccionResponse): PrediccionConMetadatos {
    const fechaInicio = new Date(prediccion.fechaInicioPeriodo);
    const fechaFin = new Date(prediccion.fechaFinPeriodo);

    const anio = fechaFin.getFullYear();
    const trimestre = this.calcularTrimestre(fechaInicio, fechaFin);
    const diasPeriodo = this.calcularDiasPeriodo(fechaInicio, fechaFin);
    const tituloFormateado = this.formatearTitulo(fechaInicio, fechaFin);

    return {
      ...prediccion,
      trimestre,
      anio,
      diasPeriodo,
      tituloFormateado
    };
  }

  private calcularTrimestre(fechaInicio: Date, fechaFin: Date): string {
    const mesInicio = fechaInicio.getMonth();
    const mesFin = fechaFin.getMonth();

    if (mesInicio <= 2 || mesFin <= 2) return 'Q1';
    if (mesInicio <= 5 || mesFin <= 5) return 'Q2';
    if (mesInicio <= 8 || mesFin <= 8) return 'Q3';
    return 'Q4';
  }

  private calcularDiasPeriodo(fechaInicio: Date, fechaFin: Date): number {
    const diferencia = fechaFin.getTime() - fechaInicio.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }

  private formatearTitulo(fechaInicio: Date, fechaFin: Date): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const mesInicio = meses[fechaInicio.getMonth()];
    const mesFin = meses[fechaFin.getMonth()];
    const anio = fechaFin.getFullYear();

    return `${mesInicio} - ${mesFin} ${anio}`;
  }

  private extraerCategoriasYAcciones(): void {
    if (!this.prediccion) return;

    const categoriasSet = new Set(this.prediccion.productos.map(p => p.categoria));
    this.categoriasDisponibles = Array.from(categoriasSet).sort();

    const accionesSet = new Set(this.prediccion.productos.map(p => p.accion));
    this.accionesDisponibles = Array.from(accionesSet).map(accion => ({
      valor: accion,
      label: AccionPrediccionLabels[accion as AccionPrediccion]
    }));
  }

  alternarFiltros(): void {
    this.filtrosVisibles = !this.filtrosVisibles;
  }

  aplicarFiltros(): void {
    if (!this.prediccion) return;

    this.productosFiltrados = this.prediccion.productos.map(producto => ({
      ...producto,
      nombreProducto: construirNombreProducto(producto) 
    })).filter(producto => {
      const cumpleNombre = !this.filtroNombre ||
        producto.nombreProducto.toLowerCase().includes(this.filtroNombre.toLowerCase());

      const cumpleCategoria = !this.filtroCategoria ||
        producto.categoria === this.filtroCategoria;

      const cumpleAccion = !this.filtroAccion ||
        producto.accion === this.filtroAccion;

      return cumpleNombre && cumpleCategoria && cumpleAccion;
    });

    this.calcularPaginacion();
    this.ajustarPaginaActual();
    this.cdr.detectChanges();
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroCategoria = '';
    this.filtroAccion = '';
    this.aplicarFiltros();
  }

  private calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.productosFiltrados.length / this.itemsPorPagina);
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

  obtenerColorPrecision(porcentaje: number | null): string {
    if (porcentaje === null) {
      return 'text-blue-600';
    }

    if (porcentaje >= 90) {
      return 'text-green-600';
    } else if (porcentaje >= 75) {
      return 'text-yellow-600';
    } else {
      return 'text-red-600';
    }
  }

  obtenerTextoPrecision(porcentaje: number | null): string {
    if (porcentaje === null) {
      return 'N/A';
    }
    return `${porcentaje}%`;
  }

  abrirModalGrafico(evento: { id: number; nombre: string }): void {
    this.productoIdSeleccionado = evento.id;
    this.productoNombreSeleccionado = evento.nombre;
    this.modalGraficoVisible = true;
  }

  cerrarModalGrafico(): void {
    this.modalGraficoVisible = false;
    this.productoIdSeleccionado = null;
    this.productoNombreSeleccionado = '';
  }

}
