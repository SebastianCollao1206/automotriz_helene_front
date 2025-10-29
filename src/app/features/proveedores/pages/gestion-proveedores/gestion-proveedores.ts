import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ProveedorForm } from '../../components/proveedor-form/proveedor-form';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Proveedor } from '../../../../core/services/proveedor/proveedor';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { CrearProveedorRequest, ProveedorResponse, ActualizarProveedorRequest } from '../../../../models/proveedor';
import { finalize, Subscription } from 'rxjs';

@Component({
  selector: 'app-gestion-proveedores',
  imports: [CommonModule, ProveedorForm],
  templateUrl: './gestion-proveedores.html',
  styleUrl: './gestion-proveedores.css'
})
export class GestionProveedores implements OnInit, OnDestroy {

  @ViewChild(ProveedorForm) formularioHijo!: ProveedorForm;

  modoEdicion: boolean = false;
  proveedorId?: number;
  proveedorData?: ProveedorResponse;
  cargandoDatos: boolean = false;

  private routeSubscription?: Subscription;

  constructor(
    private proveedorService: Proveedor,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.proveedorData = undefined;
      this.cargandoDatos = false;
      this.modoEdicion = false;
      this.proveedorId = undefined;

      this.cdr.detectChanges();

      if (params['id']) {
        this.proveedorId = +params['id'];
        this.modoEdicion = true;
        this.cargarProveedor();
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

  cargarProveedor(): void {
    if (!this.proveedorId) return;

    this.cargandoDatos = true;
    this.cdr.detectChanges();

    this.proveedorService.buscarPorId(this.proveedorId)
      .pipe(
        finalize(() => {
          this.cargandoDatos = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.proveedorData = response;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar proveedor:', error);
          this.router.navigate(['/proveedores']);
        }
      });
  }

  alCrearProveedor(datos: { request: CrearProveedorRequest }): void {
    NotificacionSweet.showLoading('Creando proveedor...');

    this.proveedorService.crearProveedor(datos.request)
      .pipe(finalize(() => {
        this.formularioHijo?.restablecerEstadoEnvio();
      }))
      .subscribe({
        next: (response) => {
          NotificacionSweet.hideLoading();
          this.formularioHijo?.limpiarFormulario();
          NotificacionSweet.showSuccess(
            'Proveedor creado exitosamente',
            `El proveedor ${response.nombre} ha sido registrado correctamente`
          );
        },
        error: (error) => {
          console.error('Error al crear proveedor:', error);
        }
      });
  }

  alActualizarProveedor(datos: { id: number, request: ActualizarProveedorRequest }): void {
    NotificacionSweet.showLoading('Actualizando proveedor...');

    this.proveedorService.actualizarProveedor(datos.id, datos.request)
      .pipe(finalize(() => {
        this.formularioHijo?.restablecerEstadoEnvio();
      }))
      .subscribe({
        next: (response) => {
          NotificacionSweet.hideLoading();
          NotificacionSweet.showSuccess(
            'Proveedor actualizado exitosamente',
            `El proveedor ${response.nombre} ha sido actualizado correctamente`
          ).then(() => {
            this.router.navigate(['/proveedores']);
          });
        },
        error: (error) => {
          console.error('Error al actualizar proveedor:', error);
        }
      });
  }

}
