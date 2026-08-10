import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  Output,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  filter
} from 'rxjs';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  BACKOFFICE_MENU
} from '../../../core/config/backoffice-menu.config';

import {
  AuthService
} from '../../../core/services/auth.service';

@Component({
  selector: 'app-backoffice-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './backoffice-sidebar.html',
  styleUrl: './backoffice-sidebar.css'
})
export class BackofficeSidebar {
  @Input() open = false;

  @Output()
  closeSidebar = new EventEmitter<void>();

  private readonly router = inject(Router);

  private readonly destroyRef =
    inject(DestroyRef);

  readonly auth = inject(AuthService);

  readonly expandedGroups =
    signal<Record<string, boolean>>({
      'Administración': false,
      Principal: true,
      Comercial: false,
      'Producción e inventario': false,
      'Atención y contenido': false
    });

  readonly menuGroups = computed(() => {
    const role = this.auth.currentUser()?.roleName;

    if (!role) {
      return [];
    }

    return BACKOFFICE_MENU
      .map(group => ({
        ...group,
        items: group.items.filter(item =>
          item.permission
            ? this.auth.hasPermission(item.permission)
            : item.roles.includes(role)
        )
      }))
      .filter(group =>
        group.items.length > 0
      );
  });

  constructor() {
    this.openCurrentRouteGroup();

    this.router.events
      .pipe(
        filter(
          event =>
            event instanceof NavigationEnd
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.openCurrentRouteGroup();
      });
  }

  isPrincipal(
    groupTitle: string
  ): boolean {
    return groupTitle === 'Principal';
  }

  isExpanded(
    groupTitle: string
  ): boolean {
    if (this.isPrincipal(groupTitle)) {
      return true;
    }

    return Boolean(
      this.expandedGroups()[groupTitle]
    );
  }

  toggleGroup(
    groupTitle: string
  ): void {
    if (this.isPrincipal(groupTitle)) {
      return;
    }

    this.expandedGroups.update(groups => ({
      ...groups,
      [groupTitle]:
        !groups[groupTitle]
    }));
  }

  close(): void {
    this.closeSidebar.emit();
  }

  closeAfterNavigation(): void {
    if (window.innerWidth <= 950) {
      this.close();
    }
  }

  private openCurrentRouteGroup(): void {
    const currentUrl =
      this.router.url.split('?')[0];

    const activeGroup =
      this.menuGroups().find(group =>
        group.items.some(item => {
          if (item.exact) {
            return currentUrl === item.route;
          }

          return currentUrl.startsWith(
            item.route
          );
        })
      );

    if (
      !activeGroup ||
      this.isPrincipal(activeGroup.title)
    ) {
      return;
    }

    this.expandedGroups.update(groups => ({
      ...groups,
      [activeGroup.title]: true
    }));
  }
}
