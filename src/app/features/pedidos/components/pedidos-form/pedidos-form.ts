import { Component, ChangeDetectorRef, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Validaciones } from '../../../../core/services/validaciones/validaciones';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { ProveedorResponse } from '../../../../models/proveedor';
import { ProductoResponse } from '../../../../models/producto';
import { CrearPedidoRequest, ActualizarPedidoRequest, PedidoResponse } from '../../../../models/pedido';
import { CrearDetallePedidoRequest } from '../../../../models/detalle-pedido';
import { finalize } from 'rxjs';
import { Proveedor } from '../../../../core/services/proveedor/proveedor';
import { Producto } from '../../../../core/services/producto/producto';
import { Router } from '@angular/router';
import { construirNombreProducto } from '../../../../shared/utils/producto-nombre';

interface DetalleTemp {
  id?: number;
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioCompraUnitario: number;
  subtotal: number;
}

@Component({
  selector: 'app-pedidos-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pedidos-form.html',
  styleUrl: './pedidos-form.css'
})
export class PedidosForm implements OnInit, OnChanges {

  @Input() modoEdicion: boolean = false;
  @Input() pedidoId?: number;
  @Input() pedidoData?: PedidoResponse;

  @Output() alEnviarFormulario = new EventEmitter<CrearPedidoRequest>();
  @Output() alActualizarFormulario = new EventEmitter<{ id: number, request: ActualizarPedidoRequest }>();

  formularioPedido: FormGroup;
  enviandoFormulario: boolean = false;

  proveedoresDisponibles: ProveedorResponse[] = [];
  productosDisponibles: ProductoResponse[] = [];
  productosFiltrados: ProductoResponse[] = [];

  cargandoProveedores: boolean = false;
  cargandoProductos: boolean = false;

  busquedaProducto: string = '';
  productoSeleccionado: ProductoResponse | null = null;
  mostrarSugerencias: boolean = false;
  cantidadDetalle: number = 1;
  precioUnitarioDetalle: number = 0;

  detallesPedido: DetalleTemp[] = [];
  detalleEditando: number | null = null;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    public validacionFormulario: Validaciones,
    private proveedorService: Proveedor,
    private productoService: Producto,
    private router: Router
  ) {
    this.formularioPedido = this.crearFormulario();
    this.inicializarEventListeners();
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pedidoData'] && this.modoEdicion && this.pedidoData) {
      if (this.proveedoresDisponibles.length > 0) {
        this.cargarDatosPedido();
      }
    }
    this.cdr.detectChanges();
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      fechaEntregaEsperada: ['', [Validators.required]],
      proveedorId: ['', [Validators.required]]
    });
  }

  private inicializarEventListeners(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.relative')) {
          this.mostrarSugerencias = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  private cargarDatosIniciales(): void {
    this.cargarProveedores();
    this.cargarProductos();
  }

  private cargarDatosPedido(): void {
    if (!this.pedidoData) return;

    const proveedor = this.proveedoresDisponibles.find(p => p.nombre === this.pedidoData?.proveedor);

    const fecha = new Date(this.pedidoData.fechaEntregaEsperada);
    const fechaFormateada = fecha.toISOString().slice(0, 16);

    this.formularioPedido.patchValue({
      fechaEntregaEsperada: fechaFormateada,
      proveedorId: proveedor?.id || ''
    });

    if (this.pedidoData.detalles && this.pedidoData.detalles.length > 0) {
      this.detallesPedido = this.pedidoData.detalles.map(detalle => ({
        id: detalle.id,
        productoId: detalle.id,
        nombreProducto: detalle.producto,
        cantidad: detalle.cantidad,
        precioCompraUnitario: detalle.precioCompraUnitario,
        subtotal: detalle.subtotal
      }));
    }

    this.cdr.detectChanges();
  }

  volverAListaPedidos(): void {
    this.router.navigate(['/pedidos']);
  }

  cargarProveedores(): void {
    this.cargandoProveedores = true;

    this.proveedorService.listarActivos()
      .pipe(finalize(() => {
        this.cargandoProveedores = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (proveedores) => {
          this.proveedoresDisponibles = proveedores;
          if (this.modoEdicion && this.pedidoData) {
            this.cargarDatosPedido();
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar proveedores:', error);
          NotificacionSweet.showError('Error', 'No se pudieron cargar los proveedores disponibles');
          this.proveedoresDisponibles = [];
        }
      });
  }

  cargarProductos(): void {
    this.cargandoProductos = true;

    this.productoService.listarActivos()
      .pipe(finalize(() => {
        this.cargandoProductos = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (productos) => {
          this.productosDisponibles = productos;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar productos:', error);
          NotificacionSweet.showError('Error', 'No se pudieron cargar los productos disponibles');
          this.productosDisponibles = [];
        }
      });
  }

  formatearNombreProducto(producto: ProductoResponse): string {
    const nombreSinFormato = `${producto.nombre} ${producto.marca} ${producto.tipoProducto} ${producto.cantidadTamanio}${producto.unidadMedida}`;
    return construirNombreProducto({ nombreProducto: nombreSinFormato });
  }

  onBuscarProducto(): void {
    if (!this.busquedaProducto || this.busquedaProducto.trim().length === 0) {
      this.productosFiltrados = [];
      this.mostrarSugerencias = false;
      this.cdr.detectChanges();
      return;
    }

    const termino = this.busquedaProducto.toLowerCase().trim();
    this.productosFiltrados = this.productosDisponibles.filter(producto => {
      const nombreCompleto = this.formatearNombreProducto(producto).toLowerCase();
      return nombreCompleto.includes(termino);
    }); //.slice(0, 10);

    this.mostrarSugerencias = this.productosFiltrados.length > 0;
    this.cdr.detectChanges();
  }

  seleccionarProducto(producto: ProductoResponse): void {
    this.productoSeleccionado = producto;
    this.busquedaProducto = this.formatearNombreProducto(producto);
    this.mostrarSugerencias = false;
    this.precioUnitarioDetalle = 0;
    this.cdr.detectChanges();
  }

  limpiarProductoSeleccionado(): void {
    this.productoSeleccionado = null;
    this.busquedaProducto = '';
    this.productosFiltrados = [];
    this.mostrarSugerencias = false;
    this.cantidadDetalle = 1;
    this.precioUnitarioDetalle = 0;
    this.cdr.detectChanges();
  }

  agregarDetalle(): void {
    if (!this.productoSeleccionado) {
      NotificacionSweet.showWarning('Producto requerido', 'Debe seleccionar un producto');
      return;
    }

    if (!this.cantidadDetalle || this.cantidadDetalle <= 0) {
      NotificacionSweet.showWarning('Cantidad inválida', 'La cantidad debe ser mayor a 0');
      return;
    }

    if (!this.precioUnitarioDetalle || this.precioUnitarioDetalle <= 0) {
      NotificacionSweet.showWarning('Precio inválido', 'El precio unitario debe ser mayor a 0');
      return;
    }

    const existe = this.detallesPedido.find(d => d.productoId === this.productoSeleccionado!.id);
    if (existe) {
      NotificacionSweet.showWarning('Producto duplicado', 'Este producto ya está en el pedido. Edítelo desde la tabla.');
      return;
    }

    const subtotal = this.cantidadDetalle * this.precioUnitarioDetalle;

    const nuevoDetalle: DetalleTemp = {
      productoId: this.productoSeleccionado.id,
      nombreProducto: this.formatearNombreProducto(this.productoSeleccionado),
      cantidad: this.cantidadDetalle,
      precioCompraUnitario: this.precioUnitarioDetalle,
      subtotal: subtotal
    };

    this.detallesPedido.push(nuevoDetalle);
    this.limpiarProductoSeleccionado();

    NotificacionSweet.showSuccess('¡Producto agregado!', 'El producto se ha agregado al pedido');
    this.cdr.detectChanges();
  }

  editarDetalle(index: number): void {
    this.detalleEditando = index;
    this.cdr.detectChanges();
  }

  guardarEdicion(): void {
    if (this.detalleEditando !== null) {
      const detalle = this.detallesPedido[this.detalleEditando];

      if (detalle.cantidad <= 0) {
        NotificacionSweet.showWarning('Cantidad inválida', 'La cantidad debe ser mayor a 0');
        return;
      }

      if (detalle.precioCompraUnitario <= 0) {
        NotificacionSweet.showWarning('Precio inválido', 'El precio unitario debe ser mayor a 0');
        return;
      }

      this.calcularSubtotal(detalle);
      this.detalleEditando = null;
      NotificacionSweet.showSuccess('¡Guardado!', 'Los cambios se han guardado correctamente');
      this.cdr.detectChanges();
    }
  }

  eliminarDetalle(index: number): void {
    const detalle = this.detallesPedido[index];

    NotificacionSweet.showConfirmation(
      '¿Eliminar producto?',
      `¿Deseas eliminar "${detalle.nombreProducto}" del pedido?`,
      'Sí, eliminar',
      'No, mantener'
    ).then((result) => {
      if (result.isConfirmed) {
        this.detallesPedido.splice(index, 1);
        if (this.detalleEditando === index) {
          this.detalleEditando = null;
        }
        NotificacionSweet.showSuccess('¡Eliminado!', 'El producto se ha eliminado del pedido');
        this.cdr.detectChanges();
      }
    });
  }

  calcularSubtotal(detalle: DetalleTemp): void {
    detalle.subtotal = detalle.cantidad * detalle.precioCompraUnitario;
    this.cdr.detectChanges();
  }

  calcularTotal(): number {
    return this.detallesPedido.reduce((total, detalle) => total + detalle.subtotal, 0);
  }

  enviarFormulario(): void {
    if (this.enviandoFormulario) return;

    Object.keys(this.formularioPedido.controls).forEach(key => {
      this.formularioPedido.get(key)?.markAsTouched();
    });

    if (this.formularioPedido.invalid) {
      NotificacionSweet.showWarning('Formulario incompleto', 'Por favor complete todos los campos requeridos');
      return;
    }

    if (this.detallesPedido.length === 0) {
      NotificacionSweet.showWarning('Sin productos', 'Debe agregar al menos un producto al pedido');
      return;
    }

    if (this.modoEdicion) {
      this.enviarActualizacion();
    } else {
      this.enviarCreacion();
    }
  }

  private enviarCreacion(): void {
    this.enviandoFormulario = true;

    const detalles: CrearDetallePedidoRequest[] = this.detallesPedido.map(detalle => ({
      productoId: detalle.productoId,
      cantidad: detalle.cantidad,
      precioCompraUnitario: detalle.precioCompraUnitario
    }));

    const request: CrearPedidoRequest = {
      fechaEntregaEsperada: this.formularioPedido.get('fechaEntregaEsperada')?.value,
      proveedorId: Number(this.formularioPedido.get('proveedorId')?.value),
      detalles: detalles
    };

    this.alEnviarFormulario.emit(request);
  }

  private enviarActualizacion(): void {
    if (!this.pedidoId) {
      NotificacionSweet.showError('Error', 'ID de pedido no disponible');
      return;
    }

    this.enviandoFormulario = true;

    const detalles = this.detallesPedido.map(detalle => ({
      productoId: detalle.productoId,
      cantidad: detalle.cantidad,
      precioCompraUnitario: detalle.precioCompraUnitario
    }));

    const request: ActualizarPedidoRequest = {
      fechaEntregaEsperada: this.formularioPedido.get('fechaEntregaEsperada')?.value,
      proveedorId: Number(this.formularioPedido.get('proveedorId')?.value),
      detalles: detalles
    };

    this.alActualizarFormulario.emit({
      id: this.pedidoId,
      request
    });
  }

  restablecerEstadoEnvio(): void {
    this.enviandoFormulario = false;
    this.cdr.detectChanges();
  }

  limpiarFormulario(): void {
    this.enviandoFormulario = false;

    this.formularioPedido.reset({
      fechaEntregaEsperada: '',
      proveedorId: ''
    });

    this.formularioPedido.markAsPristine();
    this.formularioPedido.markAsUntouched();

    this.detallesPedido = [];
    this.limpiarProductoSeleccionado();
    this.detalleEditando = null;

    this.cdr.detectChanges();
  }

}
