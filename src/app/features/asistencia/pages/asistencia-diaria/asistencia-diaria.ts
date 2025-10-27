import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciaTable } from '../../components/asistencia-table/asistencia-table';


@Component({
  selector: 'app-asistencia-diaria',
  imports: [CommonModule, FormsModule, AsistenciaTable],
  templateUrl: './asistencia-diaria.html',
  styleUrl: './asistencia-diaria.css'
})
export class AsistenciaDiaria {
}
