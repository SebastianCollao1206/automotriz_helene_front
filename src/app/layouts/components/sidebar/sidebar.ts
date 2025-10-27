import { Component, Injectable, Input, EventEmitter, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  @Input() collapsed = false;
  @Input() showCloseButton = false;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
