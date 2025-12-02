import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Carrito, ItemCarrito } from '../../../../core/services/carrito/carrito';
import { Cliente } from '../../../../core/services/cliente/cliente';
import { MetodoPago } from '../../../../core/services/metodo-pago/metodo-pago';
import { Venta } from '../../../../core/services/venta/venta';
import { ReniecService, DatosPersona } from '../../../../core/services/api/reniec-service';
import { SunatService, DatosEmpresa } from '../../../../core/services/api/sunat-service';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { MetodoPagoResponse } from '../../../../models/metodo-pago';
import { TipoComprobante, CrearVentaRequest, DetalleVentaDTO } from '../../../../models/venta';
import { CrearClienteRequest } from '../../../../models/cliente';
import { construirNombreProducto } from '../../../../shared/utils/producto-nombre';
import { ProductoResponse } from '../../../../models/producto';
import { Comprobante } from '../../../../core/services/comprobante/comprobante';

type TipoDocumento = 'DNI' | 'RUC';

interface DatosCliente {
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombre: string;
  direccion?: string;
  existeEnBD: boolean;
}

@Component({
  selector: 'app-pagar',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pagar.html',
  styleUrl: './pagar.css'
})
export class Pagar implements OnInit, OnDestroy {

  pasoActual: number = 1;

  tipoDocumento: TipoDocumento = 'DNI';
  numeroDocumento: string = '';
  datosCliente: DatosCliente | null = null;
  buscandoCliente: boolean = false;

  metodosPago: MetodoPagoResponse[] = [];
  metodoPagoSeleccionado: number | null = null;

  itemsCarrito: ItemCarrito[] = [];
  private subscription?: Subscription;

  procesandoVenta: boolean = false;

  constructor(
    private carritoService: Carrito,
    private clienteService: Cliente,
    private metodoPagoService: MetodoPago,
    private ventaService: Venta,
    private reniecService: ReniecService,
    private sunatService: SunatService,
    private router: Router,
    private comprobantePdfService: Comprobante,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.subscription = this.carritoService.items$.subscribe(items => {
      this.itemsCarrito = items;
      if (items.length === 0) {
        this.router.navigate(['/venta']);
      }
    });

    this.cargarMetodosPago();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private cargarMetodosPago(): void {
    this.metodoPagoService.listarActivos().subscribe({
      next: (metodos) => {
        this.metodosPago = metodos;
      },
      error: (error) => {
        console.error('Error al cargar métodos de pago:', error);
      }
    });
  }

  seleccionarTipoDocumento(tipo: TipoDocumento): void {
    this.tipoDocumento = tipo;
    this.numeroDocumento = '';
    this.datosCliente = null;
  }

  buscarCliente(): void {
    if (!this.numeroDocumento || this.numeroDocumento.trim() === '') {
      NotificacionSweet.showWarning('Documento requerido', 'Ingresa el número de documento');
      return;
    }

    const documento = this.numeroDocumento.trim();

    if (this.tipoDocumento === 'DNI' && documento.length !== 8) {
      NotificacionSweet.showWarning('DNI inválido', 'El DNI debe tener 8 dígitos');
      return;
    }

    if (this.tipoDocumento === 'RUC' && documento.length !== 11) {
      NotificacionSweet.showWarning('RUC inválido', 'El RUC debe tener 11 dígitos');
      return;
    }

    this.buscandoCliente = true;
    NotificacionSweet.showLoading('Buscando cliente...');

    if (this.tipoDocumento === 'DNI') {
      this.buscarClientePorDni(documento);
    } else {
      this.buscarClientePorRuc(documento);
    }
  }

  private buscarClientePorDni(dni: string): void {
    this.clienteService.buscarPorDni(dni).subscribe({
      next: (cliente) => {
        this.datosCliente = {
          tipoDocumento: 'DNI',
          numeroDocumento: dni,
          nombre: cliente.nombre,
          direccion: cliente.direccionFiscal,
          existeEnBD: true
        };
        this.buscandoCliente = false;
        NotificacionSweet.hideLoading();
        this.cdr.detectChanges();
      },
      error: () => {
        this.buscarEnReniec(dni);
      }
    });
  }

  private buscarClientePorRuc(ruc: string): void {
    this.clienteService.buscarPorRuc(ruc).subscribe({
      next: (cliente) => {
        this.datosCliente = {
          tipoDocumento: 'RUC',
          numeroDocumento: ruc,
          nombre: cliente.nombre,
          direccion: cliente.direccionFiscal,
          existeEnBD: true
        };
        this.buscandoCliente = false;
        NotificacionSweet.hideLoading();
        this.cdr.detectChanges();
      },
      error: () => {
        this.buscarEnSunat(ruc);
      }
    });
  }

  private buscarEnReniec(dni: string): void {
    this.reniecService.buscarPorDni(dni).subscribe({
      next: (datos: DatosPersona) => {
        this.datosCliente = {
          tipoDocumento: 'DNI',
          numeroDocumento: dni,
          nombre: datos.nombreCompleto,
          direccion: undefined,
          existeEnBD: false
        };
        this.buscandoCliente = false;
        NotificacionSweet.hideLoading();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.buscandoCliente = false;
        NotificacionSweet.hideLoading();
        this.cdr.detectChanges();
      }
    });
  }

  private buscarEnSunat(ruc: string): void {
    this.sunatService.buscarPorRuc(ruc).subscribe({
      next: (datos: DatosEmpresa) => {
        this.datosCliente = {
          tipoDocumento: 'RUC',
          numeroDocumento: ruc,
          nombre: datos.razonSocial,
          direccion: datos.direccion,
          existeEnBD: false
        };
        this.buscandoCliente = false;
        NotificacionSweet.hideLoading();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.buscandoCliente = false;
        NotificacionSweet.hideLoading();
        this.cdr.detectChanges();
      }
    });
  }

  limpiarDatosCliente(): void {
    this.numeroDocumento = '';
    this.datosCliente = null;
  }

  siguientePaso(): void {
    if (this.pasoActual === 1) {
      if (!this.datosCliente) {
        NotificacionSweet.showWarning('Datos incompletos', 'Debes buscar los datos del cliente');
        return;
      }
      this.pasoActual = 2;
    } else if (this.pasoActual === 2) {
      if (!this.metodoPagoSeleccionado) {
        NotificacionSweet.showWarning('Método de pago requerido', 'Selecciona un método de pago');
        return;
      }
      this.pasoActual = 3;
    }
  }

  pasoAnterior(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }
  }

  seleccionarMetodoPago(id: number): void {
    this.metodoPagoSeleccionado = id;
  }

  finalizarCompra(): void {
    if (!this.datosCliente || !this.metodoPagoSeleccionado) {
      NotificacionSweet.showError('Error', 'Faltan datos para completar la venta');
      return;
    }

    NotificacionSweet.showConfirmation(
      '¿Finalizar compra?',
      '¿Estás seguro de procesar esta venta?',
      'Sí, procesar',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.procesarVenta();
      }
    });
  }

  private procesarVenta(): void {
    if (!this.datosCliente || !this.metodoPagoSeleccionado) return;

    this.procesandoVenta = true;
    NotificacionSweet.showLoading('Procesando venta...');

    const tipoComprobante: TipoComprobante = this.tipoDocumento === 'RUC'
      ? TipoComprobante.FACTURA
      : TipoComprobante.BOLETA;

    const clienteRequest: CrearClienteRequest = {
      nombre: this.datosCliente.nombre,
      dni: this.tipoDocumento === 'DNI' ? this.datosCliente.numeroDocumento : undefined,
      ruc: this.tipoDocumento === 'RUC' ? this.datosCliente.numeroDocumento : undefined,
      direccionFiscal: this.datosCliente.direccion || undefined
    };

    const detalles: DetalleVentaDTO[] = this.itemsCarrito.map(item => ({
      productoId: item.producto.id,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario
    }));

    const ventaRequest: CrearVentaRequest = {
      metodoPagoId: this.metodoPagoSeleccionado,
      tipoComprobante: tipoComprobante,
      cliente: clienteRequest,
      detalles: detalles
    };

    this.ventaService.crear(ventaRequest).subscribe({
      next: (venta) => {
        this.procesandoVenta = false;
        NotificacionSweet.hideLoading();

        this.carritoService.vaciarCarrito();

        NotificacionSweet.showSuccess(
          '¡Venta realizada!',
          `${venta.tipoComprobante} ${venta.numeroComprobante} generada correctamente`
        ).then(() => {
          this.router.navigate(['/venta']);
        });
      },
      error: (error) => {
        this.procesandoVenta = false;
        console.error('Error al procesar venta:', error);
      }
    });
  }

  //DESCOMENTAR PARA GENERAR PDF AUTOMÁTICAMENTE
  // private procesarVenta(): void {
  //   if (!this.datosCliente || !this.metodoPagoSeleccionado) return;

  //   this.procesandoVenta = true;
  //   NotificacionSweet.showLoading('Procesando venta...');

  //   const tipoComprobante: TipoComprobante = this.tipoDocumento === 'RUC'
  //     ? TipoComprobante.FACTURA
  //     : TipoComprobante.BOLETA;

  //   const clienteRequest: CrearClienteRequest = {
  //     nombre: this.datosCliente.nombre,
  //     dni: this.tipoDocumento === 'DNI' ? this.datosCliente.numeroDocumento : undefined,
  //     ruc: this.tipoDocumento === 'RUC' ? this.datosCliente.numeroDocumento : undefined,
  //     direccionFiscal: this.datosCliente.direccion || undefined
  //   };

  //   const detalles: DetalleVentaDTO[] = this.itemsCarrito.map(item => ({
  //     productoId: item.producto.id,
  //     cantidad: item.cantidad,
  //     precioUnitario: item.precioUnitario
  //   }));

  //   const ventaRequest: CrearVentaRequest = {
  //     metodoPagoId: this.metodoPagoSeleccionado,
  //     tipoComprobante: tipoComprobante,
  //     cliente: clienteRequest,
  //     detalles: detalles
  //   };

  //   this.ventaService.crear(ventaRequest).subscribe({
  //     next: (venta) => {
  //       this.procesandoVenta = false;
  //       NotificacionSweet.hideLoading();

  //       this.carritoService.vaciarCarrito();

  //       // GENERAR PDF AUTOMÁTICAMENTE
  //       this.comprobantePdfService.generarComprobante(venta);

  //       NotificacionSweet.showSuccess(
  //         '¡Venta realizada!',
  //         `${venta.tipoComprobante} ${venta.numeroComprobante} generada correctamente. El PDF se descargará automáticamente.`
  //       ).then(() => {
  //         this.router.navigate(['/venta']);
  //       });
  //     },
  //     error: (error) => {
  //       this.procesandoVenta = false;
  //       console.error('Error al procesar venta:', error);
  //     }
  //   });
  // }

  volverAlCarrito(): void {
    this.router.navigate(['/venta/carrito']);
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

  getTipoComprobante(): string {
    return this.tipoDocumento === 'RUC' ? 'FACTURA' : 'BOLETA';
  }

  getMetodoPagoNombre(): string {
    const metodo = this.metodosPago.find(m => m.id === this.metodoPagoSeleccionado);
    return metodo ? metodo.nombre : '';
  }

  obtenerNombreCompleto(producto: ProductoResponse): string {
    const nombreSinFormato = `${producto.nombre} ${producto.marca} ${producto.tipoProducto} ${producto.cantidadTamanio}${producto.unidadMedida}`;
    return construirNombreProducto({ nombreProducto: nombreSinFormato });
  }

}
