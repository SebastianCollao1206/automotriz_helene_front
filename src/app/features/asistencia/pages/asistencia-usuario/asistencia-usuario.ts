import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CommonModule } from '@angular/common';
import { After } from 'v8';

interface AttendanceRecord {
  date: string;
  status: 'present' | 'late' | 'absent';
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

interface Employee {
  id: number;
  name: string;
  area: string;
  position: string;
  avatar?: string;
}


@Component({
  selector: 'app-asistencia-usuario',
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './asistencia-usuario.html',
  styleUrl: './asistencia-usuario.css',
})
export class AsistenciaUsuario implements OnInit, AfterViewInit {
  @ViewChild('calendar', { static: false }) calendarComponent!: FullCalendarComponent;

  selectedEmployee: Employee | null = null;
  employees: Employee[] = [];
  attendanceRecords: AttendanceRecord[] = [];

  currentMonth: Date = new Date();
  selectedDate: AttendanceRecord | null = null;
  showDetailsModal: boolean = false;

  stats = {
    present: 0,
    late: 0,
    absent: 0,
    total: 0,
    percentage: 0
  };

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    headerToolbar: false,
    height: 'auto',
    firstDay: 1,
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
    events: [],
    dayCellClassNames: (arg) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const cellDate = new Date(arg.date);
      cellDate.setHours(0, 0, 0, 0);

      if (cellDate.getTime() === today.getTime()) {
        return ['today-cell'];
      }
      return [];
    }
  };

  ngOnInit() {
    this.loadEmployees();
    if (this.employees.length > 0) {
      this.selectEmployee(this.employees[0]);
    }
  }

  ngAfterViewInit() {
    // Aquí se asegura que el calendario esté listo
  }

  loadEmployees() {
    this.employees = [
      { id: 1, name: 'Juan Pérez', area: 'Ventas', position: 'Gerente de Ventas' },
      { id: 2, name: 'María García', area: 'Marketing', position: 'Coordinadora' },
      { id: 3, name: 'Carlos López', area: 'Desarrollo', position: 'Developer Senior' },
      { id: 4, name: 'Ana Martínez', area: 'Recursos Humanos', position: 'Analista' },
    ];
  }

  selectEmployee(employee: Employee) {
    this.selectedEmployee = employee;
    this.loadAttendanceRecords();
  }

  loadAttendanceRecords() {
    if (!this.selectedEmployee) return;
    this.attendanceRecords = this.generateMockAttendance();
    this.updateCalendarEvents();
    this.calculateStats();
  }

  generateMockAttendance(): AttendanceRecord[] {
    const records: AttendanceRecord[] = [];
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);

      if (date.getDay() !== 0 && date.getDay() !== 6 && date <= new Date()) {
        const random = Math.random();
        let status: 'present' | 'late' | 'absent';
        let checkIn = '';
        let checkOut = '';

        if (random < 0.75) {
          status = 'present';
          checkIn = '08:00';
          checkOut = '17:30';
        } else if (random < 0.90) {
          status = 'late';
          checkIn = '08:45';
          checkOut = '17:30';
        } else {
          status = 'absent';
        }

        records.push({
          date: date.toISOString().split('T')[0],
          status,
          checkIn,
          checkOut
        });
      }
    }

    return records;
  }

  updateCalendarEvents() {
    const events = this.attendanceRecords.map(record => ({
      date: record.date,
      display: 'background',
      backgroundColor: this.getStatusColor(record.status),
      classNames: ['attendance-event']
    }));

    this.calendarOptions = {
      ...this.calendarOptions,
      events: events
    };
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'present': return '#22c55e';
      case 'late': return '#eab308';
      case 'absent': return '#ef4444';
      default: return '#94a3b8';
    }
  }

  getStatusBgClass(status: string): string {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'present': return 'Presente';
      case 'late': return 'Tardanza';
      case 'absent': return 'Ausente';
      default: return 'Desconocido';
    }
  }

  calculateStats() {
    this.stats.total = this.attendanceRecords.length;
    this.stats.present = this.attendanceRecords.filter(r => r.status === 'present').length;
    this.stats.late = this.attendanceRecords.filter(r => r.status === 'late').length;
    this.stats.absent = this.attendanceRecords.filter(r => r.status === 'absent').length;
    this.stats.percentage = this.stats.total > 0
      ? Math.round((this.stats.present / this.stats.total) * 100)
      : 0;
  }

  handleDateClick(arg: any) {
    const dateStr = arg.dateStr;
    const record = this.attendanceRecords.find(r => r.date === dateStr);

    if (record) {
      this.selectedDate = record;
      this.showDetailsModal = true;
    }
  }

  handleEventClick(arg: any) {
    // Similar a handleDateClick
  }

  previousMonth() {
    if (this.calendarComponent) {
      const calendarApi = this.calendarComponent.getApi();
      if (calendarApi) {
        calendarApi.prev();
        this.currentMonth = new Date(calendarApi.getDate());
        this.loadAttendanceRecords();
      }
    }
  }

  nextMonth() {
    if (this.calendarComponent) {
      const calendarApi = this.calendarComponent.getApi();
      if (calendarApi) {
        calendarApi.next();
        this.currentMonth = new Date(calendarApi.getDate());
        this.loadAttendanceRecords();
      }
    }
  }

  goToToday() {
    if (this.calendarComponent) {
      const calendarApi = this.calendarComponent.getApi();
      if (calendarApi) {
        calendarApi.today();
        this.currentMonth = new Date(calendarApi.getDate());
        this.loadAttendanceRecords();
      }
    }
  }
}
