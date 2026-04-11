import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsistenciaDiariaDTO } from '../../../../models/asistencia';

@Component({
  selector: 'app-asistencia-table',
  imports: [CommonModule],
  templateUrl: './asistencia-table.html',
  styleUrl: './asistencia-table.css'
})
export class AsistenciaTable {

  @Input() asistencias: AsistenciaDiariaDTO[] = [];
  @Output() verHistorial = new EventEmitter<number>();

  onVerHistorial(userId: number): void {
    this.verHistorial.emit(userId);
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Presente':
        return 'badge-verde';
      case 'Tardanza':
        return 'badge-amarillo';
      case 'Falto':
        return 'badge-rojo';
      case 'Descanso':
        return 'badge-azul';
      default:
        return 'badge-gris';
    }
  }

  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'Presente':
        return 'fas fa-check';
      case 'Tardanza':
        return 'fas fa-clock';
      case 'Falto':
        return 'fas fa-xmark';
      case 'Descanso':
        return 'fas fa-bed';
      default:
        return 'fas fa-question';
    }
  }

  formatearHora(horaEntrada: string | null): string {
    if (!horaEntrada) {
      return '--';
    }

    const [horaStr, minutoStr] = horaEntrada.split(':');

    let horas = parseInt(horaStr, 10);
    const minutos = minutoStr.padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';

    horas = horas % 12;
    horas = horas ? horas : 12;

    return `${horas}:${minutos} ${ampm}`;
  }


}
