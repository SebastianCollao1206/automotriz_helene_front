import { Injectable } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificacionSweet {
  static showSuccess(title: string, message?: string): Promise<SweetAlertResult> {
      return Swal.fire({
          icon: 'success',
          title: title,
          text: message,
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
      });
  }

  static showError(title: string, message?: string): Promise<SweetAlertResult> {
      return Swal.fire({
          icon: 'error',
          title: title,
          text: message,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#d33'
      });
  }

  static showWarning(title: string, message?: string): Promise<SweetAlertResult> {
      return Swal.fire({
          icon: 'warning',
          title: title,
          text: message,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#f39c12'
      });
  }

  static showInfo(title: string, message?: string): Promise<SweetAlertResult> {
      return Swal.fire({
          icon: 'info',
          title: title,
          text: message,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#3085d6'
      });
  }

  static showConfirmation(
      title: string, 
      message: string, 
      confirmText: string = 'Sí, confirmar',
      cancelText: string = 'Cancelar'
  ): Promise<SweetAlertResult> {
      return Swal.fire({
          icon: 'question',
          title: title,
          text: message,
          showCancelButton: true,
          confirmButtonText: confirmText,
          cancelButtonText: cancelText,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33'
      });
  }

  static showLoading(title: string = 'Cargando...'): void {
      Swal.fire({
          title: title,
          allowOutsideClick: false,
          didOpen: () => {
              Swal.showLoading();
          }
      });
  }

  static hideLoading(): void {
      Swal.close();
  }

  static handleBackendError(error: any): void {
      if (error.error && error.error.message) {
          this.showError('Error', error.error.message);
      } else if (error.error && error.error.errors) {
          const errors = error.error.errors;
          const errorMessages = Object.values(errors).join('\n');
          this.showError('Errores de validación', errorMessages);
      } else if (error.message) {
          this.showError('Error', error.message);
      } else {
          this.showError('Error', 'Ha ocurrido un error inesperado');
      }
  }
}
