import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../components/header/header';
import { Sidebar } from '../components/sidebar/sidebar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  imports: [Header, Sidebar, RouterOutlet, CommonModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {
  sidebarCollapsed = false;
  mobileSidebarOpen = false;

  toggleSidebar() {
    if (window.innerWidth < 1024) {
      this.mobileSidebarOpen = !this.mobileSidebarOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  closeMobileSidebar() {
    this.mobileSidebarOpen = false;
  }
}
