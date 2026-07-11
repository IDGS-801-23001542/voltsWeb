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
  RawMaterial
} from '../../../core/models/raw-material.model';

import {
  Waste,
  WasteAction,
  WasteClassification,
  WasteDestination,
  WasteSummary
} from '../../../core/models/waste.model';

import {
  RawMaterialService
} from '../../../core/services/raw-material.service';

import {
  WasteService
} from '../../../core/services/waste.service';

@Component({
  selector: 'app-waste',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule
  ],
  templateUrl: './waste.html',
  styleUrl: './waste.css'
})
export class WasteManagement implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly wasteService =
    inject(WasteService);

  private readonly rawMaterialService =
    inject(RawMaterialService);

  readonly wastes = signal<Waste[]>([]);
  readonly materials = signal<RawMaterial[]>([]);

  readonly summary =
    signal<WasteSummary | null>(null);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly processing = signal(false);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly searchTerm = signal('');
  readonly classificationFilter = signal('all');
  readonly statusFilter = signal('all');

  readonly createModalOpen = signal(false);
  readonly dispositionModalOpen = signal(false);
  readonly detailModalOpen = signal(false);

  readonly selectedWaste =
    signal<Waste | null>(null);

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
      label: 'Retrabajo o reparación'
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

  readonly actions: Array<{
    value: WasteAction;
    label: string;
  }> = [
    {
      value: 'Reuse',
      label: 'Utilizar en producción'
    },
    {
      value: 'Sell',
      label: 'Vender'
    },
    {
      value: 'Recycle',
      label: 'Enviar a reciclaje'
    },
    {
      value: 'Repair',
      label: 'Reparar o retrabajar'
    },
    {
      value: 'Discard',
      label: 'Desechar definitivamente'
    }
  ];

  readonly filteredWastes = computed(() => {
    const search = this.searchTerm()
      .trim()
      .toLowerCase();

    const classification =
      this.classificationFilter();

    const status =
      this.statusFilter();

    return this.wastes().filter(waste => {
      const matchesSearch =
        !search ||
        waste.rawMaterialName
          .toLowerCase()
          .includes(search) ||
        waste.rawMaterialCode
          .toLowerCase()
          .includes(search) ||
        (
          waste.productionFolio ?? ''
        )
          .toLowerCase()
          .includes(search) ||
        waste.reason
          .toLowerCase()
          .includes(search);

      const matchesClassification =
        classification === 'all' ||
        waste.classification === classification;

      const matchesStatus =
        status === 'all' ||
        (
          status === 'available' &&
          waste.availableQuantity > 0
        ) ||
        (
          status === 'completed' &&
          waste.availableQuantity <= 0
        );

      return (
        matchesSearch &&
        matchesClassification &&
        matchesStatus
      );
    });
  });

  readonly createForm =
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
        'FinalWaste' as WasteClassification,
        Validators.required
      ],

      destination: [
        'Pending' as WasteDestination,
        Validators.required
      ],

      reason: [
        '',
        [
          Validators.required,
          Validators.maxLength(500)
        ]
      ],

      notes: [
        '',
        Validators.maxLength(1000)
      ],

      estimatedRecoveryValue: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ]
    });

  readonly dispositionForm =
    this.fb.nonNullable.group({
      quantity: [
        0.01,
        [
          Validators.required,
          Validators.min(0.0001)
        ]
      ],

      action: [
        'Reuse' as WasteAction,
        Validators.required
      ],

      recoveredValue: [
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
    });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      wastes:
        this.wasteService.getAll(),

      summary:
        this.wasteService.getSummary(),

      materials:
        this.rawMaterialService.getAll()
    }).subscribe({
      next: response => {
        this.wastes.set(
          response.wastes.data ?? []
        );

        this.summary.set(
          response.summary.data
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
          'No fue posible cargar la merma.'
        );
      }
    });
  }

  updateSearch(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    this.searchTerm.set(input.value);
  }

  updateClassificationFilter(
    event: Event
  ): void {
    const select =
      event.target as HTMLSelectElement;

    this.classificationFilter.set(
      select.value
    );
  }

  updateStatusFilter(event: Event): void {
    const select =
      event.target as HTMLSelectElement;

    this.statusFilter.set(select.value);
  }

  openCreateModal(): void {
    this.createForm.reset({
      rawMaterialId: '',
      quantity: 0.01,
      classification: 'FinalWaste',
      destination: 'Pending',
      reason: '',
      notes: '',
      estimatedRecoveryValue: 0
    });

    this.errorMessage.set('');
    this.createModalOpen.set(true);
  }

  closeCreateModal(): void {
    if (!this.saving()) {
      this.createModalOpen.set(false);
    }
  }

  submitCreate(): void {
    if (
      this.createForm.invalid ||
      this.saving()
    ) {
      this.createForm.markAllAsTouched();
      return;
    }

    const value =
      this.createForm.getRawValue();

    this.saving.set(true);
    this.errorMessage.set('');

    this.wasteService
      .create({
        rawMaterialId:
          value.rawMaterialId,

        quantity:
          Number(value.quantity),

        classification:
          value.classification,

        destination:
          value.destination,

        reason:
          value.reason.trim(),

        notes:
          value.notes.trim(),

        estimatedRecoveryValue:
          Number(
            value.estimatedRecoveryValue
          )
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
            'No fue posible registrar la merma.'
          );
        }
      });
  }

  openDispositionModal(waste: Waste): void {
    if (waste.availableQuantity <= 0) {
      return;
    }

    this.selectedWaste.set(waste);

    this.dispositionForm.reset({
      quantity: waste.availableQuantity,
      action: 'Reuse',
      recoveredValue: 0,
      notes: ''
    });

    this.dispositionModalOpen.set(true);
  }

  closeDispositionModal(): void {
    if (!this.processing()) {
      this.dispositionModalOpen.set(false);
      this.selectedWaste.set(null);
    }
  }

  submitDisposition(): void {
    const waste = this.selectedWaste();

    if (
      !waste ||
      this.dispositionForm.invalid ||
      this.processing()
    ) {
      this.dispositionForm.markAllAsTouched();
      return;
    }

    const value =
      this.dispositionForm.getRawValue();

    if (
      Number(value.quantity) >
      waste.availableQuantity
    ) {
      this.errorMessage.set(
        `Solo hay ${waste.availableQuantity} ${waste.unit} disponibles.`
      );

      return;
    }

    this.processing.set(true);
    this.errorMessage.set('');

    this.wasteService
      .dispose(
        waste.id,
        {
          quantity:
            Number(value.quantity),

          action:
            value.action,

          recoveredValue:
            Number(value.recoveredValue),

          notes:
            value.notes.trim()
        }
      )
      .subscribe({
        next: response => {
          this.processing.set(false);
          this.dispositionModalOpen.set(false);
          this.selectedWaste.set(null);

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
            'No fue posible procesar la merma.'
          );
        }
      });
  }

  openDetail(waste: Waste): void {
    this.selectedWaste.set(waste);
    this.detailModalOpen.set(true);
  }

  closeDetail(): void {
    this.detailModalOpen.set(false);
    this.selectedWaste.set(null);
  }

  getClassificationLabel(
    value: WasteClassification
  ): string {
    return this.classifications.find(
      item => item.value === value
    )?.label ?? value;
  }

  getDestinationLabel(
    value: WasteDestination
  ): string {
    return this.destinations.find(
      item => item.value === value
    )?.label ?? value;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Available':
        return 'Disponible';

      case 'PartiallyUsed':
        return 'Uso parcial';

      case 'Consumed':
        return 'Reutilizada';

      case 'Sold':
        return 'Vendida';

      case 'Recycled':
        return 'Reciclada';

      case 'Reworked':
        return 'Retrabajada';

      case 'Discarded':
        return 'Desechada';

      default:
        return status;
    }
  }

  private clearSuccessMessageLater(): void {
    window.setTimeout(() => {
      this.successMessage.set('');
    }, 4000);
  }
}
