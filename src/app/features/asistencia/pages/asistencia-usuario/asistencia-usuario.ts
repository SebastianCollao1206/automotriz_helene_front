import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Asistencia } from '../../service/asistencia';
import { DetalleAsistenciaDia } from '../../../../models/asistencia';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { finalize } from 'rxjs';

interface AttendanceRecord {
  date: string;
  status: 'Presente' | 'Tardanza' | 'Falto' | 'Descanso';
  diaSemana: string;
}

interface CalendarDay {
  day: number;
  date: string;
  isCurrentMonth: boolean;
  status?: 'Presente' | 'Tardanza' | 'Falto' | 'Descanso';
  isToday: boolean;
}


@Component({
  selector: 'app-asistencia-usuario',
  imports: [CommonModule],
  templateUrl: './asistencia-usuario.html',
  styleUrl: './asistencia-usuario.css',
})
export class AsistenciaUsuario implements OnInit {

  userId: number = 0;
  nombreUsuario: string = '';
  attendanceRecords: AttendanceRecord[] = [];

  currentMonth: Date = new Date();
  selectedDate: AttendanceRecord | null = null;
  showDetailsModal: boolean = false;
  cargandoDatos: boolean = false;

  calendarDays: CalendarDay[] = [];
  diasSemana: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  stats = {
    present: 0,
    late: 0,
    absent: 0,
    total: 0,
    percentage: 0
  };

  constructor(
    private route: ActivatedRoute,
    private asistenciaService: Asistencia,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.userId = +params['userId'];
      if (this.userId) {
        this.loadAttendanceRecords();
      }
    });
  }

  loadAttendanceRecords() {
    if (!this.userId) return;

    this.cargandoDatos = true;
    const mes = this.currentMonth.getMonth() + 1;
    const anio = this.currentMonth.getFullYear();

    this.asistenciaService.obtenerAsistenciasMensuales(this.userId, mes, anio)
      .pipe(
        finalize(() => {
          this.cargandoDatos = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.nombreUsuario = response.data.nombreUsuario;
            this.stats.present = response.data.totalPresente;
            this.stats.late = response.data.totalTardanza;
            this.stats.absent = response.data.totalFalta;
            this.stats.total = this.stats.present + this.stats.late + this.stats.absent;
            this.stats.percentage = Math.round(response.data.porcentajeAsistencia);

            this.attendanceRecords = response.data.detalles.map((detalle: DetalleAsistenciaDia) => ({
              date: detalle.fecha,
              status: detalle.estado as 'Presente' | 'Tardanza' | 'Falto' | 'Descanso',
              diaSemana: detalle.diaSemana
            }));

            this.generateCalendar();
            this.cdr.detectChanges();
          } else {
            NotificacionSweet.showError('Error', response.mensaje || 'No se pudieron cargar las asistencias');
          }
        },
        error: (error) => {
          NotificacionSweet.handleBackendError(error);
        }
      });
  }

  generateCalendar() {
    this.calendarDays = [];
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      this.calendarDays.push({
        day,
        date: this.formatDate(date),
        isCurrentMonth: false,
        isToday: false
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = this.formatDate(date);
      const record = this.attendanceRecords.find(r => r.date === dateStr);

      const isToday = date.getTime() === today.getTime();

      this.calendarDays.push({
        day,
        date: dateStr,
        isCurrentMonth: true,
        status: record?.status,
        isToday
      });
    }

    const remainingDays = 7 - (this.calendarDays.length % 7);
    if (remainingDays < 7) {
      for (let day = 1; day <= remainingDays; day++) {
        const date = new Date(year, month + 1, day);
        this.calendarDays.push({
          day,
          date: this.formatDate(date),
          isCurrentMonth: false,
          isToday: false
        });
      }
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getDayClass(calendarDay: CalendarDay): string {
    let classes = 'calendar-day';

    if (!calendarDay.isCurrentMonth) {
      classes += ' other-month';
    }

    if (calendarDay.isToday) {
      classes += ' today';
    }

    if (calendarDay.status) {
      classes += ' has-status';
    }

    return classes;
  }

  getDayStatusClass(status?: string): string {
    if (!status) return '';

    switch (status) {
      case 'PRESENTE': return 'status-presente';
      case 'TARDANZA': return 'status-tardanza';
      case 'FALTA': return 'status-falto';
      case 'DESCANSO': return 'status-descanso';
      default: return '';
    }
  }

  onDayClick(calendarDay: CalendarDay) {
    if (!calendarDay.isCurrentMonth || !calendarDay.status) return;

    const record = this.attendanceRecords.find(r => r.date === calendarDay.date);
    if (record) {
      this.selectedDate = record;
      this.showDetailsModal = true;
      this.cdr.detectChanges();
    }
  }

  previousMonth() {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
    this.loadAttendanceRecords();
  }

  nextMonth() {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
    this.loadAttendanceRecords();
  }

  goToToday() {
    this.currentMonth = new Date();
    this.loadAttendanceRecords();
  }

  getMonthYearDisplay(): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${meses[this.currentMonth.getMonth()]} - ${this.currentMonth.getFullYear()}`;
  }

  getInitial(initialString: string): string {
    const palabras = initialString.split(' ');
    return palabras[0][0].toUpperCase();
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'Presente': return 'Presente';
      case 'Tardanza': return 'Tardanza';
      case 'Falto': return 'Ausente';
      case 'Descanso': return 'Descanso';
      default: return 'Desconocido';
    }
  }

  getStatusBgClass(status: string): string {
    switch (status) {
      case 'Presente': return 'bg-green-100 text-green-800 border-green-200';
      case 'Tardanza': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Falto': return 'bg-red-100 text-red-800 border-red-200';
      case 'Descanso': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatDateDisplay(dateStr: string): string {
    const date = new Date(dateStr);
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    return `${dias[date.getDay()]}, ${date.getDate()} de ${meses[date.getMonth()]} del ${date.getFullYear()}`;
  }

}
