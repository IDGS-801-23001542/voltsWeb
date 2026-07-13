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
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
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

      return (
        matchesSearch &&
        matchesSupplier
      );
    });
  });

  readonly form = this.fb.nonNullable.group({
    supplierId: [
      '',
      Validators.required
    ],

    invoiceNumber: [''],

    purchaseDate: [
      this.getCurrentDate()
    ],

    tax: [
      0,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],

    shippingCost: [
      0,
      [
        Validators.required,
        Validators.min(0)
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

  readonly purchaseSubtotal = computed(() => {
    return this.details.controls.reduce(
      (total, control) => {
        const value = control.getRawValue();

        return total +
          (
            Number(value.quantity) *
            Number(value.unitCost)
          );
      },
      0
    );
  });

  readonly purchaseTotal = computed(() => {
    return (
      this.purchaseSubtotal() +
      Number(this.form.controls.tax.value) +
      Number(
        this.form.controls.shippingCost.value
      )
    );
  });

  ngOnInit(): void {
    this.loadData();
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
  }

  materialChanged(index: number): void {
    const control = this.details.at(index);

    const materialId =
      control.get('rawMaterialId')?.value;

    const material = this.materials()
      .find(item => item.id === materialId);

    if (!material) {
      return;
    }

    control.patchValue({
      unitCost:
        material.lastPurchaseCost > 0
          ? material.lastPurchaseCost
          : material.averageCost
    });
  }

  getMaterial(
    materialId: string
  ): RawMaterial | undefined {
    return this.materials()
      .find(material =>
        material.id === materialId
      );
  }

  getDetailSubtotal(index: number): number {
    const detail =
      this.details.at(index).getRawValue();

    return (
      Number(detail.quantity) *
      Number(detail.unitCost)
    );
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

    const repeatedMaterials =
      values.details
        .map(detail =>
          detail.rawMaterialId
        )
        .filter(
          (
            materialId,
            index,
            collection
          ) =>
            collection.indexOf(
              materialId
            ) !== index
        );

    if (repeatedMaterials.length > 0) {
      this.errorMessage.set(
        'No puedes agregar dos veces la misma materia prima.'
      );

      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const request = {
      supplierId:
        values.supplierId,

      invoiceNumber:
        values.invoiceNumber.trim() ||
        null,

      purchaseDate:
        values.purchaseDate
          ? new Date(
              `${values.purchaseDate}T12:00:00`
            ).toISOString()
          : null,

      tax:
        Number(values.tax),

      shippingCost:
        Number(values.shippingCost),

      notes:
        values.notes.trim(),

      details:
        values.details.map(detail => ({
          rawMaterialId:
            detail.rawMaterialId,

          quantity:
            Number(detail.quantity),

          unitCost:
            Number(detail.unitCost)
        }))
    };

    this.purchaseService
      .create(request)
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

  openDetails(purchase: Purchase): void {
    this.selectedPurchase.set(purchase);
    this.detailModalOpen.set(true);
  }

  closeDetails(): void {
    this.detailModalOpen.set(false);
    this.selectedPurchase.set(null);
  }

  private createDetailGroup() {
    return this.fb.nonNullable.group({
      rawMaterialId: [
        '',
        Validators.required
      ],

      quantity: [
        1,
        [
          Validators.required,
          Validators.min(0.01)
        ]
      ],

      unitCost: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ]
    });
  }

  private getCurrentDate(): string {
    const date = new Date();

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private clearSuccessMessageLater(): void {
    window.setTimeout(() => {
      this.successMessage.set('');
    }, 4000);
  }
}
