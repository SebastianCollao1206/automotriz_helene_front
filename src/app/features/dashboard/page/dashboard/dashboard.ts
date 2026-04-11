import { Component, OnInit, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Estadisticas } from '../../../../core/services/estadisticas/estadisticas';
import { Producto } from '../../../../core/services/producto/producto';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { EstadisticasDTO, TopProductoDTO, TopMarcaDTO, RecaudacionPorPeriodoDTO } from '../../../../models/estadisticas';


type PeriodoFiltro = 'mensual' | 'trimestral' | 'anual';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard implements OnInit {

  @ViewChild('chartRecaudado') chartRecaudado?: BaseChartDirective;
  @ViewChild('chartMarcas') chartMarcas?: BaseChartDirective;

  cargandoDatos = false;
  estadisticas?: EstadisticasDTO;

  periodoSeleccionado: PeriodoFiltro = 'mensual';
  mesSeleccionado: number = new Date().getMonth() + 1;
  anioSeleccionado: number = new Date().getFullYear();
  trimestreSeleccionado: number = Math.ceil((new Date().getMonth() + 1) / 3);

  barChartType: ChartType = 'bar';
  lineChartType: ChartType = 'line';

  Math = Math;

  lineChartDataRecaudado: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };

  lineChartOptionsRecaudado: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#e4e4e7',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            if (context.parsed.y !== null) {
              return `S/ ${context.parsed.y.toFixed(2)}`;
            }
            return '';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return `S/ ${value}`;
          }
        }
      }
    }
  };

  barChartDataMarcas: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };

  barChartOptionsMarcas: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#e4e4e7',
        borderWidth: 1,
        callbacks: {
          label: (context) => `Vendidos: ${context.parsed.x}`
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  meses = [
    { valor: 1, nombre: 'Enero' },
    { valor: 2, nombre: 'Febrero' },
    { valor: 3, nombre: 'Marzo' },
    { valor: 4, nombre: 'Abril' },
    { valor: 5, nombre: 'Mayo' },
    { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' },
    { valor: 8, nombre: 'Agosto' },
    { valor: 9, nombre: 'Septiembre' },
    { valor: 10, nombre: 'Octubre' },
    { valor: 11, nombre: 'Noviembre' },
    { valor: 12, nombre: 'Diciembre' }
  ];

  trimestres = [
    { valor: 1, nombre: 'Q1 (Ene-Mar)' },
    { valor: 2, nombre: 'Q2 (Abr-Jun)' },
    { valor: 3, nombre: 'Q3 (Jul-Sep)' },
    { valor: 4, nombre: 'Q4 (Oct-Dic)' }
  ];

  anios: number[] = [];

  constructor(
    private estadisticasService: Estadisticas,
    private productoService: Producto,
    private cdr: ChangeDetectorRef
  ) {
    const anioActual = new Date().getFullYear();
    for (let i = anioActual; i >= anioActual - 5; i--) {
      this.anios.push(i);
    }
  }

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  aplicarFiltros(): void {
    this.cargarEstadisticas();
  }

  private cargarEstadisticas(): void {
    this.cargandoDatos = true;
    this.cdr.markForCheck();

    let observable;

    switch (this.periodoSeleccionado) {
      case 'mensual':
        observable = this.estadisticasService.obtenerEstadisticasMensuales(
          this.anioSeleccionado,
          this.mesSeleccionado
        );
        break;
      case 'trimestral':
        observable = this.estadisticasService.obtenerEstadisticasTrimestrales(
          this.anioSeleccionado,
          this.trimestreSeleccionado
        );
        break;
      case 'anual':
        observable = this.estadisticasService.obtenerEstadisticasAnuales(
          this.anioSeleccionado
        );
        break;
    }

    observable.pipe(
      finalize(() => {
        this.cargandoDatos = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (estadisticas) => {
        this.estadisticas = estadisticas;
        this.generarGraficos();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        NotificacionSweet.showError('Error', 'No se pudieron cargar las estadísticas');
      }
    });
  }

  private generarGraficos(): void {
    if (!this.estadisticas) return;

    this.generarGraficoRecaudado();
    this.generarGraficoMarcas();

    setTimeout(() => {
      this.chartRecaudado?.update();
      this.chartMarcas?.update();
      this.cdr.markForCheck();
    }, 0);
  }

  private generarGraficoRecaudado(): void {
    if (!this.estadisticas) return;

    const datos = this.procesarRecaudacionPorPeriodo();
    const mediaRecaudado = this.estadisticas.mediaRecaudado || 0;

    const datasetRecaudacion = {
      label: 'Recaudado',
      data: datos.map(d => d.total),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true,
      borderWidth: 3,
      pointRadius: 4,
      pointBackgroundColor: '#10b981'
    };

    const datasetMedia = {
      label: 'Media',
      data: datos.map(() => mediaRecaudado),
      borderColor: '#f59e0b',
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderDash: [5, 5],
      pointRadius: 0,
      fill: false
    };

    this.lineChartDataRecaudado = {
      labels: datos.map(d => d.label),
      datasets: [datasetRecaudacion, datasetMedia]
    };
  }

  private procesarRecaudacionPorPeriodo(): { label: string, total: number }[] {
    if (!this.estadisticas?.recaudacionPorPeriodo) return [];

    return this.estadisticas.recaudacionPorPeriodo.map(item => {
      let label = '';

      if (this.periodoSeleccionado === 'mensual') {
        const partes = item.periodo.split('-');
        if (partes.length === 3) {
          label = parseInt(partes[2]).toString(); 
        }
      } else {
        const [anio, mes] = item.periodo.split('-');
        const mesNum = parseInt(mes);
        label = this.meses[mesNum - 1].nombre.substring(0, 3);
      }

      return {
        label,
        total: item.total
      };
    });
  }

  private generarGraficoMarcas(): void {
    if (!this.estadisticas?.topMarcas) return;

    this.barChartDataMarcas = {
      labels: this.estadisticas.topMarcas.map(m => m.marca),
      datasets: [{
        data: this.estadisticas.topMarcas.map(m => m.cantidadVendida),
        backgroundColor: '#8b5cf6',
        borderColor: '#7c3aed',
        borderWidth: 1
      }]
    };
  }

  obtenerUrlImagen(nombreArchivo: string | undefined): string {
    return this.productoService.obtenerUrlImagen(nombreArchivo);
  }

  get totalRecaudado(): number {
    return this.estadisticas?.totalRecaudado || 0;
  }

  get numeroVentas(): number {
    return this.estadisticas?.numeroVentas || 0;
  }

  get numeroClientes(): number {
    return this.estadisticas?.numeroClientes || 0;
  }

  get mediaRecaudado(): number {
    return this.estadisticas?.mediaRecaudado || 0;
  }

  get topProductos(): TopProductoDTO[] {
    return this.estadisticas?.topProductos || [];
  }

  get topMarcas(): TopMarcaDTO[] {
    return this.estadisticas?.topMarcas || [];
  }

  get variacionMedia(): number {
    return Math.round(this.estadisticas?.porcentajeDiferencia || 0);
  }

  get descripcionMedia(): string {
    const esMayor = this.estadisticas?.porEncimaMedia || false;
    const periodo = this.periodoSeleccionado === 'mensual' ? 'este mes' :
      this.periodoSeleccionado === 'trimestral' ? 'este trimestre' : 'este año';

    return `${esMayor ? '+' : ''}${this.variacionMedia}% vs promedio`;
  }

}
