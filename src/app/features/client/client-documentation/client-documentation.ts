import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  Documentation
} from '../../../core/models/documentation.model';

import {
  DocumentationService
} from '../../../core/services/documentation.service';

@Component({
  selector:
    'app-client-documentation',

  standalone:
    true,

  imports: [
    RouterLink
  ],

  templateUrl:
    './client-documentation.html',

  styleUrl:
    './client-documentation.css'
})
export class ClientDocumentation
  implements OnInit {

  private readonly documentationService =
    inject(DocumentationService);

  readonly documents =
    signal<Documentation[]>([]);

  readonly loading =
    signal(true);

  readonly message =
    signal('');

  readonly errorMessage =
    signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.documentationService
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

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible cargar tus recursos VOLTS.'
          );
        }
      });
  }

  resourceUrl(
    fileUrl: string
  ): string {

    return this.documentationService
      .resolveResourceUrl(
        fileUrl
      );
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

  actionLabel(
    type: Documentation['documentType']
  ): string {

    if (
      type === 'AndroidApp' ||
      type === 'Firmware'
    ) {
      return 'Descargar';
    }

    return 'Ver documento';
  }
}
