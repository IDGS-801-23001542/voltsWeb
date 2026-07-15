import {
  DatePipe
} from '@angular/common';

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
  forkJoin
} from 'rxjs';

import {
  Role
} from '../../../../core/models/role.model';

import {
  User
} from '../../../../core/models/user.model';

import {
  RoleService
} from '../../../../core/services/role.service';

import {
  UserService
} from '../../../../core/services/user.service';

type UserTab =
  | 'internal'
  | 'clients'
  | 'institutions';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule
  ],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {
  private readonly fb =
    inject(FormBuilder);

  private readonly userService =
    inject(UserService);

  private readonly roleService =
    inject(RoleService);

  readonly users = signal<User[]>([]);
  readonly roles = signal<Role[]>([]);

  readonly activeTab =
    signal<UserTab>('internal');

  readonly searchTerm = signal('');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly actionId =
    signal<string | null>(null);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly formErrorMessage =
    signal('');

  readonly formOpen = signal(false);
  readonly editingUser =
    signal<User | null>(null);

  readonly internalUsers =
    computed(() =>
      this.users().filter(user =>
        user.roleName !== 'Client' &&
        user.roleName !== 'Institution'
      )
    );

  readonly clientUsers =
    computed(() =>
      this.users().filter(user =>
        user.roleName === 'Client'
      )
    );

  readonly institutionUsers =
    computed(() =>
      this.users().filter(user =>
        user.roleName === 'Institution'
      )
    );

  readonly visibleUsers =
    computed(() => {
      const source =
        this.activeTab() === 'clients'
          ? this.clientUsers()
          : this.activeTab() ===
              'institutions'
            ? this.institutionUsers()
            : this.internalUsers();

      const search =
        this.searchTerm()
          .trim()
          .toLowerCase();

      return source.filter(user =>
        !search ||
        [
          user.fullName,
          user.email,
          user.roleName,
          user.profileId ?? ''
        ]
          .join(' ')
          .toLowerCase()
          .includes(search)
      );
    });

  readonly assignableRoles =
    computed(() =>
      this.roles().filter(role =>
        role.isActive &&
        role.name !== 'Client' &&
        role.name !== 'Institution'
      )
    );

  readonly form =
    this.fb.nonNullable.group({
      firstNames: [
        '',
        [
          Validators.required,
          Validators.minLength(2)
        ]
      ],
      paternalLastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2)
        ]
      ],
      maternalLastName: [''],
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      password: [
        '',
        [
          Validators.minLength(8)
        ]
      ],
      roleName: [
        'Employee',
        Validators.required
      ],
      isActive: [true]
    });

  ngOnInit(): void {
    this.loadData();
  }

  setTab(tab: UserTab): void {
    this.activeTab.set(tab);
    this.searchTerm.set('');
  }

  loadData(): void {
    this.loading.set(true);

    forkJoin({
      users: this.userService.getAll(),
      roles: this.roleService.getAll()
    }).subscribe({
      next: result => {
        this.users.set(
          result.users.data ?? []
        );

        this.roles.set(
          result.roles.data ?? []
        );

        this.loading.set(false);
      },
      error: error => {
        this.loading.set(false);
        this.errorMessage.set(
          this.extractError(
            error,
            'No fue posible cargar usuarios.'
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

  openCreate(): void {
    this.editingUser.set(null);

    this.form.reset({
      firstNames: '',
      paternalLastName: '',
      maternalLastName: '',
      email: '',
      password: '',
      roleName: 'Employee',
      isActive: true
    });

    this.form.controls.email.enable();

    this.form.controls.password
      .setValidators([
        Validators.required,
        Validators.minLength(8)
      ]);

    this.form.controls.password
      .updateValueAndValidity();

    this.formOpen.set(true);
  }

  openEdit(user: User): void {
    this.editingUser.set(user);

    this.form.reset({
      firstNames:
        user.name.firstNames,
      paternalLastName:
        user.name.paternalLastName,
      maternalLastName:
        user.name.maternalLastName ?? '',
      email: user.email,
      password: '',
      roleName: user.roleName,
      isActive: user.isActive
    });

    this.form.controls.email.disable();
    this.form.controls.password
      .clearValidators();
    this.form.controls.password
      .updateValueAndValidity();

    this.formOpen.set(true);
  }

  closeForm(): void {
    if (this.saving()) {
      return;
    }

    this.formOpen.set(false);
    this.editingUser.set(null);
    this.formErrorMessage.set('');
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const values = this.form.getRawValue();
    const editing = this.editingUser();
    this.saving.set(true);
    this.formErrorMessage.set('');

    if (editing) {
      this.userService.update(editing.id, {
        firstNames: values.firstNames.trim(),
        paternalLastName: values.paternalLastName.trim(),
        maternalLastName: values.maternalLastName.trim() || null,
        roleName: values.roleName,
        isActive: values.isActive
      }).subscribe({
        next: response => { this.saving.set(false); this.closeForm(); this.successMessage.set(response.message); this.loadData(); },
        error: error => { this.saving.set(false); this.formErrorMessage.set(this.extractError(error, 'No fue posible actualizar la cuenta.')); }
      });
      return;
    }

    this.userService.create({
      firstNames: values.firstNames.trim(),
      paternalLastName: values.paternalLastName.trim(),
      maternalLastName: values.maternalLastName.trim() || null,
      email: values.email.trim().toLowerCase(),
      password: values.password,
      roleName: values.roleName
    }).subscribe({
      next: response => { this.saving.set(false); this.closeForm(); this.successMessage.set(response.message); this.loadData(); },
      error: error => { this.saving.set(false); this.formErrorMessage.set(this.extractError(error, 'No fue posible crear la cuenta.')); }
    });
  }

  toggleStatus(user: User): void {
    this.actionId.set(user.id);

    this.userService.updateStatus(
      user.id,
      !user.isActive
    ).subscribe({
      next: response => {
        this.actionId.set(null);
        this.successMessage.set(
          response.message
        );
        this.loadData();
      },
      error: error => {
        this.actionId.set(null);
        this.errorMessage.set(
          this.extractError(
            error,
            'No fue posible cambiar el estado.'
          )
        );
      }
    });
  }

  unlock(user: User): void {
    this.actionId.set(user.id);

    this.userService.unlock(
      user.id
    ).subscribe({
      next: response => {
        this.actionId.set(null);
        this.successMessage.set(
          response.message
        );
        this.loadData();
      },
      error: error => {
        this.actionId.set(null);
        this.errorMessage.set(
          this.extractError(
            error,
            'No fue posible desbloquear.'
          )
        );
      }
    });
  }

  delete(user: User): void {
    if (!window.confirm(
      `¿Eliminar a ${user.fullName}?`
    )) {
      return;
    }

    this.actionId.set(user.id);

    this.userService.delete(
      user.id
    ).subscribe({
      next: response => {
        this.actionId.set(null);
        this.successMessage.set(
          response.message
        );
        this.loadData();
      },
      error: error => {
        this.actionId.set(null);
        this.errorMessage.set(
          this.extractError(
            error,
            'No fue posible eliminar.'
          )
        );
      }
    });
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
