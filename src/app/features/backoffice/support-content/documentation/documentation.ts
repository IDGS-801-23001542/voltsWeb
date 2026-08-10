
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
  Documentation,
  DocumentationCreateRequest,
  DocumentationStatusFilter,
  DocumentationType,
  DocumentationTypeFilter,
  DocumentationUpdateRequest,
  DocumentationVisibilityFilter
} from '../../../../core/models/documentation.model';

import {
  AuthService
} from '../../../../core/services/auth.service';

import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';

import {
  DocumentationService
} from '../../../../core/services/documentation.service';

@Component({
  selector: 'app-documentation',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule
  ],
  templateUrl: './documentation.html',
  styleUrl: './documentation.css'
})
export class DocumentationManagement
  implements OnInit {

  private readonly documentationService =
    inject(DocumentationService);

  private readonly productService = inject(ProductService);

  readonly products = signal<Product[]>([]);

  readonly auth =
    inject(AuthService);

  readonly documents =
    signal<Documentation[]>([]);

  readonly selectedDocument =
    signal<Documentation | null>(null);

  readonly editingDocument =
    signal<Documentation | null>(null);

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

  readonly typeControl =
    new FormControl<DocumentationTypeFilter>(
      'all',
      {
        nonNullable: true
      }
    );

  readonly visibilityControl =
    new FormControl<DocumentationVisibilityFilter>(
      'all',
      {
        nonNullable: true
      }
    );

  readonly statusControl =
    new FormControl<DocumentationStatusFilter>(
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
              Validators.minLength(3),
              Validators.maxLength(180)
            ]
          }
        ),

      documentType:
        new FormControl<DocumentationType>(
          'Manual',
          {
            nonNullable: true,
            validators: [
              Validators.required
            ]
          }
        ),

      description:
        new FormControl(
          '',
          {
            nonNullable: true,
            validators: [
              Validators.required,
              Validators.minLength(10),
              Validators.maxLength(1500)
            ]
          }
        ),

      fileUrl:
        new FormControl(
          '',
          {
            nonNullable: true,
            validators: [
              Validators.required,
              Validators.pattern(
                /^https?:\/\/.+/i
              )
            ]
          }
        ),

      version:
        new FormControl(
          '1.0',
          {
            nonNullable: true,
            validators: [
              Validators.required,
              Validators.maxLength(30)
            ]
          }
        ),

      productIds:
        new FormControl<string[]>([], { nonNullable: true }),

      isPublic:
        new FormControl(
          false,
          {
            nonNullable: true
          }
        ),

      isActive:
        new FormControl(
          true,
          {
            nonNullable: true
          }
        )
    });

  private readonly searchTerm =
    toSignal(
      this.searchControl.valueChanges.pipe(
        startWith(
          this.searchControl.value
        )
      ),
      {
        initialValue: ''
      }
    );

  private readonly typeFilter =
    toSignal(
      this.typeControl.valueChanges.pipe(
        startWith(
          this.typeControl.value
        )
      ),
      {
        initialValue: 'all'
      }
    );

  private readonly visibilityFilter =
    toSignal(
      this.visibilityControl.valueChanges.pipe(
        startWith(
          this.visibilityControl.value
        )
      ),
      {
        initialValue: 'all'
      }
    );

  private readonly statusFilter =
    toSignal(
      this.statusControl.valueChanges.pipe(
        startWith(
          this.statusControl.value
        )
      ),
      {
        initialValue: 'all'
      }
    );

  readonly filteredDocuments =
    computed(() => {
      const term =
        this.searchTerm()
          .trim()
          .toLowerCase();

      const type =
        this.typeFilter();

      const visibility =
        this.visibilityFilter();

      const status =
        this.statusFilter();

      return this.documents().filter(
        document => {
          const matchesSearch =
            !term ||
            document.title
              .toLowerCase()
              .includes(term) ||
            document.description
              .toLowerCase()
              .includes(term) ||
            document.version
              .toLowerCase()
              .includes(term) ||
            document.fileUrl
              .toLowerCase()
              .includes(term);

          const matchesType =
            type === 'all' ||
            document.documentType === type;

          const matchesVisibility =
            visibility === 'all' ||
            (
              visibility === 'public' &&
              document.isPublic
            ) ||
            (
              visibility === 'private' &&
              !document.isPublic
            );

          const matchesStatus =
            status === 'all' ||
            (
              status === 'active' &&
              document.isActive
            ) ||
            (
              status === 'inactive' &&
              !document.isActive
            );

          return (
            matchesSearch &&
            matchesType &&
            matchesVisibility &&
            matchesStatus
          );
        }
      );
    });

  readonly summary =
    computed(() => {
      const documents =
        this.documents();

      return {
        total:
          documents.length,

        public:
          documents.filter(
            document =>
              document.isPublic
          ).length,

        private:
          documents.filter(
            document =>
              !document.isPublic
          ).length,

        active:
          documents.filter(
            document =>
              document.isActive
          ).length
      };
    });

  readonly documentTypes:
    DocumentationType[] = [
      'Manual',
      'QuickGuide',
      'Firmware',
      'Video',
      'AndroidApp',
      'EducationalResource',
      'Warranty',
      'Other'
    ];

  ngOnInit(): void {
    this.loadDocuments();
    this.productService.getAll().subscribe({
      next: response => this.products.set((response.data ?? []).filter(product => !product.isDeleted)),
      error: () => this.products.set([])
    });
  }

  loadDocuments(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.documentationService
      .getAll()
      .subscribe({
        next: response => {
          this.documents.set(
            response.data ?? []
          );

          this.loading.set(false);
        },

        error: error => {
          this.loading.set(false);

          this.errorMessage.set(
            this.resolveError(
              error,
              'No fue posible cargar la documentación.'
            )
          );
        }
      });
  }

openDetails(
  documentItem: Documentation
): void {
  this.selectedDocument.set(
    documentItem
  );

  this.detailOpen.set(true);
  this.errorMessage.set('');
  this.successMessage.set('');

  window.document.body.classList.add(
    'modal-open'
  );
}
  closeDetails(): void {
    this.selectedDocument.set(null);
    this.detailOpen.set(false);

    document.body.classList.remove(
      'modal-open'
    );
  }

  openCreateForm(): void {
    if (!this.auth.hasRole('Admin')) {
      return;
    }

    this.editingDocument.set(null);

    this.form.reset({
      title: '',
      documentType: 'Manual',
      description: '',
      fileUrl: '',
      version: '1.0',
      productIds: [],
      isPublic: false,
      isActive: true
    });

    this.formOpen.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    document.body.classList.add(
      'modal-open'
    );
  }

  openEditForm(
    documentItem: Documentation
  ): void {
    if (!this.auth.hasRole('Admin')) {
      return;
    }

    this.closeDetails();

    this.editingDocument.set(
      documentItem
    );

    this.form.reset({
      title:
        documentItem.title,

      documentType:
        documentItem.documentType,

      description:
        documentItem.description,

      fileUrl:
        documentItem.fileUrl,

      version:
        documentItem.version,

      productIds:
        documentItem.productIds ?? [],

      isPublic:
        documentItem.isPublic,

      isActive:
        documentItem.isActive
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
    this.editingDocument.set(null);

    document.body.classList.remove(
      'modal-open'
    );
  }

  saveDocument(): void {
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
      this.editingDocument();

    const request =
      editing
        ? this.documentationService.update(
            editing.id,
            {
              title:
                value.title.trim(),

              documentType:
                value.documentType,

              description:
                value.description.trim(),

              fileUrl:
                value.fileUrl.trim(),

              version:
                value.version.trim(),

              productIds:
                value.productIds,

              isPublic:
                value.isPublic,

              isActive:
                value.isActive
            } satisfies
              DocumentationUpdateRequest
          )
        : this.documentationService.create(
            {
              title:
                value.title.trim(),

              documentType:
                value.documentType,

              description:
                value.description.trim(),

              fileUrl:
                value.fileUrl.trim(),

              version:
                value.version.trim(),

              productIds:
                value.productIds,

              isPublic:
                value.isPublic
            } satisfies
              DocumentationCreateRequest
          );

    request.subscribe({
      next: response => {
        const saved =
          response.data;

        if (saved) {
          this.upsertDocument(
            saved
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
            'No fue posible guardar el documento.'
          )
        );
      }
    });
  }

  toggleVisibility(
    documentItem: Documentation
  ): void {
    this.updateDocumentFlags(
      documentItem,
      !documentItem.isPublic,
      documentItem.isActive
    );
  }

  toggleStatus(
    documentItem: Documentation
  ): void {
    this.updateDocumentFlags(
      documentItem,
      documentItem.isPublic,
      !documentItem.isActive
    );
  }

  deleteDocument(
    documentItem: Documentation
  ): void {
    if (
      !this.auth.hasRole('Admin') ||
      this.saving()
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `¿Seguro que deseas eliminar "${documentItem.title}"?`
      );

    if (!confirmed) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    this.documentationService
      .delete(documentItem.id)
      .subscribe({
        next: () => {
          this.documents.update(
            current =>
              current.filter(
                item =>
                  item.id !==
                  documentItem.id
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
              'No fue posible eliminar el documento.'
            )
          );
        }
      });
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.typeControl.setValue('all');
    this.visibilityControl.setValue(
      'all'
    );
    this.statusControl.setValue('all');
  }

  typeLabel(
    type: DocumentationType
  ): string {
    const labels:
      Record<DocumentationType, string> = {
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

    return labels[type];
  }

  typeIcon(
    type: DocumentationType
  ): string {
    const icons:
      Record<DocumentationType, string> = {
        Manual: '📘',
        QuickGuide: '📄',
        Firmware: '⚙️',
        Video: '🎬',
        AndroidApp: '📱',
        EducationalResource: '🎓',
        Warranty: '🛡️',
        Other: '📎'
      };

    return icons[type];
  }

  private updateDocumentFlags(
    documentItem: Documentation,
    isPublic: boolean,
    isActive: boolean
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
      DocumentationUpdateRequest = {
        title:
          documentItem.title,

        documentType:
          documentItem.documentType,

        description:
          documentItem.description,

        fileUrl:
          documentItem.fileUrl,

        version:
          documentItem.version,

        productIds:
          documentItem.productIds ?? [],

        isPublic,
        isActive
      };

    this.documentationService
      .update(
        documentItem.id,
        request
      )
      .subscribe({
        next: response => {
          if (response.data) {
            this.upsertDocument(
              response.data
            );

            if (
              this.selectedDocument()?.id ===
              response.data.id
            ) {
              this.selectedDocument.set(
                response.data
              );
            }
          }

          this.saving.set(false);
        },

        error: error => {
          this.saving.set(false);

          this.errorMessage.set(
            this.resolveError(
              error,
              'No fue posible actualizar el documento.'
            )
          );
        }
      });
  }

  private upsertDocument(
    saved: Documentation
  ): void {
    this.documents.update(
      current => {
        const exists =
          current.some(
            document =>
              document.id === saved.id
          );

        if (exists) {
          return current.map(
            document =>
              document.id === saved.id
                ? saved
                : document
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
