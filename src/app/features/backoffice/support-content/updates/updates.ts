import {
  DatePipe
} from '@angular/common';

import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  toSignal
} from '@angular/core/rxjs-interop';

import {
  startWith
} from 'rxjs';

import {
  UpdateNews,
  UpdateNewsCreateRequest,
  UpdateNewsUpdateRequest,
  UpdatePlatform,
  UpdatePlatformFilter,
  UpdatePublicationFilter
} from '../../../../core/models/update-news.model';

import {
  AuthService
} from '../../../../core/services/auth.service';

import {
  UpdateNewsService
} from '../../../../core/services/update-news.service';

@Component({
  selector: 'app-updates',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule
  ],
  templateUrl: './updates.html',
  styleUrl: './updates.css'
})
export class Updates
  implements OnInit {

  private readonly updateService =
    inject(UpdateNewsService);

  readonly auth =
    inject(AuthService);

  readonly updates =
    signal<UpdateNews[]>([]);

  readonly selectedUpdate =
    signal<UpdateNews | null>(null);

  readonly editingUpdate =
    signal<UpdateNews | null>(null);

  readonly loading =
    signal(true);

  readonly saving =
    signal(false);

  readonly detailOpen =
    signal(false);

  readonly formOpen =
    signal(false);

  readonly errorMessage =
    signal('');

  readonly successMessage =
    signal('');

  readonly searchControl =
    new FormControl(
      '',
      {
        nonNullable: true
      }
    );

  readonly platformControl =
    new FormControl<UpdatePlatformFilter>(
      'all',
      {
        nonNullable: true
      }
    );

  readonly publicationControl =
    new FormControl<UpdatePublicationFilter>(
      'all',
      {
        nonNullable: true
      }
    );

  readonly form =
    new FormGroup({
      title:
        new FormControl(
          '',
          {
            nonNullable: true,
            validators: [
              Validators.required,
              Validators.minLength(4),
              Validators.maxLength(180)
            ]
          }
        ),

      content:
        new FormControl(
          '',
          {
            nonNullable: true,
            validators: [
              Validators.required,
              Validators.minLength(10),
              Validators.maxLength(5000)
            ]
          }
        ),

      version:
        new FormControl(
          '1.0.0',
          {
            nonNullable: true,
            validators: [
              Validators.required,
              Validators.maxLength(30)
            ]
          }
        ),

      platform:
        new FormControl<UpdatePlatform>(
          'Android',
          {
            nonNullable: true,
            validators: [
              Validators.required
            ]
          }
        ),

      isPublished:
        new FormControl(
          true,
          {
            nonNullable: true
          }
        )
    });

  readonly platforms:
    UpdatePlatform[] = [
      'Android',
      'Firmware',
      'Web',
      'General',
      'iOS'
    ];

  private readonly searchTerm =
    toSignal(
      this.searchControl
        .valueChanges
        .pipe(
          startWith(
            this.searchControl.value
          )
        ),
      {
        initialValue: ''
      }
    );

  private readonly platformFilter =
    toSignal(
      this.platformControl
        .valueChanges
        .pipe(
          startWith(
            this.platformControl.value
          )
        ),
      {
        initialValue: 'all'
      }
    );

  private readonly publicationFilter =
    toSignal(
      this.publicationControl
        .valueChanges
        .pipe(
          startWith(
            this.publicationControl.value
          )
        ),
      {
        initialValue: 'all'
      }
    );

  readonly filteredUpdates =
    computed(() => {
      const term =
        this.searchTerm()
          .trim()
          .toLowerCase();

      const platform =
        this.platformFilter();

      const publication =
        this.publicationFilter();

      return this.updates().filter(
        update => {
          const matchesSearch =
            !term ||
            update.title
              .toLowerCase()
              .includes(term) ||
            update.content
              .toLowerCase()
              .includes(term) ||
            update.version
              .toLowerCase()
              .includes(term);

          const matchesPlatform =
            platform === 'all' ||
            update.platform === platform;

          const matchesPublication =
            publication === 'all' ||
            (
              publication === 'published' &&
              update.isPublished
            ) ||
            (
              publication === 'draft' &&
              !update.isPublished
            );

          return (
            matchesSearch &&
            matchesPlatform &&
            matchesPublication
          );
        }
      );
    });

  readonly summary =
    computed(() => {
      const updates =
        this.updates();

      return {
        total:
          updates.length,

        published:
          updates.filter(
            update =>
              update.isPublished
          ).length,

        drafts:
          updates.filter(
            update =>
              !update.isPublished
          ).length,

        android:
          updates.filter(
            update =>
              update.platform === 'Android'
          ).length,

        firmware:
          updates.filter(
            update =>
              update.platform === 'Firmware'
          ).length
      };
    });

  ngOnInit(): void {
    this.loadUpdates();
  }

  loadUpdates(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.updateService
      .getAll()
      .subscribe({
        next: response => {
          this.updates.set(
            response.data ?? []
          );

          this.loading.set(false);
        },

        error: error => {
          this.loading.set(false);

          this.errorMessage.set(
            this.resolveError(
              error,
              'No fue posible cargar las actualizaciones.'
            )
          );
        }
      });
  }

  openDetails(
    update: UpdateNews
  ): void {
    this.selectedUpdate.set(
      update
    );

    this.detailOpen.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    document.body.classList.add(
      'modal-open'
    );
  }

  closeDetails(): void {
    this.selectedUpdate.set(null);
    this.detailOpen.set(false);

    document.body.classList.remove(
      'modal-open'
    );
  }

  openCreateForm(): void {
    if (!this.auth.hasRole('Admin')) {
      return;
    }

    this.editingUpdate.set(null);

    this.form.reset({
      title: '',
      content: '',
      version: '1.0.0',
      platform: 'Android',
      isPublished: true
    });

    this.formOpen.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    document.body.classList.add(
      'modal-open'
    );
  }

  openEditForm(
    update: UpdateNews
  ): void {
    if (!this.auth.hasRole('Admin')) {
      return;
    }

    this.closeDetails();

    this.editingUpdate.set(
      update
    );

    this.form.reset({
      title:
        update.title,

      content:
        update.content,

      version:
        update.version,

      platform:
        update.platform,

      isPublished:
        update.isPublished
    });

    this.formOpen.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    document.body.classList.add(
      'modal-open'
    );
  }

  closeForm(): void {
    if (this.saving()) {
      return;
    }

    this.formOpen.set(false);
    this.editingUpdate.set(null);

    document.body.classList.remove(
      'modal-open'
    );
  }

  saveUpdate(): void {
    if (
      !this.auth.hasRole('Admin') ||
      this.form.invalid ||
      this.saving()
    ) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const value =
      this.form.getRawValue();

    const editing =
      this.editingUpdate();

    const request =
      editing
        ? this.updateService.update(
            editing.id,
            {
              title:
                value.title.trim(),

              content:
                value.content.trim(),

              version:
                value.version.trim(),

              platform:
                value.platform,

              isPublished:
                value.isPublished
            } satisfies
              UpdateNewsUpdateRequest
          )
        : this.updateService.create(
            {
              title:
                value.title.trim(),

              content:
                value.content.trim(),

              version:
                value.version.trim(),

              platform:
                value.platform,

              isPublished:
                value.isPublished
            } satisfies
              UpdateNewsCreateRequest
          );

    request.subscribe({
      next: response => {
        if (response.data) {
          this.upsertUpdate(
            response.data
          );
        }

        this.saving.set(false);
        this.closeForm();
      },

      error: error => {
        this.saving.set(false);

        this.errorMessage.set(
          this.resolveError(
            error,
            'No fue posible guardar la actualización.'
          )
        );
      }
    });
  }

  togglePublication(
    update: UpdateNews
  ): void {
    if (
      !this.auth.hasRole('Admin') ||
      this.saving()
    ) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const request:
      UpdateNewsUpdateRequest = {
        title:
          update.title,

        content:
          update.content,

        version:
          update.version,

        platform:
          update.platform,

        isPublished:
          !update.isPublished
      };

    this.updateService
      .update(
        update.id,
        request
      )
      .subscribe({
        next: response => {
          if (response.data) {
            this.upsertUpdate(
              response.data
            );

            if (
              this.selectedUpdate()?.id ===
              response.data.id
            ) {
              this.selectedUpdate.set(
                response.data
              );
            }
          }

          this.successMessage.set(
            update.isPublished
              ? 'La actualización se guardó como borrador.'
              : 'La actualización fue publicada.'
          );

          this.saving.set(false);
        },

        error: error => {
          this.saving.set(false);

          this.errorMessage.set(
            this.resolveError(
              error,
              'No fue posible cambiar la publicación.'
            )
          );
        }
      });
  }

  deleteUpdate(
    update: UpdateNews
  ): void {
    if (
      !this.auth.hasRole('Admin') ||
      this.saving()
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `¿Seguro que deseas eliminar "${update.title}"?`
      );

    if (!confirmed) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    this.updateService
      .delete(update.id)
      .subscribe({
        next: () => {
          this.updates.update(
            current =>
              current.filter(
                item =>
                  item.id !==
                  update.id
              )
          );

          this.saving.set(false);
          this.closeDetails();
        },

        error: error => {
          this.saving.set(false);

          this.errorMessage.set(
            this.resolveError(
              error,
              'No fue posible eliminar la actualización.'
            )
          );
        }
      });
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.platformControl.setValue(
      'all'
    );
    this.publicationControl.setValue(
      'all'
    );
  }

  platformLabel(
    platform: UpdatePlatform
  ): string {
    const labels:
      Record<UpdatePlatform, string> = {
        Android:
          'Android',

        Firmware:
          'Firmware',

        Web:
          'Plataforma web',

        General:
          'General',

        iOS:
          'iOS'
      };

    return labels[platform];
  }

  platformIcon(
    platform: UpdatePlatform
  ): string {
    const icons:
      Record<UpdatePlatform, string> = {
        Android: '📱',
        Firmware: '⚙️',
        Web: '🌐',
        General: '📢',
        iOS: '🍎'
      };

    return icons[platform];
  }

  private upsertUpdate(
    saved: UpdateNews
  ): void {
    this.updates.update(
      current => {
        const exists =
          current.some(
            update =>
              update.id === saved.id
          );

        if (exists) {
          return current.map(
            update =>
              update.id === saved.id
                ? saved
                : update
          );
        }

        return [
          saved,
          ...current
        ];
      }
    );
  }

  private resolveError(
    error: any,
    fallback: string
  ): string {
    if (
      Array.isArray(
        error?.error?.errors
      ) &&
      error.error.errors.length > 0
    ) {
      return error.error.errors.join(
        ' '
      );
    }

    return (
      error?.error?.message ??
      fallback
    );
  }
}
