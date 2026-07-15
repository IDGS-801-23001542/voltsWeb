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
  PermissionDefinition,
  Role
} from '../../../../core/models/role.model';

import {
  RoleService
} from '../../../../core/services/role.service';

type PermissionGroup = {
  name: string;
  permissions: PermissionDefinition[];
};

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './roles.html',
  styleUrl: './roles.css'
})
export class Roles implements OnInit {
  private readonly fb =
    inject(FormBuilder);

  private readonly roleService =
    inject(RoleService);

  private readonly protectedRoleNames =
    new Set([
      'Admin',
      'Employee',
      'Client',
      'Institution'
    ]);

  readonly roles = signal<Role[]>([]);
  readonly permissions =
    signal<PermissionDefinition[]>([]);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deletingId =
    signal<string | null>(null);

  readonly formOpen = signal(false);
  readonly editingRole =
    signal<Role | null>(null);

  readonly selectedPermissions =
    signal<Set<string>>(new Set());

  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly formErrorMessage =
    signal('');

  readonly isEditingProtectedRole =
    computed(() => {
      const role = this.editingRole();

      return role
        ? this.isProtectedRole(role)
        : false;
    });

  readonly isEditingAdmin =
    computed(() =>
      this.editingRole()?.name === 'Admin'
    );

  readonly availablePermissions =
    computed(() => {
      const roleName =
        this.editingRole()?.name ?? '';

      if (roleName === 'Admin') {
        return this.permissions();
      }

      if (
        roleName === 'Employee' ||
        roleName === 'Client' ||
        roleName === 'Institution'
      ) {
        return this.permissions().filter(
          permission =>
            permission.allowedRoleNames
              .includes(roleName)
        );
      }

      /*
       * Roles personalizados son internos,
       * sin permisos críticos de Administración
       * ni permisos de portales externos.
       */
      return this.permissions().filter(
        permission =>
          permission.group !==
            'Administración' &&
          !permission.group.startsWith(
            'Portal'
          )
      );
    });

  readonly permissionGroups =
    computed<PermissionGroup[]>(() => {
      const groups =
        new Map<
          string,
          PermissionDefinition[]
        >();

      for (
        const permission of
        this.availablePermissions()
      ) {
        const items =
          groups.get(permission.group) ??
          [];

        items.push(permission);
        groups.set(
          permission.group,
          items
        );
      }

      return Array.from(
        groups.entries()
      ).map(([name, permissions]) => ({
        name,
        permissions
      }));
    });

  readonly form =
    this.fb.nonNullable.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(80)
        ]
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(300)
        ]
      ],
      isActive: [true]
    });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      roles: this.roleService.getAll(),
      permissions:
        this.roleService.getPermissions()
    }).subscribe({
      next: result => {
        this.roles.set(
          result.roles.data ?? []
        );

        this.permissions.set(
          result.permissions.data ?? []
        );

        this.loading.set(false);
      },
      error: error => {
        this.loading.set(false);
        this.errorMessage.set(
          this.extractError(
            error,
            'No fue posible cargar roles y permisos.'
          )
        );
      }
    });
  }

  openCreate(): void {
    this.editingRole.set(null);
    this.selectedPermissions.set(
      new Set()
    );

    this.form.reset({
      name: '',
      description: '',
      isActive: true
    });

    this.form.controls.name.enable();
    this.form.controls.isActive.enable();
    this.formErrorMessage.set('');
    this.formOpen.set(true);
  }

  openEdit(role: Role): void {
    this.editingRole.set(role);

    const allowedCodes =
      new Set(
        this.getAvailableForRole(
          role.name
        ).map(item => item.code)
      );

    const selected =
      role.permissions.includes('*')
        ? new Set(allowedCodes)
        : new Set(
            role.permissions.filter(
              code => allowedCodes.has(code)
            )
          );

    this.selectedPermissions.set(
      selected
    );

    this.form.reset({
      name: role.name,
      description: role.description,
      isActive: role.isActive
    });

    if (this.isProtectedRole(role)) {
      this.form.controls.name.disable();
      this.form.controls.isActive.disable();
    } else {
      this.form.controls.name.enable();
      this.form.controls.isActive.enable();
    }

    this.formErrorMessage.set('');
    this.formOpen.set(true);
  }

  closeForm(): void {
    if (this.saving()) {
      return;
    }

    this.formOpen.set(false);
    this.editingRole.set(null);
    this.formErrorMessage.set('');
  }

  togglePermission(code: string): void {
    if (this.isEditingAdmin()) {
      return;
    }

    const selected =
      new Set(
        this.selectedPermissions()
      );

    selected.has(code)
      ? selected.delete(code)
      : selected.add(code);

    this.selectedPermissions.set(
      selected
    );
  }

  selectGroup(
    group: PermissionGroup
  ): void {
    if (this.isEditingAdmin()) {
      return;
    }

    const selected =
      new Set(
        this.selectedPermissions()
      );

    group.permissions.forEach(
      item => selected.add(item.code)
    );

    this.selectedPermissions.set(
      selected
    );
  }

  clearGroup(
    group: PermissionGroup
  ): void {
    if (this.isEditingAdmin()) {
      return;
    }

    const selected =
      new Set(
        this.selectedPermissions()
      );

    group.permissions.forEach(
      item => selected.delete(item.code)
    );

    this.selectedPermissions.set(
      selected
    );
  }

  selectAllPermissions(): void {
    if (this.isEditingAdmin()) {
      return;
    }

    this.selectedPermissions.set(
      new Set(
        this.availablePermissions()
          .map(item => item.code)
      )
    );
  }

  clearAllPermissions(): void {
    if (this.isEditingAdmin()) {
      return;
    }

    this.selectedPermissions.set(
      new Set()
    );
  }

  hasPermission(code: string): boolean {
    return this.selectedPermissions()
      .has(code);
  }

  groupSelectedCount(
    group: PermissionGroup
  ): number {
    return group.permissions.filter(
      item =>
        this.hasPermission(item.code)
    ).length;
  }

  submit(): void {
    if (
      this.saving() ||
      this.form.invalid
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const values =
      this.form.getRawValue();

    const editing =
      this.editingRole();

    const request = {
      name: values.name.trim(),
      description:
        values.description.trim(),
      permissions:
        this.isEditingAdmin()
          ? ['*']
          : Array.from(
              this.selectedPermissions()
            ),
      isActive:
        this.isEditingProtectedRole()
          ? true
          : values.isActive
    };

    this.saving.set(true);

    const operation = editing
      ? this.roleService.update(
          editing.id,
          request
        )
      : this.roleService.create({
          name: request.name,
          description:
            request.description,
          permissions:
            request.permissions
        });

    operation.subscribe({
      next: response => {
        this.saving.set(false);
        this.closeForm();
        this.successMessage.set(
          response.message
        );
        this.loadData();
      },
      error: error => {
        this.saving.set(false);
        this.formErrorMessage.set(
          this.extractError(
            error,
            'No fue posible guardar el rol.'
          )
        );
      }
    });
  }

  delete(role: Role): void {
    if (this.isProtectedRole(role)) {
      return;
    }

    if (!window.confirm(
      `¿Eliminar el rol ${role.name}?`
    )) {
      return;
    }

    this.deletingId.set(role.id);

    this.roleService.delete(
      role.id
    ).subscribe({
      next: response => {
        this.deletingId.set(null);
        this.successMessage.set(
          response.message
        );
        this.loadData();
      },
      error: error => {
        this.deletingId.set(null);
        this.errorMessage.set(
          this.extractError(
            error,
            'No fue posible eliminar el rol.'
          )
        );
      }
    });
  }

  isProtectedRole(role: Role): boolean {
    return this.protectedRoleNames
      .has(role.name);
  }

  permissionSummary(role: Role): string {
    if (role.permissions.includes('*')) {
      return 'Acceso total al sistema';
    }

    return role.permissions.length === 0
      ? 'Sin permisos asignados'
      : `${role.permissions.length} permisos asignados`;
  }

  private getAvailableForRole(
    roleName: string
  ): PermissionDefinition[] {
    if (roleName === 'Admin') {
      return this.permissions();
    }

    if (
      roleName === 'Employee' ||
      roleName === 'Client' ||
      roleName === 'Institution'
    ) {
      return this.permissions().filter(
        item =>
          item.allowedRoleNames.includes(
            roleName
          )
      );
    }

    return this.permissions().filter(
      item =>
        item.group !==
          'Administración' &&
        !item.group.startsWith(
          'Portal'
        )
    );
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
