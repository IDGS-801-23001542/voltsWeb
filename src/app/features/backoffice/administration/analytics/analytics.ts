import {
  CurrencyPipe,
  DecimalPipe
} from '@angular/common';

import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  EMPTY,
  Subject,
  catchError,
  exhaustMap,
  merge,
  of,
  tap,
  timer
} from 'rxjs';

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

  private readonly destroyRef =
    inject(DestroyRef);

  private readonly manualRefresh =
    new Subject<boolean>();

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
    merge(
      of(true),
      timer(30000, 30000).pipe(
        tap(() => this.errorMessage.set('')),
        exhaustMap(() => of(false))
      ),
      this.manualRefresh
    )
      .pipe(
        exhaustMap(showLoader => {
          if (showLoader) {
            this.loading.set(true);
          }

          this.errorMessage.set('');

          return this.service.getOverview().pipe(
            tap(response => {
              this.overview.set(response.data);
              this.loading.set(false);
            }),
            catchError(error => {
              this.loading.set(false);
              this.errorMessage.set(
                error?.error?.message ??
                'No fue posible cargar la analítica.'
              );
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  load(showLoader = true): void {
    this.manualRefresh.next(showLoader);
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





