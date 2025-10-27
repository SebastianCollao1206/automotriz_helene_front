import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnidadMedidaResponse } from '../../../../models/unidad-medida';

@Component({
  selector: 'app-unidades-medida-table',
  imports: [CommonModule],
  templateUrl: './unidades-medida-table.html',
  styleUrl: './unidades-medida-table.css'
})
export class UnidadesMedidaTable {

  @Input() unidadesMedida: UnidadMedidaResponse[] = [];

  @Output() editarUnidadMedida = new EventEmitter<UnidadMedidaResponse>();
  @Output() cambiarEstado = new EventEmitter<{ id: number; enabled: boolean }>();

  onEditarClick(unidad: UnidadMedidaResponse): void {
    this.editarUnidadMedida.emit(unidad);
  }

  onToggleEstado(unidad: UnidadMedidaResponse): void {
    this.cambiarEstado.emit({
      id: unidad.id,
      enabled: !unidad.enabled
    });
  }

  trackByUnidadMedidaId(index: number, unidad: UnidadMedidaResponse): number {
    return unidad.id;
  }


}
