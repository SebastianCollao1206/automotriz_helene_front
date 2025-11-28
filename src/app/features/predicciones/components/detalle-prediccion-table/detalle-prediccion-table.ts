import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetallePrediccionResponse, AccionPrediccion } from '../../../../models/prediccion';
import { AccionPrediccionLabels, AccionPrediccionBadges } from '../../../../core/constants/prediccion-constants';


@Component({
  selector: 'app-detalle-prediccion-table',
  imports: [CommonModule],
  templateUrl: './detalle-prediccion-table.html',
  styleUrl: './detalle-prediccion-table.css'
})
export class DetallePrediccionTable {

  @Input() productos: DetallePrediccionResponse[] = [];
  @Output() verGrafico = new EventEmitter<{ id: number; nombre: string }>();

  obtenerLabelAccion(accion: AccionPrediccion): string {
    return AccionPrediccionLabels[accion] || accion;
  }

  obtenerClaseBadge(accion: AccionPrediccion): string {
    return AccionPrediccionBadges[accion] || 'badge-gris';
  }

  trackByProductoId(index: number, producto: DetallePrediccionResponse): number {
    return producto.id;
  }

  abrirGrafico(producto: DetallePrediccionResponse): void {
    this.verGrafico.emit({
      id: producto.idProducto,
      nombre: producto.nombreProducto
    });
  }

}
