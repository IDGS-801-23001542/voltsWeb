import {
  Component,
  DestroyRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
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
  interval,
  startWith,
  switchMap
} from 'rxjs';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  Notification
} from '../../../core/models/notification.model';

import {
  NotificationService
} from '../../../core/services/notification.service';

import {
  ThemeService
} from '../../../core/services/theme.service';

@Component({
  selector: 'app-backoffice-header',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink
  ],
  templateUrl: './backoffice-header.html',
  styleUrl: './backoffice-header.css'
})
export class BackofficeHeader
  implements OnInit {

  @Output()
  openSidebar =
    new EventEmitter<void>();

  private readonly notificationService =
    inject(NotificationService);

  private readonly destroyRef =
    inject(DestroyRef);

  readonly theme =
    inject(ThemeService);

  readonly notifications =
    signal<Notification[]>([]);

  readonly loadingNotifications =
    signal(false);

  readonly notificationError =
    signal('');

  readonly notificationsOpen =
    signal(false);

  readonly unreadCount =
    computed(() =>
      this.notifications().filter(
        notification =>
          !notification.isRead
      ).length
    );

  readonly recentNotifications =
    computed(() =>
      this.notifications().slice(0, 5)
    );

  ngOnInit(): void {
    this.startNotificationPolling();
  }

  openMenu(): void {
    this.openSidebar.emit();
  }

  toggleNotifications(
    event: MouseEvent
  ): void {
    event.stopPropagation();

    this.notificationsOpen.update(
      current => !current
    );
  }

  closeNotifications(): void {
    this.notificationsOpen.set(false);
  }

  markAsRead(
    notification: Notification,
    event: MouseEvent
  ): void {
    event.stopPropagation();

    if (notification.isRead) {
      return;
    }

    this.notificationService
      .markAsRead(notification.id)
      .subscribe({
        next: () => {
          this.notifications.update(
            current =>
              current.map(item =>
                item.id === notification.id
                  ? {
                      ...item,
                      isRead: true,
                      updatedAt:
                        new Date().toISOString()
                    }
                  : item
              )
          );
        },

        error: () => {
          this.notificationError.set(
            'No fue posible marcar la notificación como leída.'
          );
        }
      });
  }

  markVisibleAsRead(
    event: MouseEvent
  ): void {
    event.stopPropagation();

    const unread =
      this.recentNotifications().filter(
        notification =>
          !notification.isRead
      );

    unread.forEach(notification => {
      this.notificationService
        .markAsRead(notification.id)
        .subscribe({
          next: () => {
            this.notifications.update(
              current =>
                current.map(item =>
                  item.id === notification.id
                    ? {
                        ...item,
                        isRead: true,
                        updatedAt:
                          new Date().toISOString()
                      }
                    : item
                )
            );
          }
        });
    });
  }

  notificationIcon(
    notification: Notification
  ): string {
    const content =
      `${notification.title} ${notification.message}`
        .toLowerCase();

    if (
      content.includes('soporte') ||
      content.includes('ticket')
    ) {
      return '🎧';
    }

    if (
      content.includes('pedido') ||
      content.includes('venta')
    ) {
      return '📦';
    }

    if (
      content.includes('stock') ||
      content.includes('inventario')
    ) {
      return '⚠️';
    }

    if (
      content.includes('actualización') ||
      content.includes('versión')
    ) {
      return '📢';
    }

    return '🔔';
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeNotifications();
  }

  private startNotificationPolling(): void {
    interval(60000)
      .pipe(
        startWith(0),
        switchMap(() => {
          this.loadingNotifications.set(true);
          this.notificationError.set('');

          return this.notificationService
            .getMine();
        }),
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({
        next: response => {
          this.notifications.set(
            response.data ?? []
          );

          this.loadingNotifications.set(
            false
          );
        },

        error: () => {
          this.loadingNotifications.set(
            false
          );

          this.notificationError.set(
            'No fue posible cargar las notificaciones.'
          );
        }
      });
  }
}



