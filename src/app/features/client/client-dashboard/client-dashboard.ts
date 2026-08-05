import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  AuthService
} from '../../../core/services/auth.service';

import {
  QuoteService
} from '../../../core/services/quote.service';

import {
  Quote
} from '../../../core/models/quote.model';
import { Order } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';
import {
  LicenseService
} from '../../../core/services/license.service';

import {
  License
} from '../../../core/models/license.model';

import {
  DatePipe
} from '@angular/common';

interface DashboardMetric {
  icon: string;
  value: number | string;
  label: string;
  description: string;
  route: string;
}

interface QuickAction {
  icon: string;
  title: string;
  description: string;
  route: string;
}

type ActivityType =
  | 'Quote'
  | 'Order'
  | 'License';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  date: string;
  route: string;
  icon: string;
  status: string;
}

type ExpirationType =
  | 'Warranty'
  | 'License';

interface UpcomingExpiration {
  id: string;
  type: ExpirationType;
  title: string;
  description: string;
  expirationDate: string;
  daysRemaining: number;
  route: string;
  icon: string;
  licenseCode: string;
}

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe
  ],
  templateUrl: './client-dashboard.html',
  styleUrl: './client-dashboard.css'
})
export class ClientDashboard implements OnInit {
  readonly auth = inject(AuthService);

  private readonly quoteService =
    inject(QuoteService);

  private readonly orderService =
  inject(OrderService);

  private readonly licenseService =
  inject(LicenseService);

  private parseDate(
  value?: string | null
): Date | null {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return this.getStartOfDay(date);
}

private getStartOfDay(
  date: Date
): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

private getDaysDifference(
  startDate: Date,
  endDate: Date
): number {
  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  return Math.ceil(
    (
      endDate.getTime() -
      startDate.getTime()
    ) /
    millisecondsPerDay
  );
}

getExpirationDescription(
  daysRemaining: number,
  concept: string
): string {
  if (daysRemaining === 0) {
    return (
      `La ${concept} vence hoy.`
    );
  }

  if (daysRemaining === 1) {
    return (
      `La ${concept} vence mañana.`
    );
  }

  return (
    `La ${concept} vence en ` +
    `${daysRemaining} días.`
  );
}

getExpirationTypeLabel(
  type: ExpirationType
): string {
  const labels:
    Record<
      ExpirationType,
      string
    > = {
      Warranty: 'Garantía',
      License: 'Licencia'
    };

  return labels[type];
}

getExpirationTypeClass(
  type: ExpirationType
): string {
  return type.toLowerCase();
}

getExpirationUrgencyClass(
  daysRemaining: number
): string {
  if (daysRemaining <= 3) {
    return 'critical';
  }

  if (daysRemaining <= 7) {
    return 'warning';
  }

  return 'upcoming';
}

getDaysRemainingLabel(
  daysRemaining: number
): string {
  if (daysRemaining === 0) {
    return 'Vence hoy';
  }

  if (daysRemaining === 1) {
    return '1 día restante';
  }

  return (
    `${daysRemaining} días restantes`
  );
}

  readonly licenses =
    signal<License[]>([]);

  readonly licensesLoading =
    signal(true);

  readonly activeLicensesCount =
    computed(() =>
      this.licenses().filter(
        license =>
          license.status === 'Active'
      ).length
    );

  readonly currentUser =
    this.auth.currentUser;

  readonly quotes =
    signal<Quote[]>([]);

  readonly quotesLoading =
    signal(true);

  readonly quotesCount =
    computed(() =>
      this.quotes().length
    );

  readonly productsCount =
  computed(() => {
    const productIds =
      new Set<string>();

    for (const order of this.orders()) {
      if (order.status === 'Cancelled') {
        continue;
      }

      for (
        const detail of order.details ?? []
      ) {
        productIds.add(
          detail.productId
        );
      }
    }

    return productIds.size;
  });

  orders = signal<Order[]>([]);
  ordersLoading = signal(true);

  ordersCount = computed(() =>
    this.orders().length
  );

  readonly displayName =
    computed(() => {
      const user = this.currentUser();

      if (!user) {
        return 'Cliente';
      }

      const firstName =
        user.firstNames
          ?.trim()
          .split(/\s+/)[0];

      return (
        firstName ||
        user.fullName ||
        'Cliente'
      );
    });

  readonly fullName =
    computed(() =>
      this.currentUser()?.fullName ||
      this.displayName()
    );

  readonly email =
    computed(() =>
      this.currentUser()?.email ||
      'Correo no disponible'
    );

  readonly metrics =
    computed<DashboardMetric[]>(() => [
      {
        icon: '🛒',
        value: this.ordersLoading()
          ? '...'
          : this.ordersCount(),
        label: 'Compras',
        description: 'Compras realizadas',
        route: '/cliente/compras'
      },
      {
        icon: '📦',
        value: this.ordersLoading()
          ? '...'
          : this.productsCount(),
        label: 'Productos',
        description:
          'Productos asociados',
        route: '/cliente/productos'
      },
      {
        icon: '📝',
        value: this.quotesLoading()
          ? '...'
          : this.quotesCount(),
        label: 'Cotizaciones',
        description:
          'Solicitudes enviadas',
        route: '/cliente/cotizaciones'
      },
      {
        icon: '🔑',
        value: this.licensesLoading()
          ? '...'
          : this.activeLicensesCount(),
        label: 'Licencias',
        description: 'Licencias activas',
        route: '/cliente/licencias'
      }
    ]);

    readonly recentActivity =
  computed<ActivityItem[]>(() => {
    const activities: ActivityItem[] = [];

    for (const quote of this.quotes()) {
      activities.push({
        id: `quote-${quote.id}`,
        type: 'Quote',
        title:
          `Cotización ${quote.folio}`,
        description:
          this.getQuoteActivityDescription(
            quote.status
          ),
        date: quote.createdAt,
        route: '/cliente/cotizaciones',
        icon: '📝',
        status: quote.status
      });
    }

    for (const order of this.orders()) {
      activities.push({
        id: `order-${order.id}`,
        type: 'Order',
        title:
          `Pedido ${order.folio}`,
        description:
          this.getOrderActivityDescription(
            order.status
          ),
        date: order.createdAt,
        route: '/cliente/compras',
        icon: '📦',
        status: order.status
      });
    }

    for (const license of this.licenses()) {
      activities.push({
        id: `license-${license.id}`,
        type: 'License',
        title:
          `Licencia ${license.licenseCode}`,
        description:
          this.getLicenseActivityDescription(
            license.status,
            license.productName
          ),
        date:
          license.activationDate ??
          license.createdAt,
        route: '/cliente/licencias',
        icon: '🔑',
        status: license.status
      });
    }

    return activities
      .filter(
        activity =>
          Boolean(activity.date)
      )
      .sort(
        (first, second) =>
          new Date(second.date).getTime() -
          new Date(first.date).getTime()
      )
      .slice(0, 5);
  });

  readonly upcomingExpirations =
  computed<UpcomingExpiration[]>(() => {
    const expirations:
      UpcomingExpiration[] = [];

    const today =
      this.getStartOfDay(new Date());

    const maximumDate =
      new Date(today);

    maximumDate.setDate(
      maximumDate.getDate() + 30
    );

    for (const license of this.licenses()) {
      const warrantyDate =
        this.parseDate(
          license.warrantyEndDate
        );

      if (
        warrantyDate &&
        warrantyDate >= today &&
        warrantyDate <= maximumDate
      ) {
        const daysRemaining =
          this.getDaysDifference(
            today,
            warrantyDate
          );

        expirations.push({
          id:
            `warranty-${license.id}`,

          type: 'Warranty',

          title:
            `Garantía de ${license.productName}`,

          description:
            this.getExpirationDescription(
              daysRemaining,
              'garantía'
            ),

          expirationDate:
            license.warrantyEndDate,

          daysRemaining,

          route:
            '/cliente/licencias',

          icon: '🛡️',

          licenseCode:
            license.licenseCode
        });
      }

      const expirationDate =
        this.parseDate(
          license.expirationDate
        );

      if (
        expirationDate &&
        expirationDate >= today &&
        expirationDate <= maximumDate
      ) {
        const daysRemaining =
          this.getDaysDifference(
            today,
            expirationDate
          );

        expirations.push({
          id:
            `license-${license.id}`,

          type: 'License',

          title:
            `Licencia de ${license.productName}`,

          description:
            this.getExpirationDescription(
              daysRemaining,
              'licencia'
            ),

          expirationDate:
            license.expirationDate!,

          daysRemaining,

          route:
            '/cliente/licencias',

          icon: '🔑',

          licenseCode:
            license.licenseCode
        });
      }
    }

    return expirations
      .sort(
        (first, second) =>
          first.daysRemaining -
          second.daysRemaining
      )
      .slice(0, 5);
  });

  getQuoteActivityDescription(
  status: string
): string {
  const descriptions:
    Record<string, string> = {
      Draft:
        'La cotización se encuentra en borrador.',
      Pending:
        'La cotización está pendiente de revisión.',
      Sent:
        'La cotización fue enviada para revisión.',
      Approved:
        'La cotización fue aprobada.',
      Rejected:
        'La cotización fue rechazada.',
      Converted:
        'La cotización se convirtió en pedido.',
      Cancelled:
        'La cotización fue cancelada.'
    };

  return (
    descriptions[status] ??
    'La cotización fue actualizada.'
  );
}

getOrderActivityDescription(
  status: string
): string {
  const descriptions:
    Record<string, string> = {
      Pending:
        'El pedido está pendiente de procesamiento.',
      Confirmed:
        'El pedido fue confirmado.',
      Processing:
        'El pedido se encuentra en preparación.',
      Shipped:
        'El pedido fue enviado.',
      Delivered:
        'El pedido fue entregado.',
      Completed:
        'El pedido fue completado.',
      Cancelled:
        'El pedido fue cancelado.'
    };

  return (
    descriptions[status] ??
    'El pedido fue actualizado.'
  );
}

getLicenseActivityDescription(
  status: string,
  productName: string
): string {
  const descriptions:
    Record<string, string> = {
      Available:
        `La licencia de ${productName} está disponible.`,
      Active:
        `La licencia de ${productName} fue activada.`,
      Expired:
        `La licencia de ${productName} expiró.`,
      Revoked:
        `La licencia de ${productName} fue revocada.`
    };

  return (
    descriptions[status] ??
    `La licencia de ${productName} fue actualizada.`
  );
}

  getActivityTypeLabel(
  type: ActivityType
): string {
  const labels:
    Record<ActivityType, string> = {
      Quote: 'Cotización',
      Order: 'Compra',
      License: 'Licencia'
    };

  return labels[type];
}

getActivityTypeClass(
  type: ActivityType
): string {
  return type.toLowerCase();
}

  readonly activityLoading =
  computed(() =>
    this.quotesLoading() ||
    this.ordersLoading() ||
    this.licensesLoading()
  );

  readonly quickActions:
    QuickAction[] = [
      {
        icon: '📝',
        title: 'Solicitar cotización',
        description:
          'Envía una nueva solicitud para conocer opciones y precios.',
        route: '/cotizacion'
      },
      {
        icon: '📦',
        title: 'Consultar productos',
        description:
          'Revisa los productos relacionados con tu cuenta.',
        route: '/cliente/productos'
      },
      {
        icon: '🎓',
        title: 'Centro de aprendizaje',
        description:
          'Accede a recursos educativos y contenido de VOLTS.',
        route: '/aprendizaje'
      }
    ];

  ngOnInit(): void {
    this.loadQuotes();
    this.loadOrders();
    this.loadLicenses();
  }

  private loadQuotes(): void {
    this.quotesLoading.set(true);

    this.quoteService
      .getMyQuotes()
      .subscribe({
        next: response => {
          this.quotes.set(
            response.data ?? []
          );

          this.quotesLoading.set(false);
        },

        error: () => {
          this.quotes.set([]);
          this.quotesLoading.set(false);
        }
      });
  }

  private loadOrders(): void {

  this.ordersLoading.set(true);

  this.orderService
    .getMyOrders()
    .subscribe({

      next: response => {

        this.orders.set(
          response.data ?? []
        );

        this.ordersLoading.set(false);
      },

      error: () => {

        this.orders.set([]);

        this.ordersLoading.set(false);
      }
    });
  }

  private loadLicenses(): void {
    this.licensesLoading.set(true);

    this.licenseService
      .getMyLicenses()
      .subscribe({
        next: response => {
          this.licenses.set(
            response.data ?? []
          );

          this.licensesLoading.set(false);
        },

        error: () => {
          this.licenses.set([]);
          this.licensesLoading.set(false);
        }
      });
  }



}



