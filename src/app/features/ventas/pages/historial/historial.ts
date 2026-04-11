import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize, forkJoin } from 'rxjs';
import { Venta } from '../../../../core/services/venta/venta';
import { AuthService } from '../../../../core/services/auth/auth-service';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { VentaResponse } from '../../../../models/venta';
import { VentasTable } from '../../components/ventas-table/ventas-table';
import { VentasModal } from '../../components/ventas-modal/ventas-modal';

@Component({
  selector: 'app-historial',
  imports: [CommonModule, FormsModule, VentasTable, VentasModal],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class Historial implements OnInit, OnDestroy {

  filtrosVisibles = false;
  cargandoDatos = false;

  ventas: VentaResponse[] = [];
  ventasFiltradas: VentaResponse[] = [];

  filtroFecha = '';
  filtroDniRuc = '';
  filtroVendedor = '';
  filtroCodigo = '';

  paginaActual = 1;
  itemsPorPagina = 8;
  totalPaginas = 0;

  puedeVerTodasLasVentas = false;

  mostrarModalDetalle = false;
  ventaSeleccionada?: VentaResponse;

  Math = Math;

  get ventasPaginadas(): VentaResponse[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.ventasFiltradas.slice(inicio, fin);
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

  constructor(
    private ventaService: Venta,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.verificarPermisos();
    this.establecerFechaActual();
    this.cargarDatos();
  }

  ngOnDestroy(): void { }

  private verificarPermisos(): void {
    this.puedeVerTodasLasVentas = this.authService.puedeVerTodasLasVentas();
  }

  private establecerFechaActual(): void {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    this.filtroFecha = `${año}-${mes}-${dia}`;
  }

  private cargarDatos(): void {
    this.cargandoDatos = true;

    let observable;

    if (this.puedeVerTodasLasVentas) {
      observable = this.ventaService.listarTodas();
    } else {
      const usuario = this.authService.obtenerUsuarioActual();
      if (usuario?.id) {
        observable = this.ventaService.listarPorUsuario(usuario.id);
      } else {
        this.cargandoDatos = false;
        NotificacionSweet.showError('Error', 'No se pudo obtener el usuario actual');
        return;
      }
    }

    observable
      .pipe(
        finalize(() => {
          this.cargandoDatos = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (ventas) => {
          this.ventas = (ventas || []).sort((a, b) => b.id - a.id);
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

  get totalVentasFiltradas(): number {
    return this.ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0);
  }

  get totalVentasPaginadas(): number {
    return this.ventasPaginadas.reduce((sum, venta) => sum + venta.total, 0);
  }

  avanzarDia(): void {
    const fecha = new Date(this.filtroFecha + 'T12:00:00');
    fecha.setDate(fecha.getDate() + 1);
    this.filtroFecha = this.formatearFechaISO(fecha);
    this.aplicarFiltros();
  }

  retrocederDia(): void {
    const fecha = new Date(this.filtroFecha + 'T12:00:00');
    fecha.setDate(fecha.getDate() - 1);
    this.filtroFecha = this.formatearFechaISO(fecha);
    this.aplicarFiltros();
  }

  irAHoy(): void {
    this.establecerFechaActual();
    this.aplicarFiltros();
  }

  private formatearFechaISO(fecha: Date): string {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  aplicarFiltros(): void {
    this.ventasFiltradas = this.ventas.filter(venta => {
      const fechaVenta = venta.fecha.split('T')[0];

      const cumpleFecha = !this.filtroFecha || fechaVenta === this.filtroFecha;

      const cumpleDniRuc = !this.filtroDniRuc ||
        (venta.cliente.dni && venta.cliente.dni.includes(this.filtroDniRuc)) ||
        (venta.cliente.ruc && venta.cliente.ruc.includes(this.filtroDniRuc));

      const cumpleVendedor = !this.filtroVendedor ||
        venta.usuario.toLowerCase().includes(this.filtroVendedor.toLowerCase());

      const cumpleCodigo = !this.filtroCodigo ||
        venta.numeroComprobante.toLowerCase().includes(this.filtroCodigo.toLowerCase());

      return cumpleFecha && cumpleDniRuc && cumpleVendedor && cumpleCodigo;
    });

    this.calcularPaginacion();
    this.ajustarPaginaActual();
    this.cdr.detectChanges();
  }

  limpiarFiltros(): void {
    this.establecerFechaActual();
    this.filtroDniRuc = '';
    this.filtroVendedor = '';
    this.filtroCodigo = '';
    this.aplicarFiltros();
  }

  private calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.ventasFiltradas.length / this.itemsPorPagina);
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
    const venta = this.ventas.find(v => v.id === id);
    if (venta) {
      this.ventaSeleccionada = venta;
      this.mostrarModalDetalle = true;
      this.cdr.detectChanges();
    }
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.ventaSeleccionada = undefined;
    this.cdr.detectChanges();
  }

  get metodosPagoUnicos(): string[] {
    const metodos = new Set(this.ventas.map(v => v.metodoPago));
    return Array.from(metodos).sort();
  }

  obtenerTotalPorMetodo(metodo: string): number {
    return this.ventasFiltradas
      .filter(v => v.metodoPago === metodo)
      .reduce((sum, venta) => sum + venta.total, 0);
  }

  obtenerCantidadPorMetodo(metodo: string): number {
    return this.ventasFiltradas.filter(v => v.metodoPago === metodo).length;
  }

  obtenerMetodosPagoAdicionales(): string[] {
    const metodosBase = ['EFECTIVO', 'YAPE'];
    const todosMetodos = new Set(this.ventasFiltradas.map(v => v.metodoPago));
    return Array.from(todosMetodos).filter(m => !metodosBase.includes(m)).sort();
  }

  obtenerTotalProductosVendidos(): number {
    return this.ventasFiltradas.reduce((total, venta) => {
      const cantidadVenta = venta.detalles.reduce((sum, detalle) => sum + detalle.cantidad, 0);
      return total + cantidadVenta;
    }, 0);
  }

}
