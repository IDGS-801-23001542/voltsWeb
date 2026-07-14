import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  CurrencyPipe
} from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Category
} from '../../../../core/models/category.model';

import {
  Product,
  ProductCommercialStatus,
  ProductStatusFilter
} from '../../../../core/models/product.model';

import {
  AuthService
} from '../../../../core/services/auth.service';

import {
  CategoryService
} from '../../../../core/services/category.service';

import {
  ProductService
} from '../../../../core/services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CurrencyPipe,
    ReactiveFormsModule
  ],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {
  private readonly fb =
    inject(FormBuilder);

  private readonly productService =
    inject(ProductService);

  private readonly categoryService =
    inject(CategoryService);

  readonly auth =
    inject(AuthService);

  readonly products =
    signal<Product[]>([]);

  readonly categories =
    signal<Category[]>([]);

  readonly loading =
    signal(true);

  readonly saving =
    signal(false);

  readonly deleting =
    signal(false);

  readonly errorMessage =
    signal('');

  readonly successMessage =
    signal('');

  readonly searchTerm =
    signal('');

  readonly statusFilter =
    signal<ProductStatusFilter>('all');

  readonly formOpen =
    signal(false);

  readonly editingProduct =
    signal<Product | null>(null);

  readonly deleteCandidate =
    signal<Product | null>(null);

  readonly isAdmin =
    computed(() =>
      this.auth.hasRole('Admin')
    );

  readonly availableCount =
    computed(() =>
      this.products().filter(
        product =>
          product.commercialStatus ===
          'Available'
      ).length
    );

  readonly comingSoonCount =
    computed(() =>
      this.products().filter(
        product =>
          product.commercialStatus ===
          'ComingSoon'
      ).length
    );

  readonly lowStockCount =
    computed(() =>
      this.products().filter(
        product =>
          product.availableStock <=
          product.minimumFinishedStock
      ).length
    );

  readonly filteredProducts =
    computed(() => {
      const search =
        this.searchTerm()
          .trim()
          .toLowerCase();

      const status =
        this.statusFilter();

      return this.products().filter(
        product => {
          const matchesSearch =
            !search ||
            product.name
              .toLowerCase()
              .includes(search) ||
            product.breed
              .toLowerCase()
              .includes(search) ||
            product.species
              .toLowerCase()
              .includes(search) ||
            product.categoryName
              .toLowerCase()
              .includes(search);

          const matchesStatus =
            status === 'all' ||
            product.commercialStatus ===
              status;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    });

  readonly form =
    this.fb.nonNullable.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(120)
        ]
      ],

      slug: [
        '',
        [
          Validators.required,
          Validators.maxLength(140)
        ]
      ],

      description: [
        '',
        [
          Validators.required,
          Validators.maxLength(800)
        ]
      ],

      price: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      categoryId: [
        '',
        Validators.required
      ],

      species: [
        'Perro',
        Validators.required
      ],

      breed: [
        '',
        Validators.required
      ],

      commercialStatus: [
        'ComingSoon' as ProductCommercialStatus,
        Validators.required
      ],

      canBePurchased: [
        false
      ],

      canBeProduced: [
        true
      ],

      imageUrl: [
        ''
      ],

      minimumFinishedStock: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      isActive: [
        true
      ]
    });

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.categoryService
      .getAll()
      .subscribe({
        next: categoryResponse => {
          this.categories.set(
            (
              categoryResponse.data ??
              []
            ).filter(
              category =>
                category.isActive
            )
          );

          this.loadProducts();
        },

        error: error => {
          this.loading.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible cargar las categorías.'
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

          this.loading.set(false);
        },

        error: error => {
          this.loading.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible cargar los productos.'
          );
        }
      });
  }

  updateSearch(
    event: Event
  ): void {
    const input =
      event.target as HTMLInputElement;

    this.searchTerm.set(
      input.value
    );
  }

  updateStatusFilter(
    event: Event
  ): void {
    const select =
      event.target as HTMLSelectElement;

    this.statusFilter.set(
      select.value as ProductStatusFilter
    );
  }

  openCreateForm(): void {
    if (!this.isAdmin()) {
      return;
    }

    this.editingProduct.set(null);

    this.form.reset({
      name: '',
      slug: '',
      description: '',
      price: 0,
      categoryId: '',
      species: 'Perro',
      breed: '',

      commercialStatus:
        'ComingSoon' as ProductCommercialStatus,

      canBePurchased:
        false,

      canBeProduced:
        true,

      imageUrl:
        '',

      minimumFinishedStock:
        0,

      isActive:
        true
    });

    this.formOpen.set(true);
  }

  openEditForm(
    product: Product
  ): void {
    if (!this.isAdmin()) {
      return;
    }

    this.editingProduct.set(
      product
    );

    this.form.reset({
      name:
        product.name,

      slug:
        product.slug,

      description:
        product.description,

      price:
        product.price,

      categoryId:
        product.categoryId,

      species:
        product.species,

      breed:
        product.breed,

      commercialStatus:
        product.commercialStatus,

      canBePurchased:
        product.canBePurchased,

      canBeProduced:
        product.canBeProduced,

      imageUrl:
        product.imageUrl ?? '',

      minimumFinishedStock:
        product.minimumFinishedStock,

      isActive:
        product.isActive
    });

    this.formOpen.set(true);
  }

  closeForm(): void {
    if (this.saving()) {
      return;
    }

    this.formOpen.set(false);
    this.editingProduct.set(null);
  }

  generateSlug(): void {
    const name =
      this.form.controls
        .name.value;

    const slug =
      name
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(
          /[\u0300-\u036f]/g,
          ''
        )
        .replace(
          /[^a-z0-9]+/g,
          '-'
        )
        .replace(
          /^-+|-+$/g,
          ''
        );

    this.form.controls
      .slug
      .setValue(slug);
  }

  commercialStatusChanged(): void {
    const status =
      this.form.controls
        .commercialStatus.value;

    if (
      status !== 'Available'
    ) {
      this.form.controls
        .canBePurchased
        .setValue(false);
    }
  }

  submit(): void {
    if (
      this.form.invalid ||
      this.saving() ||
      !this.isAdmin()
    ) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const values =
      this.form.getRawValue();

    const editing =
      this.editingProduct();

    const request = {
      name:
        values.name.trim(),

      slug:
        values.slug.trim(),

      description:
        values.description.trim(),

      price:
        values.price,

      categoryId:
        values.categoryId,

      species:
        values.species.trim(),

      breed:
        values.breed.trim(),

      commercialStatus:
        values.commercialStatus,

      canBePurchased:
        values.canBePurchased,

      canBeProduced:
        values.canBeProduced,

      imageUrl:
        values.imageUrl.trim() ||
        null,

      minimumFinishedStock:
        values.minimumFinishedStock
    };

    const operation =
      editing
        ? this.productService
            .update(
              editing.id,
              {
                ...request,
                isActive:
                  values.isActive
              }
            )
        : this.productService
            .create(request);

    operation.subscribe({
      next: response => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.editingProduct.set(null);

        this.successMessage.set(
          response.message
        );

        this.loadProducts();
        this.clearSuccessMessageLater();
      },

      error: error => {
        this.saving.set(false);

        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible guardar el producto.'
        );
      }
    });
  }

  toggleStatus(
    product: Product
  ): void {
    if (!this.isAdmin()) {
      return;
    }

    this.productService
      .updateStatus(
        product.id,
        !product.isActive
      )
      .subscribe({
        next: response => {
          this.successMessage.set(
            response.message
          );

          this.loadProducts();
          this.clearSuccessMessageLater();
        },

        error: error => {
          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible cambiar el estado.'
          );
        }
      });
  }

  requestDelete(
    product: Product
  ): void {
    if (!this.isAdmin()) {
      return;
    }

    this.deleteCandidate.set(
      product
    );
  }

  cancelDelete(): void {
    if (!this.deleting()) {
      this.deleteCandidate.set(null);
    }
  }

  confirmDelete(): void {
    const product =
      this.deleteCandidate();

    if (
      !product ||
      this.deleting() ||
      !this.isAdmin()
    ) {
      return;
    }

    this.deleting.set(true);

    this.productService
      .delete(product.id)
      .subscribe({
        next: response => {
          this.deleting.set(false);
          this.deleteCandidate.set(null);

          this.successMessage.set(
            response.message
          );

          this.loadProducts();
          this.clearSuccessMessageLater();
        },

        error: error => {
          this.deleting.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible eliminar el producto.'
          );
        }
      });
  }

  getCommercialStatusLabel(
    status:
      ProductCommercialStatus
  ): string {
    switch (status) {
      case 'Available':
        return 'Disponible';

      case 'ComingSoon':
        return 'Próximamente';

      case 'Unavailable':
        return 'No disponible';

      case 'Discontinued':
        return 'Descontinuado';

      default:
        return status;
    }
  }

  private clearSuccessMessageLater(): void {
    window.setTimeout(
      () => {
        this.successMessage.set('');
      },
      3500
    );
  }
}
