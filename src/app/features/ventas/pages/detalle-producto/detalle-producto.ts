import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Producto } from '../../../../core/services/producto/producto';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { ProductoResponse } from '../../../../models/producto';
import { construirNombreProducto } from '../../../../shared/utils/producto-nombre';
import { Carrito } from '../../../../core/services/carrito/carrito';

// Importar Swiper
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-detalle-producto',
  imports: [CommonModule, FormsModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './detalle-producto.html',
  styleUrl: './detalle-producto.css'
})
export class DetalleProducto implements OnInit {

  cargandoDatos = false;
  productoActual: ProductoResponse | null = null;
  productosRelacionados: ProductoResponse[] = [];
  todosLosProductos: ProductoResponse[] = [];

  cantidad = 1;
  productoId: number | null = null;



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: Producto,
    private cdr: ChangeDetectorRef,
    private carritoService: Carrito
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.productoId = +id;
        this.cargarProducto(this.productoId);
      }
    });
  }

  private cargarProducto(id: number): void {
    this.cargandoDatos = true;
    this.cantidad = 1;

    this.productoService.buscarPorId(id)
      .pipe(
        finalize(() => {
          this.cargandoDatos = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (producto) => {
          this.productoActual = producto;
          this.cargarProductosRelacionados();
          this.scrollToTop();
        },
        error: (error) => {
          this.productoActual = null;
          NotificacionSweet.handleBackendError(error);
        }
      });
  }

  private cargarProductosRelacionados(): void {
    if (!this.productoActual) return;

    this.productoService.listarActivos()
      .subscribe({
        next: (productos) => {
          this.todosLosProductos = productos;
          this.filtrarProductosRelacionados();
        },
        error: (error) => {
          console.error('Error al cargar productos relacionados:', error);
          this.productosRelacionados = [];
        }
      });
  }

  private filtrarProductosRelacionados(): void {
    if (!this.productoActual) return;

    const productosSinActual = this.todosLosProductos.filter(
      p => p.id !== this.productoActual!.id
    );

    const productosConScore = productosSinActual.map(producto => {
      let score = 0;

      if (producto.categoria === this.productoActual!.categoria) {
        score += 40;
      }

      if (producto.marca === this.productoActual!.marca) {
        score += 30;
      }

      if (producto.unidadMedida === this.productoActual!.unidadMedida) {
        score += 20;
      }

      if (producto.tipoProducto === this.productoActual!.tipoProducto) {
        score += 10;
      }

      return { producto, score };
    });

    productosConScore.sort((a, b) => b.score - a.score);

    this.productosRelacionados = productosConScore
      .slice(0, 10)
      .map(item => item.producto);

    this.cdr.detectChanges();
  }

  aumentarCantidad(): void {
    if (this.productoActual && this.cantidad < this.productoActual.stock) {
      this.cantidad++;
    }
  }

  disminuirCantidad(): void {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  validarCantidad(): void {
    if (!this.productoActual) return;

    if (this.cantidad < 1) {
      this.cantidad = 1;
    } else if (this.cantidad > this.productoActual.stock) {
      this.cantidad = this.productoActual.stock;
    }
  }

  agregarAlCarrito(): void {
    if (!this.productoActual || this.productoActual.stock === 0) {
      return;
    }

    try {
      this.carritoService.agregarProducto(this.productoActual, this.cantidad);

      NotificacionSweet.showSuccess(
        '¡Producto agregado!',
        `${this.cantidad} ${this.cantidad === 1 ? 'unidad' : 'unidades'} de ${this.obtenerNombreCompleto(this.productoActual)} agregadas al carrito`
      );

      this.cantidad = 1;
    } catch (error: any) {
      NotificacionSweet.showError('Error', error.message);
    }
  }

  agregarRelacionadoAlCarrito(producto: ProductoResponse, event: Event): void {
    event.stopPropagation();

    if (producto.stock === 0) {
      NotificacionSweet.showWarning('Sin stock', 'Este producto no tiene stock disponible');
      return;
    }

    try {
      this.carritoService.agregarProducto(producto, 1);

      NotificacionSweet.showSuccess(
        '¡Producto agregado!',
        `1 unidad de ${this.obtenerNombreCompleto(producto)} agregada al carrito`
      );
    } catch (error: any) {
      NotificacionSweet.showError('Error', error.message);
    }
  }

  verDetalleProducto(id: number): void {
    this.router.navigate(['venta/producto/detalle', id]);
    this.cargarProducto(id);
  }

  volver(): void {
    this.router.navigate(['/venta']);
  }

  obtenerUrlImagen(producto: ProductoResponse | null): string {
    if (!producto) return 'assets/images/default-product.png';
    return this.productoService.obtenerUrlImagen(producto.imagen);
  }

  obtenerNombreCompleto(producto: ProductoResponse | null): string {
    if (!producto) return '';
    const nombreSinFormato = `${producto.nombre} ${producto.marca} ${producto.tipoProducto} ${producto.cantidadTamanio}${producto.unidadMedida}`;
    return construirNombreProducto({ nombreProducto: nombreSinFormato });
  }

  calcularPrecioConDescuento(producto: ProductoResponse): number {
    if (producto.descuento > 0) {
      return producto.precioVenta * (1 - producto.descuento / 100);
    }
    return producto.precioVenta;
  }

  calcularAhorro(producto: ProductoResponse): number {
    if (producto.descuento > 0) {
      return producto.precioVenta - this.calcularPrecioConDescuento(producto);
    }
    return 0;
  }

  trackByProductoId(index: number, producto: ProductoResponse): number {
    return producto.id;
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}
