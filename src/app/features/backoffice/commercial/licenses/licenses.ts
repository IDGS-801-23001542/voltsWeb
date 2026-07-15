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
    DatePipe
  ],
  templateUrl: './licenses.html',
  styleUrl: './licenses.css'
})
export class Licenses implements OnInit {
  private readonly licenseService =
    inject(LicenseService);

  readonly licenses = signal<License[]>([]);
  readonly loading = signal(true);
  readonly actionId = signal<string | null>(null);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

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

  assign(license: License): void {
    const name = window.prompt(
      'Nombre de la persona, grupo o responsable:'
    );

    if (!name?.trim()) {
      return;
    }

    const email = window.prompt(
      'Correo opcional:'
    );

    const serial = window.prompt(
      'Número de serie del dispositivo opcional:'
    );

    this.actionId.set(license.id);

    this.licenseService.assign(
      license.id,
      {
        assignedToName: name.trim(),
        assignedToEmail:
          email?.trim() || null,
        deviceSerialNumber:
          serial?.trim() || null
      }
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
