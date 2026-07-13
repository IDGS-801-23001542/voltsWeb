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
  AuthService
} from '../../../../core/services/auth.service';

import {
  SupplierService
} from '../../../../core/services/supplier.service';

import {
  Supplier,
  SupplierMaterialCategory,
  SupplierType
} from '../../../../core/models/supplier.model';

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
  readonly typeFilter = signal('all');
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

  readonly averageLeadTime = computed(() => {
    const suppliers = this.suppliers();

    if (suppliers.length === 0) {
      return 0;
    }

    const total = suppliers.reduce(
      (sum, supplier) =>
        sum + supplier.leadTimeDays,
      0
    );

    return Math.round(total / suppliers.length);
  });

  readonly supplierTypes: Array<{
    value: SupplierType;
    label: string;
  }> = [
    {
      value: 'Electronics',
      label: 'Electrónica'
    },
    {
      value: 'Cardboard',
      label: 'Cartón'
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
      value: 'Mechanical',
      label: 'Mecánica'
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
      value: 'General',
      label: 'General'
    }
  ];

  readonly materialCategories: Array<{
    value: SupplierMaterialCategory;
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

  readonly filteredSuppliers = computed(() => {
    const search = this.searchTerm()
      .trim()
      .toLowerCase();

    const type = this.typeFilter();
    const status = this.statusFilter();

    return this.suppliers().filter(supplier => {
      const matchesSearch =
        !search ||
        supplier.name
          .toLowerCase()
          .includes(search) ||
        supplier.code
          .toLowerCase()
          .includes(search) ||
        supplier.contactName
          .toLowerCase()
          .includes(search) ||
        supplier.email
          .toLowerCase()
          .includes(search) ||
        supplier.taxId
          .toLowerCase()
          .includes(search);

      const matchesType =
        type === 'all' ||
        supplier.supplierType === type;

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

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
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
      Validators.maxLength(30)
    ],

    address: [
      '',
      Validators.maxLength(300)
    ],

    city: [
      '',
      Validators.maxLength(100)
    ],

    state: [
      '',
      Validators.maxLength(100)
    ],

    postalCode: [
      '',
      Validators.maxLength(10)
    ],

    supplierType: [
      'General' as SupplierType,
      Validators.required
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
      Validators.maxLength(200)
    ],

    notes: [
      '',
      Validators.maxLength(1000)
    ],

    isActive: [true]
  });

  readonly selectedCategories =
    signal<SupplierMaterialCategory[]>([]);

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.supplierService.getAll().subscribe({
      next: response => {
        this.suppliers.set(response.data ?? []);
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

  updateTypeFilter(event: Event): void {
    const select =
      event.target as HTMLSelectElement;

    this.typeFilter.set(select.value);
  }

  updateStatusFilter(event: Event): void {
    const select =
      event.target as HTMLSelectElement;

    this.statusFilter.set(select.value);
  }

  openCreateForm(): void {
    this.editingSupplier.set(null);
    this.selectedCategories.set([]);

    this.form.reset({
      code: '',
      name: '',
      legalName: '',
      taxId: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      supplierType: 'General',
      leadTimeDays: 0,
      paymentTerms: '',
      notes: '',
      isActive: true
    });

    this.formOpen.set(true);
  }

  openEditForm(supplier: Supplier): void {
    this.editingSupplier.set(supplier);

    this.selectedCategories.set(
      supplier.materialCategories ?? []
    );

    this.form.reset({
      code: supplier.code,
      name: supplier.name,
      legalName: supplier.legalName,
      taxId: supplier.taxId,
      contactName: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone ?? '',
      address: supplier.address ?? '',
      city: supplier.city ?? '',
      state: supplier.state ?? '',
      postalCode: supplier.postalCode ?? '',
      supplierType: supplier.supplierType,
      leadTimeDays: supplier.leadTimeDays,
      paymentTerms: supplier.paymentTerms,
      notes: supplier.notes,
      isActive: supplier.isActive
    });

    this.formOpen.set(true);
  }

  closeForm(): void {
    if (this.saving()) {
      return;
    }

    this.formOpen.set(false);
    this.editingSupplier.set(null);
    this.selectedCategories.set([]);
  }

  toggleCategory(
    category: SupplierMaterialCategory
  ): void {
    this.selectedCategories.update(
      selected =>
        selected.includes(category)
          ? selected.filter(
              item => item !== category
            )
          : [...selected, category]
    );
  }

  categorySelected(
    category: SupplierMaterialCategory
  ): boolean {
    return this.selectedCategories()
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

    const values = this.form.getRawValue();

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const request = {
      code: values.code.trim(),
      name: values.name.trim(),
      legalName: values.legalName.trim(),
      taxId: values.taxId
        .trim()
        .toUpperCase(),
      contactName:
        values.contactName.trim(),
      email: values.email
        .trim()
        .toLowerCase(),
      phone:
        values.phone.trim() || null,
      address:
        values.address.trim() || null,
      city:
        values.city.trim() || null,
      state:
        values.state.trim() || null,
      postalCode:
        values.postalCode.trim() || null,
      supplierType:
        values.supplierType,
      materialCategories:
        this.selectedCategories(),
      leadTimeDays:
        values.leadTimeDays,
      paymentTerms:
        values.paymentTerms.trim(),
      notes:
        values.notes.trim()
    };

    const editing = this.editingSupplier();

    const operation = editing
      ? this.supplierService.update(
          editing.id,
          {
            ...request,
            isActive: values.isActive
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
        this.selectedCategories.set([]);

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

  toggleStatus(supplier: Supplier): void {
    this.errorMessage.set('');

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

  requestDelete(supplier: Supplier): void {
    if (!this.isAdmin()) {
      return;
    }

    this.deleteCandidate.set(supplier);
  }

  cancelDelete(): void {
    if (!this.deleting()) {
      this.deleteCandidate.set(null);
    }
  }

  confirmDelete(): void {
    const supplier = this.deleteCandidate();

    if (
      !supplier ||
      this.deleting() ||
      !this.isAdmin()
    ) {
      return;
    }

    this.deleting.set(true);
    this.errorMessage.set('');

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

  getTypeLabel(type: SupplierType): string {
    return this.supplierTypes.find(
      item => item.value === type
    )?.label ?? type;
  }

  getCategoryLabel(
    category: SupplierMaterialCategory
  ): string {
    return this.materialCategories.find(
      item => item.value === category
    )?.label ?? category;
  }

  private clearSuccessMessageLater(): void {
    window.setTimeout(() => {
      this.successMessage.set('');
    }, 3500);
  }
}
