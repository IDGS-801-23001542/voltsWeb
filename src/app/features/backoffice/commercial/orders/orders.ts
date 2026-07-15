import {
  CurrencyPipe
} from '@angular/common';

import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  Order
} from '../../../../core/models/order.model';

import {
  OrderService
} from '../../../../core/services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CurrencyPipe
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  private readonly orderService =
    inject(OrderService);

  readonly orders = signal<Order[]>([]);
  readonly loading = signal(true);
  readonly actionId = signal<string | null>(null);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.orderService.getAll().subscribe({
      next: response => {
        this.orders.set(response.data ?? []);
        this.loading.set(false);
      },
      error: error => {
        this.loading.set(false);
        this.errorMessage.set(
          this.extractError(
            error,
            'No fue posible cargar pedidos.'
          )
        );
      }
    });
  }

  confirm(order: Order): void {
    this.runAction(
      order,
      this.orderService.confirm(order.id)
    );
  }

  synchronize(order: Order): void {
    this.runAction(
      order,
      this.orderService.synchronizeStock(
        order.id
      )
    );
  }

  cancel(order: Order): void {
    const reason = window.prompt(
      'Motivo de cancelación:'
    );

    if (!reason?.trim()) {
      return;
    }

    this.runAction(
      order,
      this.orderService.cancel(
        order.id,
        reason.trim()
      )
    );
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      PendingConfirmation:
        'Pendiente de confirmación',
      AwaitingProduction:
        'En espera de producción',
      ReadyForSale:
        'Listo para venta',
      Sold:
        'Vendido',
      Cancelled:
        'Cancelado'
    };

    return labels[status] ?? status;
  }

  private runAction(
    order: Order,
    operation: any
  ): void {
    this.actionId.set(order.id);
    this.errorMessage.set('');

    operation.subscribe({
      next: (response: any) => {
        this.actionId.set(null);
        this.successMessage.set(
          response.message
        );
        this.loadOrders();
      },
      error: (error: any) => {
        this.actionId.set(null);
        this.errorMessage.set(
          this.extractError(
            error,
            'No fue posible completar la operación.'
          )
        );
      }
    });
  }

  private extractError(
    error: any,
    fallback: string
  ): string {
    const errors = error?.error?.errors;

    if (Array.isArray(errors) && errors.length) {
      return errors.join(' · ');
    }

    return error?.error?.message ?? fallback;
  }
}
