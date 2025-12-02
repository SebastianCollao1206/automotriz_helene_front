import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { Producto } from '../../../../core/services/producto/producto';
import { Categoria } from '../../../../core/services/categoria/categoria';
import { TipoProducto } from '../../../../core/services/tipo-producto/tipo-producto';
import { UnidadMedida } from '../../../../core/services/unidad-medida/unidad-medida';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { ProductoResponse } from '../../../../models/producto';
import { CategoriaResponse } from '../../../../models/categoria';
import { TipoProductoResponse } from '../../../../models/tipo-producto';
import { UnidadMedidaResponse } from '../../../../models/unidad-medida';
import { Marca } from '../../../../core/services/marca/marca';
import { MarcaResponse } from '../../../../models/marca';
import { construirNombreProducto } from '../../../../shared/utils/producto-nombre';
import { Carrito } from '../../../../core/services/carrito/carrito';

@Component({
  selector: 'app-catalogo-productos',
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo-productos.html',
  styleUrl: './catalogo-productos.css'
})
export class CatalogoProductos implements OnInit {

  filtrosVisibles = false;
  cargandoDatos = false;

  productos: ProductoResponse[] = [];
  productosFiltrados: ProductoResponse[] = [];

  categorias: CategoriaResponse[] = [];
  marcas: MarcaResponse[] = [];
  tiposProducto: TipoProductoResponse[] = [];
  unidadesMedida: UnidadMedidaResponse[] = [];

  filtroNombre = '';
  filtroCategoria = '';
  filtroMarca = '';
  filtroTipoProducto = '';
  filtroUnidadMedida = '';

  paginaActual = 1;
  itemsPorPagina = 20;
  totalPaginas = 0;

  Math = Math;

  get productosPaginados(): ProductoResponse[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.productosFiltrados.slice(inicio, fin);
  }

  get paginasArray(): (number | string)[] {
    const maxPaginasVisibles = 4;
    const paginas: (number | string)[] = [];

    if (this.totalPaginas <= maxPaginasVisibles + 2) {
      return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
    }

    paginas.push(1);

    let inicio: number;
    let fin: number;

    if (this.paginaActual <= Math.ceil(maxPaginasVisibles / 2) + 1) {
      inicio = 2;
      fin = maxPaginasVisibles;

      for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
      }

      if (fin < this.totalPaginas - 1) {
        paginas.push('...');
      }
    } else if (this.paginaActual >= this.totalPaginas - Math.floor(maxPaginasVisibles / 2)) {
      if (this.totalPaginas - maxPaginasVisibles > 1) {
        paginas.push('...');
      }

      inicio = this.totalPaginas - maxPaginasVisibles + 1;
      fin = this.totalPaginas - 1;

      for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
      }
    } else {
      paginas.push('...');

      const mitad = Math.floor(maxPaginasVisibles / 2);
      inicio = this.paginaActual - mitad + 1;
      fin = this.paginaActual + mitad - 1;

      for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
      }

      paginas.push('...');
    }

    if (this.totalPaginas > 1) {
      paginas.push(this.totalPaginas);
    }

    return paginas;
  }

  constructor(
    private productoService: Producto,
    private categoriaService: Categoria,
    private marcaService: Marca,
    private tipoProductoService: TipoProducto,
    private unidadMedidaService: UnidadMedida,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private carritoService: Carrito
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.cargandoDatos = true;

    forkJoin({
      productos: this.productoService.listarActivos(),
      categorias: this.categoriaService.listarActivos(),
      marcas: this.marcaService.listarActivos(),
      tiposProducto: this.tipoProductoService.listarActivos(),
      unidadesMedida: this.unidadMedidaService.listarActivos()
    })
      .pipe(
        finalize(() => {
          this.cargandoDatos = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: ({ productos, categorias, marcas, tiposProducto, unidadesMedida }) => {
          this.productos = productos || [];
          this.categorias = categorias || [];
          this.marcas = marcas || [];
          this.tiposProducto = tiposProducto || [];
          this.unidadesMedida = unidadesMedida || [];
          this.aplicarFiltros();
          this.cdr.detectChanges();
        },
        error: (error) => {
          NotificacionSweet.handleBackendError(error);
        }
      });
  }

  alternarFiltros(): void {
    this.filtrosVisibles = !this.filtrosVisibles;
  }

  aplicarFiltros(): void {
    this.productosFiltrados = this.productos.filter(producto => {
      const nombreCompleto = `${producto.nombre} ${producto.marca} ${producto.tipoProducto} ${producto.cantidadTamanio}${producto.unidadMedida}`.toLowerCase();

      const cumpleNombre = !this.filtroNombre ||
        nombreCompleto.includes(this.filtroNombre.toLowerCase());

      const cumpleCategoria = !this.filtroCategoria ||
        producto.categoria === this.filtroCategoria;

      const cumpleMarca = !this.filtroMarca ||
        producto.marca === this.filtroMarca;

      const cumpleTipoProducto = !this.filtroTipoProducto ||
        producto.tipoProducto === this.filtroTipoProducto;

      const cumpleUnidadMedida = !this.filtroUnidadMedida ||
        producto.unidadMedida === this.filtroUnidadMedida;

      return cumpleNombre && cumpleCategoria && cumpleMarca &&
        cumpleTipoProducto && cumpleUnidadMedida;
    });

    this.calcularPaginacion();
    this.ajustarPaginaActual();
    this.cdr.detectChanges();
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroCategoria = '';
    this.filtroMarca = '';
    this.filtroTipoProducto = '';
    this.filtroUnidadMedida = '';
    this.aplicarFiltros();
  }

  private calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.productosFiltrados.length / this.itemsPorPagina);
  }

  private ajustarPaginaActual(): void {
    if (this.paginaActual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaActual = this.totalPaginas;
    } else if (this.totalPaginas === 0) {
      this.paginaActual = 1;
    }
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.cdr.detectChanges();
    }
  }

  onClickPagina(pagina: number | string): void {
    if (typeof pagina === 'number') {
      this.cambiarPagina(pagina);
    }
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.cambiarPagina(this.paginaActual - 1);
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.cambiarPagina(this.paginaActual + 1);
    }
  }

  obtenerUrlImagen(producto: ProductoResponse): string {
    return this.productoService.obtenerUrlImagen(producto.imagen);
  }

  obtenerNombreCompleto(producto: ProductoResponse): string {
    const nombreSinFormato = `${producto.nombre} ${producto.marca} ${producto.tipoProducto} ${producto.cantidadTamanio}${producto.unidadMedida}`;
    return construirNombreProducto({ nombreProducto: nombreSinFormato });
  }

  calcularPrecioConDescuento(producto: ProductoResponse): number {
    if (producto.descuento > 0) {
      return producto.precioVenta * (1 - producto.descuento / 100);
    }
    return producto.precioVenta;
  }

  onVerDetalleProducto(id: number): void {
    this.router.navigate(['venta/producto/detalle', id]);
  }

  onAgregarAlCarrito(producto: ProductoResponse, event: Event): void {
    event.stopPropagation();

    try {
      this.carritoService.agregarProducto(producto, 1);
      NotificacionSweet.showSuccess(
        '¡Agregado!',
        `${this.obtenerNombreCompleto(producto)} agregado al carrito`
      );
    } catch (error: any) {
      NotificacionSweet.showError('Error', error.message);
    }
  }

  trackByProductoId(index: number, producto: ProductoResponse): number {
    return producto.id;
  }

}
