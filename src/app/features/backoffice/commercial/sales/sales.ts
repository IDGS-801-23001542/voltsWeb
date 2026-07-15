import {
  CurrencyPipe,
  DatePipe
} from '@angular/common';

import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  forkJoin
} from 'rxjs';

import {
  Order
} from '../../../../core/models/order.model';

import {
  Sale
} from '../../../../core/models/sale.model';

import {
  OrderService
} from '../../../../core/services/order.service';

import {
  SaleService
} from '../../../../core/services/sale.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './sales.html',
  styleUrl: './sales.css'
})
export class Sales implements OnInit {
  private readonly saleService =
    inject(SaleService);

  private readonly orderService =
    inject(OrderService);

  readonly sales = signal<Sale[]>([]);
  readonly readyOrders = signal<Order[]>([]);
  readonly loading = signal(true);
  readonly sellingId = signal<string | null>(null);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    forkJoin({
      sales: this.saleService.getAll(),
      orders: this.orderService.getAll()
    }).subscribe({
      next: result => {
        this.sales.set(result.sales.data ?? []);
        this.readyOrders.set(
          (result.orders.data ?? []).filter(
            item => item.status === 'ReadyForSale'
          )
        );
        this.loading.set(false);
      },
      error: error => {
        this.loading.set(false);
        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible cargar ventas.'
        );
      }
    });
  }

  sell(order: Order): void {
    if (!window.confirm(
      `¿Confirmar la venta del pedido ${order.folio}?`
    )) {
      return;
    }

    this.sellingId.set(order.id);
    this.errorMessage.set('');

    this.saleService.create(order.id).subscribe({
      next: response => {
        this.sellingId.set(null);
        this.successMessage.set(response.message);
        this.loadData();
      },
      error: error => {
        this.sellingId.set(null);
        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible crear la venta.'
        );
      }
    });
  }
}
