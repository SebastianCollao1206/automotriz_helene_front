import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoResponse } from '../../../../models/producto';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-productos-table',
  imports: [CommonModule],
  templateUrl: './productos-table.html',
  styleUrl: './productos-table.css'
})
export class ProductosTable {

  @Input() productos: ProductoResponse[] = [];

  @Output() editarProducto = new EventEmitter<number>();
  @Output() cambiarEstado = new EventEmitter<{ id: number; enabled: boolean }>();

  private readonly FILES_URL = `${environment.apiUrl}/files`;

  onEditarClick(id: number): void {
    this.editarProducto.emit(id);
  }

  onToggleEstado(producto: ProductoResponse): void {
    this.cambiarEstado.emit({
      id: producto.id,
      enabled: !producto.enabled
    });
  }

  getStockBadgeClass(stock: number): string {
    if (stock > 15) {
      return 'badge-verde';
    } else if (stock > 6) {
      return 'badge-azul';
    } else if (stock > 3) {
      return 'badge-amarillo';
    } else {
      return 'badge-rojo';
    }
  }

  obtenerUrlImagen(nombreArchivo: string | undefined): string {
    if (!nombreArchivo) {
      return 'assets/images/default-product.png';
    }
    return `${this.FILES_URL}/images/${nombreArchivo}`;
  }

  trackByProductId(index: number, producto: ProductoResponse): number {
    return producto.id;
  }

}
