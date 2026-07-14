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
  Purchase,
  PurchaseSummary
} from '../../../../core/models/purchase.model';

import {
  RawMaterial
} from '../../../../core/models/raw-material.model';

import {
  Supplier
} from '../../../../core/models/supplier.model';

import {
  PurchaseService
} from '../../../../core/services/purchase.service';

import {
  RawMaterialService
} from '../../../../core/services/raw-material.service';

import {
  SupplierService
} from '../../../../core/services/supplier.service';

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule
  ],
  templateUrl: './purchases.html',
  styleUrl: './purchases.css'
})
export class Purchases implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly purchaseService =
    inject(PurchaseService);

  private readonly supplierService =
    inject(SupplierService);

  private readonly rawMaterialService =
    inject(RawMaterialService);

  readonly purchases = signal<Purchase[]>([]);

  readonly summary =
    signal<PurchaseSummary | null>(null);

  readonly suppliers = signal<Supplier[]>([]);

  readonly materials = signal<RawMaterial[]>([]);

  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly searchTerm = signal('');
  readonly supplierFilter = signal('all');

  readonly formOpen = signal(false);

  readonly selectedPurchase =
    signal<Purchase | null>(null);

  readonly detailModalOpen = signal(false);

  readonly filteredPurchases = computed(() => {
    const search = this.searchTerm()
      .trim()
      .toLowerCase();

    const supplierId =
      this.supplierFilter();

    return this.purchases().filter(purchase => {
      const matchesSearch =
        !search ||
        purchase.folio
          .toLowerCase()
          .includes(search) ||
        purchase.supplierName
          .toLowerCase()
          .includes(search) ||
        (
          purchase.invoiceNumber ?? ''
        )
          .toLowerCase()
          .includes(search);

      const matchesSupplier =
        supplierId === 'all' ||
        purchase.supplierId === supplierId;

      return matchesSearch && matchesSupplier;
    });
  });

  readonly form = this.fb.nonNullable.group({
    supplierId: [
      '',
      Validators.required
    ],

    invoiceNumber: [
      '',
      Validators.maxLength(100)
    ],

    purchaseDate: [
      this.getCurrentDate(),
      Validators.required
    ],

    tax: [
      0,
      [
        Validators.required,
        Validators.min(0),
        this.maximumDecimalPlacesValidator(2)
      ]
    ],

    shippingCost: [
      0,
      [
        Validators.required,
        Validators.min(0),
        this.maximumDecimalPlacesValidator(2)
      ]
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

  readonly purchaseSubtotal = signal(0);
  readonly purchaseTotal = signal(0);

  ngOnInit(): void {
    this.loadData();

    this.form.controls.tax.valueChanges
      .subscribe(() => this.recalculateTotals());

    this.form.controls.shippingCost.valueChanges
      .subscribe(() => this.recalculateTotals());
  }

  loadData(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      purchases:
        this.purchaseService.getAll(),

      summary:
        this.purchaseService.getSummary(),

      suppliers:
        this.supplierService.getActive(),

      materials:
        this.rawMaterialService.getAll()
    }).subscribe({
      next: response => {
        this.purchases.set(
          response.purchases.data ?? []
        );

        this.summary.set(
          response.summary.data
        );

        this.suppliers.set(
          response.suppliers.data ?? []
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
          'No fue posible cargar las compras.'
        );
      }
    });
  }

  updateSearch(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    this.searchTerm.set(input.value);
  }

  updateSupplierFilter(event: Event): void {
    const select =
      event.target as HTMLSelectElement;

    this.supplierFilter.set(select.value);
  }

  openCreateForm(): void {
    this.form.reset({
      supplierId: '',
      invoiceNumber: '',
      purchaseDate:
        this.getCurrentDate(),
      tax: 0,
      shippingCost: 0,
      notes: ''
    });

    this.details.clear();
    this.details.push(
      this.createDetailGroup()
    );

    this.recalculateTotals();

    this.errorMessage.set('');
    this.successMessage.set('');
    this.formOpen.set(true);
  }

  closeForm(): void {
    if (this.saving()) {
      return;
    }

    this.formOpen.set(false);
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
    this.recalculateTotals();
  }

  materialChanged(index: number): void {
    const control =
      this.details.at(index);

    const materialId =
      control.get('rawMaterialId')?.value;

    const material =
      this.materials().find(
        item => item.id === materialId
      );

    if (!material) {
      return;
    }

    control.get('unitCost')?.setValue(
      material.lastPurchaseCost > 0
        ? material.lastPurchaseCost
        : material.averageCost
    );

    control.get('quantity')?.setValue(
      material.unitAllowsDecimals
        ? this.minimumQuantity(
            material.unitDecimalPlaces
          )
        : 1
    );

    this.applyQuantityValidator(
      index,
      material
    );

    this.recalculateTotals();
  }

  detailChanged(): void {
    this.recalculateTotals();
  }

  submit(): void {
    if (
      this.form.invalid ||
      this.saving()
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const raw =
      this.form.getRawValue();

    const repeatedIds =
      raw.details
        .map(detail => detail.rawMaterialId)
        .filter(
          (id, index, array) =>
            array.indexOf(id) !== index
        );

    if (repeatedIds.length > 0) {
      this.errorMessage.set(
        'Una materia prima no puede repetirse en la misma compra.'
      );
      return;
    }

    for (
      let index = 0;
      index < raw.details.length;
      index++
    ) {
      const detail = raw.details[index];

      const material =
        this.materials().find(
          item =>
            item.id === detail.rawMaterialId
        );

      if (!material) {
        this.errorMessage.set(
          `Selecciona una materia prima válida en el detalle ${index + 1}.`
        );
        return;
      }

      const quantity =
        Number(detail.quantity);

      if (!Number.isFinite(quantity) ||
          quantity <= 0) {
        this.errorMessage.set(
          `La cantidad del detalle ${index + 1} debe ser mayor a cero.`
        );
        return;
      }

      if (
        !material.unitAllowsDecimals &&
        !Number.isInteger(quantity)
      ) {
        this.errorMessage.set(
          `${material.name} solo acepta cantidades enteras.`
        );
        return;
      }

      if (
        material.unitAllowsDecimals &&
        this.decimalPlaces(quantity) >
          material.unitDecimalPlaces
      ) {
        this.errorMessage.set(
          `${material.name} permite máximo ${material.unitDecimalPlaces} decimales.`
        );
        return;
      }

      const newStock =
        material.currentStock +
        quantity;

      if (
        material.maximumStock > 0 &&
        newStock >
          material.maximumStock
      ) {
        this.errorMessage.set(
          `La compra de ${material.name} superaría el stock máximo de ` +
          `${this.formatMaterialQuantity(
            material,
            material.maximumStock
          )} ${material.unitSymbol}.`
        );
        return;
      }

      const unitCost =
        Number(detail.unitCost);

      if (
        !Number.isFinite(unitCost) ||
        unitCost <= 0
      ) {
        this.errorMessage.set(
          `El costo unitario de ${material.name} debe ser mayor a cero.`
        );
        return;
      }
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.purchaseService.create({
      supplierId:
        raw.supplierId,

      invoiceNumber:
        raw.invoiceNumber.trim() ||
        null,

      purchaseDate:
        raw.purchaseDate
          ? new Date(
              `${raw.purchaseDate}T12:00:00`
            ).toISOString()
          : null,

      tax:
        this.roundMoney(
          Number(raw.tax)
        ),

      shippingCost:
        this.roundMoney(
          Number(raw.shippingCost)
        ),

      notes:
        raw.notes.trim(),

      details:
        raw.details.map(detail => ({
          rawMaterialId:
            detail.rawMaterialId,

          quantity:
            Number(detail.quantity),

          unitCost:
            this.roundNumber(
              Number(detail.unitCost),
              6
            )
        }))
    })
    .subscribe({
      next: response => {
        this.saving.set(false);
        this.formOpen.set(false);

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
          'No fue posible registrar la compra.'
        );
      }
    });
  }

  openDetail(
    purchase: Purchase
  ): void {
    this.selectedPurchase.set(
      purchase
    );

    this.detailModalOpen.set(true);
  }

  closeDetail(): void {
    this.detailModalOpen.set(false);
    this.selectedPurchase.set(null);
  }

  getMaterial(
    index: number
  ): RawMaterial | null {
    const materialId =
      this.details.at(index)
        .get('rawMaterialId')?.value;

    return this.materials().find(
      item => item.id === materialId
    ) ?? null;
  }

  getAvailableMaterials(
    currentIndex: number
  ): RawMaterial[] {
    const selectedIds =
      this.details.controls
        .map(
          (control, index) =>
            index === currentIndex
              ? null
              : control.get(
                  'rawMaterialId'
                )?.value
        )
        .filter(Boolean);

    return this.materials().filter(
      material =>
        !selectedIds.includes(
          material.id
        )
    );
  }

  getDetailSubtotal(
    index: number
  ): number {
    const raw =
      this.details.at(index)
        .getRawValue();

    return this.roundMoney(
      Number(raw.quantity || 0) *
      Number(raw.unitCost || 0)
    );
  }

  quantityStep(
    material: RawMaterial | null
  ): string {
    if (!material ||
        !material.unitAllowsDecimals) {
      return '1';
    }

    return this.minimumQuantity(
      material.unitDecimalPlaces
    ).toString();
  }

  formatMaterialQuantity(
    material: RawMaterial,
    value: number
  ): string {
    return value.toLocaleString(
      'es-MX',
      {
        minimumFractionDigits: 0,
        maximumFractionDigits:
          material.unitAllowsDecimals
            ? material.unitDecimalPlaces
            : 0
      }
    );
  }

  formatDetailQuantity(
    value: number,
    allowsDecimals: boolean,
    decimalPlaces: number
  ): string {
    return value.toLocaleString(
      'es-MX',
      {
        minimumFractionDigits: 0,
        maximumFractionDigits:
          allowsDecimals
            ? decimalPlaces
            : 0
      }
    );
  }

  private createDetailGroup() {
    const group =
      this.fb.nonNullable.group({
        rawMaterialId: [
          '',
          Validators.required
        ],

        quantity: [
          1,
          [
            Validators.required,
            Validators.min(0.0001)
          ]
        ],

        unitCost: [
          0,
          [
            Validators.required,
            Validators.min(0.000001),
            this.maximumDecimalPlacesValidator(6)
          ]
        ]
      });

    group.valueChanges.subscribe(() => {
      this.recalculateTotals();
    });

    return group;
  }

  private applyQuantityValidator(
    index: number,
    material: RawMaterial
  ): void {
    const quantityControl =
      this.details.at(index)
        .get('quantity');

    if (!quantityControl) {
      return;
    }

    const validators: ValidatorFn[] = [
      Validators.required,
      Validators.min(
        material.unitAllowsDecimals
          ? this.minimumQuantity(
              material.unitDecimalPlaces
            )
          : 1
      )
    ];

    if (!material.unitAllowsDecimals) {
      validators.push(
        this.integerValidator()
      );
    } else {
      validators.push(
        this.maximumDecimalPlacesValidator(
          material.unitDecimalPlaces
        )
      );
    }

    quantityControl.setValidators(
      validators
    );

    quantityControl.updateValueAndValidity({
      emitEvent: false
    });
  }

  private recalculateTotals(): void {
    const subtotal =
      this.details.controls.reduce(
        (total, control) => {
          const value =
            control.getRawValue();

          return total +
            (
              Number(value.quantity || 0) *
              Number(value.unitCost || 0)
            );
        },
        0
      );

    this.purchaseSubtotal.set(
      this.roundMoney(subtotal)
    );

    this.purchaseTotal.set(
      this.roundMoney(
        subtotal +
        Number(
          this.form.controls.tax.value || 0
        ) +
        Number(
          this.form.controls
            .shippingCost.value || 0
        )
      )
    );
  }

  private integerValidator(): ValidatorFn {
    return (
      control: AbstractControl
    ): ValidationErrors | null => {
      const value =
        Number(control.value);

      return Number.isInteger(value)
        ? null
        : { integer: true };
    };
  }

  private maximumDecimalPlacesValidator(
    maximumPlaces: number
  ): ValidatorFn {
    return (
      control: AbstractControl
    ): ValidationErrors | null => {
      const value =
        Number(control.value);

      if (!Number.isFinite(value)) {
        return {
          invalidNumber: true
        };
      }

      return this.decimalPlaces(value) <=
        maximumPlaces
        ? null
        : {
            decimalPlaces: {
              maximumPlaces
            }
          };
    };
  }

  private decimalPlaces(
    value: number
  ): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    const text = value.toString();

    if (text.includes('e-')) {
      return Number(
        text.split('e-')[1] ?? 0
      );
    }

    return text.split('.')[1]?.length ?? 0;
  }

  private minimumQuantity(
    decimalPlaces: number
  ): number {
    return 1 / (
      10 ** decimalPlaces
    );
  }

  private roundMoney(
    value: number
  ): number {
    return this.roundNumber(
      value,
      2
    );
  }

  private roundNumber(
    value: number,
    decimalPlaces: number
  ): number {
    const factor =
      10 ** decimalPlaces;

    return Math.round(
      (value + Number.EPSILON) *
      factor
    ) / factor;
  }

  private getCurrentDate(): string {
    const now = new Date();

    const offset =
      now.getTimezoneOffset();

    const local =
      new Date(
        now.getTime() -
        offset * 60_000
      );

    return local
      .toISOString()
      .slice(0, 10);
  }

  private clearSuccessMessageLater(): void {
    window.setTimeout(() => {
      this.successMessage.set('');
    }, 4000);
  }
}
