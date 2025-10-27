import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Asistencia } from '../../service/asistencia';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-marcar-asistencia',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './marcar-asistencia.html',
  styleUrl: './marcar-asistencia.css',
})
export class MarcarAsistencia implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement', { static: false })
  videoElement!: ElementRef<HTMLVideoElement>;

  private stream: MediaStream | null = null;
  private procesando = false;
  private intervaloParpadeos: any = null;
  private isBrowser: boolean;

  public parpadeoObjetivo = 0;
  public parpadeoActual = 0;
  public mostrarContador = false;
  public mensajeInstruccion = 'Presiona "Marcar Asistencia" para comenzar';

  constructor(
    private asistencia: Asistencia,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.iniciarCamara();
    }
  }

  async iniciarCamara() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      NotificacionSweet.showError(
        'Navegador no compatible',
        'Tu navegador no soporta acceso a la cámara.'
      );
      return;
    }
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (this.videoElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
      }
    } catch (err) {
      NotificacionSweet.showError(
        'Error de cámara',
        'No se pudo acceder a la cámara. Verifica los permisos.'
      );
    }
  }

  recargarCamara() {
    this.detenerCamara();
    this.reiniciarVariables();
    this.iniciarCamara();
  }

  detenerCamara() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  reiniciarVariables() {
    this.procesando = false;
    this.parpadeoObjetivo = 0;
    this.parpadeoActual = 0;
    this.mostrarContador = false;
    this.mensajeInstruccion = 'Presiona "Marcar Asistencia" para comenzar';

    if (this.intervaloParpadeos) {
      clearInterval(this.intervaloParpadeos);
      this.intervaloParpadeos = null;
    }

    this.cdr.detectChanges();
  }

  async marcarAsistencia() {
    if (this.procesando) {
      NotificacionSweet.showWarning('Espera', 'Ya hay un proceso en curso');
      return;
    }

    this.procesando = true;
    this.reconocimientoInicial();
  }

  private reconocimientoInicial() {
    this.mensajeInstruccion = 'Verificando rostro...';
    this.cdr.detectChanges();

    NotificacionSweet.showLoading('Verificando...');

    const imagenBase64 = this.capturarImagen();

    this.asistencia.reconocerRostro(imagenBase64).subscribe({
      next: (response) => {
        NotificacionSweet.hideLoading();

        if (response.success) {
          this.mensajeInstruccion = `Rostro detectado. Prepárate...`;
          this.cdr.detectChanges();

          setTimeout(() => {
            this.iniciarDeteccionParpadeos();
          }, 800);
        } else {
          NotificacionSweet.showError(
            'No reconocido',
            'No se detectó un rostro válido'
          );
          this.reiniciarVariables();
        }
      },
      error: (error) => {
        NotificacionSweet.hideLoading();
        NotificacionSweet.showError('Error', 'No se pudo verificar el rostro');
        this.reiniciarVariables();
      },
    });
  }

  private iniciarDeteccionParpadeos() {
    this.parpadeoObjetivo = Math.floor(Math.random() * 3) + 1;
    this.parpadeoActual = 0;
    this.mostrarContador = true;
    this.mensajeInstruccion = `Parpadea ${this.parpadeoObjetivo} ${this.parpadeoObjetivo === 1 ? 'vez' : 'veces'
      }`;

    this.cdr.detectChanges();

    this.asistencia.reiniciarParpadeos().subscribe({
      next: () => {
        this.intervaloParpadeos = setInterval(() => {
          this.verificarParpadeoEnFrame();
        }, 150);
      },
      error: (err) => {
        NotificacionSweet.showError('Error', 'No se pudo iniciar la detección');
        this.reiniciarVariables();
      },
    });
  }

  private verificarParpadeoEnFrame() {
    if (!this.procesando || !this.mostrarContador) {
      return;
    }

    const imagenBase64 = this.capturarImagen();

    this.asistencia.verificarParpadeo(imagenBase64).subscribe({
      next: (response) => {
        if (response.success && response.parpadeo === true) {
          this.parpadeoActual++;

          if (navigator.vibrate) {
            navigator.vibrate(80);
          }

          this.mensajeInstruccion = `${this.parpadeoActual} de ${this.parpadeoObjetivo}`;
          this.cdr.detectChanges();

          if (this.parpadeoActual >= this.parpadeoObjetivo) {
            if (this.intervaloParpadeos) {
              clearInterval(this.intervaloParpadeos);
              this.intervaloParpadeos = null;
            }

            this.mostrarContador = false;
            this.cdr.detectChanges();

            setTimeout(() => {
              this.realizarReconocimientoFinal();
            }, 400);
          }
        }
      },
      error: (error) => {
        console.error('Error verificando parpadeo:', error);
      },
    });
  }

  private realizarReconocimientoFinal() {
    this.mensajeInstruccion = 'Reconociendo rostro final...';
    this.cdr.detectChanges();

    NotificacionSweet.showLoading('Reconociendo...');

    const imagenBase64 = this.capturarImagen();

    this.asistencia.reconocerRostro(imagenBase64).subscribe({
      next: (response) => {
        NotificacionSweet.hideLoading();

        if (response.success) {
          this.mensajeInstruccion = `¡Verificado ${response.nombre}!`;
          this.cdr.detectChanges();

          setTimeout(() => {
            this.registrarAsistenciaFinal(response.userId);
          }, 800);
        } else {
          NotificacionSweet.showError(
            'Fallo de verificación',
            'No se pudo confirmar tu identidad'
          );
          this.reiniciarVariables();
        }
      },
      error: (error) => {
        NotificacionSweet.hideLoading();
        NotificacionSweet.showError(
          'Error',
          'No se pudo verificar el rostro final'
        );
        this.reiniciarVariables();
      },
    });
  }

  private registrarAsistenciaFinal(userId: number) {
    this.mensajeInstruccion = 'Registrando asistencia...';
    this.cdr.detectChanges();

    NotificacionSweet.showLoading('Guardando...');

    this.asistencia.registrarAsistencia(userId).subscribe({
      next: (response) => {
        NotificacionSweet.hideLoading();

        if (response.success && response.asistencia) {
          NotificacionSweet.showSuccess(
            '¡Asistencia registrada!',
            `Bienvenido ${response.asistencia.nombreUsuario}. ${response.asistencia.mensaje}`
          );
        } else {
          NotificacionSweet.showWarning(
            'Aviso',
            response.mensaje || 'No se pudo registrar'
          );
        }

        this.reiniciarVariables();
      },
      error: (error) => {
        NotificacionSweet.hideLoading();

        if (error.error?.mensaje) {
          NotificacionSweet.showWarning('Aviso', error.error.mensaje);
        } else {
          NotificacionSweet.showError('Error', 'Error al registrar asistencia');
        }

        this.reiniciarVariables();
      },
    });
  }

  private capturarImagen(): string {
    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');

    const scale = 0.5;
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.6);
    }

    throw new Error('No se pudo capturar la imagen');
  }

  ngOnDestroy() {
    this.detenerCamara();
    if (this.intervaloParpadeos) {
      clearInterval(this.intervaloParpadeos);
    }
  }
}
