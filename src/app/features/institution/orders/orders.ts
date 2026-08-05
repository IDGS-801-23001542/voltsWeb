import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Order } from '../../../core/models/order.model';
import { InstitutionPortalService } from '../../../core/services/institution-portal.service';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-orders', standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './orders.html', styleUrl: './orders.css'
})
export class InstitutionOrders implements OnInit {
  private readonly portal = inject(InstitutionPortalService);
  private readonly ordersService = inject(OrderService);
  readonly items = signal<Order[]>([]);
  readonly payingId = signal<string | null>(null);
  readonly message = signal('');

  ngOnInit(): void { this.load(); }
  load(): void { this.portal.orders().subscribe(response => this.items.set(response.data ?? [])); }
  pay(order: Order): void {
    if (this.payingId() || order.paymentStatus === 'Paid') return;
    this.payingId.set(order.id); this.message.set('');
    this.ordersService.pay(order.id).subscribe({
      next: response => {
        this.payingId.set(null);
        this.items.update(items => items.map(item => item.id === order.id ? response.data : item));
        this.message.set('Pago simulado registrado. El pedido ya puede pasar a producción.');
      },
      error: error => { this.payingId.set(null); this.message.set(error?.error?.message ?? 'No fue posible registrar el pago.'); }
    });
  }
}
