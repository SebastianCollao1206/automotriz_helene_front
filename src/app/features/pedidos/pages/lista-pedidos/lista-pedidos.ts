import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { PedidosTable } from '../../components/pedidos-table/pedidos-table';
import { Pedido } from '../../../../core/services/pedido/pedido';
import { Proveedor } from '../../../../core/services/proveedor/proveedor';
import { AuthService } from '../../../../core/services/auth/auth-service';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { PedidoResponse, EstadoPedido } from '../../../../models/pedido';
import { ProveedorResponse } from '../../../../models/proveedor';
import { PedidosModal } from '../../components/pedidos-modal/pedidos-modal';
import { ProductoResponse } from '../../../../models/producto';
import { Producto } from '../../../../core/services/producto/producto';
import { construirNombreProducto } from '../../../../shared/utils/producto-nombre';

@Component({
  selector: 'app-lista-pedidos',
  imports: [CommonModule, PedidosTable, FormsModule, PedidosModal],
  templateUrl: './lista-pedidos.html',
  styleUrl: './lista-pedidos.css'
})
export class ListaPedidos implements OnInit {

  @Input() productosDisponibles: ProductoResponse[] = [];

  filtrosVisibles = false;
  cargandoDatos = false;

  pedidos: PedidoResponse[] = [];
  pedidosFiltrados: PedidoResponse[] = [];
  proveedores: ProveedorResponse[] = [];

  filtroEstado = '';
  filtroProveedor = '';
  filtroFechaDesde = '';
  filtroFechaHasta = '';

  paginaActual = 1;
  itemsPorPagina = 6;
  totalPaginas = 0;

  puedeGestionar = false;
  puedeRecibir = false;

  mostrarModalDetalle = false;
  pedidoSeleccionado?: PedidoResponse;

  Math = Math;

  get pedidosPaginados(): PedidoResponse[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.pedidosFiltrados.slice(inicio, fin);
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

  onClickPagina(pagina: number | string): void {
    if (typeof pagina === 'number') {
      this.cambiarPagina(pagina);
    }
  }

  formatearNombreProducto(detalle: any): string {
    const producto = this.productosDisponibles.find(p => p.id === detalle.id);
    if (producto) {
      return `${producto.nombre} ${producto.marca} ${producto.tipoProducto} ${producto.cantidadTamanio}${producto.unidadMedida}`;
    }
    return detalle.producto;
  }

  constructor(
    private pedidoService: Pedido,
    private proveedorService: Proveedor,
    private authService: AuthService,
    private productoService: Producto,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.verificarPermisos();
    this.cargarDatos();
  }

  private verificarPermisos(): void {
    this.puedeGestionar = this.authService.puedeGestionarPedidos();
    this.puedeRecibir = this.authService.puedeRecibirPedidos();
  }

  private cargarDatos(): void {
    this.cargandoDatos = true;

    forkJoin({
      pedidos: this.pedidoService.listarTodos(),
      proveedores: this.proveedorService.listarTodos(),
      productos: this.productoService.listarTodos()
    })
      .pipe(
        finalize(() => {
          this.cargandoDatos = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: ({ pedidos, proveedores, productos }) => {
          this.pedidos = (pedidos || []).sort((a, b) => b.id - a.id);
          this.proveedores = proveedores || [];
          this.productosDisponibles = productos || [];
          this.aplicarFiltros();
          this.cdr.detectChanges();
        },
        error: (error) => {
          NotificacionSweet.handleBackendError(error);
        }
      });
  }

  onAgregarPedido(): void {
    this.router.navigate(['/pedidos/agregar']);
  }

  alternarFiltros(): void {
    this.filtrosVisibles = !this.filtrosVisibles;
  }

  aplicarFiltros(): void {
    this.pedidosFiltrados = this.pedidos.filter(pedido => {
      const cumpleEstado = !this.filtroEstado ||
        pedido.estado === this.filtroEstado;

      const cumpleProveedor = !this.filtroProveedor ||
        pedido.proveedor === this.filtroProveedor;

      const cumpleFechaDesde = !this.filtroFechaDesde ||
        new Date(pedido.fechaPedido) >= new Date(this.filtroFechaDesde);

      const cumpleFechaHasta = !this.filtroFechaHasta ||
        new Date(pedido.fechaPedido) <= new Date(this.filtroFechaHasta);

      return cumpleEstado && cumpleProveedor && cumpleFechaDesde && cumpleFechaHasta;
    });

    this.calcularPaginacion();
    this.ajustarPaginaActual();
    this.cdr.detectChanges();
  }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroProveedor = '';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.aplicarFiltros();
  }

  private calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.pedidosFiltrados.length / this.itemsPorPagina);
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

  onVerDetalle(id: number): void {
    const pedido = this.pedidos.find(p => p.id === id);
    if (pedido) {
      const pedidoConNombresCompletos = {
        ...pedido,
        detalles: pedido.detalles.map(detalle => ({
          ...detalle,
          producto: this.formatearDetalleProducto(detalle)
        }))
      };
      this.pedidoSeleccionado = pedidoConNombresCompletos;
      this.mostrarModalDetalle = true;
      this.cdr.detectChanges();
    }
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.pedidoSeleccionado = undefined;
    this.cdr.detectChanges();
  }

  onEditarPedido(id: number): void {
    this.router.navigate(['/pedidos/editar', id]);
  }

  onCancelarPedido(id: number): void {
    const pedido = this.pedidos.find(p => p.id === id);
    if (!pedido) {
      NotificacionSweet.showError('Error', 'Pedido no encontrado');
      return;
    }

    NotificacionSweet.showConfirmation(
      '¿Estás seguro?',
      `¿Deseas cancelar el pedido #${pedido.id}?`,
      'Sí, cancelar',
      'No, mantener'
    ).then((result) => {
      if (result.isConfirmed) {
        this.cancelarPedido(id);
      }
    });
  }

  private cancelarPedido(id: number): void {
    NotificacionSweet.showLoading('Cancelando pedido...');

    this.pedidoService.cancelar(id).subscribe({
      next: (pedidoActualizado: PedidoResponse) => {
        this.actualizarPedidoEnListas(pedidoActualizado);
        this.cdr.detectChanges();
        NotificacionSweet.hideLoading();
        NotificacionSweet.showSuccess(
          '¡Éxito!',
          'Pedido cancelado correctamente'
        );
      },
      error: (error) => {
        NotificacionSweet.hideLoading();
        NotificacionSweet.handleBackendError(error);
      }
    });
  }

  onRecibirPedido(id: number): void {
    this.router.navigate(['/pedidos/recibir', id]);
  }

  private actualizarPedidoEnListas(pedidoActualizado: PedidoResponse): void {
    const indicePedidos = this.pedidos.findIndex(p => p.id === pedidoActualizado.id);
    if (indicePedidos !== -1) {
      this.pedidos[indicePedidos] = { ...pedidoActualizado };
    }

    const indiceFiltrados = this.pedidosFiltrados.findIndex(p => p.id === pedidoActualizado.id);
    if (indiceFiltrados !== -1) {
      this.pedidosFiltrados[indiceFiltrados] = { ...pedidoActualizado };
    }

    this.calcularPaginacion();
  }

  formatearDetalleProducto(detalle: any): string {
    const producto = this.productosDisponibles.find(p => {
      const nombreCompleto = `${p.nombre} ${p.marca} ${p.tipoProducto} ${p.cantidadTamanio}${p.unidadMedida}`;
      return nombreCompleto.includes(detalle.producto) || detalle.producto.includes(p.nombre);
    });

    if (producto) {
      const nombreSinFormato = `${producto.nombre} ${producto.marca} ${producto.tipoProducto} ${producto.cantidadTamanio}${producto.unidadMedida}`;
      return construirNombreProducto({ nombreProducto: nombreSinFormato });
    }
    return construirNombreProducto({ nombreProducto: detalle.producto });
  }

}
