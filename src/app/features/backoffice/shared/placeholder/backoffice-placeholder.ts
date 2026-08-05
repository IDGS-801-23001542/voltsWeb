import {
  Component,
  inject
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-backoffice-placeholder',
  standalone: true,
  templateUrl: './backoffice-placeholder.html',
  styleUrl: './backoffice-placeholder.css'
})
export class BackofficePlaceholder {
  private readonly route = inject(ActivatedRoute);

  readonly title =
    this.route.snapshot.data['title'] ?? 'Módulo VOLTS';

  readonly description =
    this.route.snapshot.data['description'] ??
    'Este módulo será desarrollado próximamente.';
}



