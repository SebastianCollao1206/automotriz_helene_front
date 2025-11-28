import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoResponse, EstadoPedido } from '../../../../models/pedido';
import { EstadoPedidoBadges, EstadoPedidoLabels } from '../../../../core/constants/pedido-constants';

@Component({
  selector: 'app-pedidos-modal',
  imports: [CommonModule],
  templateUrl: './pedidos-modal.html',
  styleUrl: './pedidos-modal.css'
})
export class PedidosModal implements OnChanges {

  @Input() mostrar: boolean = false;
  @Input() pedido?: PedidoResponse;

  @Output() alCerrar = new EventEmitter<void>();

  estadoBadges = EstadoPedidoBadges;
  estadoLabels = EstadoPedidoLabels;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mostrar'] && this.mostrar) {
      this.cdr.detectChanges();
    }
  }

  cerrar(): void {
    this.alCerrar.emit();
  }

  mostrarCantidadRecibida(): boolean {
    return this.pedido?.estado === 'ENTREGA_INCOMPLETA'
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

}
