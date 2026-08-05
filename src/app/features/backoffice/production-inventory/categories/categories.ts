import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  DatePipe
} from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Category,
  CategoryStatusFilter
} from '../../../../core/models/category.model';

import {
  AuthService
} from '../../../../core/services/auth.service';

import {
  CategoryService
} from '../../../../core/services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class Categories implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly categoryService =
    inject(CategoryService);

  readonly auth = inject(AuthService);

  readonly categories = signal<Category[]>([]);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deleting = signal(false);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly searchTerm = signal('');
  readonly statusFilter =
    signal<CategoryStatusFilter>('all');

  readonly formOpen = signal(false);
  readonly editingCategory =
    signal<Category | null>(null);

  readonly deleteCandidate =
    signal<Category | null>(null);

  readonly isAdmin = computed(() =>
    this.auth.hasRole('Admin')
  );

  readonly activeCategories = computed(() =>
    this.categories().filter(
      category => category.isActive
    ).length
  );

  readonly inactiveCategories = computed(() =>
    this.categories().filter(
      category => !category.isActive
    ).length
  );

  readonly filteredCategories = computed(() => {
    const search = this.searchTerm()
      .trim()
      .toLowerCase();

    const status = this.statusFilter();

    return this.categories().filter(category => {
      const matchesSearch =
        !search ||
        category.name.toLowerCase().includes(search) ||
        category.description
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        status === 'all' ||
        (
          status === 'active' &&
          category.isActive
        ) ||
        (
          status === 'inactive' &&
          !category.isActive
        );

      return matchesSearch && matchesStatus;
    });
  });

  readonly form = this.fb.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(80)
      ]
    ],
    description: [
      '',
      [
        Validators.maxLength(300)
      ]
    ],
    isActive: [true]
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.categoryService.getAll().subscribe({
      next: response => {
        this.categories.set(response.data ?? []);
        this.loading.set(false);
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

  updateSearch(
    event: Event
  ): void {
    const input = event.target as HTMLInputElement;

    this.searchTerm.set(input.value);
  }

  updateStatusFilter(
    event: Event
  ): void {
    const select = event.target as HTMLSelectElement;

    this.statusFilter.set(
      select.value as CategoryStatusFilter
    );
  }

  openCreateForm(): void {
    if (!this.isAdmin()) {
      return;
    }

    this.editingCategory.set(null);

    this.form.reset({
      name: '',
      description: '',
      isActive: true
    });

    this.errorMessage.set('');
    this.successMessage.set('');
    this.formOpen.set(true);
  }

  openEditForm(
    category: Category
  ): void {
    if (!this.isAdmin()) {
      return;
    }

    this.editingCategory.set(category);

    this.form.reset({
      name: category.name,
      description: category.description,
      isActive: category.isActive
    });

    this.errorMessage.set('');
    this.successMessage.set('');
    this.formOpen.set(true);
  }

  closeForm(): void {
    if (this.saving()) {
      return;
    }

    this.formOpen.set(false);
    this.editingCategory.set(null);

    this.form.reset({
      name: '',
      description: '',
      isActive: true
    });
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

    const values = this.form.getRawValue();
    const editing = this.editingCategory();

    const request = {
      name: values.name.trim(),
      description: values.description.trim(),
      isActive: values.isActive
    };

    const operation = editing
      ? this.categoryService.update(
          editing.id,
          request
        )
      : this.categoryService.create({
          name: request.name,
          description: request.description
        });

    operation.subscribe({
      next: response => {
        this.saving.set(false);

        this.successMessage.set(
          response.message
        );

        this.closeForm();
        this.loadCategories();
        this.clearSuccessMessageLater();
      },
      error: error => {
        this.saving.set(false);

        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible guardar la categoría.'
        );
      }
    });
  }

  toggleStatus(
    category: Category
  ): void {
    if (!this.isAdmin()) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.categoryService
      .updateStatus(
        category.id,
        !category.isActive
      )
      .subscribe({
        next: response => {
          this.successMessage.set(
            response.message
          );

          this.categories.update(categories =>
            categories.map(item =>
              item.id === category.id
                ? {
                    ...item,
                    isActive: !item.isActive
                  }
                : item
            )
          );

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
    category: Category
  ): void {
    if (!this.isAdmin()) {
      return;
    }

    this.deleteCandidate.set(category);
  }

  cancelDelete(): void {
    if (this.deleting()) {
      return;
    }

    this.deleteCandidate.set(null);
  }

  confirmDelete(): void {
    const category = this.deleteCandidate();

    if (
      !category ||
      this.deleting() ||
      !this.isAdmin()
    ) {
      return;
    }

    this.deleting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.categoryService
      .delete(category.id)
      .subscribe({
        next: response => {
          this.deleting.set(false);
          this.deleteCandidate.set(null);

          this.categories.update(categories =>
            categories.filter(
              item => item.id !== category.id
            )
          );

          this.successMessage.set(
            response.message
          );

          this.clearSuccessMessageLater();
        },
        error: error => {
          this.deleting.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible eliminar la categoría.'
          );
        }
      });
  }

  private clearSuccessMessageLater(): void {
    window.setTimeout(() => {
      this.successMessage.set('');
    }, 3500);
  }
}



