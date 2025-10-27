import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosTable } from '../../components/productos-table/productos-table';
import { Producto } from '../../../../core/services/producto/producto';
import { Categoria } from '../../../../core/services/categoria/categoria';
import { Marca } from '../../../../core/services/marca/marca';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { ProductoResponse } from '../../../../models/producto';
import { CategoriaResponse } from '../../../../models/categoria';
import { MarcaResponse } from '../../../../models/marca';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-productos',
  imports: [CommonModule, FormsModule, ProductosTable],
  templateUrl: './lista-productos.html',
  styleUrl: './lista-productos.css'
})
export class ListaProductos implements OnInit {

  filtrosVisibles = false;
  cargandoDatos = false;

  productos: ProductoResponse[] = [];
  productosFiltrados: ProductoResponse[] = [];
  categorias: CategoriaResponse[] = [];
  marcas: MarcaResponse[] = [];

  filtroNombre = '';
  filtroCategoria = '';
  filtroMarca = '';
  filtroStock = '';

  paginaActual = 1;
  itemsPorPagina = 6;
  totalPaginas = 0;

  Math = Math;

  get productosPaginados(): ProductoResponse[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.productosFiltrados.slice(inicio, fin);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  constructor(
    private productoService: Producto,
    private categoriaService: Categoria,
    private marcaService: Marca,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.cargandoDatos = true;

    forkJoin({
      productos: this.productoService.listarTodos(),
      categorias: this.categoriaService.listarTodos(),
      marcas: this.marcaService.listarTodos()
    })
      .pipe(
        finalize(() => {
          this.cargandoDatos = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: ({ productos, categorias, marcas }) => {
          this.productos = productos || [];
          this.categorias = categorias || [];
          this.marcas = marcas || [];
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
      const cumpleNombre = !this.filtroNombre ||
        producto.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());

      const cumpleCategoria = !this.filtroCategoria ||
        producto.categoria === this.filtroCategoria;

      const cumpleMarca = !this.filtroMarca ||
        producto.marca === this.filtroMarca;

      const cumpleStock = !this.filtroStock || this.filtrarPorStock(producto.stock);

      return cumpleNombre && cumpleCategoria && cumpleMarca && cumpleStock;
    });

    this.calcularPaginacion();
    this.ajustarPaginaActual();
    this.cdr.detectChanges();
  }

  private filtrarPorStock(stock: number): boolean {
    switch (this.filtroStock) {
      case 'alto':
        return stock > 15;
      case 'normal':
        return stock > 6 && stock <= 15;
      case 'bajo':
        return stock > 3 && stock <= 6;
      case 'critico':
        return stock <= 3;
      default:
        return true;
    }
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroCategoria = '';
    this.filtroMarca = '';
    this.filtroStock = '';
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

  onEditarProducto(id: number): void {
    this.router.navigate(['/producto/editar', id]);
  }

  onCambiarEstado(evento: { id: number; enabled: boolean }): void {
    const producto = this.productos.find(p => p.id === evento.id);
    if (!producto) {
      NotificacionSweet.showError('Error', 'Producto no encontrado');
      return;
    }

    const mensajeAccion = evento.enabled ? 'activar' : 'desactivar';

    NotificacionSweet.showConfirmation(
      '¿Estás seguro?',
      `¿Deseas ${mensajeAccion} el producto ${producto.nombre}?`,
      `Sí, ${mensajeAccion}`,
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.cambiarEstadoProducto(evento.id, evento.enabled);
      }
    });
  }

  private cambiarEstadoProducto(id: number, enabled: boolean): void {
    const accion = enabled ? 'Activando' : 'Desactivando';
    NotificacionSweet.showLoading(`${accion} producto...`);

    this.productoService.cambiarEstado(id, enabled).subscribe({
      next: (productoActualizado: ProductoResponse) => {
        this.actualizarProductoEnListas(productoActualizado);
        this.cdr.detectChanges();
        NotificacionSweet.hideLoading();
        NotificacionSweet.showSuccess(
          '¡Éxito!',
          `Producto ${productoActualizado.enabled ? 'activado' : 'desactivado'} correctamente`
        );
      },
      error: (error) => {
        NotificacionSweet.hideLoading();
        NotificacionSweet.handleBackendError(error);
      }
    });
  }

  private actualizarProductoEnListas(productoActualizado: ProductoResponse): void {
    const indiceProductos = this.productos.findIndex(p => p.id === productoActualizado.id);
    if (indiceProductos !== -1) {
      this.productos[indiceProductos] = { ...productoActualizado };
    }

    const indiceFiltrados = this.productosFiltrados.findIndex(p => p.id === productoActualizado.id);
    if (indiceFiltrados !== -1) {
      this.productosFiltrados[indiceFiltrados] = { ...productoActualizado };
    }

    this.calcularPaginacion();
  }

}
