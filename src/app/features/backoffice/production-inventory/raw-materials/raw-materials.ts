import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  CurrencyPipe,
  DatePipe
} from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  forkJoin
} from 'rxjs';

import {
  RawMaterial,
  RawMaterialCategory,
  RawMaterialMovement,
  RawMaterialSummary,
  StockMovementType
} from '../../../../core/models/raw-material.model';

import {
  AuthService
} from '../../../../core/services/auth.service';

import {
  RawMaterialService
} from '../../../../core/services/raw-material.service';

@Component({
  selector: 'app-raw-materials',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule
  ],
  templateUrl: './raw-materials.html',
  styleUrl: './raw-materials.css'
})
export class RawMaterials implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly rawMaterialService =
    inject(RawMaterialService);

  readonly auth = inject(AuthService);

  readonly materials = signal<RawMaterial[]>([]);
  readonly summary =
    signal<RawMaterialSummary | null>(null);

  readonly movements =
    signal<RawMaterialMovement[]>([]);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly adjusting = signal(false);
  readonly deleting = signal(false);
  readonly loadingMovements = signal(false);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly searchTerm = signal('');
  readonly categoryFilter = signal('all');
  readonly stockFilter = signal('all');

  readonly formOpen = signal(false);
  readonly stockModalOpen = signal(false);
  readonly movementsModalOpen = signal(false);

  readonly editingMaterial =
    signal<RawMaterial | null>(null);

  readonly selectedMaterial =
    signal<RawMaterial | null>(null);

  readonly deleteCandidate =
    signal<RawMaterial | null>(null);

  readonly isAdmin = computed(() =>
    this.auth.hasRole('Admin')
  );

  readonly categories: Array<{
    value: RawMaterialCategory;
    label: string;
  }> = [
    {
      value: 'Cardboard',
      label: 'Cartón'
    },
    {
      value: 'Electronics',
      label: 'Electrónica'
    },
    {
      value: 'Mechanical',
      label: 'Mecánica'
    },
    {
      value: 'Textiles',
      label: 'Textiles'
    },
    {
      value: 'Adhesives',
      label: 'Adhesivos'
    },
    {
      value: 'Consumables',
      label: 'Consumibles'
    },
    {
      value: 'Soldering',
      label: 'Soldadura'
    },
    {
      value: 'Packaging',
      label: 'Empaque'
    },
    {
      value: 'Other',
      label: 'Otros'
    }
  ];

  readonly filteredMaterials = computed(() => {
    const search = this.searchTerm()
      .trim()
      .toLowerCase();

    const category = this.categoryFilter();
    const stock = this.stockFilter();

    return this.materials().filter(material => {
      const matchesSearch =
        !search ||
        material.name
          .toLowerCase()
          .includes(search) ||
        material.code
          .toLowerCase()
          .includes(search) ||
        material.description
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        category === 'all' ||
        material.category === category;

      const isLow =
        material.currentStock <=
        material.minimumStock;

      const isEmpty =
        material.currentStock <= 0;

      const matchesStock =
        stock === 'all' ||
        (stock === 'low' && isLow) ||
        (stock === 'empty' && isEmpty) ||
        (
          stock === 'normal' &&
          !isLow &&
          !isEmpty
        );

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock
      );
    });
  });

  readonly form = this.fb.nonNullable.group({
    code: [
      '',
      [
        Validators.required,
        Validators.maxLength(30)
      ]
    ],
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(150)
      ]
    ],
    description: [
      '',
      Validators.maxLength(500)
    ],
    category: [
      'Other' as RawMaterialCategory,
      Validators.required
    ],
    unit: [
      'Pieza',
      Validators.required
    ],
    currentStock: [
      0,
      Validators.min(0)
    ],
    minimumStock: [
      0,
      Validators.min(0)
    ],
    maximumStock: [
      0,
      Validators.min(0)
    ],
    averageCost: [
      0,
      Validators.min(0)
    ],
    lastPurchaseCost: [
      0,
      Validators.min(0)
    ],
    storageLocation: [''],
    preferredSupplierId: [''],
    preferredSupplierName: [''],
    isRecycled: [false],
    isReusable: [false],
    requiresPurchase: [true],
    isActive: [true]
  });

  readonly stockForm =
    this.fb.nonNullable.group({
      movementType: [
        'Entry' as StockMovementType,
        Validators.required
      ],
      quantity: [
        1,
        [
          Validators.required,
          Validators.min(0.01)
        ]
      ],
      reason: [
        '',
        [
          Validators.required,
          Validators.maxLength(300)
        ]
      ],
      unitCost: [
        0,
        Validators.min(0)
      ]
    });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      materials:
        this.rawMaterialService.getAll(),
      summary:
        this.rawMaterialService.getSummary()
    }).subscribe({
      next: response => {
        this.materials.set(
          response.materials.data ?? []
        );

        this.summary.set(
          response.summary.data
        );

        this.loading.set(false);
      },
      error: error => {
        this.loading.set(false);

        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible cargar la materia prima.'
        );
      }
    });
  }

  updateSearch(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    this.searchTerm.set(input.value);
  }

  updateCategoryFilter(event: Event): void {
    const select =
      event.target as HTMLSelectElement;

    this.categoryFilter.set(select.value);
  }

  updateStockFilter(event: Event): void {
    const select =
      event.target as HTMLSelectElement;

    this.stockFilter.set(select.value);
  }

  openCreateForm(): void {
    this.editingMaterial.set(null);

    this.form.reset({
      code: '',
      name: '',
      description: '',
      category: 'Other',
      unit: 'Pieza',
      currentStock: 0,
      minimumStock: 0,
      maximumStock: 0,
      averageCost: 0,
      lastPurchaseCost: 0,
      storageLocation: '',
      preferredSupplierId: '',
      preferredSupplierName: '',
      isRecycled: false,
      isReusable: false,
      requiresPurchase: true,
      isActive: true
    });

    this.form.controls
      .currentStock
      .enable();

    this.formOpen.set(true);
  }

  openEditForm(material: RawMaterial): void {
    this.editingMaterial.set(material);

    this.form.reset({
      code: material.code,
      name: material.name,
      description: material.description,
      category: material.category,
      unit: material.unit,
      currentStock: material.currentStock,
      minimumStock: material.minimumStock,
      maximumStock: material.maximumStock,
      averageCost: material.averageCost,
      lastPurchaseCost:
        material.lastPurchaseCost,
      storageLocation:
        material.storageLocation,
      preferredSupplierId:
        material.preferredSupplierId ?? '',
      preferredSupplierName:
        material.preferredSupplierName ?? '',
      isRecycled: material.isRecycled,
      isReusable: material.isReusable,
      requiresPurchase:
        material.requiresPurchase,
      isActive: material.isActive
    });

    /*
     * El stock no se edita directamente.
     */
    this.form.controls
      .currentStock
      .disable();

    this.formOpen.set(true);
  }

  closeForm(): void {
    if (this.saving()) {
      return;
    }

    this.formOpen.set(false);
    this.editingMaterial.set(null);

    this.form.controls
      .currentStock
      .enable();
  }

  submit(): void {
    if (
      this.form.invalid ||
      this.saving()
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (
      raw.maximumStock > 0 &&
      raw.maximumStock < raw.minimumStock
    ) {
      this.errorMessage.set(
        'El stock máximo no puede ser menor al mínimo.'
      );

      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const request = {
      code: raw.code.trim(),
      name: raw.name.trim(),
      description:
        raw.description.trim(),
      category: raw.category,
      unit: raw.unit.trim(),
      currentStock: raw.currentStock,
      minimumStock: raw.minimumStock,
      maximumStock: raw.maximumStock,
      averageCost: raw.averageCost,
      lastPurchaseCost:
        raw.lastPurchaseCost,
      isRecycled: raw.isRecycled,
      isReusable: raw.isReusable,
      requiresPurchase:
        raw.requiresPurchase,
      storageLocation:
        raw.storageLocation.trim(),
      preferredSupplierId:
        raw.preferredSupplierId.trim() ||
        null,
      preferredSupplierName:
        raw.preferredSupplierName.trim() ||
        null
    };

    const editing = this.editingMaterial();

    const operation = editing
      ? this.rawMaterialService.update(
          editing.id,
          {
            ...request,
            isActive: raw.isActive
          }
        )
      : this.rawMaterialService.create(
          request
        );

    operation.subscribe({
      next: response => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.editingMaterial.set(null);

        this.successMessage.set(
          response.message
        );

        this.form.controls
          .currentStock
          .enable();

        this.loadData();
        this.clearSuccessMessageLater();
      },
      error: error => {
        this.saving.set(false);

        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible guardar la materia prima.'
        );
      }
    });
  }

  openStockModal(material: RawMaterial): void {
    this.selectedMaterial.set(material);

    this.stockForm.reset({
      movementType: 'Entry',
      quantity: 1,
      reason: '',
      unitCost: material.averageCost
    });

    this.stockModalOpen.set(true);
  }

  closeStockModal(): void {
    if (this.adjusting()) {
      return;
    }

    this.stockModalOpen.set(false);
    this.selectedMaterial.set(null);
  }

  submitStockMovement(): void {
    const material = this.selectedMaterial();

    if (
      !material ||
      this.stockForm.invalid ||
      this.adjusting()
    ) {
      this.stockForm.markAllAsTouched();
      return;
    }

    const values =
      this.stockForm.getRawValue();

    this.adjusting.set(true);
    this.errorMessage.set('');

    this.rawMaterialService
      .adjustStock(
        material.id,
        {
          movementType:
            values.movementType,
          quantity: values.quantity,
          reason: values.reason.trim(),
          unitCost:
            values.movementType === 'Entry'
              ? values.unitCost
              : null,
          referenceType: 'Manual',
          referenceId: null
        }
      )
      .subscribe({
        next: response => {
          this.adjusting.set(false);
          this.stockModalOpen.set(false);
          this.selectedMaterial.set(null);

          this.successMessage.set(
            response.message
          );

          this.loadData();
          this.clearSuccessMessageLater();
        },
        error: error => {
          this.adjusting.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible registrar el movimiento.'
          );
        }
      });
  }

  openMovements(material: RawMaterial): void {
    this.selectedMaterial.set(material);
    this.movements.set([]);
    this.movementsModalOpen.set(true);
    this.loadingMovements.set(true);

    this.rawMaterialService
      .getMovements(material.id)
      .subscribe({
        next: response => {
          this.movements.set(
            response.data ?? []
          );

          this.loadingMovements.set(false);
        },
        error: error => {
          this.loadingMovements.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible cargar los movimientos.'
          );
        }
      });
  }

  closeMovements(): void {
    this.movementsModalOpen.set(false);
    this.selectedMaterial.set(null);
    this.movements.set([]);
  }

  requestDelete(material: RawMaterial): void {
    if (!this.isAdmin()) {
      return;
    }

    this.deleteCandidate.set(material);
  }

  cancelDelete(): void {
    if (!this.deleting()) {
      this.deleteCandidate.set(null);
    }
  }

  confirmDelete(): void {
    const material = this.deleteCandidate();

    if (
      !material ||
      this.deleting() ||
      !this.isAdmin()
    ) {
      return;
    }

    this.deleting.set(true);

    this.rawMaterialService
      .delete(material.id)
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
            'No fue posible eliminar la materia prima.'
          );
        }
      });
  }

  getCategoryLabel(
    category: RawMaterialCategory
  ): string {
    return this.categories.find(
      item => item.value === category
    )?.label ?? category;
  }

  isLowStock(material: RawMaterial): boolean {
    return (
      material.currentStock <=
      material.minimumStock
    );
  }

  private clearSuccessMessageLater(): void {
    window.setTimeout(() => {
      this.successMessage.set('');
    }, 3500);
  }
}
