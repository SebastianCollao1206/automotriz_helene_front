import { Injectable } from '@angular/core';

export interface ProductoParaPedido {
  id: number;
  nombre: string;
  cantidad: number;
}


@Injectable({
  providedIn: 'root'
})
export class ProductosCompartidos {

  private productosSeleccionados: ProductoParaPedido[] = [];

  setProductos(productos: ProductoParaPedido[]): void {
    this.productosSeleccionados = productos;
  }

  getProductos(): ProductoParaPedido[] {
    const productos = [...this.productosSeleccionados];
    this.productosSeleccionados = [];
    return productos;
  }

  limpiar(): void {
    this.productosSeleccionados = [];
  }

}
