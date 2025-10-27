import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Validaciones } from '../../../../core/services/validaciones/validaciones';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { UnidadMedidaResponse, ActualizarUnidadMedidaRequest, CrearUnidadMedidaRequest } from '../../../../models/unidad-medida';

@Component({
  selector: 'app-unidades-medida-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './unidades-medida-modal.html',
  styleUrl: './unidades-medida-modal.css'
})
export class UnidadesMedidaModal implements OnChanges{

  @Input() mostrar: boolean = false;
  @Input() modoEdicion: boolean = false;
  @Input() unidadMedidaData?: UnidadMedidaResponse;

  @Output() alCerrar = new EventEmitter<void>();
  @Output() alGuardar = new EventEmitter<{ data: CrearUnidadMedidaRequest | ActualizarUnidadMedidaRequest, id?: number }>();

  formulario: FormGroup;
  enviando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    public validacionFormulario: Validaciones
  ) {
    this.formulario = this.crearFormulario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mostrar'] && this.mostrar) {
      if (this.modoEdicion && this.unidadMedidaData) {
        this.cargarDatos();
      } else {
        this.limpiarFormulario();
      }
      this.cdr.detectChanges();
    }
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      enabled: [true]
    });
  }

  private cargarDatos(): void {
    if (!this.unidadMedidaData) return;

    this.formulario.patchValue({
      nombre: this.unidadMedidaData.nombre,
      enabled: this.unidadMedidaData.enabled
    });

    this.cdr.detectChanges();
  }

  limpiarFormulario(): void {
    this.formulario.reset({
      nombre: '',
      enabled: true
    });

    this.formulario.markAsPristine();
    this.formulario.markAsUntouched();
    this.enviando = false;

    this.cdr.detectChanges();
  }

  cerrar(): void {
    if (this.enviando) return;
    this.limpiarFormulario();
    this.alCerrar.emit();
  }

  enviarFormulario(): void {
    if (this.enviando) return;

    Object.keys(this.formulario.controls).forEach(key => {
      this.formulario.get(key)?.markAsTouched();
    });

    if (this.formulario.invalid) {
      NotificacionSweet.showWarning('Formulario incompleto', 'Por favor complete todos los campos correctamente');
      return;
    }

    this.enviando = true;

    const nombre = this.formulario.get('nombre')?.value.trim();

    if (this.modoEdicion && this.unidadMedidaData) {
      const request: ActualizarUnidadMedidaRequest = {
        nombre: nombre,
        enabled: this.formulario.get('enabled')?.value
      };

      this.alGuardar.emit({ data: request, id: this.unidadMedidaData.id });
    } else {
      const request: CrearUnidadMedidaRequest = {
        nombre: nombre
      };

      this.alGuardar.emit({ data: request });
    }
  }

  restablecerEstadoEnvio(): void {
    this.enviando = false;
    this.cdr.detectChanges();
  }

}
