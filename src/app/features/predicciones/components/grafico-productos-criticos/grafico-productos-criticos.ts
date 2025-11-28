import { Component, Input, OnChanges, SimpleChanges, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DetallePrediccionResponse } from '../../../../models/prediccion';
import { AccionPrediccionLabels } from '../../../../core/constants/prediccion-constants';


@Component({
  selector: 'app-grafico-productos-criticos',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './grafico-productos-criticos.html',
  styleUrl: './grafico-productos-criticos.css'
})
export class GraficoProductosCriticos implements OnChanges {

  @Input() productos: DetallePrediccionResponse[] = [];
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  hayDatos = false;

  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
            weight: 'bold' as const
          },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i] as number;
                const total = (data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);

                return {
                  text: `${label}: ${value} (${percentage}%)`,
                  fillStyle: (data.datasets[0].backgroundColor as string[])[i],
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
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
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed as number;
            const total = (context.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);

            return `${label}: ${value} productos (${percentage}%)`;
          }
        }
      }
    }
  };

  private coloresAcciones: { [key: string]: string } = {
    'PEDIDO URGENTE': '#ef4444',     
    'REPONER_PRONTO': '#f59e0b',      
    'MONITOREAR': '#3b82f6',          
    'STOCK_SUFICIENTE': '#22c55e',    
    'SIN_REGISTROS': '#6b7280'        
  };

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productos']) {
      this.configurarGrafico();
    }
  }

  private configurarGrafico(): void {
    if (!this.productos || this.productos.length === 0) {
      this.hayDatos = false;
      return;
    }

    const conteoAcciones = this.productos.reduce((acc, producto) => {
      acc[producto.accion] = (acc[producto.accion] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const labels = Object.keys(conteoAcciones).map(
      accion => AccionPrediccionLabels[accion as keyof typeof AccionPrediccionLabels]
    );
    const data = Object.values(conteoAcciones);
    const colores = Object.keys(conteoAcciones).map(
      accion => this.coloresAcciones[accion] || '#6b7280'
    );

    this.pieChartData = {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colores,
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff'
      }]
    };

    this.hayDatos = true;

    if (this.chart) {
      this.chart.update();
    }

    this.cdr.detectChanges();
  }

}
