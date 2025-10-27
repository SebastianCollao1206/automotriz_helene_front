import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarcaResponse } from '../../../../models/marca';

@Component({
  selector: 'app-marcas-table',
  imports: [CommonModule],
  templateUrl: './marcas-table.html',
  styleUrl: './marcas-table.css'
})
export class MarcasTable {

  @Input() marcas: MarcaResponse[] = [];
  
    @Output() editarMarca = new EventEmitter<MarcaResponse>();
    @Output() cambiarEstado = new EventEmitter<{ id: number; enabled: boolean }>();
  
    onEditarClick(marca: MarcaResponse): void {
      this.editarMarca.emit(marca);
    }
  
    onToggleEstado(marca: MarcaResponse): void {
      this.cambiarEstado.emit({
        id: marca.id,
        enabled: !marca.enabled
      });
    }
  
    trackByMarcaId(index: number, marca: MarcaResponse): number {
      return marca.id;
    }

}
