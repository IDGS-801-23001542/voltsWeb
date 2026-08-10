import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  Documentation
} from '../../../core/models/documentation.model';

import {
  DocumentationService
} from '../../../core/services/documentation.service';

@Component({
  selector:
    'app-institution-resources',

  standalone:
    true,

  templateUrl:
    './resources.html',

  styleUrl:
    './resources.css'
})
export class InstitutionResources
  implements OnInit {

  private readonly service =
    inject(DocumentationService);

  readonly documents =
    signal<Documentation[]>([]);

  readonly loading =
    signal(true);

  readonly message =
    signal('');

  readonly error =
    signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {

    this.loading.set(true);

    this.error.set('');

    this.service
      .getMyResources()
      .subscribe({

        next: response => {

          this.documents.set(
            response.data ?? []
          );

          this.message.set(
            response.message ?? ''
          );

          this.loading.set(false);
        },

        error: error => {

          this.documents.set([]);

          this.loading.set(false);

          this.error.set(
            error?.error?.message ??
            'No fue posible cargar los recursos institucionales.'
          );
        }
      });
  }

  resourceUrl(
    fileUrl: string
  ): string {

    return this.service
      .resolveResourceUrl(
        fileUrl
      );
  }

  iconClass(
    type: Documentation['documentType']
  ): string {

    const icons:
      Record<
        Documentation['documentType'],
        string
      > = {

        Manual:
          'bi bi-book',

        QuickGuide:
          'bi bi-file-earmark-text',

        Firmware:
          'bi bi-cpu',

        Video:
          'bi bi-play-btn',

        AndroidApp:
          'bi bi-phone',

        EducationalResource:
          'bi bi-mortarboard',

        Warranty:
          'bi bi-shield-check',

        Other:
          'bi bi-paperclip'
      };

    return icons[type] ??
      'bi bi-file-earmark';
  }

  typeLabel(
    type: Documentation['documentType']
  ): string {

    const labels:
      Record<
        Documentation['documentType'],
        string
      > = {

        Manual:
          'Manual',

        QuickGuide:
          'Guía rápida',

        Firmware:
          'Firmware',

        Video:
          'Video',

        AndroidApp:
          'Aplicación Android',

        EducationalResource:
          'Recurso educativo',

        Warranty:
          'Garantía',

        Other:
          'Otro'
      };

    return labels[type] ??
      'Documento';
  }
}
