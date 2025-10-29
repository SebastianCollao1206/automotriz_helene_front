import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth-service';
import { NotificacionSweet } from '../../../core/services/notificacion-sweet/notificacion-sweet';
import { Validaciones } from '../../../core/services/validaciones/validaciones';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  verPassword: boolean = false;
  formularioLogin: FormGroup;
  enviando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public validacionFormulario: Validaciones
  ) {
    this.formularioLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      recordarme: [false]
    });
  }

  toggleVerPassword(): void {
    this.verPassword = !this.verPassword;
  }

  onSubmit(): void {
    if (this.formularioLogin.invalid) {
      this.validacionFormulario.marcarFormularioComoTocado(this.formularioLogin);
      NotificacionSweet.showWarning('Formulario incompleto', 'Por favor completa todos los campos correctamente');
      return;
    }

    if (this.enviando) {
      return;
    }

    this.enviando = true;
    NotificacionSweet.showLoading('Iniciando sesión...');

    const credenciales = {
      email: this.formularioLogin.get('email')?.value,
      password: this.formularioLogin.get('password')?.value
    };

    this.authService.login(credenciales)
      .pipe(
        finalize(() => {
          this.enviando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          NotificacionSweet.hideLoading();
          NotificacionSweet.showSuccess(
            '¡Bienvenido!',
            `Hola ${response.nombre}`
          ).then(() => {
            this.router.navigate(['/bienvenida']);
          });
        },
        error: (error) => {
          NotificacionSweet.hideLoading();

          let mensaje = 'Credenciales incorrectas';
          if (error?.message) {
            mensaje = error.message;
          } else if (error?.error?.message) {
            mensaje = error.error.message;
          } else if (error?.error?.detalle) {
            mensaje = error.error.detalle;
          } else if (typeof error?.error === 'string') {
            mensaje = error.error;
          }

          NotificacionSweet.showError('Error al iniciar sesión', mensaje);
        }
      });
  }

}
