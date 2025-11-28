import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prediccion } from '../../../../core/services/prediccion/prediccion';
import { GraficoProductoResponse } from '../../../../models/prediccion';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { finalize } from 'rxjs/operators';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-grafico-pediccion-producto',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './grafico-pediccion-producto.html',
  styleUrl: './grafico-pediccion-producto.css'
})
export class GraficoPediccionProducto implements OnChanges {

  @Input() visible = false;
  @Input() productoId: number | null = null;
  @Input() nombreProducto = '';
  @Output() cerrar = new EventEmitter<void>();

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  cargandoDatos = false;
  datosGrafico: GraficoProductoResponse | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] || changes['productoId']) {
      if (this.visible && this.productoId) {
        this.datosGrafico = null;
        this.lineChartData = {
          datasets: [],
          labels: []
        };

        this.cargarDatosGrafico();
      }
    }
  }

  public lineChartType: ChartType = 'line';
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 30,
          font: {
            size: 12,
            weight: 'bold' as const
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#e4e4e7',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toLocaleString() + ' unidades';
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad',
          padding: { bottom: 15 },
          font: {
            size: 14,
            weight: 'bold' as const
          }
        },
        ticks: {
          font: {
            size: 12
          },
          callback: function (value) {
            return value.toLocaleString();
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Período',
          padding: { top: 15 },
          font: {
            size: 14,
            weight: 'bold' as const
          }
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    }
  };

  constructor(
    private prediccionService: Prediccion, 
    private cdr: ChangeDetectorRef
  ) { }

  private cargarDatosGrafico(): void {
    if (!this.productoId) return;

    this.cargandoDatos = true;
    this.cdr.detectChanges();

    this.prediccionService.obtenerGraficoProducto(this.productoId)
      .pipe(finalize(() => {
        this.cargandoDatos = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          this.datosGrafico = response.datos;
          this.configurarGrafico();
          this.cdr.detectChanges();
        },
        error: (error) => {
          NotificacionSweet.handleBackendError(error);
          this.cerrarModal();
        }
      });
  }

  private configurarGrafico(): void {
    if (!this.datosGrafico) return;

    const todosLosDatos = [
      ...this.datosGrafico.datosHistoricos,
      ...this.datosGrafico.datosPrediccion
    ];

    todosLosDatos.sort((a, b) => {
      const [mesA, anioA] = this.extraerMesAnio(a.mes);
      const [mesB, anioB] = this.extraerMesAnio(b.mes);

      if (anioA !== anioB) return anioA - anioB;
      return mesA - mesB;
    });

    const labels = todosLosDatos.map(d => d.mes);

    const datosHistoricos = new Array(labels.length).fill(null);
    this.datosGrafico.datosHistoricos.forEach(d => {
      const index = labels.indexOf(d.mes);
      if (index !== -1) {
        datosHistoricos[index] = d.cantidad;
      }
    });

    const datosPrediccion = new Array(labels.length).fill(null);
    this.datosGrafico.datosPrediccion.forEach(d => {
      const index = labels.indexOf(d.mes);
      if (index !== -1) {
        datosPrediccion[index] = d.cantidad;
      }
    });

    const ultimoIndiceHistorico = this.datosGrafico.datosHistoricos.length - 1;
    if (ultimoIndiceHistorico >= 0 && this.datosGrafico.datosPrediccion.length > 0) {
      const ultimoValorHistorico = this.datosGrafico.datosHistoricos[ultimoIndiceHistorico].cantidad;
      const primerIndicePrediccion = labels.indexOf(this.datosGrafico.datosPrediccion[0].mes);

      if (primerIndicePrediccion > 0) {
        datosPrediccion[primerIndicePrediccion - 1] = ultimoValorHistorico;
      }
    }

    this.lineChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Histórico',
          data: datosHistoricos,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#3b82f6',
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
          tension: 0.4,
          spanGaps: false
        },
        {
          label: 'Predicción',
          data: datosPrediccion,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          pointBackgroundColor: '#ef4444',
          pointBorderColor: '#ef4444',
          pointHoverRadius: 6,
          borderWidth: 3,
          borderDash: [10, 5],
          tension: 0.4,
          spanGaps: true,
          pointRadius: datosPrediccion.map((val, idx) => {
            const primerIndicePrediccion = datosPrediccion.findIndex(v => v !== null);
            return idx === primerIndicePrediccion ? 0 : 4;
          })
        }
      ]
    };

    if (this.chart) {
      this.chart.update();
    }
  }

  private extraerMesAnio(mesTexto: string): [number, number] {
    const meses: { [key: string]: number } = {
      'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
      'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
      'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
    };

    const partes = mesTexto.toLowerCase().split(' ');
    const mes = meses[partes[0]] || 1;
    const anio = partes.length > 1 ? parseInt(partes[1]) : new Date().getFullYear();

    return [mes, anio];
  }

  cerrarModal(): void {
    this.cerrar.emit();
    this.datosGrafico = null;
    this.lineChartData = {
      datasets: [],
      labels: []
    };
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrarModal();
    }
  }

}
