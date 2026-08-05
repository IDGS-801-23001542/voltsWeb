import {
  CurrencyPipe,
  DecimalPipe
} from '@angular/common';

import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  AnalyticsCategory,
  AnalyticsOverview,
  AnalyticsPoint
} from '../../../../core/models/analytics.model';

import {
  AnalyticsService
} from '../../../../core/services/analytics.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CurrencyPipe,
    DecimalPipe
  ],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class Analytics implements OnInit {
  private readonly service =
    inject(AnalyticsService);

  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly overview =
    signal<AnalyticsOverview | null>(null);

  readonly revenuePoints = computed(() =>
    this.buildPolyline(
      this.overview()?.monthlyRevenue ?? []
    )
  );

  readonly purchasePoints = computed(() =>
    this.buildPolyline(
      this.overview()?.monthlyPurchases ?? []
    )
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.service
      .getOverview()
      .subscribe({
        next: response => {
          this.overview.set(response.data);
          this.loading.set(false);
        },
        error: error => {
          this.loading.set(false);
          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible cargar la analítica.'
          );
        }
      });
  }

  maxValue(items: AnalyticsCategory[]): number {
    return Math.max(
      1,
      ...items.map(item => item.value)
    );
  }

  barWidth(
    value: number,
    items: AnalyticsCategory[]
  ): number {
    return Math.max(
      4,
      value * 100 / this.maxValue(items)
    );
  }

  private buildPolyline(
    items: AnalyticsPoint[]
  ): string {
    if (items.length === 0)
      return '';

    const width = 720;
    const height = 220;
    const padding = 18;
    const max = Math.max(
      1,
      ...items.map(item => item.value)
    );

    return items
      .map((item, index) => {
        const x = items.length === 1
          ? width / 2
          : padding +
            index *
            (width - padding * 2) /
            (items.length - 1);

        const y =
          height -
          padding -
          item.value *
          (height - padding * 2) /
          max;

        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }
}



