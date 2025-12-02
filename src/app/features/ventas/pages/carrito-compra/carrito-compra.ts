import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Carrito, ItemCarrito } from '../../../../core/services/carrito/carrito';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { ProductoResponse } from '../../../../models/producto';
import { Producto } from '../../../../core/services/producto/producto';
import { construirNombreProducto } from '../../../../shared/utils/producto-nombre';


@Component({
  selector: 'app-carrito-compra',
  imports: [CommonModule, RouterModule],
  templateUrl: './carrito-compra.html',
  styleUrl: './carrito-compra.css'
})
export class CarritoCompra implements OnInit, OnDestroy {

  itemsCarrito: ItemCarrito[] = [];
  private subscription?: Subscription;

  constructor(
    private carritoService: Carrito,
    private router: Router,
    private productoService: Producto,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.subscription = this.carritoService.items$.subscribe(items => {
      this.itemsCarrito = items;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  aumentarCantidad(item: ItemCarrito): void {
    if (item.cantidad < item.producto.stock) {
      try {
        this.carritoService.actualizarCantidad(item.producto.id, item.cantidad + 1);
        this.cdr.detectChanges();
      } catch (error: any) {
        NotificacionSweet.showError('Error', error.message);
      }
    } else {
      NotificacionSweet.showWarning(
        'Stock insuficiente',
        `Solo hay ${item.producto.stock} unidades disponibles`
      );
    }
  }

  disminuirCantidad(item: ItemCarrito): void {
    if (item.cantidad > 1) {
      try {
        this.carritoService.actualizarCantidad(item.producto.id, item.cantidad - 1);
        this.cdr.detectChanges();
      } catch (error: any) {
        NotificacionSweet.showError('Error', error.message);
      }
    }
  }

  eliminarProducto(item: ItemCarrito): void {
    NotificacionSweet.showConfirmation(
      '¿Eliminar producto?',
      `¿Estás seguro de eliminar "${this.obtenerNombreCompleto(item.producto)}" del carrito?`,
      'Sí, eliminar',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.carritoService.eliminarProducto(item.producto.id);
        this.cdr.detectChanges();
        NotificacionSweet.showSuccess(
          'Producto eliminado',
          'El producto ha sido eliminado del carrito'
        );
      }
    });
  }

  vaciarCarrito(): void {
    if (this.itemsCarrito.length === 0) return;

    NotificacionSweet.showConfirmation(
      '¿Vaciar carrito?',
      '¿Estás seguro de eliminar todos los productos del carrito?',
      'Sí, vaciar',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.carritoService.vaciarCarrito();
        this.cdr.detectChanges();
        NotificacionSweet.showSuccess(
          'Carrito vaciado',
          'Todos los productos han sido eliminados'
        );
      }
    });
  }

  obtenerSubtotal(): number {
    return this.carritoService.obtenerSubtotal();
  }

  obtenerCantidadTotal(): number {
    return this.carritoService.obtenerCantidadTotal();
  }

  calcularIGV(): number {
    return this.obtenerSubtotal() * 0.18;
  }

  calcularTotal(): number {
    return this.obtenerSubtotal() + this.calcularIGV();
  }

  irAPagar(): void {
    if (this.itemsCarrito.length === 0) {
      NotificacionSweet.showWarning(
        'Carrito vacío',
        'Agrega productos al carrito antes de proceder al pago'
      );
      return;
    }

    this.router.navigate(['/venta/pagar']);
  }

  continuarComprando(): void {
    this.router.navigate(['/venta']);
  }

  obtenerUrlImagen(producto: ProductoResponse): string {
    return this.productoService.obtenerUrlImagen(producto.imagen);
  }

  obtenerNombreCompleto(producto: ProductoResponse): string {
    const nombreSinFormato = `${producto.nombre} ${producto.marca} ${producto.tipoProducto} ${producto.cantidadTamanio}${producto.unidadMedida}`;
    return construirNombreProducto({ nombreProducto: nombreSinFormato });
  }

  verDetalleProducto(id: number): void {
    this.router.navigate(['venta/producto/detalle', id]);
  }

}
