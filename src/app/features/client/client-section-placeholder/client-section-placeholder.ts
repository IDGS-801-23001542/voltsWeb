import {
  Component,
  computed,
  inject
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  AuthService
} from '../../../core/services/auth.service';

interface ClientSectionData {
  icon?: string;
  title?: string;
  description?: string;
}

@Component({
  selector:
    'app-client-section-placeholder',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl:
    './client-section-placeholder.html',
  styleUrl:
    './client-section-placeholder.css'
})
export class ClientSectionPlaceholder {
  private readonly route =
    inject(ActivatedRoute);

  readonly auth =
    inject(AuthService);

  readonly sectionData =
    computed<ClientSectionData>(() => {
      return this.route.snapshot.data ??
        {};
    });

  readonly icon =
    computed(() =>
      this.sectionData().icon ??
      '🐾'
    );

  readonly title =
    computed(() =>
      this.sectionData().title ??
      'Mi cuenta'
    );

  readonly description =
    computed(() =>
      this.sectionData().description ??
      'Consulta la información de tu cuenta VOLTS.'
    );
}



