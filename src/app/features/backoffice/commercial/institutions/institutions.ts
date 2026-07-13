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
  Institution,
  InstitutionStatusFilter,
  InstitutionType,
  InstitutionTypeFilter
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
    DatePipe,
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

  readonly institutionTypes:
    InstitutionType[] = [
      'Escuela',
      'Preparatoria',
      'Universidad',
      'Guardería',
      'Centro educativo',
      'Asociación',
      'Fundación',
      'Otro'
    ];

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deleting = signal(false);

  readonly changingStatusId =
    signal<string | null>(null);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly searchTerm = signal('');

  readonly statusFilter =
    signal<InstitutionStatusFilter>('all');

  readonly typeFilter =
    signal<InstitutionTypeFilter>('all');

  readonly formOpen = signal(false);

  readonly editingInstitution =
    signal<Institution | null>(null);

  readonly deleteCandidate =
    signal<Institution | null>(null);

  readonly detailInstitution =
    signal<Institution | null>(null);

  readonly canManage = computed(() =>
    this.auth.hasRole('Admin') ||
    this.auth.hasRole('Employee')
  );

  readonly activeInstitutions = computed(() =>
    this.institutions().filter(
      institution => institution.isActive
    ).length
  );

  readonly inactiveInstitutions = computed(() =>
    this.institutions().filter(
      institution => !institution.isActive
    ).length
  );

  readonly universities = computed(() =>
    this.institutions().filter(
      institution =>
        institution.institutionType ===
        'Universidad'
    ).length
  );

  readonly schools = computed(() =>
    this.institutions().filter(
      institution =>
        institution.institutionType ===
          'Escuela' ||
        institution.institutionType ===
          'Preparatoria'
    ).length
  );

  readonly filteredInstitutions = computed(() => {
    const search = this.searchTerm()
      .trim()
      .toLowerCase();

    const status = this.statusFilter();
    const type = this.typeFilter();

    return this.institutions().filter(
      institution => {
        const searchableContent = [
          institution.name,
          institution.contactName,
          institution.email,
          institution.phone ?? '',
          institution.address ?? '',
          institution.institutionType
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
            institution.isActive
          ) ||
          (
            status === 'inactive' &&
            !institution.isActive
          );

        const matchesType =
          type === 'all' ||
          institution.institutionType === type;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesType
        );
      }
    );
  });

  readonly form = this.fb.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(150)
      ]
    ],

    contactName: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(120)
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

    institutionType: [
      'Escuela' as InstitutionType,
      [
        Validators.required
      ]
    ],

    isActive: [true]
  });

  ngOnInit(): void {
    this.loadInstitutions();
  }

  loadInstitutions(): void {
    this.loading.set(true);
    this.errorMessage.set('');

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
            error?.error?.message ??
            'No fue posible cargar las instituciones.'
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
      select.value as InstitutionStatusFilter
    );
  }

  updateTypeFilter(
    event: Event
  ): void {
    const select =
      event.target as HTMLSelectElement;

    this.typeFilter.set(
      select.value as InstitutionTypeFilter
    );
  }

  openCreateForm(): void {
    if (!this.canManage()) {
      return;
    }

    this.editingInstitution.set(null);

    this.form.reset({
      name: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      institutionType: 'Escuela',
      isActive: true
    });

    this.clearMessages();
    this.formOpen.set(true);
  }

  openEditForm(
    institution: Institution
  ): void {
    if (!this.canManage()) {
      return;
    }

    this.editingInstitution.set(
      institution
    );

    this.form.reset({
      name: institution.name,
      contactName: institution.contactName,
      email: institution.email,
      phone: institution.phone ?? '',
      address: institution.address ?? '',
      institutionType:
        institution.institutionType,
      isActive: institution.isActive
    });

    this.clearMessages();
    this.formOpen.set(true);
  }

  closeForm(): void {
    if (this.saving()) {
      return;
    }

    this.formOpen.set(false);
    this.editingInstitution.set(null);

    this.form.reset({
      name: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      institutionType: 'Escuela',
      isActive: true
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

  submit(): void {
    if (
      this.form.invalid ||
      this.saving() ||
      !this.canManage()
    ) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.clearMessages();

    const values = this.form.getRawValue();

    const editing =
      this.editingInstitution();

    const baseRequest = {
      name: values.name.trim(),

      contactName:
        values.contactName.trim(),

      email: values.email
        .trim()
        .toLowerCase(),

      phone:
        values.phone.trim() || null,

      address:
        values.address.trim() || null,

      institutionType:
        values.institutionType
    };

    const operation = editing
      ? this.institutionService.update(
          editing.id,
          {
            ...baseRequest,
            isActive: values.isActive
          }
        )
      : this.institutionService.create(
          baseRequest
        );

    operation.subscribe({
      next: response => {
        this.saving.set(false);

        this.successMessage.set(
          response.message
        );

        this.closeForm();
        this.loadInstitutions();
        this.clearSuccessMessageLater();
      },

      error: error => {
        this.saving.set(false);

        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible guardar la institución.'
        );
      }
    });
  }

  toggleStatus(
    institution: Institution
  ): void {
    if (
      !this.canManage() ||
      this.changingStatusId()
    ) {
      return;
    }

    this.changingStatusId.set(
      institution.id
    );

    this.clearMessages();

    this.institutionService
      .updateStatus(
        institution,
        !institution.isActive
      )
      .subscribe({
        next: response => {
          this.changingStatusId.set(null);

          const updatedInstitution =
            response.data;

          this.institutions.update(
            institutions =>
              institutions.map(item =>
                item.id === institution.id
                  ? (
                      updatedInstitution ??
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
            'No fue posible cambiar el estado de la institución.'
          );
        }
      });
  }

  requestDelete(
    institution: Institution
  ): void {
    if (!this.canManage()) {
      return;
    }

    this.deleteCandidate.set(
      institution
    );
  }

  cancelDelete(): void {
    if (this.deleting()) {
      return;
    }

    this.deleteCandidate.set(null);
  }

  confirmDelete(): void {
    const institution =
      this.deleteCandidate();

    if (
      !institution ||
      this.deleting() ||
      !this.canManage()
    ) {
      return;
    }

    this.deleting.set(true);
    this.clearMessages();

    this.institutionService
      .delete(institution.id)
      .subscribe({
        next: response => {
          this.deleting.set(false);
          this.deleteCandidate.set(null);

          this.institutions.update(
            institutions =>
              institutions.filter(
                item =>
                  item.id !== institution.id
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
            'No fue posible eliminar la institución.'
          );
        }
      });
  }

  institutionIcon(
    type: InstitutionType
  ): string {
    switch (type) {
      case 'Universidad':
        return '🎓';

      case 'Preparatoria':
        return '📘';

      case 'Guardería':
        return '🧸';

      case 'Asociación':
        return '🤝';

      case 'Fundación':
        return '💚';

      case 'Centro educativo':
        return '📚';

      default:
        return '🏫';
    }
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
