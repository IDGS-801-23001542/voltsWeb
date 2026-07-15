import {
  CurrencyPipe,
  DatePipe
} from '@angular/common';

import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  DashboardSummary
} from '../../../core/models/dashboard.model';

import {
  AuthService
} from '../../../core/services/auth.service';

import {
  DashboardService
} from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-backoffice-dashboard',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './backoffice-dashboard.html',
  styleUrl: './backoffice-dashboard.css'
})
export class BackofficeDashboard implements OnInit {
  private readonly dashboardService =
    inject(DashboardService);

  readonly auth = inject(AuthService);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly summary =
    signal<DashboardSummary | null>(null);

  readonly currentDate = new Date();

  readonly maxRevenue = computed(() =>
    Math.max(
      1,
      ...(
        this.summary()?.monthlyRevenue ?? []
      ).map(item => item.value)
    )
  );

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.dashboardService
      .getSummary()
      .subscribe({
        next: response => {
          this.summary.set(response.data);
          this.loading.set(false);
        },
        error: error => {
          this.loading.set(false);
          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible cargar el dashboard.'
          );
        }
      });
  }

  revenueHeight(value: number): number {
    return Math.max(
      5,
      value * 100 / this.maxRevenue()
    );
  }
}
