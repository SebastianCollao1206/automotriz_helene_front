import { Component, ChangeDetectorRef, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Validaciones } from '../../../../core/services/validaciones/validaciones';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { ROLE_NAMES } from '../../../../core/constants/roles-constants';
import { RoleModel } from '../../../../models/role';
import { CrearUsuarioRequest, ActualizarUsuarioRequest, UserResponse } from '../../../../models/user';
import { finalize } from 'rxjs';
import { User } from '../../../../core/services/user/user';
import { Role } from '../../../../core/services/role/role';
import { ReniecService, DatosPersona } from '../../../../core/services/api/reniec-service';
import { FormDataLoader } from '../../../../core/services/loaders/form-data-loader';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users-form.html',
  styleUrl: './users-form.css'
})
export class UsersForm implements OnInit, OnChanges {
  @Input() modoEdicion: boolean = false;
  @Input() usuarioId?: number;
  @Input() usuarioData?: UserResponse;

  @Output() alEnviarFormulario = new EventEmitter<{ request: CrearUsuarioRequest, imagen: File }>();
  @Output() alActualizarFormulario = new EventEmitter<{ id: number, request: ActualizarUsuarioRequest, imagen?: File }>();

  formularioUsuario: FormGroup;
  urlImagenSeleccionada: string | null = null;
  estaBuscandoDni: boolean = false;
  enviandoFormulario: boolean = false;
  private archivoSeleccionado: File | null = null;

  rolesDisponibles: RoleModel[] = [];
  cargandoRoles: boolean = false;
  roleNames = ROLE_NAMES;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    public validacionFormulario: Validaciones,
    private userService: User,
    private formDataLoader: FormDataLoader,
    private reniecService: ReniecService,
    private router: Router
  ) {
    this.formularioUsuario = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarRoles();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modoEdicion']) {
      this.configurarValidadores(!this.modoEdicion);
    }

    if (changes['usuarioData'] && this.modoEdicion && this.usuarioData) {
      if (this.rolesDisponibles.length > 0) {
        this.cargarDatosUsuario();
      }
    }

    this.cdr.detectChanges();
  }

  volverAListaUsuarios(): void {
    this.router.navigate(['/usuarios']);
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      nombreCompleto: [{ value: '', disabled: true }, [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      roles: [[], [Validators.required, Validators.minLength(1)]],
      imagen: ['', [Validators.required]],
      enabled: [true]
    });
  }

  private configurarValidadores(esCreacion: boolean): void {
    const contrasenaControl = this.formularioUsuario.get('contrasena');
    const imagenControl = this.formularioUsuario.get('imagen');

    if (esCreacion) {
      contrasenaControl?.setValidators([Validators.required, Validators.minLength(6)]);
      imagenControl?.setValidators([Validators.required]);
    } else {
      contrasenaControl?.setValidators([Validators.minLength(6)]);
      imagenControl?.clearValidators();
    }

    contrasenaControl?.updateValueAndValidity();
    imagenControl?.updateValueAndValidity();
  }

  private cargarDatosUsuario(): void {
    if (!this.usuarioData) return;

    this.formularioUsuario.patchValue({
      dni: this.usuarioData.dni,
      nombreCompleto: this.usuarioData.nombre,
      correo: this.usuarioData.email,
      contrasena: '',
      enabled: this.usuarioData.enabled
    });

    if (this.usuarioData.imagenOriginal) {
      this.urlImagenSeleccionada = this.userService.obtenerUrlImagen(this.usuarioData.imagenOriginal);
    }

    this.cargarRolesUsuario();
    this.cdr.detectChanges();
  }

  private cargarRolesUsuario(): void {
    if (!this.usuarioData?.roles || this.rolesDisponibles.length === 0) return;

    const roleIds: number[] = [];

    this.usuarioData.roles.forEach(roleName => {
      const role = this.rolesDisponibles.find(r => r.name === roleName);
      if (role) roleIds.push(role.id);
    });

    this.formularioUsuario.patchValue({ roles: roleIds });
    this.cdr.detectChanges();
  }

  cargarRoles(): void {
    this.cargandoRoles = true;

    this.formDataLoader.cargarRoles()
      .pipe(finalize(() => {
        this.cargandoRoles = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (roles) => {
          this.rolesDisponibles = roles;

          if (this.modoEdicion && this.usuarioData) {
            setTimeout(() => this.cargarDatosUsuario(), 0);
          }

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar roles:', error);
          NotificacionSweet.showError('Error', 'No se pudieron cargar los roles disponibles');
          this.rolesDisponibles = [];
        }
      });
  }

  async buscarDni(): Promise<void> {
    const dni = this.formularioUsuario.get('dni')?.value;

    if (!dni || dni.length !== 8) {
      NotificacionSweet.showWarning('DNI inválido', 'Por favor ingrese un DNI válido de 8 dígitos');
      return;
    }

    this.estaBuscandoDni = true;

    this.reniecService.buscarPorDni(dni)
      .pipe(finalize(() => {
        this.estaBuscandoDni = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (datos: DatosPersona) => {
          this.formularioUsuario.patchValue({
            nombreCompleto: datos.nombreCompleto
          });
          NotificacionSweet.showSuccess('DNI encontrado', `Datos de ${datos.nombreCompleto} cargados`);
        },
        error: (error) => {
          if (error.code === 'NOT_FOUND') {
            NotificacionSweet.showWarning('DNI no encontrado', error.message);
          } else if (error.code === 'INVALID_DNI') {
            NotificacionSweet.showWarning('DNI inválido', error.message);
          } else {
            NotificacionSweet.showError('Error de conexión', error.message);
          }
        }
      });
  }

  obtenerNombreRol(roleName: string): string {
    return this.roleNames[roleName] || roleName;
  }

  alSeleccionarArchivo(event: any): void {
    const archivo = event.target.files[0];
    if (!archivo) return;

    if (archivo.size > 2 * 1024 * 1024) {
      NotificacionSweet.showWarning('Imagen muy grande', 'La imagen no debe superar los 2MB');
      return;
    }

    if (!archivo.type.startsWith('image/')) {
      NotificacionSweet.showWarning('Archivo inválido', 'Por favor seleccione una imagen válida');
      return;
    }

    this.archivoSeleccionado = archivo;

    if (!this.modoEdicion) {
      this.formularioUsuario.patchValue({ imagen: 'valid' });
      this.formularioUsuario.get('imagen')?.markAsTouched();
    }

    const lector = new FileReader();
    lector.onload = (e: any) => {
      this.urlImagenSeleccionada = e.target.result;
      this.cdr.detectChanges();
    };
    lector.readAsDataURL(archivo);
  }

  eliminarImagen(): void {
    this.urlImagenSeleccionada = null;
    this.archivoSeleccionado = null;

    if (!this.modoEdicion) {
      this.formularioUsuario.patchValue({ imagen: '' });
      this.formularioUsuario.get('imagen')?.markAsTouched();
    }

    if (typeof document !== 'undefined') {
      const inputArchivo = document.getElementById('fileInput') as HTMLInputElement;
      if (inputArchivo) inputArchivo.value = '';
    }

    this.cdr.detectChanges();
  }

  alCambiarRol(event: any, idRol: number): void {
    const roles = this.formularioUsuario.get('roles')?.value || [];

    if (event.target.checked) {
      roles.push(idRol);
    } else {
      const indice = roles.indexOf(idRol);
      if (indice > -1) roles.splice(indice, 1);
    }

    this.formularioUsuario.patchValue({ roles });
    this.cdr.detectChanges();
  }

  esRolSeleccionado(idRol: number): boolean {
    const roles = this.formularioUsuario.get('roles')?.value || [];
    return roles.includes(idRol);
  }

  enviarFormulario(): void {
    if (this.enviandoFormulario) return;

    Object.keys(this.formularioUsuario.controls).forEach(key => {
      if (key !== 'nombreCompleto' && key !== 'dni') {
        this.formularioUsuario.get(key)?.markAsTouched();
      }
    });

    if (this.modoEdicion) {
      this.enviarActualizacion();
    } else {
      this.enviarCreacion();
    }
  }

  private enviarCreacion(): void {
    if (!this.archivoSeleccionado) {
      NotificacionSweet.showWarning('Imagen requerida', 'Por favor seleccione una foto de perfil');
      return;
    }

    if (this.formularioUsuario.invalid) {
      NotificacionSweet.showWarning('Formulario incompleto', 'Por favor complete todos los campos requeridos');
      return;
    }

    const nombreCompleto = this.formularioUsuario.get('nombreCompleto')?.value;

    if (!nombreCompleto) {
      NotificacionSweet.showWarning('Nombre requerido', 'Por favor busque el DNI para cargar el nombre');
      return;
    }

    this.enviandoFormulario = true;

    const request: CrearUsuarioRequest = {
      nombre: nombreCompleto,
      email: this.formularioUsuario.get('correo')?.value,
      password: this.formularioUsuario.get('contrasena')?.value,
      dni: this.formularioUsuario.get('dni')?.value,
      roleIds: this.formularioUsuario.get('roles')?.value
    };

    this.alEnviarFormulario.emit({ request, imagen: this.archivoSeleccionado });
  }

  private enviarActualizacion(): void {
    if (!this.usuarioId) {
      NotificacionSweet.showError('Error', 'ID de usuario no disponible');
      return;
    }

    const roles = this.formularioUsuario.get('roles')?.value;
    if (!roles || roles.length === 0) {
      NotificacionSweet.showWarning('Roles requeridos', 'Debe seleccionar al menos un rol');
      return;
    }

    this.enviandoFormulario = true;

    const request: ActualizarUsuarioRequest = {
      email: this.formularioUsuario.get('correo')?.value,
      roleIds: roles,
      enabled: this.formularioUsuario.get('enabled')?.value
    };

    const contrasena = this.formularioUsuario.get('contrasena')?.value;
    if (contrasena && contrasena.trim() !== '') {
      request.password = contrasena;
    }

    this.alActualizarFormulario.emit({
      id: this.usuarioId,
      request,
      imagen: this.archivoSeleccionado || undefined
    });
  }

  restablecerEstadoEnvio(): void {
    this.enviandoFormulario = false;
    this.cdr.detectChanges();
  }

  limpiarFormulario(): void {
    this.enviandoFormulario = false;

    this.formularioUsuario.reset({
      dni: '',
      nombreCompleto: '',
      correo: '',
      contrasena: '',
      roles: [],
      imagen: '',
      enabled: true
    });

    this.formularioUsuario.markAsPristine();
    this.formularioUsuario.markAsUntouched();

    this.urlImagenSeleccionada = null;
    this.archivoSeleccionado = null;

    if (typeof document !== 'undefined') {
      const inputArchivo = document.getElementById('fileInput') as HTMLInputElement;
      if (inputArchivo) inputArchivo.value = '';
    }

    this.cdr.detectChanges();
  }
}
