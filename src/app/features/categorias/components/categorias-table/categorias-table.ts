import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriaResponse } from '../../../../models/categoria';

@Component({
  selector: 'app-categorias-table',
  imports: [CommonModule],
  templateUrl: './categorias-table.html',
  styleUrl: './categorias-table.css'
})
export class CategoriasTable {
  @Input() categorias: CategoriaResponse[] = [];

  @Output() editarCategoria = new EventEmitter<CategoriaResponse>();
  @Output() cambiarEstado = new EventEmitter<{ id: number; enabled: boolean }>();

  onEditarClick(categoria: CategoriaResponse): void {
    this.editarCategoria.emit(categoria);
  }

  onToggleEstado(categoria: CategoriaResponse): void {
    this.cambiarEstado.emit({
      id: categoria.id,
      enabled: !categoria.enabled
    });
  }

  trackByCategoriaId(index: number, categoria: CategoriaResponse): number {
    return categoria.id;
  }
}
