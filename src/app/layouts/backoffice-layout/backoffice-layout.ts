import {
  Component,
  signal
} from '@angular/core';

import {
  RouterOutlet
} from '@angular/router';

import {
  BackofficeSidebar
} from '../../shared/components/backoffice-sidebar/backoffice-sidebar';

import {
  BackofficeHeader
} from '../../shared/components/backoffice-header/backoffice-header';

@Component({
  selector: 'app-backoffice-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    BackofficeSidebar,
    BackofficeHeader
  ],
  templateUrl: './backoffice-layout.html',
  styleUrl: './backoffice-layout.css'
})
export class BackofficeLayout {
  readonly sidebarOpen = signal(false);

  openSidebar(): void {
    this.sidebarOpen.set(true);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
