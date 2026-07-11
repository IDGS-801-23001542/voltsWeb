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
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  toSignal
} from '@angular/core/rxjs-interop';

import {
  forkJoin,
  map,
  startWith
} from 'rxjs';

import {
  Product
} from '../../../core/models/product.model';

import {
  RawMaterial
} from '../../../core/models/raw-material.model';

import {
  Recipe
} from '../../../core/models/recipe.model';

import {
  AuthService
} from '../../../core/services/auth.service';

import {
  ProductService
} from '../../../core/services/product.service';

import {
  RawMaterialService
} from '../../../core/services/raw-material.service';

import {
  RecipeService
} from '../../../core/services/recipe.service';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [
    CurrencyPipe,
    ReactiveFormsModule
  ],
  templateUrl: './recipes.html',
  styleUrl: './recipes.css'
})
export class Recipes implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly recipeService =
    inject(RecipeService);

  private readonly productService =
    inject(ProductService);

  private readonly rawMaterialService =
    inject(RawMaterialService);

  readonly auth = inject(AuthService);

  readonly recipes = signal<Recipe[]>([]);
  readonly products = signal<Product[]>([]);
  readonly materials = signal<RawMaterial[]>([]);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deleting = signal(false);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly searchTerm = signal('');
  readonly statusFilter = signal('all');

  readonly formOpen = signal(false);
  readonly detailOpen = signal(false);

  readonly editingRecipe =
    signal<Recipe | null>(null);

  readonly selectedRecipe =
    signal<Recipe | null>(null);

  readonly deleteCandidate =
    signal<Recipe | null>(null);

  readonly isAdmin = computed(() =>
    this.auth.hasRole('Admin')
  );

  readonly activeRecipes = computed(() =>
    this.recipes().filter(
      recipe => recipe.isActive
    ).length
  );

  readonly inactiveRecipes = computed(() =>
    this.recipes().filter(
      recipe => !recipe.isActive
    ).length
  );

  readonly averageRecipeCost = computed(() => {
    const recipes = this.recipes();

    if (recipes.length === 0) {
      return 0;
    }

    return recipes.reduce(
      (total, recipe) =>
        total + recipe.estimatedUnitCost,
      0
    ) / recipes.length;
  });

  readonly filteredRecipes = computed(() => {
    const search = this.searchTerm()
      .trim()
      .toLowerCase();

    const status = this.statusFilter();

    return this.recipes().filter(recipe => {
      const matchesSearch =
        !search ||
        recipe.code
          .toLowerCase()
          .includes(search) ||
        recipe.productName
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        status === 'all' ||
        (
          status === 'active' &&
          recipe.isActive
        ) ||
        (
          status === 'inactive' &&
          !recipe.isActive
        );

      return matchesSearch && matchesStatus;
    });
  });

  readonly form = this.fb.nonNullable.group({
    productId: [
      '',
      Validators.required
    ],

    version: [
      1,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    notes: [
      '',
      Validators.maxLength(1000)
    ],

    isActive: [true],

    details: this.fb.array([
      this.createDetailGroup()
    ])
  });

  get details(): FormArray {
    return this.form.controls.details;
  }

  /*
   * Reactive Forms no son signals.
   * Esta conversión permite recalcular el costo
   * mientras el usuario modifica el formulario.
   */
  readonly estimatedTotal = toSignal(
    this.form.valueChanges.pipe(
      startWith(this.form.getRawValue()),

      map(() => {
        return this.details.controls.reduce(
          (total, control) => {
            const values =
              control.getRawValue();

            const material =
              this.getMaterial(
                values.rawMaterialId
              );

            if (!material) {
              return total;
            }

            const quantityRequired =
              Number(
                values.quantityRequired
              ) || 0;

            const wastePercentage =
              Number(
                values.wastePercentage
              ) || 0;

            const quantityWithWaste =
              quantityRequired *
              (
                1 +
                wastePercentage / 100
              );

            return total +
              (
                quantityWithWaste *
                material.averageCost
              );
          },
          0
        );
      })
    ),
    {
      initialValue: 0
    }
  );

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      recipes:
        this.recipeService.getAll(),

      products:
        this.productService.getAll(),

      materials:
        this.rawMaterialService.getAll()
    }).subscribe({
      next: response => {
        this.recipes.set(
          response.recipes.data ?? []
        );

        this.products.set(
          (response.products.data ?? [])
            .filter(product =>
              product.isActive &&
              product.canBeProduced
            )
        );

        this.materials.set(
          (response.materials.data ?? [])
            .filter(material =>
              material.isActive
            )
        );

        this.loading.set(false);
      },

      error: error => {
        this.loading.set(false);

        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible cargar las recetas.'
        );
      }
    });
  }

  updateSearch(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    this.searchTerm.set(input.value);
  }

  updateStatusFilter(event: Event): void {
    const select =
      event.target as HTMLSelectElement;

    this.statusFilter.set(select.value);
  }

  openCreateForm(): void {
    this.editingRecipe.set(null);

    this.form.reset({
      productId: '',
      version: 1,
      notes: '',
      isActive: true
    });

    this.details.clear();

    this.details.push(
      this.createDetailGroup()
    );

    this.errorMessage.set('');
    this.formOpen.set(true);
  }

  openEditForm(recipe: Recipe): void {
    this.editingRecipe.set(recipe);

    this.form.reset({
      productId: recipe.productId,
      version: recipe.version,
      notes: recipe.notes,
      isActive: recipe.isActive
    });

    this.details.clear();

    for (const detail of recipe.details) {
      this.details.push(
        this.fb.nonNullable.group({
          rawMaterialId: [
            detail.rawMaterialId,
            Validators.required
          ],

          quantityRequired: [
            detail.quantityRequired,
            [
              Validators.required,
              Validators.min(0.0001)
            ]
          ],

          wastePercentage: [
            detail.wastePercentage,
            [
              Validators.required,
              Validators.min(0),
              Validators.max(100)
            ]
          ],

          acceptsRecoveredWaste: [
            detail.acceptsRecoveredWaste
          ]
        })
      );
    }

    this.formOpen.set(true);
  }

  closeForm(): void {
    if (this.saving()) {
      return;
    }

    this.formOpen.set(false);
    this.editingRecipe.set(null);
  }

  addDetail(): void {
    this.details.push(
      this.createDetailGroup()
    );
  }

  removeDetail(index: number): void {
    if (this.details.length === 1) {
      return;
    }

    this.details.removeAt(index);
  }

  getMaterial(
    materialId: string
  ): RawMaterial | undefined {
    return this.materials().find(
      material =>
        material.id === materialId
    );
  }

  getDetailEstimatedCost(
    index: number
  ): number {
    const values =
      this.details.at(index).getRawValue();

    const material =
      this.getMaterial(
        values.rawMaterialId
      );

    if (!material) {
      return 0;
    }

    const quantityWithWaste =
      Number(values.quantityRequired) *
      (
        1 +
        Number(values.wastePercentage) /
        100
      );

    return quantityWithWaste *
      material.averageCost;
  }

  submit(): void {
    if (
      this.form.invalid ||
      this.saving()
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();

    const materialIds =
      values.details.map(
        detail => detail.rawMaterialId
      );

    const hasDuplicates =
      new Set(materialIds).size !==
      materialIds.length;

    if (hasDuplicates) {
      this.errorMessage.set(
        'Una materia prima no puede repetirse en la receta.'
      );

      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const request = {
      productId: values.productId,
      version: Number(values.version),
      notes: values.notes.trim(),
      isActive: values.isActive,

      details: values.details.map(
        detail => ({
          rawMaterialId:
            detail.rawMaterialId,

          quantityRequired:
            Number(
              detail.quantityRequired
            ),

          wastePercentage:
            Number(
              detail.wastePercentage
            ),

          acceptsRecoveredWaste:
            detail.acceptsRecoveredWaste
        })
      )
    };

    const editing = this.editingRecipe();

    const operation = editing
      ? this.recipeService.update(
          editing.id,
          request
        )
      : this.recipeService.create(
          request
        );

    operation.subscribe({
      next: response => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.editingRecipe.set(null);

        this.successMessage.set(
          response.message
        );

        this.loadData();
        this.clearSuccessMessageLater();
      },

      error: error => {
        this.saving.set(false);

        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible guardar la receta.'
        );
      }
    });
  }

  toggleStatus(recipe: Recipe): void {
    this.errorMessage.set('');

    this.recipeService
      .updateStatus(
        recipe.id,
        !recipe.isActive
      )
      .subscribe({
        next: response => {
          this.successMessage.set(
            response.message
          );

          this.loadData();
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

  openDetail(recipe: Recipe): void {
    this.selectedRecipe.set(recipe);
    this.detailOpen.set(true);
  }

  closeDetail(): void {
    this.detailOpen.set(false);
    this.selectedRecipe.set(null);
  }

  requestDelete(recipe: Recipe): void {
    if (!this.isAdmin()) {
      return;
    }

    this.deleteCandidate.set(recipe);
  }

  cancelDelete(): void {
    if (!this.deleting()) {
      this.deleteCandidate.set(null);
    }
  }

  confirmDelete(): void {
    const recipe = this.deleteCandidate();

    if (
      !recipe ||
      this.deleting() ||
      !this.isAdmin()
    ) {
      return;
    }

    this.deleting.set(true);
    this.errorMessage.set('');

    this.recipeService
      .delete(recipe.id)
      .subscribe({
        next: response => {
          this.deleting.set(false);
          this.deleteCandidate.set(null);

          this.successMessage.set(
            response.message
          );

          this.loadData();
          this.clearSuccessMessageLater();
        },

        error: error => {
          this.deleting.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible eliminar la receta.'
          );
        }
      });
  }

  private createDetailGroup() {
    return this.fb.nonNullable.group({
      rawMaterialId: [
        '',
        Validators.required
      ],

      quantityRequired: [
        1,
        [
          Validators.required,
          Validators.min(0.0001)
        ]
      ],

      wastePercentage: [
        0,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(100)
        ]
      ],

      acceptsRecoveredWaste: [false]
    });
  }

  private clearSuccessMessageLater(): void {
    window.setTimeout(() => {
      this.successMessage.set('');
    }, 4000);
  }
}
