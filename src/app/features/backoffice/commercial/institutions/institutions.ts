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
  PortalAccountCredentials
} from '../../../../core/models/customer.model';

import {
  Institution,
  InstitutionStatusFilter,
  InstitutionType,
  InstitutionTypeFilter,
  INSTITUTION_TYPE_OPTIONS,
  institutionTypeLabel
} from '../../../../core/models/institution.model';

import {
  AuthService
} from '../../../../core/services/auth.service';

import {
  InstitutionService
} from '../../../../core/services/institution.service';

@Component({
  selector: 'app-institutions',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './institutions.html',
  styleUrl: './institutions.css'
})
export class Institutions implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly institutionService =
    inject(InstitutionService);

  readonly auth = inject(AuthService);
  readonly institutions =
    signal<Institution[]>([]);
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
    signal<InstitutionStatusFilter>('all');
  readonly typeFilter =
    signal<InstitutionTypeFilter>('all');
  readonly formOpen = signal(false);
  readonly editingInstitution =
    signal<Institution | null>(null);
  readonly detailInstitution =
    signal<Institution | null>(null);
  readonly deleteCandidate =
    signal<Institution | null>(null);
  readonly portalCredentials =
    signal<PortalAccountCredentials | null>(
      null
    );

  readonly institutionTypes =
    INSTITUTION_TYPE_OPTIONS;

  readonly canManage = computed(() =>
    this.auth.hasRole('Admin') ||
    this.auth.hasRole('Employee')
  );

  readonly activeInstitutions =
    computed(() =>
      this.institutions()
        .filter(item => item.isActive)
        .length
    );

  readonly inactiveInstitutions =
    computed(() =>
      this.institutions()
        .filter(item => !item.isActive)
        .length
    );

  readonly filteredInstitutions =
    computed(() => {
      const search =
        this.searchTerm()
          .trim()
          .toLowerCase();

      return this.institutions().filter(
        institution => {
          const content = [
            institution.name,
            institution.responsible
              .name.fullName,
            institution.responsible.email,
            institution.responsible
              .phone ?? '',
            institutionTypeLabel(
              institution.institutionType
            ),
            formatAddress(
              institution.address
            )
          ].join(' ').toLowerCase();

          return (
            (
              !search ||
              content.includes(search)
            ) &&
            (
              this.statusFilter() ===
                'all' ||
              (
                this.statusFilter() ===
                  'active' &&
                institution.isActive
              ) ||
              (
                this.statusFilter() ===
                  'inactive' &&
                !institution.isActive
              )
            ) &&
            (
              this.typeFilter() ===
                'all' ||
              institution.institutionType ===
                this.typeFilter()
            )
          );
        }
      );
    });

  readonly form =
    this.fb.nonNullable.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ],
      institutionType: [
        'Other' as InstitutionType,
        Validators.required
      ],
      responsibleFirstNames: [
        '',
        Validators.required
      ],
      responsiblePaternalLastName: [
        '',
        Validators.required
      ],
      responsibleMaternalLastName: [''],
      responsibleEmail: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      responsiblePhone: [
        '',
        Validators.pattern(/^\d{10}$/)
      ],
      responsiblePosition: [''],
      estimatedStudents: [
        0,
        Validators.min(0)
      ],
      notes: [''],
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
    this.loadInstitutions();
  }

  loadInstitutions(): void {
    this.loading.set(true);

    this.institutionService
      .getAll()
      .subscribe({
        next: response => {
          this.institutions.set(
            response.data ?? []
          );
          this.loading.set(false);
        },
        error: error => {
          this.loading.set(false);
          this.errorMessage.set(
            this.extractError(
              error,
              'No fue posible cargar las instituciones.'
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
        .value as InstitutionStatusFilter
    );
  }

  updateTypeFilter(event: Event): void {
    this.typeFilter.set(
      (event.target as HTMLSelectElement)
        .value as InstitutionTypeFilter
    );
  }

  openCreateForm(): void {
    this.editingInstitution.set(null);
    this.resetForm();
    this.formOpen.set(true);
  }

  openEditForm(
    institution: Institution
  ): void {
    this.editingInstitution.set(
      institution
    );

    this.form.reset({
      name: institution.name,
      institutionType:
        institution.institutionType,
      responsibleFirstNames:
        institution.responsible
          .name.firstNames,
      responsiblePaternalLastName:
        institution.responsible
          .name.paternalLastName,
      responsibleMaternalLastName:
        institution.responsible
          .name.maternalLastName ?? '',
      responsibleEmail:
        institution.responsible.email,
      responsiblePhone:
        institution.responsible.phone ?? '',
      responsiblePosition:
        institution.responsible.position ??
        '',
      estimatedStudents:
        institution.estimatedStudents ?? 0,
      notes: institution.notes ?? '',
      createPortalAccount: false,
      autoGeneratePassword: true,
      temporaryPassword: '',
      hasAddress:
        Boolean(institution.address),
      street:
        institution.address?.street ?? '',
      exteriorNumber:
        institution.address
          ?.exteriorNumber ?? '',
      interiorNumber:
        institution.address
          ?.interiorNumber ?? '',
      neighborhood:
        institution.address
          ?.neighborhood ?? '',
      postalCode:
        institution.address
          ?.postalCode ?? '',
      city:
        institution.address?.city ?? '',
      state:
        institution.address?.state ?? '',
      country:
        institution.address?.country ??
        'México',
      references:
        institution.address
          ?.references ?? '',
      isActive: institution.isActive
    });

    this.applyAddressValidators();
    this.formOpen.set(true);
  }

  closeForm(): void {
    if (this.saving()) return;

    this.formOpen.set(false);
    this.editingInstitution.set(null);
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
      name:
        values.name.trim(),

      institutionType:
        values.institutionType,

      responsible: {
        name: {
          firstNames:
            values.responsibleFirstNames
              .trim(),

          paternalLastName:
            values
              .responsiblePaternalLastName
              .trim(),

          maternalLastName:
            values
              .responsibleMaternalLastName
              .trim() ||
            null,

          fullName: ''
        },

        email:
          values.responsibleEmail
            .trim()
            .toLowerCase(),

        phone:
          values.responsiblePhone
            .trim() ||
          null,

        position:
          values.responsiblePosition
            .trim() ||
          null
      },

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
          : null,

      estimatedStudents:
        values.estimatedStudents > 0
          ? values.estimatedStudents
          : null,

      notes:
        values.notes.trim() ||
        null
    };

    const editing =
      this.editingInstitution();

    this.saving.set(true);
    this.formErrorMessage.set('');

    if (!editing) {
      this.institutionService
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

            this.loadInstitutions();
          },

          error: error => {
            this.saving.set(false);

            this.formErrorMessage.set(
              this.extractError(
                error,
                'No fue posible crear la institución.'
              )
            );
          }
        });

      return;
    }

    this.institutionService
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

          this.loadInstitutions();
        },

        error: error => {
          this.saving.set(false);

          this.formErrorMessage.set(
            this.extractError(
              error,
              'No fue posible actualizar la institución.'
            )
          );
        }
      });
  }

  toggleStatus(
    institution: Institution
  ): void {
    this.changingStatusId.set(
      institution.id
    );

    this.institutionService
      .updateStatus(
        institution.id,
        !institution.isActive
      )
      .subscribe({
        next: response => {
          this.changingStatusId.set(null);
          this.successMessage.set(
            response.message
          );
          this.loadInstitutions();
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

  openDetail(
    institution: Institution
  ): void {
    this.detailInstitution.set(
      institution
    );
  }

  closeDetail(): void {
    this.detailInstitution.set(null);
  }

  requestDelete(
    institution: Institution
  ): void {
    this.deleteCandidate.set(
      institution
    );
  }

  cancelDelete(): void {
    this.deleteCandidate.set(null);
  }

  confirmDelete(): void {
    const institution =
      this.deleteCandidate();

    if (!institution) return;

    this.deleting.set(true);

    this.institutionService
      .delete(institution.id)
      .subscribe({
        next: response => {
          this.deleting.set(false);
          this.deleteCandidate.set(null);
          this.successMessage.set(
            response.message
          );
          this.loadInstitutions();
        },
        error: error => {
          this.deleting.set(false);
          this.errorMessage.set(
            this.extractError(
              error,
              'No fue posible eliminar la institución.'
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

  typeLabel(
    type: InstitutionType
  ): string {
    return institutionTypeLabel(type);
  }

  addressText(
    institution: Institution
  ): string {
    return formatAddress(
      institution.address
    );
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
      !this.editingInstitution() &&
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
      name: '',
      institutionType: 'Other',
      responsibleFirstNames: '',
      responsiblePaternalLastName: '',
      responsibleMaternalLastName: '',
      responsibleEmail: '',
      responsiblePhone: '',
      responsiblePosition: '',
      estimatedStudents: 0,
      notes: '',
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
