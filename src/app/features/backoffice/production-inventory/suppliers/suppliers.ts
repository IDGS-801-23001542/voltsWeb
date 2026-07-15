import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Supplier,
  SupplierMaterialCategory,
  SupplierType
} from '../../../../core/models/supplier.model';

import {
  AuthService
} from '../../../../core/services/auth.service';

import {
  SupplierService
} from '../../../../core/services/supplier.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './suppliers.html',
  styleUrl: './suppliers.css'
})
export class Suppliers implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly supplierService =
    inject(SupplierService);

  readonly auth = inject(AuthService);

  readonly suppliers = signal<Supplier[]>([]);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deleting = signal(false);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly searchTerm = signal('');
  readonly statusFilter = signal('all');

  readonly formOpen = signal(false);

  readonly editingSupplier =
    signal<Supplier | null>(null);

  readonly deleteCandidate =
    signal<Supplier | null>(null);

  readonly isAdmin = computed(() =>
    this.auth.hasRole('Admin')
  );

  readonly activeCount = computed(() =>
    this.suppliers().filter(
      supplier => supplier.isActive
    ).length
  );

  readonly inactiveCount = computed(() =>
    this.suppliers().filter(
      supplier => !supplier.isActive
    ).length
  );

  readonly filteredSuppliers = computed(() => {
    const search = this.searchTerm()
      .trim()
      .toLowerCase();

    const status = this.statusFilter();

    return this.suppliers().filter(supplier => {
      const matchesSearch =
        !search ||
        supplier.name.toLowerCase().includes(search) ||
        supplier.code.toLowerCase().includes(search) ||
        supplier.email.toLowerCase().includes(search) ||
        supplier.contactName.toLowerCase().includes(search) ||
        supplier.taxId.toLowerCase().includes(search);

      const matchesStatus =
        status === 'all' ||
        (
          status === 'active' &&
          supplier.isActive
        ) ||
        (
          status === 'inactive' &&
          !supplier.isActive
        );

      return matchesSearch && matchesStatus;
    });
  });

  readonly supplierTypes: Array<{
    value: SupplierType;
    label: string;
  }> = [
    { value: 'Electronics', label: 'Electrónica' },
    { value: 'Cardboard', label: 'Cartón' },
    { value: 'Textiles', label: 'Textiles' },
    { value: 'Adhesives', label: 'Adhesivos' },
    { value: 'Mechanical', label: 'Mecánica' },
    { value: 'Soldering', label: 'Soldadura' },
    { value: 'Packaging', label: 'Empaque' },
    { value: 'General', label: 'General' }
  ];

  readonly materialCategories: Array<{
    value: SupplierMaterialCategory;
    label: string;
  }> = [
    { value: 'Cardboard', label: 'Cartón' },
    { value: 'Electronics', label: 'Electrónica' },
    { value: 'Mechanical', label: 'Mecánica' },
    { value: 'Textiles', label: 'Textiles' },
    { value: 'Adhesives', label: 'Adhesivos' },
    { value: 'Consumables', label: 'Consumibles' },
    { value: 'Soldering', label: 'Soldadura' },
    { value: 'Packaging', label: 'Empaque' },
    { value: 'Other', label: 'Otros' }
  ];

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
        Validators.minLength(2),
        Validators.maxLength(150)
      ]
    ],

    legalName: [
      '',
      Validators.maxLength(200)
    ],

    taxId: [
      '',
      Validators.maxLength(20)
    ],

    contactName: [
      '',
      [
        Validators.required,
        Validators.maxLength(150)
      ]
    ],

    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    phone: [
      '',
      Validators.pattern(/^[0-9+\-\s()]{7,25}$/)
    ],

    supplierType: [
      'General' as SupplierType,
      Validators.required
    ],

    materialCategories: [
      [] as SupplierMaterialCategory[]
    ],

    leadTimeDays: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(365)
      ]
    ],

    paymentTerms: [
      '',
      Validators.maxLength(300)
    ],

    notes: [
      '',
      Validators.maxLength(1000)
    ],

    street: [
      '',
      [
        Validators.required,
        Validators.maxLength(150)
      ]
    ],

    exteriorNumber: [
      '',
      [
        Validators.required,
        Validators.maxLength(20)
      ]
    ],

    interiorNumber: [
      '',
      Validators.maxLength(20)
    ],

    neighborhood: [
      '',
      [
        Validators.required,
        Validators.maxLength(120)
      ]
    ],

    postalCode: [
      '',
      [
        Validators.required,
        Validators.pattern(/^\d{5}$/)
      ]
    ],

    city: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],

    state: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],

    country: [
      'México',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],

    references: [
      '',
      Validators.maxLength(500)
    ],

    isActive: [true]
  });

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.supplierService.getAll().subscribe({
      next: response => {
        this.suppliers.set(
          response.data ?? []
        );

        this.loading.set(false);
      },

      error: error => {
        this.loading.set(false);

        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible cargar los proveedores.'
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
    this.editingSupplier.set(null);

    this.form.reset({
      code: '',
      name: '',
      legalName: '',
      taxId: '',
      contactName: '',
      email: '',
      phone: '',
      supplierType: 'General',
      materialCategories: [],
      leadTimeDays: 0,
      paymentTerms: '',
      notes: '',
      street: '',
      exteriorNumber: '',
      interiorNumber: '',
      neighborhood: '',
      postalCode: '',
      city: '',
      state: '',
      country: 'México',
      references: '',
      isActive: true
    });

    this.errorMessage.set('');
    this.successMessage.set('');
    this.formOpen.set(true);
  }

  openEditForm(
    supplier: Supplier
  ): void {
    this.editingSupplier.set(supplier);

    this.form.reset({
      code: supplier.code,
      name: supplier.name,
      legalName: supplier.legalName,
      taxId: supplier.taxId,
      contactName: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone ?? '',
      supplierType: supplier.supplierType,
      materialCategories:
        supplier.materialCategories ?? [],
      leadTimeDays: supplier.leadTimeDays,
      paymentTerms: supplier.paymentTerms,
      notes: supplier.notes,
      street: supplier.address?.street ?? '',
      exteriorNumber:
        supplier.address?.exteriorNumber ?? '',
      interiorNumber:
        supplier.address?.interiorNumber ?? '',
      neighborhood:
        supplier.address?.neighborhood ?? '',
      postalCode:
        supplier.address?.postalCode ?? '',
      city:
        supplier.address?.city ?? '',
      state:
        supplier.address?.state ?? '',
      country:
        supplier.address?.country ?? 'México',
      references:
        supplier.address?.references ?? '',
      isActive: supplier.isActive
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
    this.editingSupplier.set(null);
  }

  toggleMaterialCategory(
    category: SupplierMaterialCategory
  ): void {
    const current =
      this.form.controls
        .materialCategories.value;

    const exists =
      current.includes(category);

    this.form.controls
      .materialCategories
      .setValue(
        exists
          ? current.filter(
              item => item !== category
            )
          : [
              ...current,
              category
            ]
      );
  }

  hasMaterialCategory(
    category: SupplierMaterialCategory
  ): boolean {
    return this.form.controls
      .materialCategories.value
      .includes(category);
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

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const request = {
      code: raw.code.trim(),
      name: raw.name.trim(),
      legalName: raw.legalName.trim(),
      taxId: raw.taxId.trim(),
      contactName: raw.contactName.trim(),
      email: raw.email.trim().toLowerCase(),
      phone: raw.phone.trim() || null,

      address: {
        street: raw.street.trim(),
        exteriorNumber:
          raw.exteriorNumber.trim(),
        interiorNumber:
          raw.interiorNumber.trim() || null,
        neighborhood:
          raw.neighborhood.trim(),
        postalCode:
          raw.postalCode.trim(),
        city:
          raw.city.trim(),
        state:
          raw.state.trim(),
        country:
          raw.country.trim(),
        references:
          raw.references.trim() || null
      },

      supplierType:
        raw.supplierType,

      materialCategories:
        raw.materialCategories,

      leadTimeDays:
        Number(raw.leadTimeDays),

      paymentTerms:
        raw.paymentTerms.trim(),

      notes:
        raw.notes.trim()
    };

    const editing =
      this.editingSupplier();

    const operation =
      editing
        ? this.supplierService.update(
            editing.id,
            {
              ...request,
              isActive: raw.isActive
            }
          )
        : this.supplierService.create(
            request
          );

    operation.subscribe({
      next: response => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.editingSupplier.set(null);

        this.successMessage.set(
          response.message
        );

        this.loadSuppliers();
        this.clearSuccessMessageLater();
      },

      error: error => {
        this.saving.set(false);

        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible guardar el proveedor.'
        );
      }
    });
  }

  toggleStatus(
    supplier: Supplier
  ): void {
    this.supplierService
      .updateStatus(
        supplier.id,
        !supplier.isActive
      )
      .subscribe({
        next: response => {
          this.successMessage.set(
            response.message
          );

          this.loadSuppliers();
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
    supplier: Supplier
  ): void {
    if (!this.isAdmin()) {
      return;
    }

    this.deleteCandidate.set(
      supplier
    );
  }

  cancelDelete(): void {
    if (!this.deleting()) {
      this.deleteCandidate.set(null);
    }
  }

  confirmDelete(): void {
    const supplier =
      this.deleteCandidate();

    if (
      !supplier ||
      this.deleting() ||
      !this.isAdmin()
    ) {
      return;
    }

    this.deleting.set(true);

    this.supplierService
      .delete(supplier.id)
      .subscribe({
        next: response => {
          this.deleting.set(false);
          this.deleteCandidate.set(null);

          this.successMessage.set(
            response.message
          );

          this.loadSuppliers();
          this.clearSuccessMessageLater();
        },

        error: error => {
          this.deleting.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible eliminar el proveedor.'
          );
        }
      });
  }

  getSupplierTypeLabel(
    value: SupplierType
  ): string {
    return this.supplierTypes.find(
      item => item.value === value
    )?.label ?? value;
  }

  formatAddress(
    supplier: Supplier
  ): string {
    const address = supplier.address;

    if (!address) {
      return 'Sin dirección';
    }

    const number =
      address.interiorNumber
        ? `${address.exteriorNumber} Int. ${address.interiorNumber}`
        : address.exteriorNumber;

    return [
      `${address.street} ${number}`,
      address.neighborhood,
      `${address.city}, ${address.state}`,
      `CP ${address.postalCode}`,
      address.country
    ]
      .filter(Boolean)
      .join(', ');
  }

  private clearSuccessMessageLater(): void {
    window.setTimeout(() => {
      this.successMessage.set('');
    }, 3500);
  }
}
