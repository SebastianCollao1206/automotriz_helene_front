import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoResponse } from '../../../../models/pedido';
import { EstadoPedidoBadges, EstadoPedidoLabels } from '../../../../core/constants/pedido-constants';


@Component({
  selector: 'app-pedidos-table',
  imports: [CommonModule],
  templateUrl: './pedidos-table.html',
  styleUrl: './pedidos-table.css'
})
export class PedidosTable {

  @Input() pedidos: PedidoResponse[] = [];
  @Input() puedeGestionar: boolean = false;
  @Input() puedeRecibir: boolean = false;

  @Output() verDetalle = new EventEmitter<number>();
  @Output() editarPedido = new EventEmitter<number>();
  @Output() cancelarPedido = new EventEmitter<number>();
  @Output() recibirPedido = new EventEmitter<number>();

  estadoBadges = EstadoPedidoBadges;
  estadoLabels = EstadoPedidoLabels;

  onVerDetalleClick(id: number): void {
    this.verDetalle.emit(id);
  }

  onEditarClick(id: number): void {
    this.editarPedido.emit(id);
  }

  onCancelarClick(id: number): void {
    this.cancelarPedido.emit(id);
  }

  onRecibirClick(id: number): void {
    this.recibirPedido.emit(id);
  }

  getEstadoBadge(estado: string): string {
    return this.estadoBadges[estado as keyof typeof this.estadoBadges] || 'badge-gris';
  }

  getEstadoLabel(estado: string): string {
    return this.estadoLabels[estado as keyof typeof this.estadoLabels] || estado;
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  trackByPedidoId(index: number, pedido: PedidoResponse): number {
    return pedido.id;
  }

}
