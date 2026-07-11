import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicHeader } from '../../shared/components/public-header/public-header';
import { PublicFooter } from '../../shared/components/public-footer/public-footer';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, PublicHeader, PublicFooter],
  template: `
    <app-public-header />
    <main>
      <router-outlet />
    </main>
    <app-public-footer />
  `
})
export class PublicLayout {}
