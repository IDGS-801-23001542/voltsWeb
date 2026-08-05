import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  CurrencyPipe,
  DecimalPipe
} from '@angular/common';

import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import {
  forkJoin
} from 'rxjs';

import {
  Product
} from '../../../../core/models/product.model';

import {
  RawMaterial
} from '../../../../core/models/raw-material.model';

import {
  Recipe,
  RecipeStatus
} from '../../../../core/models/recipe.model';

import {
  AuthService
} from '../../../../core/services/auth.service';

import {
  ProductService
} from '../../../../core/services/product.service';

import {
  RawMaterialService
} from '../../../../core/services/raw-material.service';

import {
  RecipeService
} from '../../../../core/services/recipe.service';

import {
  formatQuantity,
  isValidQuantity,
  quantityStep
} from '../../../../shared/utils/unit-format.util';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [
  CurrencyPipe,
  DecimalPipe,
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
      recipe => recipe.status === 'Active'
    ).length
  );

  readonly inactiveRecipes = computed(() =>
    this.recipes().filter(
      recipe => recipe.status !== 'Active'
    ).length
  );

  readonly averageRecipeCost = computed(() => {
    const values = this.recipes();

    return values.length === 0
      ? 0
      : values.reduce(
          (sum, recipe) =>
            sum + recipe.estimatedUnitCost,
          0
        ) / values.length;
  });

  readonly filteredRecipes = computed(() => {
    const search =
      this.searchTerm().trim().toLowerCase();

    return this.recipes().filter(recipe => {
      const matchesSearch =
        !search ||
        recipe.code.toLowerCase().includes(search) ||
        recipe.productName
          .toLowerCase()
          .includes(search);

      const filter = this.statusFilter();

      const matchesStatus =
        filter === 'all' ||
        recipe.status === filter;

      return matchesSearch && matchesStatus;
    });
  });

  readonly form = this.fb.nonNullable.group({
    productId: ['', Validators.required],
    version: [
      1,
      [
        Validators.required,
        Validators.min(1),
        this.integerValidator()
      ]
    ],
    status: [
      'Draft' as RecipeStatus,
      Validators.required
    ],
    notes: [
      '',
      Validators.maxLength(1000)
    ],
    details: this.fb.array([
      this.createDetailGroup()
    ])
  });

  get details(): FormArray {
    return this.form.controls.details;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    forkJoin({
      recipes: this.recipeService.getAll(),
      products: this.productService.getAll(),
      materials: this.rawMaterialService.getAll()
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
            .filter(material => material.isActive)
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
    this.searchTerm.set(
      (event.target as HTMLInputElement).value
    );
  }

  updateStatusFilter(event: Event): void {
    this.statusFilter.set(
      (event.target as HTMLSelectElement).value
    );
  }

  openCreateForm(): void {
    this.editingRecipe.set(null);
    this.form.reset({
      productId: '',
      version: 1,
      status: 'Draft',
      notes: ''
    });
    this.details.clear();
    this.details.push(this.createDetailGroup());
    this.formOpen.set(true);
  }

  openEditForm(recipe: Recipe): void {
    this.errorMessage.set('');
    this.recipeService.getById(recipe.id).subscribe({
      next: response => {
        const full = response.data;
        this.editingRecipe.set(full);
        this.form.reset({ productId: full.productId, version: full.version, status: full.status, notes: full.notes ?? '' });
        this.details.clear();
        for (const detail of full.details ?? []) {
          const group = this.createDetailGroup();
          group.setValue({
            rawMaterialId: detail.rawMaterialId,
            quantityRequired: Number(detail.quantityRequired),
            wastePercentage: Number(detail.wastePercentage),
            acceptsRecoveredWaste: Boolean(detail.acceptsRecoveredWaste)
          });
          this.details.push(group);
          this.applyQuantityValidators(this.details.length - 1);
        }
        if (this.details.length === 0) this.details.push(this.createDetailGroup());
        this.formOpen.set(true);
      },
      error: error => this.errorMessage.set(error?.error?.message ?? 'No fue posible cargar la receta completa para editarla.')
    });
  }

  closeForm(): void {
    if (!this.saving()) {
      this.formOpen.set(false);
      this.editingRecipe.set(null);
    }
  }

  addDetail(): void {
    this.details.push(this.createDetailGroup());
  }

  removeDetail(index: number): void {
    if (this.details.length > 1) {
      this.details.removeAt(index);
    }
  }

  materialChanged(index: number): void {
    this.applyQuantityValidators(index);
  }

  getMaterial(
    materialId: string
  ): RawMaterial | undefined {
    return this.materials().find(
      material => material.id === materialId
    );
  }

  getAvailableMaterials(
    index: number
  ): RawMaterial[] {
    const selected = this.details.controls
      .map((control, currentIndex) =>
        currentIndex === index
          ? null
          : control.get('rawMaterialId')?.value
      )
      .filter(Boolean);

    return this.materials().filter(
      material => !selected.includes(material.id)
    );
  }

  quantityStepFor(
    material?: RawMaterial
  ): string {
    return quantityStep(material);
  }

  formatMaterialQuantity(
    value: number,
    material: RawMaterial
  ): string {
    return formatQuantity(value, material);
  }

  getDetailEstimatedCost(index: number): number {
    const value =
      this.details.at(index).getRawValue();

    const material =
      this.getMaterial(value.rawMaterialId);

    if (!material) {
      return 0;
    }

    const quantityWithWaste =
      Number(value.quantityRequired) *
      (
        1 +
        Number(value.wastePercentage) / 100
      );

    return (
      quantityWithWaste *
      material.averageCost
    );
  }

  estimatedTotal(): number {
    return this.details.controls.reduce(
      (sum, _, index) =>
        sum + this.getDetailEstimatedCost(index),
      0
    );
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const ids =
      value.details.map(
        detail => detail.rawMaterialId
      );

    if (new Set(ids).size !== ids.length) {
      this.errorMessage.set(
        'Una materia prima no puede repetirse.'
      );
      return;
    }

    for (
      let index = 0;
      index < value.details.length;
      index++
    ) {
      const detail = value.details[index];

      const material =
        this.getMaterial(detail.rawMaterialId);

      if (
        !material ||
        !isValidQuantity(
          Number(detail.quantityRequired),
          material
        )
      ) {
        this.errorMessage.set(
          `La cantidad del material ${index + 1} ` +
          'no es válida para su unidad.'
        );
        return;
      }
    }

    const request = {
      productId: value.productId,
      version: Number(value.version),
      status: value.status,
      notes: value.notes.trim(),
      details: value.details.map(detail => ({
        rawMaterialId:
          detail.rawMaterialId,
        quantityRequired:
          Number(detail.quantityRequired),
        wastePercentage:
          Number(detail.wastePercentage),
        acceptsRecoveredWaste:
          detail.acceptsRecoveredWaste
      }))
    };

    this.saving.set(true);
    this.errorMessage.set('');

    const editing = this.editingRecipe();

    const operation = editing
      ? this.recipeService.update(
          editing.id,
          request
        )
      : this.recipeService.create(request);

    operation.subscribe({
      next: response => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.successMessage.set(response.message);
        this.loadData();
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

  openDetail(recipe: Recipe): void {
    this.recipeService.getById(recipe.id).subscribe({
      next: response => { this.selectedRecipe.set(response.data); this.detailOpen.set(true); },
      error: error => this.errorMessage.set(error?.error?.message ?? 'No fue posible cargar el detalle de la receta.')
    });
  }

  closeDetail(): void {
    this.detailOpen.set(false);
    this.selectedRecipe.set(null);
  }

  requestDelete(recipe: Recipe): void {
    this.deleteCandidate.set(recipe);
  }

  cancelDelete(): void {
    this.deleteCandidate.set(null);
  }

  confirmDelete(): void {
    const recipe = this.deleteCandidate();

    if (!recipe || !this.isAdmin()) {
      return;
    }

    this.deleting.set(true);

    this.recipeService.delete(recipe.id)
      .subscribe({
        next: response => {
          this.deleting.set(false);
          this.deleteCandidate.set(null);
          this.successMessage.set(
            response.message
          );
          this.loadData();
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

  private applyQuantityValidators(
    index: number
  ): void {
    const control =
      this.details.at(index);

    const material =
      this.getMaterial(
        control.get('rawMaterialId')?.value
      );

    const quantityControl =
      control.get('quantityRequired');

    if (!material || !quantityControl) {
      return;
    }

    const validators: ValidatorFn[] = [
      Validators.required,
      Validators.min(
        material.unitAllowsDecimals
          ? 1 / 10 ** material.unitDecimalPlaces
          : 1
      ),
      this.decimalPlacesValidator(
        material.unitAllowsDecimals
          ? material.unitDecimalPlaces
          : 0
      )
    ];

    quantityControl.setValidators(validators);
    quantityControl.updateValueAndValidity({
      emitEvent: false
    });
  }

  private integerValidator(): ValidatorFn {
    return (
      control: AbstractControl
    ): ValidationErrors | null =>
      Number.isInteger(Number(control.value))
        ? null
        : { integer: true };
  }

  private decimalPlacesValidator(
    maximum: number
  ): ValidatorFn {
    return (
      control: AbstractControl
    ): ValidationErrors | null => {
      const value = Number(control.value);

      if (!Number.isFinite(value)) {
        return { invalidNumber: true };
      }

      const places = value
        .toString()
        .split('.')[1]?.length ?? 0;

      return places <= maximum
        ? null
        : { decimalPlaces: true };
    };
  }
}


