import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Asistencia } from '../../service/asistencia';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { AsistenciaDiariaDTO } from '../../../../models/asistencia';
import { AsistenciaTable } from '../../components/asistencia-table/asistencia-table';
@Component({
  selector: 'app-asistencia-diaria',
  imports: [CommonModule, FormsModule, AsistenciaTable],
  templateUrl: './asistencia-diaria.html',
  styleUrl: './asistencia-diaria.css'
})
export class AsistenciaDiaria implements OnInit, OnDestroy {

  cargandoDatos = false;

  asistencias: AsistenciaDiariaDTO[] = [];
  asistenciasFiltradas: AsistenciaDiariaDTO[] = [];

  filtroFecha = '';
  filtroNombre = '';
  filtroEstado = 'TODOS';

  fechaActual = new Date();
  fechaSeleccionada = '';

  paginaActual = 1;
  itemsPorPagina = 8;
  totalPaginas = 0;

  Math = Math;

  get asistenciasPaginadas(): AsistenciaDiariaDTO[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.asistenciasFiltradas.slice(inicio, fin);
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
    private asistenciaService: Asistencia,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.establecerFechaActual();
    this.cargarAsistencias();
  }

  ngOnDestroy(): void { }

  private establecerFechaActual(): void {
    const hoy = new Date();
    this.fechaActual = hoy;
    this.fechaSeleccionada = this.formatearFechaDisplay(hoy);
    this.filtroFecha = this.formatearFechaISO(hoy);
  }

  private cargarAsistencias(): void {
    this.cargandoDatos = true;

    this.asistenciaService.listarTodasAsistencias()
      .pipe(
        finalize(() => {
          this.cargandoDatos = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.asistencias = response.asistencias || [];
            this.aplicarFiltros();
          } else {
            NotificacionSweet.showError('Error', response.mensaje || 'No se pudieron cargar las asistencias');
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          NotificacionSweet.handleBackendError(error);
        }
      });
  }

  get totalAsistencias(): number {
    return this.asistenciasFiltradas.length;
  }

  get totalPresentes(): number {
    return this.asistenciasFiltradas.filter(a => a.estado === 'Presente').length;
  }

  get totalTardanzas(): number {
    return this.asistenciasFiltradas.filter(a => a.estado === 'Tardanza').length;
  }

  get totalAusentes(): number {
    return this.asistenciasFiltradas.filter(a => a.estado === 'Falto').length;
  }

  avanzarDia(): void {
    this.fechaActual.setDate(this.fechaActual.getDate() + 1);
    this.fechaSeleccionada = this.formatearFechaDisplay(this.fechaActual);
    this.filtroFecha = this.formatearFechaISO(this.fechaActual);
    this.aplicarFiltros();
  }

  retrocederDia(): void {
    this.fechaActual.setDate(this.fechaActual.getDate() - 1);
    this.fechaSeleccionada = this.formatearFechaDisplay(this.fechaActual);
    this.filtroFecha = this.formatearFechaISO(this.fechaActual);
    this.aplicarFiltros();
  }

  irAHoy(): void {
    this.establecerFechaActual();
    this.cargarAsistencias();
  }

  private formatearFechaISO(fecha: Date): string {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  private formatearFechaDisplay(fecha: Date): string {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    const diaSemana = dias[fecha.getDay()];
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();

    return `${diaSemana}, ${dia} ${mes} ${año}`;
  }

  aplicarFiltros(): void {
    this.asistenciasFiltradas = this.asistencias.filter(asistencia => {
      const cumpleFecha = !this.filtroFecha || asistencia.fecha === this.filtroFecha;

      const cumpleNombre = !this.filtroNombre ||
        asistencia.nombreUsuario.toLowerCase().includes(this.filtroNombre.toLowerCase());

      const cumpleEstado = this.filtroEstado === 'TODOS' ||
        asistencia.estado === this.filtroEstado;

      return cumpleFecha && cumpleNombre && cumpleEstado;
    });

    this.calcularPaginacion();
    this.ajustarPaginaActual();
    this.cdr.detectChanges();
  }


  private calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.asistenciasFiltradas.length / this.itemsPorPagina);
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

  onVerHistorial(userId: number): void {
    this.router.navigate(['/asistencia/usuario'], {
      queryParams: { userId: userId }
    });
  }

  // formatearHora(horaEntrada: string | null): string {
  //   if (!horaEntrada) {
  //     return '--';
  //   }

  //   const fecha = new Date(horaEntrada);
  //   let horas = fecha.getHours();
  //   const minutos = fecha.getMinutes().toString().padStart(2, '0');
  //   const ampm = horas >= 12 ? 'PM' : 'AM';

  //   horas = horas % 12;
  //   horas = horas ? horas : 12;

  //   return `${horas}:${minutos} ${ampm}`;
  // }

}
