import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProductoResponse } from '../../../models/producto';

export interface ItemCarrito {
  producto: ProductoResponse;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class Carrito {

  private itemsSubject = new BehaviorSubject<ItemCarrito[]>([]);
  public items$ = this.itemsSubject.asObservable();

  private readonly STORAGE_KEY = 'carrito_items';

  constructor() {
    this.cargarCarritoDesdeStorage();
  }

  private cargarCarritoDesdeStorage(): void {
    const itemsGuardados = localStorage.getItem(this.STORAGE_KEY);
    if (itemsGuardados) {
      try {
        const items = JSON.parse(itemsGuardados);
        this.itemsSubject.next(items);
      } catch (error) {
        console.error('Error al cargar carrito:', error);
        this.itemsSubject.next([]);
      }
    }
  }

  private guardarCarritoEnStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.itemsSubject.value));
  }

  agregarProducto(producto: ProductoResponse, cantidad: number = 1): void {
    const items = [...this.itemsSubject.value];
    const precioConDescuento = this.calcularPrecioConDescuento(producto);

    const itemExistente = items.find(item => item.producto.id === producto.id);

    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad;

      if (nuevaCantidad <= producto.stock) {
        itemExistente.cantidad = nuevaCantidad;
        itemExistente.subtotal = itemExistente.cantidad * precioConDescuento;
      } else {
        throw new Error('No hay suficiente stock disponible');
      }
    } else {
      items.push({
        producto,
        cantidad,
        precioUnitario: precioConDescuento,
        subtotal: precioConDescuento * cantidad
      });
    }

    this.itemsSubject.next(items);
    this.guardarCarritoEnStorage();
  }

  actualizarCantidad(productoId: number, cantidad: number): void {
    const items = [...this.itemsSubject.value];
    const item = items.find(i => i.producto.id === productoId);

    if (item) {
      if (cantidad <= 0) {
        this.eliminarProducto(productoId);
        return;
      }

      if (cantidad <= item.producto.stock) {
        item.cantidad = cantidad;
        item.subtotal = item.cantidad * item.precioUnitario;
        this.itemsSubject.next(items);
        this.guardarCarritoEnStorage();
      } else {
        throw new Error('No hay suficiente stock disponible');
      }
    }
  }

  eliminarProducto(productoId: number): void {
    const items = this.itemsSubject.value.filter(item => item.producto.id !== productoId);
    this.itemsSubject.next(items);
    this.guardarCarritoEnStorage();
  }

  vaciarCarrito(): void {
    this.itemsSubject.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  obtenerItems(): ItemCarrito[] {
    return this.itemsSubject.value;
  }

  obtenerCantidadTotal(): number {
    return this.itemsSubject.value.reduce((total, item) => total + item.cantidad, 0);
  }

  obtenerSubtotal(): number {
    return this.itemsSubject.value.reduce((total, item) => total + item.subtotal, 0);
  }

  private calcularPrecioConDescuento(producto: ProductoResponse): number {
    if (producto.descuento > 0) {
      return producto.precioVenta * (1 - producto.descuento / 100);
    }
    return producto.precioVenta;
  }

}
