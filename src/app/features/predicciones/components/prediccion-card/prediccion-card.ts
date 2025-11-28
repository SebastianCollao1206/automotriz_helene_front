import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrediccionResponse } from '../../../../models/prediccion';

interface PrediccionConMetadatos extends PrediccionResponse {
  trimestre: string;
  anio: number;
  diasPeriodo: number;
  tituloFormateado: string;
}


@Component({
  selector: 'app-prediccion-card',
  imports: [CommonModule],
  templateUrl: './prediccion-card.html',
  styleUrl: './prediccion-card.css'
})
export class PrediccionCard {

  @Input() predicciones: PrediccionConMetadatos[] = [];
  @Output() verDetalles = new EventEmitter<number>();

  onVerDetallesClick(id: number): void {
    this.verDetalles.emit(id);
  }

  obtenerClaseBadgePrecision(porcentaje: number | null): string {
    if (porcentaje === null) {
      return 'badge-azul';
    }

    if (porcentaje >= 90) {
      return 'badge-verde';
    } else if (porcentaje >= 75) {
      return 'badge-amarillo';
    } else {
      return 'badge-rojo';
    }
  }

  obtenerTextoPrecision(porcentaje: number | null): string {
    if (porcentaje === null) {
      return 'Nueva';
    }
    return `${porcentaje}% Precisión`;
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  trackByPrediccionId(index: number, prediccion: PrediccionConMetadatos): number {
    return prediccion.id;
  }

}
