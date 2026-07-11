import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

import {
  ThemeService
} from '../../../core/services/theme.service';

@Component({
  selector: 'app-backoffice-header',
  standalone: true,
  imports: [],
  templateUrl: './backoffice-header.html',
  styleUrl: './backoffice-header.css'
})
export class BackofficeHeader {
  @Output()
  openSidebar = new EventEmitter<void>();

  constructor(
    public readonly theme: ThemeService
  ) {}

  openMenu(): void {
    this.openSidebar.emit();
  }
}
