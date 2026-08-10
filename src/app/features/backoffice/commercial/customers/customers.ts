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
  formatAddress
} from '../../../../core/models/common.model';

import {
  Customer,
  CustomerStatusFilter,
  PortalAccountCredentials
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
  readonly formErrorMessage = signal('');
  readonly searchTerm = signal('');
  readonly statusFilter =
    signal<CustomerStatusFilter>('all');
  readonly formOpen = signal(false);
  readonly editingCustomer =
    signal<Customer | null>(null);
  readonly detailCustomer =
    signal<Customer | null>(null);
  readonly deleteCandidate =
    signal<Customer | null>(null);
  readonly portalCredentials =
    signal<PortalAccountCredentials | null>(
      null
    );

  readonly canManage = computed(() =>
    this.auth.hasRole('Admin') ||
    this.auth.hasRole('Employee')
  );

  readonly activeCustomers = computed(() =>
    this.customers()
      .filter(item => item.isActive)
      .length
  );

  readonly inactiveCustomers = computed(() =>
    this.customers()
      .filter(item => !item.isActive)
      .length
  );

  readonly filteredCustomers = computed(() => {
    const search =
      this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.customers().filter(customer => {
      const content = [
        customer.fullName,
        customer.email,
        customer.phone ?? '',
        formatAddress(customer.address)
      ].join(' ').toLowerCase();

      return (
        (!search || content.includes(search)) &&
        (
          status === 'all' ||
          (
            status === 'active' &&
            customer.isActive
          ) ||
          (
            status === 'inactive' &&
            !customer.isActive
          )
        )
      );
    });
  });

  readonly form =
    this.fb.nonNullable.group({
      firstNames: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(80)
        ]
      ],
      paternalLastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(60)
        ]
      ],
      maternalLastName: [
        '',
        Validators.maxLength(60)
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
        Validators.pattern(/^\d{10}$/)
      ],
      createPortalAccount: [true],
      autoGeneratePassword: [true],
      temporaryPassword: [''],
      hasAddress: [false],
      street: [''],
      exteriorNumber: [''],
      interiorNumber: [''],
      neighborhood: [''],
      postalCode: [
        '',
        Validators.pattern(/^\d{5}$/)
      ],
      city: [''],
      state: [''],
      country: ['México'],
      references: [''],
      isActive: [true]
    });

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading.set(true);

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
          this.extractError(
            error,
            'No fue posible cargar los clientes.'
          )
        );
      }
    });
  }

  updateSearch(event: Event): void {
    this.searchTerm.set(
      (event.target as HTMLInputElement)
        .value
    );
  }

  updateStatusFilter(event: Event): void {
    this.statusFilter.set(
      (event.target as HTMLSelectElement)
        .value as CustomerStatusFilter
    );
  }

  openCreateForm(): void {
    this.editingCustomer.set(null);
    this.resetForm();
    this.formOpen.set(true);
  }

  openEditForm(customer: Customer): void {
    this.editingCustomer.set(customer);

    this.form.reset({
      firstNames:
        customer.name.firstNames,
      paternalLastName:
        customer.name.paternalLastName,
      maternalLastName:
        customer.name.maternalLastName ?? '',
      email: customer.email,
      phone: customer.phone ?? '',
      createPortalAccount: false,
      autoGeneratePassword: true,
      temporaryPassword: '',
      hasAddress:
        Boolean(customer.address),
      street:
        customer.address?.street ?? '',
      exteriorNumber:
        customer.address?.exteriorNumber ?? '',
      interiorNumber:
        customer.address?.interiorNumber ?? '',
      neighborhood:
        customer.address?.neighborhood ?? '',
      postalCode:
        customer.address?.postalCode ?? '',
      city:
        customer.address?.city ?? '',
      state:
        customer.address?.state ?? '',
      country:
        customer.address?.country ?? 'México',
      references:
        customer.address?.references ?? '',
      isActive: customer.isActive
    });

    this.applyAddressValidators();
    this.formOpen.set(true);
  }

  closeForm(): void {
    if (this.saving()) return;

    this.formOpen.set(false);
    this.editingCustomer.set(null);
    this.formErrorMessage.set('');
  }

  submit(): void {
    if (this.saving()) {
      return;
    }

    this.applyAddressValidators();
    this.applyPasswordValidators();

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      this.formErrorMessage.set(
        'Revisa los campos obligatorios y la contraseña temporal.'
      );

      return;
    }

    const values =
      this.form.getRawValue();

    const requestBase = {
      name: {
        firstNames:
          values.firstNames.trim(),

        paternalLastName:
          values.paternalLastName.trim(),

        maternalLastName:
          values.maternalLastName.trim() ||
          null,

        fullName: ''
      },

      email:
        values.email
          .trim()
          .toLowerCase(),

      phone:
        values.phone.trim() ||
        null,

      address:
        values.hasAddress
          ? {
              street:
                values.street.trim(),

              exteriorNumber:
                values.exteriorNumber.trim(),

              interiorNumber:
                values.interiorNumber.trim() ||
                null,

              neighborhood:
                values.neighborhood.trim(),

              postalCode:
                values.postalCode.trim(),

              city:
                values.city.trim(),

              state:
                values.state.trim(),

              country:
                values.country.trim() ||
                'México',

              references:
                values.references.trim() ||
                null
            }
          : null
    };

    const editing =
      this.editingCustomer();

    this.saving.set(true);
    this.formErrorMessage.set('');

    if (!editing) {
      this.customerService
        .create({
          ...requestBase,

          createPortalAccount:
            values.createPortalAccount,

          autoGeneratePassword:
            values.autoGeneratePassword,

          temporaryPassword:
            values.autoGeneratePassword
              ? null
              : values.temporaryPassword.trim()
        })
        .subscribe({
          next: response => {
            this.saving.set(false);

            this.portalCredentials.set(
              response.data?.portalAccount ??
              null
            );

            this.closeForm();

            this.successMessage.set(
              response.message
            );

            this.loadCustomers();
          },

          error: error => {
            this.saving.set(false);

            this.formErrorMessage.set(
              this.extractError(
                error,
                'No fue posible crear el cliente.'
              )
            );
          }
        });

      return;
    }

    this.customerService
      .update(
        editing.id,
        {
          ...requestBase,
          isActive:
            values.isActive
        }
      )
      .subscribe({
        next: response => {
          this.saving.set(false);

          this.closeForm();

          this.successMessage.set(
            response.message
          );

          this.loadCustomers();
        },

        error: error => {
          this.saving.set(false);

          this.formErrorMessage.set(
            this.extractError(
              error,
              'No fue posible actualizar el cliente.'
            )
          );
        }
      });
  }

  toggleStatus(customer: Customer): void {
    this.changingStatusId.set(customer.id);

    this.customerService.updateStatus(
      customer.id,
      !customer.isActive
    ).subscribe({
      next: response => {
        this.changingStatusId.set(null);
        this.successMessage.set(
          response.message
        );
        this.loadCustomers();
      },
      error: error => {
        this.changingStatusId.set(null);
        this.errorMessage.set(
          this.extractError(
            error,
            'No fue posible cambiar el estado.'
          )
        );
      }
    });
  }

  openDetail(customer: Customer): void {
    this.detailCustomer.set(customer);
  }

  closeDetail(): void {
    this.detailCustomer.set(null);
  }

  requestDelete(customer: Customer): void {
    this.deleteCandidate.set(customer);
  }

  cancelDelete(): void {
    this.deleteCandidate.set(null);
  }

  confirmDelete(): void {
    const customer =
      this.deleteCandidate();

    if (!customer) return;

    this.deleting.set(true);

    this.customerService.delete(
      customer.id
    ).subscribe({
      next: response => {
        this.deleting.set(false);
        this.deleteCandidate.set(null);
        this.successMessage.set(
          response.message
        );
        this.loadCustomers();
      },
      error: error => {
        this.deleting.set(false);
        this.errorMessage.set(
          this.extractError(
            error,
            'No fue posible eliminar el cliente.'
          )
        );
      }
    });
  }

  closeCredentials(): void {
    this.portalCredentials.set(null);
  }

  copyCredentials(): void {
    const credentials =
      this.portalCredentials();

    if (!credentials) return;

    navigator.clipboard.writeText(
      `Correo: ${credentials.email}\nContraseña temporal: ${credentials.temporaryPassword}`
    );
  }

  addressText(customer: Customer): string {
    return formatAddress(customer.address);
  }

  private applyAddressValidators(): void {
    const controls = [
      this.form.controls.street,
      this.form.controls.exteriorNumber,
      this.form.controls.neighborhood,
      this.form.controls.postalCode,
      this.form.controls.city,
      this.form.controls.state
    ];

    controls.forEach(control => {
      this.form.controls.hasAddress.value
        ? control.addValidators(
            Validators.required
          )
        : control.removeValidators(
            Validators.required
          );

      control.updateValueAndValidity({
        emitEvent: false
      });
    });
  }

  private applyPasswordValidators(): void {
    const password =
      this.form.controls.temporaryPassword;

    if (
      !this.editingCustomer() &&
      this.form.controls
        .createPortalAccount.value &&
      !this.form.controls
        .autoGeneratePassword.value
    ) {
      password.setValidators([
        Validators.required,
        Validators.minLength(8)
      ]);
    } else {
      password.clearValidators();
    }

    password.updateValueAndValidity({
      emitEvent: false
    });
  }

  private resetForm(): void {
    this.form.reset({
      firstNames: '',
      paternalLastName: '',
      maternalLastName: '',
      email: '',
      phone: '',
      createPortalAccount: true,
      autoGeneratePassword: true,
      temporaryPassword: '',
      hasAddress: false,
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

    this.applyAddressValidators();
    this.applyPasswordValidators();
  }

  private extractError(
    error: any,
    fallback: string
  ): string {
    const errors =
      error?.error?.errors;

    return Array.isArray(errors) &&
      errors.length > 0
      ? errors.join(' · ')
      : error?.error?.message ??
          fallback;
  }
}
