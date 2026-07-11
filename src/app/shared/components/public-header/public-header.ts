import {
  Component,
  HostListener,
  signal
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { ThemeService } from '../../../core/services/theme.service';

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

  private touchStartY = 0;
  private accumulatedDirection = 0;

  constructor(
    public readonly theme: ThemeService
  ) {}

  /*
   * Detecta directamente la dirección de la rueda.
   * Ya no depende de window.scrollY.
   */
  @HostListener('window:wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    if (this.menuOpen()) {
      this.showHeader();
      return;
    }

    /*
     * Acumulamos movimiento para evitar que un pequeño
     * movimiento accidental o del trackpad cambie el header.
     */
    if (
      Math.sign(event.deltaY) !==
      Math.sign(this.accumulatedDirection)
    ) {
      this.accumulatedDirection = 0;
    }

    this.accumulatedDirection += event.deltaY;

    /*
     * Usuario desplazándose hacia abajo.
     */
    if (this.accumulatedDirection > 18) {
      this.hideHeader();
      this.accumulatedDirection = 0;
    }

    /*
     * Usuario desplazándose hacia arriba.
     */
    if (this.accumulatedDirection < -8) {
      this.showHeader();
      this.accumulatedDirection = 0;
    }

    this.headerScrolled.set(true);
  }

  /*
   * Inicio del gesto táctil en celular.
   */
  @HostListener('window:touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.touchStartY =
      event.touches[0]?.clientY ?? 0;
  }

  /*
   * Detecta hacia dónde mueve el dedo.
   *
   * El dedo sube:
   * la página baja y el header se oculta.
   *
   * El dedo baja:
   * la página sube y el header aparece.
   */
  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (this.menuOpen()) {
      this.showHeader();
      return;
    }

    const currentTouchY =
      event.touches[0]?.clientY ?? this.touchStartY;

    const difference =
      currentTouchY - this.touchStartY;

    if (difference < -12) {
      this.hideHeader();
      this.touchStartY = currentTouchY;
    }

    if (difference > 7) {
      this.showHeader();
      this.touchStartY = currentTouchY;
    }

    this.headerScrolled.set(true);
  }

  /*
   * También responde cuando el usuario navega
   * con el teclado.
   */
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
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

  /*
   * Al mover el mouse hasta la zona superior
   * también mostramos el header.
   */
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (event.clientY <= 18) {
      this.showHeader();
    }
  }

  private hideHeader(): void {
    if (this.menuOpen()) {
      return;
    }

    this.headerHidden.set(true);
  }

  private showHeader(): void {
    this.headerHidden.set(false);
  }

  toggleMenu(): void {
    this.menuOpen.update(value => !value);

    if (this.menuOpen()) {
      this.showHeader();
    }
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
