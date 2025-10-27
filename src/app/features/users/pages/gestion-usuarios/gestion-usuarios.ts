import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { UsersForm } from '../../components/users-form/users-form';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { User } from '../../../../core/services/user/user';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { CrearUsuarioRequest, UserResponse, ActualizarUsuarioRequest } from '../../../../models/user';
import { finalize, Subscription } from 'rxjs';


@Component({
  selector: 'app-gestion-usuarios',
  imports: [UsersForm, CommonModule],
  templateUrl: './gestion-usuarios.html',
  styleUrl: './gestion-usuarios.css'
})
export class GestionUsuarios implements OnInit, OnDestroy {

  @ViewChild(UsersForm) formularioHijo!: UsersForm;

  modoEdicion: boolean = false;
  usuarioId?: number;
  usuarioData?: UserResponse;
  cargandoDatos: boolean = false;

  private routeSubscription?: Subscription;

  constructor(
    private userService: User,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.usuarioData = undefined;
      this.cargandoDatos = false;
      this.modoEdicion = false;
      this.usuarioId = undefined;

      this.cdr.detectChanges();

      if (params['id']) {
        this.usuarioId = +params['id'];
        this.modoEdicion = true;
        this.cargarUsuario();
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

  cargarUsuario(): void {
    if (!this.usuarioId) return;

    this.cargandoDatos = true;
    this.cdr.detectChanges();

    this.userService.buscarPorId(this.usuarioId)
      .pipe(
        finalize(() => {
          this.cargandoDatos = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.usuarioData = response;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar usuario:', error);
          this.router.navigate(['/usuarios']);
        }
      });
  }

  alCrearUsuario(datos: { request: CrearUsuarioRequest, imagen: File }): void {
    NotificacionSweet.showLoading('Creando usuario...');

    this.userService.crearUsuario(datos.request, datos.imagen)
      .pipe(finalize(() => {
        this.formularioHijo?.restablecerEstadoEnvio();
      }))
      .subscribe({
        next: (response) => {
          NotificacionSweet.hideLoading();
          this.formularioHijo?.limpiarFormulario();
          NotificacionSweet.showSuccess(
            'Usuario creado exitosamente',
            `El usuario ${response.nombre} ha sido registrado correctamente`
          );
        },
        error: (error) => {
          console.error('Error al crear usuario:', error);
        }
      });
  }

  alActualizarUsuario(datos: { id: number, request: ActualizarUsuarioRequest, imagen?: File }): void {
    NotificacionSweet.showLoading('Actualizando usuario...');

    this.userService.actualizarUsuario(datos.id, datos.request, datos.imagen)
      .pipe(finalize(() => {
        this.formularioHijo?.restablecerEstadoEnvio();
      }))
      .subscribe({
        next: (response) => {
          NotificacionSweet.hideLoading();
          NotificacionSweet.showSuccess(
            'Usuario actualizado exitosamente',
            `El usuario ${response.nombre} ha sido actualizado correctamente`
          ).then(() => {
            this.router.navigate(['/usuarios']);
          });
        },
        error: (error) => {
          console.error('Error al actualizar usuario:', error);
        }
      });
  }
}
