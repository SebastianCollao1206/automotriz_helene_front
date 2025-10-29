import { Component, ChangeDetectorRef, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Validaciones } from '../../../../core/services/validaciones/validaciones';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { CrearProveedorRequest, ActualizarProveedorRequest, ProveedorResponse } from '../../../../models/proveedor';
import { finalize } from 'rxjs';
import { SunatService, DatosEmpresa } from '../../../../core/services/api/sunat-service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-proveedor-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './proveedor-form.html',
  styleUrl: './proveedor-form.css'
})
export class ProveedorForm implements OnChanges, OnInit {

  @Input() modoEdicion: boolean = false;
  @Input() proveedorId?: number;
  @Input() proveedorData?: ProveedorResponse;

  @Output() alEnviarFormulario = new EventEmitter<{ request: CrearProveedorRequest }>();
  @Output() alActualizarFormulario = new EventEmitter<{ id: number, request: ActualizarProveedorRequest }>();

  formularioProveedor: FormGroup;
  estaBuscandoRuc: boolean = false;
  enviandoFormulario: boolean = false;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    public validacionFormulario: Validaciones,
    private sunatService: SunatService,
    private router: Router
  ) {
    this.formularioProveedor = this.crearFormulario();
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['proveedorData'] && this.modoEdicion && this.proveedorData) {
      this.cargarDatosProveedor();
      this.configurarValidadores(!this.modoEdicion);
    } else if (changes['modoEdicion']) {
      this.configurarValidadores(!this.modoEdicion);
    }

    this.cdr.detectChanges();
  }

  volverAListaProveedores(): void {
    this.router.navigate(['/proveedores']);
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      ruc: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      nombre: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(3)]],
      direccion: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(5)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9\s\-\+\(\)]{7,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      enabled: [true]
    });
  }

  private configurarValidadores(esCreacion: boolean): void {
    const nombreControl = this.formularioProveedor.get('nombre');
    const direccionControl = this.formularioProveedor.get('direccion');

    if (esCreacion) {
      nombreControl?.disable();
      direccionControl?.disable();
    } else {
      nombreControl?.enable();
      direccionControl?.enable();
    }

    nombreControl?.updateValueAndValidity();
    direccionControl?.updateValueAndValidity();
    this.formularioProveedor.updateValueAndValidity();
  }

  private cargarDatosProveedor(): void {
    if (!this.proveedorData) return;

    this.formularioProveedor.patchValue({
      nombre: this.proveedorData.nombre,
      direccion: this.proveedorData.direccion,
      telefono: this.proveedorData.telefono,
      email: this.proveedorData.email,
      enabled: this.proveedorData.enabled
    });

    this.cdr.detectChanges();
  }

  get esFormularioValido(): boolean {
    if (this.modoEdicion) {
      const nombreValido = this.formularioProveedor.get('nombre')?.valid ?? false;
      const direccionValida = this.formularioProveedor.get('direccion')?.valid ?? false;
      const telefonoValido = this.formularioProveedor.get('telefono')?.valid ?? false;
      const emailValido = this.formularioProveedor.get('email')?.valid ?? false;

      return nombreValido && direccionValida && telefonoValido && emailValido;
    } else {
      const rucValido = this.formularioProveedor.get('ruc')?.valid ?? false;
      const telefonoValido = this.formularioProveedor.get('telefono')?.valid ?? false;
      const emailValido = this.formularioProveedor.get('email')?.valid ?? false;
      const nombreTieneValor = !!this.formularioProveedor.get('nombre')?.value;
      const direccionTieneValor = !!this.formularioProveedor.get('direccion')?.value;

      return rucValido && telefonoValido && emailValido && nombreTieneValor && direccionTieneValor;
    }
  }

  async buscarRuc(): Promise<void> {
    const ruc = this.formularioProveedor.get('ruc')?.value;

    if (!ruc || ruc.length !== 11) {
      NotificacionSweet.showWarning('RUC inválido', 'Por favor ingrese un RUC válido de 11 dígitos');
      return;
    }

    this.estaBuscandoRuc = true;

    this.sunatService.buscarPorRuc(ruc)
      .pipe(finalize(() => {
        this.estaBuscandoRuc = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (datos: DatosEmpresa) => {
          this.formularioProveedor.patchValue({
            nombre: datos.nombreComercial || datos.razonSocial,
            direccion: datos.direccion
          });
          NotificacionSweet.showSuccess('RUC encontrado', `Datos de ${datos.nombreComercial || datos.razonSocial} cargados`);
        },
        error: (error) => {
          if (error.code === 'NOT_FOUND') {
            NotificacionSweet.showWarning('RUC no encontrado', error.message);
          } else if (error.code === 'INVALID_RUC') {
            NotificacionSweet.showWarning('RUC inválido', error.message);
          } else {
            NotificacionSweet.showError('Error de conexión', error.message);
          }
        }
      });
  }

  enviarFormulario(): void {
    if (this.enviandoFormulario) return;

    Object.keys(this.formularioProveedor.controls).forEach(key => {
      if (key !== 'nombre' && key !== 'direccion' && key !== 'ruc' || this.modoEdicion) {
        this.formularioProveedor.get(key)?.markAsTouched();
      }
    });

    if (this.modoEdicion) {
      this.enviarActualizacion();
    } else {
      this.enviarCreacion();
    }
  }

  private enviarCreacion(): void {
    const nombre = this.formularioProveedor.get('nombre')?.value;
    const direccion = this.formularioProveedor.get('direccion')?.value;

    if (!nombre || !direccion) {
      NotificacionSweet.showWarning('Datos incompletos', 'Por favor busque el RUC para cargar los datos de la empresa');
      return;
    }

    if (!this.esFormularioValido) {
      NotificacionSweet.showWarning('Formulario incompleto', 'Por favor complete todos los campos requeridos');
      return;
    }

    this.enviandoFormulario = true;

    const request: CrearProveedorRequest = {
      ruc: this.formularioProveedor.get('ruc')?.value,
      nombre: nombre,
      direccion: direccion,
      telefono: this.formularioProveedor.get('telefono')?.value,
      email: this.formularioProveedor.get('email')?.value
    };

    this.alEnviarFormulario.emit({ request });
  }

  private enviarActualizacion(): void {
    if (!this.proveedorId) {
      NotificacionSweet.showError('Error', 'ID de proveedor no disponible');
      return;
    }

    if (!this.esFormularioValido) {
      NotificacionSweet.showWarning('Formulario incompleto', 'Por favor complete todos los campos requeridos');
      return;
    }

    this.enviandoFormulario = true;

    const request: ActualizarProveedorRequest = {
      nombre: this.formularioProveedor.get('nombre')?.value,
      direccion: this.formularioProveedor.get('direccion')?.value,
      telefono: this.formularioProveedor.get('telefono')?.value,
      email: this.formularioProveedor.get('email')?.value,
      enabled: this.formularioProveedor.get('enabled')?.value
    };

    this.alActualizarFormulario.emit({
      id: this.proveedorId,
      request
    });
  }

  restablecerEstadoEnvio(): void {
    this.enviandoFormulario = false;
    this.cdr.detectChanges();
  }

  limpiarFormulario(): void {
    this.enviandoFormulario = false;

    this.formularioProveedor.reset({
      ruc: '',
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      enabled: true
    });

    this.formularioProveedor.markAsPristine();
    this.formularioProveedor.markAsUntouched();

    const nombreControl = this.formularioProveedor.get('nombre');
    const direccionControl = this.formularioProveedor.get('direccion');
    nombreControl?.disable();
    direccionControl?.disable();

    this.cdr.detectChanges();
  }

}
