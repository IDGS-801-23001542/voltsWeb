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
  Product
} from '../../../../core/models/product.model';

import {
  ProductionOrder,
  ProductionStatus,
  WasteClassification,
  WasteDestination
} from '../../../../core/models/production.model';

import {
  ProductService
} from '../../../../core/services/product.service';

import {
  ProductionService
} from '../../../../core/services/production.service';

interface ProductionWasteFormValue {
  rawMaterialId: string;
  quantity: number;
  classification: WasteClassification;
  destination: WasteDestination;
  estimatedRecoveryValue: number;
  notes: string;
}

@Component({
  selector: 'app-production',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule
  ],
  templateUrl: './production.html',
  styleUrl: './production.css'
})
export class Production implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly productionService =
    inject(ProductionService);

  private readonly productService =
    inject(ProductService);

  readonly orders =
    signal<ProductionOrder[]>([]);

  readonly products =
    signal<Product[]>([]);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly processing = signal(false);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly searchTerm = signal('');
  readonly statusFilter = signal('all');

  readonly createModalOpen = signal(false);
  readonly detailModalOpen = signal(false);
  readonly completeModalOpen = signal(false);
  readonly cancelModalOpen = signal(false);

  readonly selectedOrder =
    signal<ProductionOrder | null>(null);

  readonly createdCount = computed(() =>
    this.orders().filter(
      order => order.status === 'Created'
    ).length
  );

  readonly inProgressCount = computed(() =>
    this.orders().filter(
      order => order.status === 'InProgress'
    ).length
  );

  readonly completedCount = computed(() =>
    this.orders().filter(
      order => order.status === 'Completed'
    ).length
  );

  readonly totalFinished = computed(() =>
    this.orders().reduce(
      (total, order) =>
        total + order.quantityCompleted,
      0
    )
  );

  readonly filteredOrders = computed(() => {
    const search = this.searchTerm()
      .trim()
      .toLowerCase();

    const status = this.statusFilter();

    return this.orders().filter(order => {
      const matchesSearch =
        !search ||
        order.folio
          .toLowerCase()
          .includes(search) ||
        order.productName
          .toLowerCase()
          .includes(search) ||
        order.recipeCode
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        status === 'all' ||
        order.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  readonly classifications: Array<{
    value: WasteClassification;
    label: string;
  }> = [
    {
      value: 'Reusable',
      label: 'Reutilizable'
    },
    {
      value: 'Recyclable',
      label: 'Reciclable'
    },
    {
      value: 'Sellable',
      label: 'Vendible'
    },
    {
      value: 'Rework',
      label: 'Reparación o retrabajo'
    },
    {
      value: 'FinalWaste',
      label: 'Desecho final'
    }
  ];

  readonly destinations: Array<{
    value: WasteDestination;
    label: string;
  }> = [
    {
      value: 'Pending',
      label: 'Pendiente'
    },
    {
      value: 'Reuse',
      label: 'Reutilizar'
    },
    {
      value: 'Sell',
      label: 'Vender'
    },
    {
      value: 'Recycle',
      label: 'Reciclar'
    },
    {
      value: 'Repair',
      label: 'Reparar'
    },
    {
      value: 'Discard',
      label: 'Desechar'
    }
  ];

  readonly createForm =
    this.fb.nonNullable.group({
      productId: [
        '',
        Validators.required
      ],

      quantity: [
        1,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      notes: [
        '',
        Validators.maxLength(1000)
      ]
    });

  readonly completeForm =
    this.fb.nonNullable.group({
      quantityCompleted: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      quantityDefective: [
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

      wastes: this.fb.array([])
    });

  readonly cancelForm =
    this.fb.nonNullable.group({
      reason: [
        '',
        [
          Validators.required,
          Validators.maxLength(500)
        ]
      ]
    });

  get wastes(): FormArray {
    return this.completeForm.controls.wastes;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.productionService
      .getAll()
      .subscribe({
        next: response => {
          this.orders.set(
            response.data ?? []
          );

          this.loadProducts();
        },

        error: error => {
          this.loading.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible cargar las órdenes de producción.'
          );
        }
      });
  }

  private loadProducts(): void {
    this.productService
      .getAll()
      .subscribe({
        next: response => {
          this.products.set(
            (response.data ?? []).filter(
              product =>
                product.isActive &&
                product.canBeProduced
            )
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

    this.searchTerm.set(input.value);
  }

  updateStatusFilter(
    event: Event
  ): void {
    const select =
      event.target as HTMLSelectElement;

    this.statusFilter.set(
      select.value
    );
  }

  openCreateModal(): void {
    this.createForm.reset({
      productId: '',
      quantity: 1,
      notes: ''
    });

    this.errorMessage.set('');
    this.createModalOpen.set(true);
  }

  closeCreateModal(): void {
    if (this.saving()) {
      return;
    }

    this.createModalOpen.set(false);
  }

  submitCreate(): void {
    if (
      this.createForm.invalid ||
      this.saving()
    ) {
      this.createForm.markAllAsTouched();
      return;
    }

    const values =
      this.createForm.getRawValue();

    this.saving.set(true);
    this.errorMessage.set('');

    this.productionService
      .create({
        productId:
          values.productId,

        quantity:
          Number(values.quantity),

        notes:
          values.notes.trim()
      })
      .subscribe({
        next: response => {
          this.saving.set(false);
          this.createModalOpen.set(false);

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
            'No fue posible crear la orden.'
          );
        }
      });
  }

  openDetail(
    order: ProductionOrder
  ): void {
    this.selectedOrder.set(order);
    this.detailModalOpen.set(true);
  }

  closeDetail(): void {
    this.detailModalOpen.set(false);
    this.selectedOrder.set(null);
  }

  startProduction(
    order: ProductionOrder
  ): void {
    if (
      this.processing() ||
      order.status !== 'Created'
    ) {
      return;
    }

    const confirmed = window.confirm(
      `¿Iniciar ${order.folio}? Se descontará la materia prima requerida.`
    );

    if (!confirmed) {
      return;
    }

    this.processing.set(true);
    this.errorMessage.set('');

    this.productionService
      .start(order.id)
      .subscribe({
        next: response => {
          this.processing.set(false);

          this.successMessage.set(
            response.message
          );

          this.loadData();
          this.clearSuccessMessageLater();
        },

        error: error => {
          this.processing.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible iniciar la producción.'
          );
        }
      });
  }

  openCompleteModal(
    order: ProductionOrder
  ): void {
    this.selectedOrder.set(order);

    this.completeForm.patchValue({
      quantityCompleted:
        order.quantityPlanned,

      quantityDefective:
        0,

      notes:
        ''
    });

    this.wastes.clear();

    this.errorMessage.set('');
    this.completeModalOpen.set(true);
  }

  closeCompleteModal(): void {
    if (this.processing()) {
      return;
    }

    this.completeModalOpen.set(false);
    this.selectedOrder.set(null);
    this.wastes.clear();
  }

  addWaste(): void {
    const order = this.selectedOrder();

    if (!order) {
      return;
    }

    this.wastes.push(
      this.fb.nonNullable.group({
        rawMaterialId: [
          '',
          Validators.required
        ],

        quantity: [
          0.01,
          [
            Validators.required,
            Validators.min(0.0001)
          ]
        ],

        classification: [
          'Reusable' as WasteClassification,
          Validators.required
        ],

        destination: [
          'Pending' as WasteDestination,
          Validators.required
        ],

        estimatedRecoveryValue: [
          0,
          [
            Validators.required,
            Validators.min(0)
          ]
        ],

        notes: [
          '',
          Validators.maxLength(500)
        ]
      })
    );
  }

  removeWaste(
    index: number
  ): void {
    this.wastes.removeAt(index);
  }

  submitComplete(): void {
    const order =
      this.selectedOrder();

    if (
      !order ||
      this.completeForm.invalid ||
      this.processing()
    ) {
      this.completeForm.markAllAsTouched();
      return;
    }

    const values =
      this.completeForm.getRawValue();

    const totalResults =
      Number(
        values.quantityCompleted
      ) +
      Number(
        values.quantityDefective
      );

    if (
      totalResults !==
      order.quantityPlanned
    ) {
      this.errorMessage.set(
        `La suma de productos correctos y defectuosos debe ser ${order.quantityPlanned}.`
      );

      return;
    }

    const wasteValues = (
      this.wastes.getRawValue()
    ) as ProductionWasteFormValue[];

    const wastes = wasteValues.map(
      (
        waste: ProductionWasteFormValue
      ) => ({
        rawMaterialId:
          waste.rawMaterialId,

        quantity:
          Number(waste.quantity),

        classification:
          waste.classification,

        destination:
          waste.destination,

        estimatedRecoveryValue:
          Number(
            waste.estimatedRecoveryValue
          ),

        notes:
          waste.notes.trim()
      })
    );

    this.processing.set(true);
    this.errorMessage.set('');

    this.productionService
      .complete(
        order.id,
        {
          quantityCompleted:
            Number(
              values.quantityCompleted
            ),

          quantityDefective:
            Number(
              values.quantityDefective
            ),

          notes:
            values.notes.trim(),

          wastes
        }
      )
      .subscribe({
        next: response => {
          this.processing.set(false);
          this.completeModalOpen.set(false);
          this.selectedOrder.set(null);
          this.wastes.clear();

          this.successMessage.set(
            response.message
          );

          this.loadData();
          this.clearSuccessMessageLater();
        },

        error: error => {
          this.processing.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible completar la producción.'
          );
        }
      });
  }

  openCancelModal(
    order: ProductionOrder
  ): void {
    this.selectedOrder.set(order);

    this.cancelForm.reset({
      reason: ''
    });

    this.errorMessage.set('');
    this.cancelModalOpen.set(true);
  }

  closeCancelModal(): void {
    if (this.processing()) {
      return;
    }

    this.cancelModalOpen.set(false);
    this.selectedOrder.set(null);
  }

  submitCancel(): void {
    const order =
      this.selectedOrder();

    if (
      !order ||
      this.cancelForm.invalid ||
      this.processing()
    ) {
      this.cancelForm.markAllAsTouched();
      return;
    }

    this.processing.set(true);
    this.errorMessage.set('');

    this.productionService
      .cancel(
        order.id,
        {
          reason:
            this.cancelForm.controls
              .reason.value
              .trim()
        }
      )
      .subscribe({
        next: response => {
          this.processing.set(false);
          this.cancelModalOpen.set(false);
          this.selectedOrder.set(null);

          this.successMessage.set(
            response.message
          );

          this.loadData();
          this.clearSuccessMessageLater();
        },

        error: error => {
          this.processing.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible cancelar la orden.'
          );
        }
      });
  }

  getStatusLabel(
    status: ProductionStatus
  ): string {
    switch (status) {
      case 'Created':
        return 'Creada';

      case 'InProgress':
        return 'En proceso';

      case 'Completed':
        return 'Completada';

      case 'Cancelled':
        return 'Cancelada';

      default:
        return status;
    }
  }

  getClassificationLabel(
    value: WasteClassification
  ): string {
    return this.classifications.find(
      item =>
        item.value === value
    )?.label ?? value;
  }

  getDestinationLabel(
    value: WasteDestination
  ): string {
    return this.destinations.find(
      item =>
        item.value === value
    )?.label ?? value;
  }

  private clearSuccessMessageLater(): void {
    window.setTimeout(() => {
      this.successMessage.set('');
    }, 4000);
  }
}
