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
  Documentation,
  DocumentationCreateRequest,
  DocumentationStatusFilter,
  DocumentationType,
  DocumentationTypeFilter,
  DocumentationUpdateRequest,
  DocumentationVisibilityFilter
} from '../../../../core/models/documentation.model';

import {
  Product
} from '../../../../core/models/product.model';

import {
  DocumentationService
} from '../../../../core/services/documentation.service';

import {
  ProductService
} from '../../../../core/services/product.service';

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

  private readonly service =
    inject(DocumentationService);

  private readonly productService =
    inject(ProductService);

  readonly documents =
    signal<Documentation[]>([]);

  readonly products =
    signal<Product[]>([]);

  readonly loading =
    signal(true);

  readonly saving =
    signal(false);

  readonly deletingId =
    signal<string | null>(null);

  readonly errorMessage =
    signal('');

  readonly successMessage =
    signal('');

  readonly showForm =
    signal(false);

  readonly editingDocument =
    signal<Documentation | null>(null);

  readonly detailDocument =
    signal<Documentation | null>(null);

  readonly search =
    signal('');

  readonly typeFilter =
    signal<DocumentationTypeFilter>('all');

  readonly visibilityFilter =
    signal<DocumentationVisibilityFilter>('all');

  readonly statusFilter =
    signal<DocumentationStatusFilter>('all');

  readonly totalDocuments =
    computed(
      () => this.documents().length
    );

  readonly publicDocuments =
    computed(
      () =>
        this.documents()
          .filter(item => item.isPublic)
          .length
    );

  readonly privateDocuments =
    computed(
      () =>
        this.documents()
          .filter(item => !item.isPublic)
          .length
    );

  readonly activeDocuments =
    computed(
      () =>
        this.documents()
          .filter(item => item.isActive)
          .length
    );

  readonly filteredDocuments =
    computed(() => {

      const search =
        this.search()
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
            !search ||
            document.title
              .toLowerCase()
              .includes(search) ||
            document.description
              .toLowerCase()
              .includes(search) ||
            document.version
              .toLowerCase()
              .includes(search) ||
            document.fileUrl
              .toLowerCase()
              .includes(search);

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

      fileUrl:
        new FormControl(
          '/documents/manual-volts.pdf',
          {
            nonNullable: true,
            validators: [
              Validators.required,
              Validators.pattern(
                /^(\/documents\/[^\s]+|https?:\/\/.+)$/i
              )
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

      productIds:
        new FormControl<string[]>(
          [],
          {
            nonNullable: true
          }
        ),

      isPublic:
        new FormControl(
          true,
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

  ngOnInit(): void {
    this.load();
    this.loadProducts();
  }

  load(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.service
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
            error?.error?.message ??
            'No fue posible cargar la documentación.'
          );
        }
      });
  }

  loadProducts(): void {

    this.productService
      .getAll()
      .subscribe({

        next: response => {

          this.products.set(
            response.data ?? []
          );
        },

        error: () => {

          this.products.set([]);
        }
      });
  }

  setSearch(
    value: string
  ): void {

    this.search.set(value);
  }

  setTypeFilter(
    value: string
  ): void {

    this.typeFilter.set(
      value as DocumentationTypeFilter
    );
  }

  setVisibilityFilter(
    value: string
  ): void {

    this.visibilityFilter.set(
      value as DocumentationVisibilityFilter
    );
  }

  setStatusFilter(
    value: string
  ): void {

    this.statusFilter.set(
      value as DocumentationStatusFilter
    );
  }

  clearFilters(): void {

    this.search.set('');
    this.typeFilter.set('all');
    this.visibilityFilter.set('all');
    this.statusFilter.set('all');
  }

  openCreate(): void {

    this.editingDocument.set(null);

    this.form.reset({
      title: '',
      documentType: 'Manual',
      version: '1.0',
      fileUrl:
        '/documents/manual-volts.pdf',
      description: '',
      productIds: [],
      isPublic: true,
      isActive: true
    });

    this.errorMessage.set('');
    this.successMessage.set('');

    this.showForm.set(true);
  }

  openEdit(
    document: Documentation
  ): void {

    this.editingDocument.set(
      document
    );

    this.form.reset({
      title:
        document.title,

      documentType:
        document.documentType,

      version:
        document.version,

      fileUrl:
        document.fileUrl,

      description:
        document.description,

      productIds:
        document.productIds ?? [],

      isPublic:
        document.isPublic,

      isActive:
        document.isActive
    });

    this.errorMessage.set('');
    this.successMessage.set('');

    this.showForm.set(true);
  }

  closeForm(): void {

    if (this.saving()) {
      return;
    }

    this.showForm.set(false);
    this.editingDocument.set(null);
  }

  save(): void {

    if (
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

    const baseRequest:
      DocumentationCreateRequest = {

        title:
          value.title.trim(),

        documentType:
          value.documentType,

        version:
          value.version.trim(),

        /*
         * Para el manual de VOLTS,
         * si todavía existe una URL vieja
         * de example.com, la corregimos
         * antes de guardarla.
         */
        fileUrl:
          this.normalizeFileUrl(
            value.fileUrl
          ),

        description:
          value.description.trim(),

        productIds:
          value.productIds ?? [],

        isPublic:
          value.isPublic
      };

    const editing =
      this.editingDocument();

    if (editing) {

      const request:
        DocumentationUpdateRequest = {

          ...baseRequest,

          isActive:
            value.isActive
        };

      this.service
        .update(
          editing.id,
          request
        )
        .subscribe({

          next: response => {

            this.saving.set(false);

            this.successMessage.set(
              response.message ??
              'Documento actualizado correctamente.'
            );

            this.showForm.set(false);
            this.editingDocument.set(null);

            this.load();
          },

          error: error => {

            this.saving.set(false);

            this.errorMessage.set(
              error?.error?.message ??
              'No fue posible actualizar el documento.'
            );
          }
        });

      return;
    }

    this.service
      .create(baseRequest)
      .subscribe({

        next: response => {

          this.saving.set(false);

          this.successMessage.set(
            response.message ??
            'Documento creado correctamente.'
          );

          this.showForm.set(false);

          this.load();
        },

        error: error => {

          this.saving.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible crear el documento.'
          );
        }
      });
  }

  deleteDocument(
    document: Documentation
  ): void {

    const confirmed =
      window.confirm(
        `¿Eliminar el recurso "${document.title}"?`
      );

    if (!confirmed) {
      return;
    }

    this.deletingId.set(
      document.id
    );

    this.errorMessage.set('');
    this.successMessage.set('');

    this.service
      .delete(document.id)
      .subscribe({

        next: response => {

          this.deletingId.set(null);

          this.successMessage.set(
            response.message ??
            'Documento eliminado correctamente.'
          );

          this.load();
        },

        error: error => {

          this.deletingId.set(null);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible eliminar el documento.'
          );
        }
      });
  }

  openDetail(
    document: Documentation
  ): void {

    this.detailDocument.set(
      document
    );
  }

  closeDetail(): void {

    this.detailDocument.set(null);
  }

  resourceUrl(
    document: Documentation
  ): string {

    /*
     * Si es el manual VOLTS,
     * siempre utilizamos el PDF real
     * que está dentro del backend.
     *
     * Esto evita definitivamente
     * example.com aunque el registro
     * viejo de Mongo no se haya editado.
     */
    if (
      document.documentType ===
        'Manual'
    ) {
      return this.service
        .resolveResourceUrl(
          '/documents/manual-volts.pdf'
        );
    }

    return this.service
      .resolveResourceUrl(
        document.fileUrl
      );
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

  iconClass(
    type: DocumentationType
  ): string {

    const icons:
      Record<DocumentationType, string> = {

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

    return icons[type];
  }

  productNames(
    document: Documentation
  ): string {

    const ids =
      document.productIds ?? [];

    if (ids.length === 0) {
      return 'Todos los productos VOLTS';
    }

    const names =
      this.products()
        .filter(product =>
          ids.includes(product.id)
        )
        .map(product =>
          product.name
        );

    return names.length > 0
      ? names.join(', ')
      : 'Productos asociados';
  }

  private normalizeFileUrl(
    fileUrl: string
  ): string {

    const value =
      fileUrl.trim();

    const lower =
      value.toLowerCase();

    if (
      lower.includes(
        'example.com/manual-volts.pdf'
      ) ||
      lower.includes(
        'manual-ensamble-volts-v1.pdf'
      )
    ) {
      return '/documents/manual-volts.pdf';
    }

    return value;
  }
}
