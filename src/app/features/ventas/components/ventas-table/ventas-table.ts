import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentaResponse } from '../../../../models/venta';

@Component({
  selector: 'app-ventas-table',
  imports: [CommonModule],
  templateUrl: './ventas-table.html',
  styleUrl: './ventas-table.css'
})
export class VentasTable {

  @Input() ventas: VentaResponse[] = [];
  @Input() puedeVerVendedor: boolean = false;

  @Output() verDetalle = new EventEmitter<number>();

  onVerDetalleClick(id: number): void {
    this.verDetalle.emit(id);
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  trackByVentaId(index: number, venta: VentaResponse): number {
    return venta.id;
  }

  obtenerDniRuc(cliente: any): string {
    return cliente.dni || cliente.ruc || 'N/A';
  }

}
