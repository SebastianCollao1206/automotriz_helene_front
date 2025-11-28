import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Subscription, forkJoin } from 'rxjs';
import { Pedido } from '../../../../core/services/pedido/pedido';
import { DetallePedido } from '../../../../core/services/detalle-pedido/detalle-pedido';
import { Producto } from '../../../../core/services/producto/producto';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { PedidoResponse } from '../../../../models/pedido';
import { DetallePedidoResponse, EstadoDetallePedido } from '../../../../models/detalle-pedido';
import { ProductoResponse } from '../../../../models/producto';
import { EstadoDetallePedidoBadges, EstadoDetallePedidoLabels } from '../../../../core/constants/pedido-constants';
import { construirNombreProducto } from '../../../../shared/utils/producto-nombre';

interface DetalleRecepcion {
  id: number;
  nombreProducto: string;
  cantidadPedida: number;
  cantidadRestante: number;
  cantidadRecibida: number;
  recepcionCompleta: boolean;
  estadoActual: EstadoDetallePedido;
}

@Component({
  selector: 'app-recibir-pedidos',
  imports: [CommonModule, FormsModule],
  templateUrl: './recibir-pedidos.html',
  styleUrl: './recibir-pedidos.css'
})
export class RecibirPedidos implements OnInit, OnDestroy {

  pedidoId?: number;
  pedidoData?: PedidoResponse;
  productosDisponibles: ProductoResponse[] = [];
  detallesRecepcion: DetalleRecepcion[] = [];

  cargandoDatos: boolean = false;
  enviandoRecepcion: boolean = false;

  estadoBadges = EstadoDetallePedidoBadges;
  estadoLabels = EstadoDetallePedidoLabels;

  private routeSubscription?: Subscription;

  constructor(
    private pedidoService: Pedido,
    private detallePedidoService: DetallePedido,
    private productoService: Producto,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      if (params['id']) {
        this.pedidoId = +params['id'];
        this.cargarDatos();
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  private cargarDatos(): void {
    if (!this.pedidoId) return;

    this.cargandoDatos = true;
    this.cdr.detectChanges();

    forkJoin({
      pedido: this.pedidoService.buscarPorId(this.pedidoId),
      productos: this.productoService.listarTodos()
    })
      .pipe(
        finalize(() => {
          this.cargandoDatos = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: ({ pedido, productos }) => {
          this.productosDisponibles = productos || [];
          this.pedidoData = pedido;
          this.prepararDetallesRecepcion();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar datos:', error);
          NotificacionSweet.handleBackendError(error);
          this.router.navigate(['/pedidos']);
        }
      });
  }

  private prepararDetallesRecepcion(): void {
    if (!this.pedidoData?.detalles) return;

    this.detallesRecepcion = this.pedidoData.detalles.map(detalle => {
      const cantidadRecibidaPrevia = detalle.cantidadRecibida || 0;
      const cantidadRestante = detalle.cantidad - cantidadRecibidaPrevia;

      const esEntregaIncompleta = detalle.estado === 'ENTREGA_INCOMPLETA';

      return {
        id: detalle.id,
        nombreProducto: this.formatearNombreProducto(detalle),
        cantidadPedida: detalle.cantidad,
        cantidadRestante: cantidadRestante,
        cantidadRecibida: esEntregaIncompleta ? cantidadRecibidaPrevia : cantidadRestante,
        recepcionCompleta: !esEntregaIncompleta,
        estadoActual: detalle.estado
      };
    });
  }

  private formatearNombreProducto(detalle: DetallePedidoResponse): string {
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

  marcarRecepcionCompleta(index: number): void {
    const detalle = this.detallesRecepcion[index];
    if (detalle.estadoActual === 'ENTREGA_COMPLETA') return;

    detalle.recepcionCompleta = true;
    detalle.cantidadRecibida = detalle.cantidadRestante;
    this.cdr.detectChanges();
  }

  marcarRecepcionParcial(index: number): void {
    const detalle = this.detallesRecepcion[index];
    if (detalle.estadoActual === 'ENTREGA_COMPLETA') return;

    detalle.recepcionCompleta = false;
    detalle.cantidadRecibida = 0;
    this.cdr.detectChanges();
  }

  hayDetallesParaRecibir(): boolean {
    return this.detallesRecepcion.some(detalle =>
      detalle.estadoActual !== 'ENTREGA_COMPLETA' &&
      (detalle.recepcionCompleta || detalle.cantidadRecibida > 0)
    );
  }

  enviarRecepcion(): void {
    if (this.enviandoRecepcion) return;

    const detallesInvalidos = this.detallesRecepcion.filter(detalle =>
      !detalle.recepcionCompleta &&
      detalle.estadoActual !== 'ENTREGA_COMPLETA' &&
      (detalle.cantidadRecibida <= 0 || detalle.cantidadRecibida > detalle.cantidadRestante)
    );

    if (detallesInvalidos.length > 0) {
      NotificacionSweet.showWarning(
        'Cantidades inválidas',
        'Verifique que las cantidades parciales sean mayores a 0 y no excedan la cantidad restante'
      );
      return;
    }

    if (!this.hayDetallesParaRecibir()) {
      NotificacionSweet.showWarning(
        'Sin productos para recibir',
        'Debe indicar al menos un producto recibido'
      );
      return;
    }

    NotificacionSweet.showConfirmation(
      '¿Confirmar recepción?',
      '¿Desea confirmar la recepción de estos productos?',
      'Sí, confirmar',
      'No, revisar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.procesarRecepcion();
      }
    });
  }

  private procesarRecepcion(): void {
    this.enviandoRecepcion = true;
    NotificacionSweet.showLoading('Procesando recepción...');

    const detallesParaRecibir = this.detallesRecepcion
      .filter(detalle =>
        detalle.estadoActual !== 'ENTREGA_COMPLETA' &&
        (detalle.recepcionCompleta || detalle.cantidadRecibida > 0)
      )
      .map(detalle => ({
        detalleId: detalle.id,
        cantidadRecibida: detalle.cantidadRecibida
      }));

    this.detallePedidoService.recibirProductos(this.pedidoId!, {
      detalles: detallesParaRecibir
    })
      .pipe(
        finalize(() => {
          this.enviandoRecepcion = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          NotificacionSweet.hideLoading();
          NotificacionSweet.showSuccess(
            '¡Recepción exitosa!',
            'Los productos han sido recibidos correctamente'
          ).then(() => {
            this.router.navigate(['/pedidos']);
          });
        },
        error: (error) => {
          console.error('Error al procesar recepción:', error);
          NotificacionSweet.hideLoading();
          NotificacionSweet.handleBackendError(error);
        }
      });
  }

  volverAListaPedidos(): void {
    this.router.navigate(['/pedidos']);
  }

  getEstadoBadge(estado: string): string {
    return this.estadoBadges[estado as keyof typeof this.estadoBadges] || 'badge-gris';
  }

  getEstadoLabel(estado: string): string {
    return this.estadoLabels[estado as keyof typeof this.estadoLabels] || estado;
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

}
