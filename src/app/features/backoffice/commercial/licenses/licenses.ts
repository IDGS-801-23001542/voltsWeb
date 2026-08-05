import {
  DatePipe
} from '@angular/common';

import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  License,
  LicenseStatus
} from '../../../../core/models/license.model';

import {
  LicenseService
} from '../../../../core/services/license.service';

@Component({
  selector: 'app-licenses',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule
  ],
  templateUrl: './licenses.html',
  styleUrl: './licenses.css'
})
export class Licenses implements OnInit {
  private readonly licenseService =
    inject(LicenseService);

  private readonly fb = inject(FormBuilder);

  readonly licenses = signal<License[]>([]);
  readonly loading = signal(true);
  readonly actionId = signal<string | null>(null);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly selectedLicense = signal<License | null>(null);

  readonly assignmentForm = this.fb.nonNullable.group({
    assignedToName: ['', [Validators.required, Validators.maxLength(150)]],
    assignedToEmail: ['', [Validators.email, Validators.maxLength(180)]]
  });

  ngOnInit(): void {
    this.loadLicenses();
  }

  loadLicenses(): void {
    this.loading.set(true);

    this.licenseService.getAll().subscribe({
      next: response => {
        this.licenses.set(response.data ?? []);
        this.loading.set(false);
      },
      error: error => {
        this.loading.set(false);
        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible cargar licencias.'
        );
      }
    });
  }

  openAssignment(license: License): void {
    this.errorMessage.set('');
    this.selectedLicense.set(license);
    this.assignmentForm.reset({
      assignedToName: license.assignedToName ?? license.recipientName ?? '',
      assignedToEmail: license.assignedToEmail ?? license.recipientEmail ?? ''
    });
  }

  closeAssignment(): void {
    if (this.actionId()) {
      return;
    }

    this.selectedLicense.set(null);
    this.assignmentForm.reset();
  }

  saveAssignment(): void {
    const license = this.selectedLicense();

    if (!license || this.assignmentForm.invalid || this.actionId()) {
      this.assignmentForm.markAllAsTouched();
      return;
    }

    const value = this.assignmentForm.getRawValue();

    this.actionId.set(license.id);
    this.errorMessage.set('');

    this.licenseService.assign(
      license.id,
      {
        assignedToName: value.assignedToName.trim(),
        assignedToEmail: value.assignedToEmail.trim() || null
      }
    ).subscribe({
      next: response => {
        this.actionId.set(null);
        this.selectedLicense.set(null);
        this.assignmentForm.reset();
        this.successMessage.set(response.message);
        this.loadLicenses();
      },
      error: error => {
        this.actionId.set(null);
        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible asignar la licencia.'
        );
      }
    });
  }

  changeStatus(
    license: License,
    status: LicenseStatus
  ): void {
    this.actionId.set(license.id);

    this.licenseService.updateStatus(
      license.id,
      status
    ).subscribe({
      next: response => {
        this.actionId.set(null);
        this.successMessage.set(response.message);
        this.loadLicenses();
      },
      error: error => {
        this.actionId.set(null);
        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible cambiar el estado.'
        );
      }
    });
  }
}


