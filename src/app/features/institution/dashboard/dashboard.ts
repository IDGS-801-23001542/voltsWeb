import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  InstitutionPortalService
} from '../../../core/services/institution-portal.service';

import {
  InstitutionDashboard as InstitutionDashboardModel
} from '../../../core/models/institution-portal.model';

@Component({
  selector: 'app-institution-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class InstitutionDashboard implements OnInit {
  private readonly institutionPortalService =
    inject(InstitutionPortalService);

  readonly loading =
    signal(true);

  readonly errorMessage =
    signal('');

  readonly data =
    signal<InstitutionDashboardModel | null>(
      null
    );

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.institutionPortalService
      .dashboard()
      .subscribe({
        next: response => {
          this.data.set(
            response.data ?? null
          );

          this.loading.set(false);
        },

        error: error => {
          this.loading.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible cargar el resumen institucional.'
          );
        }
      });
  }
}
