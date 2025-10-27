import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserResponse } from '../../../../models/user';
import { ROLE_NAMES, ROLE_BADGE_CLASSES } from '../../../../core/constants/roles-constants';

@Component({
  selector: 'app-users-table',
  imports: [CommonModule],
  templateUrl: './users-table.html',
  styleUrl: './users-table.css',
})
export class UsersTable {

  @Input() usuarios: UserResponse[] = [];

  @Output() editarUsuario = new EventEmitter<number>();
  @Output() cambiarEstado = new EventEmitter<{ id: number; enabled: boolean }>();

  onEditarClick(id: number): void {
    this.editarUsuario.emit(id);
  }

  onToggleEstado(usuario: UserResponse): void {
    this.cambiarEstado.emit({
      id: usuario.id,
      enabled: !usuario.enabled
    });
  }

  getRoleBadgeClass(role: string): string {
    return ROLE_BADGE_CLASSES[role] || 'badge-empleado';
  }

  getRoleName(role: string): string {
    return ROLE_NAMES[role] || role.replace('ROLE_', '');
  }

  trackByUserId(index: number, usuario: UserResponse): number {
    return usuario.id;
  }

}
