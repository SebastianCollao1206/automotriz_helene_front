import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProveedorResponse } from '../../../../models/proveedor';

@Component({
  selector: 'app-proveedor-table',
  imports: [CommonModule],
  templateUrl: './proveedor-table.html',
  styleUrl: './proveedor-table.css'
})
export class ProveedorTable {

  @Input() proveedores: ProveedorResponse[] = [];

  @Output() editarProveedor = new EventEmitter<number>();
  @Output() cambiarEstado = new EventEmitter<{ id: number; enabled: boolean }>();

  onEditarClick(id: number): void {
    this.editarProveedor.emit(id);
  }

  onToggleEstado(proveedor: ProveedorResponse): void {
    this.cambiarEstado.emit({
      id: proveedor.id,
      enabled: !proveedor.enabled
    });
  }

  trackByProveedorId(index: number, proveedor: ProveedorResponse): number {
    return proveedor.id;
  }

}
