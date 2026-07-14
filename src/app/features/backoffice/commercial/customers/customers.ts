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
  Customer,
  CustomerStatusFilter,
  CustomerType,
  CustomerTypeFilter
} from '../../../../core/models/customer.model';

import {
  AuthService
} from '../../../../core/services/auth.service';

import {
  CustomerService
} from '../../../../core/services/customer.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule
  ],
  templateUrl: './customers.html',
  styleUrl: './customers.css'
})
export class Customers implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly customerService =
    inject(CustomerService);

  readonly auth = inject(AuthService);

  readonly customers = signal<Customer[]>([]);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly changingStatusId =
    signal<string | null>(null);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly searchTerm = signal('');

  readonly statusFilter =
    signal<CustomerStatusFilter>('all');

  readonly typeFilter =
    signal<CustomerTypeFilter>('all');

  readonly formOpen = signal(false);

  readonly editingCustomer =
    signal<Customer | null>(null);

  readonly deleteCandidate =
    signal<Customer | null>(null);

  readonly detailCustomer =
    signal<Customer | null>(null);

  readonly canManage = computed(() =>
    this.auth.hasRole('Admin') ||
    this.auth.hasRole('Employee')
  );

  readonly activeCustomers = computed(() =>
    this.customers().filter(
      customer => customer.isActive
    ).length
  );

  readonly inactiveCustomers = computed(() =>
    this.customers().filter(
      customer => !customer.isActive
    ).length
  );

  readonly individualCustomers = computed(() =>
    this.customers().filter(
      customer =>
        customer.customerType === 'Individual'
    ).length
  );

  readonly institutionalCustomers = computed(() =>
    this.customers().filter(
      customer =>
        customer.customerType === 'Institutional'
    ).length
  );

  readonly isInstitutionalType = computed(() =>
    this.form.controls.customerType.value ===
    'Institutional'
  );

  readonly filteredCustomers = computed(() => {
    const search = this.searchTerm()
      .trim()
      .toLowerCase();

    const status = this.statusFilter();
    const type = this.typeFilter();

    return this.customers().filter(customer => {
      const searchableContent = [
        customer.fullName,
        customer.email,
        customer.phone ?? '',
        customer.institutionName ?? '',
        customer.address ?? ''
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !search ||
        searchableContent.includes(search);

      const matchesStatus =
        status === 'all' ||
        (
          status === 'active' &&
          customer.isActive
        ) ||
        (
          status === 'inactive' &&
          !customer.isActive
        );

      const matchesType =
        type === 'all' ||
        customer.customerType === type;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  });

  readonly form = this.fb.nonNullable.group({
    customerType: [
      'Individual' as CustomerType,
      [
        Validators.required
      ]
    ],

    fullName: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(120)
      ]
    ],

    institutionName: [
      '',
      [
        Validators.maxLength(150)
      ]
    ],

    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(150)
      ]
    ],

    phone: [
      '',
      [
        Validators.maxLength(25),
        Validators.pattern(
          /^[0-9+\-\s()]*$/
        )
      ]
    ],

    address: [
      '',
      [
        Validators.maxLength(300)
      ]
    ],

    isActive: [true]
  });

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.customerService.getAll().subscribe({
      next: response => {
        this.customers.set(
          response.data ?? []
        );

        this.loading.set(false);
      },

      error: error => {
        this.loading.set(false);

        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible cargar los clientes.'
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
      select.value as CustomerStatusFilter
    );
  }

  updateTypeFilter(
    event: Event
  ): void {
    const select =
      event.target as HTMLSelectElement;

    this.typeFilter.set(
      select.value as CustomerTypeFilter
    );
  }

  onCustomerTypeChange(): void {
    const customerType =
      this.form.controls.customerType.value;

    if (customerType === 'Individual') {
      this.form.controls.institutionName.setValue(
        ''
      );
    }
  }

  openCreateForm(): void {
    if (!this.canManage()) {
      return;
    }

    this.editingCustomer.set(null);

    this.form.reset({
      customerType: 'Individual',
      fullName: '',
      institutionName: '',
      email: '',
      phone: '',
      address: '',
      isActive: true
    });

    this.clearMessages();
    this.formOpen.set(true);
  }

  openEditForm(
    customer: Customer
  ): void {
    if (!this.canManage()) {
      return;
    }

    this.editingCustomer.set(customer);

    this.form.reset({
      customerType: customer.customerType,
      fullName: customer.fullName,
      institutionName:
        customer.institutionName ?? '',
      email: customer.email,
      phone: customer.phone ?? '',
      address: customer.address ?? '',
      isActive: customer.isActive
    });

    this.clearMessages();
    this.formOpen.set(true);
  }

  closeForm(): void {
    if (this.saving()) {
      return;
    }

    this.formOpen.set(false);
    this.editingCustomer.set(null);

    this.form.reset({
      customerType: 'Individual',
      fullName: '',
      institutionName: '',
      email: '',
      phone: '',
      address: '',
      isActive: true
    });
  }

  openDetail(
    customer: Customer
  ): void {
    this.detailCustomer.set(customer);
  }

  closeDetail(): void {
    this.detailCustomer.set(null);
  }

  submit(): void {
    if (
      this.form.invalid ||
      this.saving() ||
      !this.canManage()
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();

    if (
      values.customerType ===
        'Institutional' &&
      !values.institutionName.trim()
    ) {
      this.form.controls
        .institutionName
        .setErrors({
          required: true
        });

      this.form.controls
        .institutionName
        .markAsTouched();

      return;
    }

    this.saving.set(true);
    this.clearMessages();

    const editing =
      this.editingCustomer();

    const baseRequest = {
      customerType: values.customerType,
      fullName: values.fullName.trim(),
      institutionName:
        values.customerType === 'Institutional'
          ? values.institutionName.trim()
          : null,
      email: values.email
        .trim()
        .toLowerCase(),
      phone:
        values.phone.trim() || null,
      address:
        values.address.trim() || null
    };

    const operation = editing
      ? this.customerService.update(
          editing.id,
          {
            ...baseRequest,
            isActive: values.isActive
          }
        )
      : this.customerService.create(
          baseRequest
        );

    operation.subscribe({
      next: response => {
        this.saving.set(false);

        this.successMessage.set(
          response.message
        );

        this.closeForm();
        this.loadCustomers();
        this.clearSuccessMessageLater();
      },

      error: error => {
        this.saving.set(false);

        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible guardar el cliente.'
        );
      }
    });
  }

  toggleStatus(
    customer: Customer
  ): void {
    if (
      !this.canManage() ||
      this.changingStatusId()
    ) {
      return;
    }

    this.changingStatusId.set(customer.id);
    this.clearMessages();

    this.customerService
      .updateStatus(
        customer,
        !customer.isActive
      )
      .subscribe({
        next: response => {
          this.changingStatusId.set(null);

          const updatedCustomer =
            response.data;

          this.customers.update(customers =>
            customers.map(item =>
              item.id === customer.id
                ? (
                    updatedCustomer ??
                    {
                      ...item,
                      isActive:
                        !item.isActive
                    }
                  )
                : item
            )
          );

          this.successMessage.set(
            response.message
          );

          this.clearSuccessMessageLater();
        },

        error: error => {
          this.changingStatusId.set(null);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible cambiar el estado del cliente.'
          );
        }
      });
  }

  requestDelete(
    customer: Customer
  ): void {
    if (!this.canManage()) {
      return;
    }

    this.deleteCandidate.set(customer);
  }

  cancelDelete(): void {
    if (this.deleting()) {
      return;
    }

    this.deleteCandidate.set(null);
  }

  confirmDelete(): void {
    const customer =
      this.deleteCandidate();

    if (
      !customer ||
      this.deleting() ||
      !this.canManage()
    ) {
      return;
    }

    this.deleting.set(true);
    this.clearMessages();

    this.customerService
      .delete(customer.id)
      .subscribe({
        next: response => {
          this.deleting.set(false);
          this.deleteCandidate.set(null);

          this.customers.update(customers =>
            customers.filter(
              item => item.id !== customer.id
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
            'No fue posible eliminar el cliente.'
          );
        }
      });
  }

  private clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  private clearSuccessMessageLater(): void {
    window.setTimeout(() => {
      this.successMessage.set('');
    }, 3500);
  }
}
