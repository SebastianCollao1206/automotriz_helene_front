import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ProductosForm } from '../../components/productos-form/productos-form';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Producto } from '../../../../core/services/producto/producto';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { CrearProductoRequest, ProductoResponse, ActualizarProductoRequest } from '../../../../models/producto';
import { finalize, Subscription } from 'rxjs';

@Component({
  selector: 'app-gestion-productos',
  imports: [ProductosForm, CommonModule],
  templateUrl: './gestion-productos.html',
  styleUrl: './gestion-productos.css'
})
export class GestionProductos implements OnInit, OnDestroy {

  @ViewChild(ProductosForm) formularioHijo!: ProductosForm;

  modoEdicion: boolean = false;
  productoId?: number;
  productoData?: ProductoResponse;
  cargandoDatos: boolean = false;

  private routeSubscription?: Subscription;

  constructor(
    private productoService: Producto,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.productoData = undefined;
      this.cargandoDatos = false;
      this.modoEdicion = false;
      this.productoId = undefined;

      this.cdr.detectChanges();

      if (params['id']) {
        this.productoId = +params['id'];
        this.modoEdicion = true;
        this.cargarProducto();
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

  cargarProducto(): void {
    if (!this.productoId) return;

    this.cargandoDatos = true;
    this.cdr.detectChanges();

    this.productoService.buscarPorId(this.productoId)
      .pipe(
        finalize(() => {
          this.cargandoDatos = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.productoData = response;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar producto:', error);
          this.router.navigate(['/productos']);
        }
      });
  }

  alCrearProducto(datos: { request: CrearProductoRequest, imagen: File }): void {
    NotificacionSweet.showLoading('Creando producto...');

    this.productoService.crear(datos.request, datos.imagen)
      .pipe(finalize(() => {
        this.formularioHijo?.restablecerEstadoEnvio();
      }))
      .subscribe({
        next: (response) => {
          NotificacionSweet.hideLoading();
          this.formularioHijo?.limpiarFormulario();
          NotificacionSweet.showSuccess(
            'Producto creado exitosamente',
            `El producto ${response.nombre} ha sido registrado correctamente`
          );
        },
        error: (error) => {
          console.error('Error al crear producto:', error);
        }
      });
  }

  alActualizarProducto(datos: { id: number, request: ActualizarProductoRequest, imagen?: File }): void {
    NotificacionSweet.showLoading('Actualizando producto...');

    this.productoService.actualizar(datos.id, datos.request, datos.imagen)
      .pipe(finalize(() => {
        this.formularioHijo?.restablecerEstadoEnvio();
      }))
      .subscribe({
        next: (response) => {
          NotificacionSweet.hideLoading();
          NotificacionSweet.showSuccess(
            'Producto actualizado exitosamente',
            `El producto ${response.nombre} ha sido actualizado correctamente`
          ).then(() => {
            this.router.navigate(['/productos']);
          });
        },
        error: (error) => {
          console.error('Error al actualizar producto:', error);
        }
      });
  }

}
