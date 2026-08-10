import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { InstitutionPortalService } from '../../../core/services/institution-portal.service';
import { OrderService } from '../../../core/services/order.service';

@Component({ selector:'app-orders', standalone:true, imports:[CurrencyPipe,DatePipe], templateUrl:'./orders.html', styleUrl:'./orders.css' })
export class InstitutionOrders implements OnInit {
  private readonly portal=inject(InstitutionPortalService); private readonly ordersService=inject(OrderService);
  readonly items=signal<Order[]>([]); readonly loading=signal(true); readonly payingId=signal<string|null>(null); readonly message=signal(''); readonly error=signal('');
  readonly pendingPayment=computed(()=>this.items().filter(x=>x.paymentStatus!=='Paid'&&x.status==='PendingConfirmation').length);
  readonly inProcess=computed(()=>this.items().filter(x=>x.status==='AwaitingProduction'||x.status==='ReadyForSale').length);
  readonly sold=computed(()=>this.items().filter(x=>x.status==='Sold').length);
  ngOnInit(){this.load();}
  load(){this.loading.set(true);this.portal.orders().subscribe({next:r=>{this.items.set(r.data??[]);this.loading.set(false)},error:e=>{this.loading.set(false);this.error.set(e?.error?.message??'No fue posible cargar los pedidos.')}});}
  pay(order:Order){if(this.payingId()||order.paymentStatus==='Paid')return;this.payingId.set(order.id);this.message.set('');this.error.set('');this.ordersService.pay(order.id).subscribe({next:r=>{this.payingId.set(null);if(r.data)this.items.update(items=>items.map(x=>x.id===order.id?r.data!:x));this.message.set('Pago simulado registrado. El sistema continuará con reserva y producción cuando corresponda.')},error:e=>{this.payingId.set(null);this.error.set(e?.error?.message??'No fue posible registrar el pago.')}});}
  statusLabel(s:OrderStatus){return ({PendingConfirmation:'Pendiente de pago',AwaitingProduction:'En producción',ReadyForSale:'Lista para venta',Sold:'Vendida',Cancelled:'Cancelada'} as Record<OrderStatus,string>)[s];}
}
