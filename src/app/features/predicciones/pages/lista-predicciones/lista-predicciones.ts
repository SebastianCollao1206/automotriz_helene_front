import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrediccionCard } from '../../components/prediccion-card/prediccion-card';
import { FormsModule } from '@angular/forms';
import { Prediccion } from '../../../../core/services/prediccion/prediccion';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { PrediccionResponse } from '../../../../models/prediccion';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

interface PrediccionConMetadatos extends PrediccionResponse {
  trimestre: string;
  anio: number;
  diasPeriodo: number;
  tituloFormateado: string;
}

@Component({
  selector: 'app-lista-predicciones',
  imports: [CommonModule, FormsModule, PrediccionCard],
  templateUrl: './lista-predicciones.html',
  styleUrl: './lista-predicciones.css'
})
export class ListaPredicciones implements OnInit {

  filtrosVisibles = false;
  cargandoDatos = false;

  predicciones: PrediccionConMetadatos[] = [];
  prediccionesFiltradas: PrediccionConMetadatos[] = [];

  filtroTrimestre = '';
  filtroAnio = '';
  aniosDisponibles: number[] = [];

  paginaActual = 1;
  itemsPorPagina = 6;
  totalPaginas = 0;

  Math = Math;

  get prediccionesPaginadas(): PrediccionConMetadatos[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.prediccionesFiltradas.slice(inicio, fin);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  constructor(
    private prediccionService: Prediccion,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.cargandoDatos = true;

    this.prediccionService.listarTodas()
      .pipe(
        finalize(() => {
          this.cargandoDatos = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.predicciones = (response.predicciones || []).map(pred => this.procesarPrediccion(pred));
          this.extraerAniosDisponibles();
          this.aplicarFiltros();
          this.cdr.detectChanges();
        },
        error: (error) => {
          NotificacionSweet.handleBackendError(error);
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

  private extraerAniosDisponibles(): void {
    const aniosSet = new Set(this.predicciones.map(p => p.anio));
    this.aniosDisponibles = Array.from(aniosSet).sort((a, b) => b - a);
  }

  onGenerarPrediccion(): void {
    this.router.navigate(['/predicciones/generar']);
  }

  alternarFiltros(): void {
    this.filtrosVisibles = !this.filtrosVisibles;
  }

  aplicarFiltros(): void {
    this.prediccionesFiltradas = this.predicciones.filter(prediccion => {
      const cumpleTrimestre = !this.filtroTrimestre ||
        prediccion.trimestre === this.filtroTrimestre;

      const cumpleAnio = !this.filtroAnio ||
        prediccion.anio.toString() === this.filtroAnio;

      return cumpleTrimestre && cumpleAnio;
    });

    this.calcularPaginacion();
    this.ajustarPaginaActual();
    this.cdr.detectChanges();
  }

  limpiarFiltros(): void {
    this.filtroTrimestre = '';
    this.filtroAnio = '';
    this.aplicarFiltros();
  }

  private calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.prediccionesFiltradas.length / this.itemsPorPagina);
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

  onVerDetalles(id: number): void {
    this.router.navigate(['/predicciones/detalle', id]);
  }

}
