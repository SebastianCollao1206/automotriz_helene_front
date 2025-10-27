import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Validaciones } from '../../../../core/services/validaciones/validaciones';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { MarcaResponse, ActualizarMarcaRequest, CrearMarcaRequest } from '../../../../models/marca';

@Component({
  selector: 'app-marcas-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './marcas-modal.html',
  styleUrl: './marcas-modal.css'
})
export class MarcasModal implements OnChanges{

  @Input() mostrar: boolean = false;
    @Input() modoEdicion: boolean = false;
    @Input() marcaData?: MarcaResponse;
  
    @Output() alCerrar = new EventEmitter<void>();
    @Output() alGuardar = new EventEmitter<{ data: CrearMarcaRequest | ActualizarMarcaRequest, id?: number }>();
  
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
        if (this.modoEdicion && this.marcaData) {
          this.cargarDatos();
        } else {
          this.limpiarFormulario();
        }
        this.cdr.detectChanges();
      }
    }
  
    private crearFormulario(): FormGroup {
      return this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
        enabled: [true]
      });
    }
  
    private cargarDatos(): void {
      if (!this.marcaData) return;
  
      this.formulario.patchValue({
        nombre: this.marcaData.nombre,
        enabled: this.marcaData.enabled
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
  
      if (this.modoEdicion && this.marcaData) {
        const request: ActualizarMarcaRequest = {
          nombre: nombre,
          enabled: this.formulario.get('enabled')?.value
        };
  
        this.alGuardar.emit({ data: request, id: this.marcaData.id });
      } else {
        const request: CrearMarcaRequest = {
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
