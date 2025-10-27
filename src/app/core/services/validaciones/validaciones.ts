import { Injectable } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class Validaciones {
  constructor() { }

  marcarFormularioComoTocado(formulario: FormGroup): void {
    Object.keys(formulario.controls).forEach(key => {
      const control = formulario.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.marcarFormularioComoTocado(control);
      }
    });
  }

  esCampoInvalido(formulario: FormGroup, nombreCampo: string): boolean {
    const campo = formulario.get(nombreCampo);
    return !!(campo && campo.invalid && (campo.dirty || campo.touched));
  }

  esCampoValido(formulario: FormGroup, nombreCampo: string): boolean {
    const campo = formulario.get(nombreCampo);
    return !!(campo && campo.valid && (campo.dirty || campo.touched));
  }

  obtenerMensajeError(formulario: FormGroup, nombreCampo: string, etiquetaCampo: string = 'Este campo'): string {
    const control = formulario.get(nombreCampo);

    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return `${etiquetaCampo} es requerido`;
    }

    if (control.errors['email']) {
      return 'Ingrese un correo electrónico válido';
    }

    if (control.errors['minlength']) {
      const longitudMinima = control.errors['minlength'].requiredLength;
      return `${etiquetaCampo} debe tener al menos ${longitudMinima} caracteres`;
    }

    if (control.errors['maxlength']) {
      const longitudMaxima = control.errors['maxlength'].requiredLength;
      return `${etiquetaCampo} no debe exceder ${longitudMaxima} caracteres`;
    }

    if (control.errors['pattern']) {
      if (nombreCampo === 'dni') {
        return 'El DNI debe tener 8 dígitos';
      }
      return `${etiquetaCampo} tiene un formato inválido`;
    }

    if (control.errors['min']) {
      return `El valor mínimo es ${control.errors['min'].min}`;
    }

    if (control.errors['max']) {
      return `El valor máximo es ${control.errors['max'].max}`;
    }

    return 'Campo inválido';
  }

  obtenerClasesCampo(formulario: FormGroup, nombreCampo: string): string {
    const clasesBase = 'texto-pequeño input-formulario';
    return clasesBase;
  }

  reiniciarFormulario(formulario: FormGroup): void {
    formulario.reset();
    Object.keys(formulario.controls).forEach(key => {
      formulario.get(key)?.setErrors(null);
    });
  }
}
