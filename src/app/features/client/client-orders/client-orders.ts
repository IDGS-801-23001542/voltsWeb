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
  Order,
  OrderStatus
} from '../../../core/models/order.model';

import {
  OrderService
} from '../../../core/services/order.service';

@Component({
  selector: 'app-client-orders',
  standalone: true,
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './client-orders.html',
  styleUrl: './client-orders.css'
})
export class ClientOrders implements OnInit {
  private readonly orderService =
    inject(OrderService);

  readonly orders =
    signal<Order[]>([]);

  readonly loading =
    signal(true);

  readonly errorMessage =
    signal('');
  readonly payingId = signal<string | null>(null);
  readonly successMessage = signal('');

  readonly totalOrders =
    computed(() =>
      this.orders().length
    );

  readonly activeOrders =
    computed(() =>
      this.orders().filter(
        order =>
          order.status !== 'Sold' &&
          order.status !== 'Cancelled'
      ).length
    );

  readonly completedOrders =
    computed(() =>
      this.orders().filter(
        order =>
          order.status === 'Sold'
      ).length
    );

  readonly totalSpent =
    computed(() =>
      this.orders()
        .filter(
          order =>
            order.status !== 'Cancelled'
        )
        .reduce(
          (total, order) =>
            total + order.total,
          0
        )
    );

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.orderService
      .getMyOrders()
      .subscribe({
        next: response => {
          this.orders.set(
            response.data ?? []
          );

          this.loading.set(false);
        },

        error: error => {
          this.loading.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible cargar tus compras.'
          );
        }
      });
  }

  getStatusLabel(
    status: OrderStatus
  ): string {
    const labels:
      Record<OrderStatus, string> = {
        PendingConfirmation:
          'Pendiente de confirmación',

        AwaitingProduction:
          'En producción',

        ReadyForSale:
          'Lista para entrega',

        Sold:
          'Completada',

        Cancelled:
          'Cancelada'
      };

    return labels[status];
  }

  getStatusIcon(
    status: OrderStatus
  ): string {
    const icons:
      Record<OrderStatus, string> = {
        PendingConfirmation: '⏳',
        AwaitingProduction: '🏭',
        ReadyForSale: '📦',
        Sold: '✅',
        Cancelled: '🚫'
      };

    return icons[status];
  }

  getStatusClass(
    status: OrderStatus
  ): string {
    return status
      .replace(
        /([a-z])([A-Z])/g,
        '$1-$2'
      )
      .toLowerCase();
  }

  pay(order: Order): void {
    if (order.paymentStatus === 'Paid' || this.payingId()) return;
    this.payingId.set(order.id);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.orderService.pay(order.id).subscribe({
      next: response => {
        this.payingId.set(null);
        this.orders.update(items => items.map(item => item.id === order.id ? response.data : item));
        this.successMessage.set('Pago simulado registrado. Tu pedido ya puede pasar a producción.');
      },
      error: error => {
        this.payingId.set(null);
        this.errorMessage.set(error?.error?.message ?? 'No fue posible registrar el pago.');
      }
    });
  }
}


