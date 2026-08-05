import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  DatePipe
} from '@angular/common';

import {
  RouterLink
} from '@angular/router';

import {
  Order
} from '../../../core/models/order.model';

import {
  OrderService
} from '../../../core/services/order.service';

interface ClientProduct {
  productId: string;
  productName: string;
  productImageUrl?: string | null;
  totalQuantity: number;
  ordersCount: number;
  lastPurchaseDate: string;
  lastOrderFolio: string;
}

@Component({
  selector: 'app-client-products',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe
  ],
  templateUrl: './client-products.html',
  styleUrl: './client-products.css'
})
export class ClientProducts implements OnInit {
  private readonly orderService =
    inject(OrderService);

  readonly orders =
    signal<Order[]>([]);

  readonly loading =
    signal(true);

  readonly errorMessage =
    signal('');

  readonly products =
    computed<ClientProduct[]>(() => {
      const groupedProducts =
        new Map<string, ClientProduct>();

      const validOrders =
        this.orders().filter(
          order =>
            order.status !== 'Cancelled'
        );

      for (const order of validOrders) {
        for (const detail of order.details ?? []) {
          const existingProduct =
            groupedProducts.get(
              detail.productId
            );

          if (!existingProduct) {
            groupedProducts.set(
              detail.productId,
              {
                productId:
                  detail.productId,

                productName:
                  detail.productName,

                productImageUrl: detail.productImageUrl,

                totalQuantity:
                  detail.requestedQuantity,

                ordersCount: 1,

                lastPurchaseDate:
                  order.createdAt,

                lastOrderFolio:
                  order.folio
              }
            );

            continue;
          }

          existingProduct.totalQuantity +=
            detail.requestedQuantity;

          existingProduct.ordersCount += 1;

          const currentDate =
            new Date(order.createdAt);

          const savedDate =
            new Date(
              existingProduct
                .lastPurchaseDate
            );

          if (
            currentDate.getTime() >
            savedDate.getTime()
          ) {
            existingProduct.lastPurchaseDate =
              order.createdAt;

            existingProduct.lastOrderFolio =
              order.folio;
          }
        }
      }

      return Array.from(
        groupedProducts.values()
      ).sort(
        (first, second) =>
          new Date(
            second.lastPurchaseDate
          ).getTime() -
          new Date(
            first.lastPurchaseDate
          ).getTime()
      );
    });

  readonly totalProducts =
    computed(() =>
      this.products().length
    );

  readonly totalUnits =
    computed(() =>
      this.products().reduce(
        (total, product) =>
          total +
          product.totalQuantity,
        0
      )
    );

  readonly totalOrders =
    computed(() =>
      this.orders().filter(
        order =>
          order.status !== 'Cancelled'
      ).length
    );

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
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
          this.orders.set([]);
          this.loading.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible cargar tus productos.'
          );
        }
      });
  }

  trackByProductId(
    _index: number,
    product: ClientProduct
  ): string {
    return product.productId;
  }
}


