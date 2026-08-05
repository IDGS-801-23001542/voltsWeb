import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  CurrencyPipe,
  DatePipe
} from '@angular/common';

import {
  RouterLink
} from '@angular/router';

import {
  Quote,
  QuoteStatus
} from '../../../core/models/quote.model';

import {
  QuoteService
} from '../../../core/services/quote.service';

@Component({
  selector: 'app-client-quotes',
  standalone: true,
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './client-quotes.html',
  styleUrl: './client-quotes.css'
})
export class ClientQuotes implements OnInit {
  private readonly quoteService =
    inject(QuoteService);

  readonly quotes = signal<Quote[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly totalQuotes = computed(
    () => this.quotes().length
  );

  readonly pendingQuotes = computed(
    () =>
      this.quotes().filter(
        quote => quote.status === 'Pending'
      ).length
  );

  readonly approvedQuotes = computed(
    () =>
      this.quotes().filter(
        quote =>
          quote.status === 'Approved' ||
          quote.status === 'Converted'
      ).length
  );

  readonly totalQuoted = computed(
    () =>
      this.quotes().reduce(
        (total, quote) =>
          total + quote.total,
        0
      )
  );

  ngOnInit(): void {
    this.loadQuotes();
  }

  loadQuotes(): void {
    if (this.loading() && this.quotes().length > 0) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.quoteService
      .getMyQuotes()
      .subscribe({
        next: response => {
          this.quotes.set(
            response.data ?? []
          );

          this.loading.set(false);
        },
        error: error => {
          this.loading.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible cargar tus cotizaciones.'
          );
        }
      });
  }

  getStatusLabel(
    status: QuoteStatus
  ): string {
    const labels:
      Record<QuoteStatus, string> = {
        Pending: 'Pendiente',
        Approved: 'Aprobada',
        Rejected: 'Rechazada',
        Cancelled: 'Cancelada',
        Converted: 'Convertida en pedido'
      };

    return labels[status];
  }

  getStatusIcon(
    status: QuoteStatus
  ): string {
    const icons:
      Record<QuoteStatus, string> = {
        Pending: '⏳',
        Approved: '✅',
        Rejected: '❌',
        Cancelled: '🚫',
        Converted: '📦'
      };

    return icons[status];
  }

  getStatusClass(
    status: QuoteStatus
  ): string {
    return status.toLowerCase();
  }

  isExpired(
    quote: Quote
  ): boolean {
    if (
      quote.status === 'Converted' ||
      quote.status === 'Cancelled' ||
      quote.status === 'Rejected'
    ) {
      return false;
    }

    const validUntil =
      new Date(quote.validUntil);

    return (
      validUntil.getTime() <
      new Date().setHours(0, 0, 0, 0)
    );
  }

  trackByQuoteId(
    _index: number,
    quote: Quote
  ): string {
    return quote.id;
  }
}



