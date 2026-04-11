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

  public barChartType: ChartType = 'bar';

  public barChartData: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x', // Para barras horizontales
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#e4e4e7',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            const value = context.parsed.x as number;
            const total = (context.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${value} productos (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };


  private coloresAcciones: { [key: string]: string } = {
    'pedido_urgente': '#ef4444',
    'reponer_pronto': '#f59e0b',
    'monitorear': '#3b82f6',
    'stock_suficiente': '#22c55e',
    'sin_registros': '#6b7280'
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

    this.barChartData = {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colores,
        borderColor: '#ffffff',
        borderWidth: 1
      }]
    };

    this.hayDatos = true;

    if (this.chart) {
      this.chart.update();
    }

    this.cdr.detectChanges();
  }

}
