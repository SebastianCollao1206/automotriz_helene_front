import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TipoProductoResponse } from '../../../../models/tipo-producto';

@Component({
  selector: 'app-tipo-producto-table',
  imports: [CommonModule],
  templateUrl: './tipo-producto-table.html',
  styleUrl: './tipo-producto-table.css'
})
export class TipoProductoTable {

  @Input() tiposProducto: TipoProductoResponse[] = [];

  @Output() editarTipoProducto = new EventEmitter<TipoProductoResponse>();
  @Output() cambiarEstado = new EventEmitter<{ id: number; enabled: boolean }>();

  onEditarClick(tipoProducto: TipoProductoResponse): void {
    this.editarTipoProducto.emit(tipoProducto);
  }

  onToggleEstado(tipoProducto: TipoProductoResponse): void {
    this.cambiarEstado.emit({
      id: tipoProducto.id,
      enabled: !tipoProducto.enabled
    });
  }

  trackByTipoProductoId(index: number, tipoProducto: TipoProductoResponse): number {
    return tipoProducto.id;
  }

}
