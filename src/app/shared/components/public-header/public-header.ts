import {
  Component,
  HostListener,
  signal
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  AuthService
} from '../../../core/services/auth.service';

import {
  ThemeService
} from '../../../core/services/theme.service';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './public-header.html',
  styleUrl: './public-header.css'
})
export class PublicHeader {
  readonly menuOpen = signal(false);
  readonly accountMenuOpen = signal(false);
  readonly headerHidden = signal(false);
  readonly headerScrolled = signal(false);

  readonly navItems = [
    {
      path: '/',
      label: 'Inicio',
      exact: true
    },
    {
      path: '/aprendizaje',
      label: 'Aprendizaje',
      exact: false
    },
    {
      path: '/cotizacion',
      label: 'Cotización',
      exact: false
    },
    {
      path: '/faq',
      label: 'FAQ',
      exact: false
    },
    {
      path: '/contacto',
      label: 'Contacto',
      exact: false
    }
  ];

  readonly clientMenuItems = [
    {
      path: '/cliente',
      icon: '🏠',
      label: 'Resumen',
      exact: true
    },
    {
      path: '/cliente/compras',
      icon: '🛒',
      label: 'Mis compras',
      exact: false
    },
    {
      path: '/cliente/productos',
      icon: '📦',
      label: 'Mis productos',
      exact: false
    },
    {
      path: '/cliente/cotizaciones',
      icon: '📝',
      label: 'Mis cotizaciones',
      exact: false
    },
    {
      path: '/cliente/comentarios',
      icon: '💬',
      label: 'Mis comentarios',
      exact: false
    },
    {
      path: '/cliente/licencias',
      icon: '🔑',
      label: 'Licencias',
      exact: false
    },
    {
      path: '/cliente/documentacion',
      icon: '📚',
      label: 'Documentación',
      exact: false
    },
    { path: '/cliente/soporte', icon: '🎧', label: 'Soporte', exact: false },
    { path: '/cliente/notificaciones', icon: '🔔', label: 'Notificaciones', exact: false },
    {
      path: '/cliente/perfil',
      icon: '⚙️',
      label: 'Mi perfil',
      exact: false
    }
  ];

  readonly institutionMenuItems = [
    { path: '/institucion', icon: '🏠', label: 'Resumen', exact: true },
    { path: '/institucion/pedidos', icon: '🛒', label: 'Pedidos', exact: false },
    { path: '/institucion/licencias', icon: '🔑', label: 'Licencias', exact: false },
    { path: '/institucion/dispositivos', icon: '🤖', label: 'Dispositivos', exact: false },
    { path: '/institucion/personas', icon: '👥', label: 'Personas', exact: false },
    { path: '/institucion/recursos', icon: '📚', label: 'Recursos', exact: false },
    { path: '/institucion/soporte', icon: '🎧', label: 'Soporte', exact: false },
    { path: '/institucion/notificaciones', icon: '🔔', label: 'Notificaciones', exact: false }
  ];

  get accountMenuItems() {
    return this.auth.hasRole('Institution') ? this.institutionMenuItems : this.clientMenuItems;
  }

  private touchStartY = 0;
  private accumulatedDirection = 0;

  constructor(
    public readonly theme: ThemeService,
    public readonly auth: AuthService
  ) {}

  get customerDisplayName(): string {
    const user = this.auth.currentUser();

    if (!user) {
      return 'Mi cuenta';
    }

    const firstName =
      user.firstNames
        ?.trim()
        .split(/\s+/)[0];

    return firstName ||
      user.fullName ||
      'Mi cuenta';
  }

  @HostListener(
    'document:click',
    ['$event']
  )
  onDocumentClick(
    event: MouseEvent
  ): void {
    const target =
      event.target as HTMLElement | null;

    if (
      target?.closest(
        '.account-menu'
      )
    ) {
      return;
    }

    this.closeAccountMenu();
  }

  /*
   * Detecta directamente la dirección de la rueda.
   */
  @HostListener(
    'window:wheel',
    ['$event']
  )
  onWheel(
    event: WheelEvent
  ): void {
    if (
      this.menuOpen() ||
      this.accountMenuOpen()
    ) {
      this.showHeader();
      return;
    }

    if (
      Math.sign(event.deltaY) !==
      Math.sign(
        this.accumulatedDirection
      )
    ) {
      this.accumulatedDirection = 0;
    }

    this.accumulatedDirection +=
      event.deltaY;

    if (
      this.accumulatedDirection > 18
    ) {
      this.hideHeader();
      this.accumulatedDirection = 0;
    }

    if (
      this.accumulatedDirection < -8
    ) {
      this.showHeader();
      this.accumulatedDirection = 0;
    }

    this.headerScrolled.set(true);
  }

  @HostListener(
    'window:touchstart',
    ['$event']
  )
  onTouchStart(
    event: TouchEvent
  ): void {
    this.touchStartY =
      event.touches[0]?.clientY ?? 0;
  }

  @HostListener(
    'window:touchmove',
    ['$event']
  )
  onTouchMove(
    event: TouchEvent
  ): void {
    if (
      this.menuOpen() ||
      this.accountMenuOpen()
    ) {
      this.showHeader();
      return;
    }

    const currentTouchY =
      event.touches[0]?.clientY ??
      this.touchStartY;

    const difference =
      currentTouchY -
      this.touchStartY;

    if (difference < -12) {
      this.hideHeader();
      this.touchStartY =
        currentTouchY;
    }

    if (difference > 7) {
      this.showHeader();
      this.touchStartY =
        currentTouchY;
    }

    this.headerScrolled.set(true);
  }

  @HostListener(
    'window:keydown',
    ['$event']
  )
  onKeyDown(
    event: KeyboardEvent
  ): void {
    if (event.key === 'Escape') {
      this.closeAccountMenu();
      this.closeMenu();
      return;
    }

    if (
      event.key === 'ArrowUp' ||
      event.key === 'PageUp' ||
      event.key === 'Home'
    ) {
      this.showHeader();
    }

    if (
      event.key === 'ArrowDown' ||
      event.key === 'PageDown' ||
      event.key === 'End'
    ) {
      this.hideHeader();
    }
  }

  @HostListener(
    'document:mousemove',
    ['$event']
  )
  onMouseMove(
    event: MouseEvent
  ): void {
    if (event.clientY <= 18) {
      this.showHeader();
    }
  }

  private hideHeader(): void {
    if (
      this.menuOpen() ||
      this.accountMenuOpen()
    ) {
      return;
    }

    this.headerHidden.set(true);
  }

  private showHeader(): void {
    this.headerHidden.set(false);
  }

  toggleMenu(): void {
    this.accountMenuOpen.set(false);

    this.menuOpen.update(
      value => !value
    );

    if (this.menuOpen()) {
      this.showHeader();
    }
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleAccountMenu(
    event?: MouseEvent
  ): void {
    event?.stopPropagation();

    this.menuOpen.set(false);

    this.accountMenuOpen.update(
      value => !value
    );

    this.showHeader();
  }

  closeAccountMenu(): void {
    this.accountMenuOpen.set(false);
  }

  closeAllMenus(): void {
    this.closeMenu();
    this.closeAccountMenu();
  }

  logout(): void {
    this.closeAllMenus();
    this.auth.logout();
  }
}


