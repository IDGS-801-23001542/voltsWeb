import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'volts_theme';

  readonly isNight = signal(
    localStorage.getItem(this.storageKey) === 'night'
  );

  constructor(
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isNight.update(current => !current);
    this.applyTheme();
  }

  private applyTheme(): void {
    const night = this.isNight();

    this.document.body.classList.toggle('night-mode', night);

    localStorage.setItem(
      this.storageKey,
      night ? 'night' : 'light'
    );
  }
}
