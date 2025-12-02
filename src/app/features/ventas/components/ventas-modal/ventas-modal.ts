import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentaResponse } from '../../../../models/venta';
import { construirNombreProducto } from '../../../../shared/utils/producto-nombre';
import { Producto } from '../../../../core/services/producto/producto';
import { ProductoResponse } from '../../../../models/producto';

@Component({
  selector: 'app-ventas-modal',
  imports: [CommonModule],
  templateUrl: './ventas-modal.html',
  styleUrl: './ventas-modal.css'
})
export class VentasModal implements OnChanges, OnInit {

  @Input() mostrar: boolean = false;
  @Input() venta?: VentaResponse;

  @Output() alCerrar = new EventEmitter<void>();

  productosMap: Map<number, ProductoResponse> = new Map();

  constructor(
    private cdr: ChangeDetectorRef,
    private productoService: Producto
  ) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mostrar'] && this.mostrar) {
      this.cdr.detectChanges();
    }
  }

  private cargarProductos(): void {
    this.productoService.listarTodos().subscribe({
      next: (productos) => {
        productos.forEach(p => {
          this.productosMap.set(p.id, p);
        });
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  cerrar(): void {
    this.alCerrar.emit();
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  obtenerSubtotal(): number {
    if (!this.venta) return 0;
    return this.venta.detalles.reduce((sum, item) => sum + item.subtotal, 0);
  }

  obtenerCantidadTotal(): number {
    if (!this.venta) return 0;
    return this.venta.detalles.reduce((sum, item) => sum + item.cantidad, 0);
  }

  calcularIGV(): number {
    return this.obtenerSubtotal() * 0.18;
  }

  obtenerNombreProductoCompleto(detalle: any): string {
    const productoCompleto = this.productosMap.get(detalle.productoId);

    if (productoCompleto) {
      const nombreSinFormato = `${productoCompleto.nombre} ${productoCompleto.marca} ${productoCompleto.tipoProducto} ${productoCompleto.cantidadTamanio}${productoCompleto.unidadMedida}`;
      return construirNombreProducto({ nombreProducto: nombreSinFormato });
    }

    return detalle.producto;
  }

}
