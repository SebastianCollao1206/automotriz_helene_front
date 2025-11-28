import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { PedidosForm } from '../../components/pedidos-form/pedidos-form';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Pedido } from '../../../../core/services/pedido/pedido';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { CrearPedidoRequest, PedidoResponse, ActualizarPedidoRequest } from '../../../../models/pedido';
import { finalize, Subscription, forkJoin } from 'rxjs';
import { ProductoResponse } from '../../../../models/producto';
import { Producto } from '../../../../core/services/producto/producto';
import { construirNombreProducto } from '../../../../shared/utils/producto-nombre';

@Component({
  selector: 'app-gestion-pedidos',
  imports: [CommonModule, PedidosForm],
  templateUrl: './gestion-pedidos.html',
  styleUrl: './gestion-pedidos.css'
})
export class GestionPedidos implements OnInit, OnDestroy {

  @ViewChild(PedidosForm) formularioHijo!: PedidosForm;

  modoEdicion: boolean = false;
  pedidoId?: number;
  pedidoData?: PedidoResponse;
  cargandoDatos: boolean = false;
  productosDisponibles: ProductoResponse[] = [];

  private routeSubscription?: Subscription;

  constructor(
    private pedidoService: Pedido,
    private productoService: Producto,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.pedidoData = undefined;
      this.cargandoDatos = false;
      this.modoEdicion = false;
      this.pedidoId = undefined;

      this.cdr.detectChanges();

      if (params['id']) {
        this.pedidoId = +params['id'];
        this.modoEdicion = true;
        this.cargarPedido();
      } else {
        setTimeout(() => {
          if (this.formularioHijo) {
            this.formularioHijo.limpiarFormulario();
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  cargarPedido(): void {
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

          const pedidoConNombresCompletos = {
            ...pedido,
            detalles: pedido.detalles.map(detalle => ({
              ...detalle,
              producto: this.formatearDetalleProducto(detalle)
            }))
          };

          this.pedidoData = pedidoConNombresCompletos;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar pedido:', error);
          NotificacionSweet.handleBackendError(error);
          this.router.navigate(['/pedidos']);
        }
      });
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

  alCrearPedido(request: CrearPedidoRequest): void {
    NotificacionSweet.showLoading('Creando pedido...');

    this.pedidoService.crear(request)
      .pipe(finalize(() => {
        this.formularioHijo?.restablecerEstadoEnvio();
      }))
      .subscribe({
        next: (response) => {
          NotificacionSweet.hideLoading();
          this.formularioHijo?.limpiarFormulario();
          NotificacionSweet.showSuccess(
            'Pedido creado exitosamente',
            `El pedido ha sido registrado correctamente`
          ).then(() => {
            this.router.navigate(['/pedidos']);
          });
        },
        error: (error) => {
          console.error('Error al crear pedido:', error);
        }
      });
  }

  alActualizarPedido(datos: { id: number, request: ActualizarPedidoRequest }): void {
    NotificacionSweet.showLoading('Actualizando pedido...');

    this.pedidoService.actualizar(datos.id, datos.request)
      .pipe(finalize(() => {
        this.formularioHijo?.restablecerEstadoEnvio();
      }))
      .subscribe({
        next: (response) => {
          NotificacionSweet.hideLoading();
          NotificacionSweet.showSuccess(
            'Pedido actualizado exitosamente',
            `El pedido ha sido actualizado correctamente`
          ).then(() => {
            this.router.navigate(['/pedidos']);
          });
        },
        error: (error) => {
          console.error('Error al actualizar pedido:', error);
        }
      });
  }

}
