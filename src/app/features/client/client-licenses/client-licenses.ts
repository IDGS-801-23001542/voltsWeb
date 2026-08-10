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
  RouterLink
} from '@angular/router';

import {
  License,
  LicenseStatus
} from '../../../core/models/license.model';

import {
  LicenseService
} from '../../../core/services/license.service';

@Component({
  selector: 'app-client-licenses',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe
  ],
  templateUrl: './client-licenses.html',
  styleUrl: './client-licenses.css'
})
export class ClientLicenses implements OnInit {
  private readonly licenseService =
    inject(LicenseService);

  readonly licenses =
    signal<License[]>([]);

  readonly loading =
    signal(true);

  readonly errorMessage =
    signal('');

  readonly totalLicenses =
    computed(() =>
      this.licenses().length
    );

  readonly activeLicenses =
    computed(() =>
      this.licenses().filter(
        license =>
          license.status === 'Active'
      ).length
    );

  readonly availableLicenses =
    computed(() =>
      this.licenses().filter(
        license =>
          license.status === 'Available'
      ).length
    );

  readonly inactiveLicenses =
    computed(() =>
      this.licenses().filter(
        license =>
          license.status === 'Expired' ||
          license.status === 'Revoked'
      ).length
    );

  ngOnInit(): void {
    this.loadLicenses();
  }

  loadLicenses(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.licenseService
      .getMyLicenses()
      .subscribe({
        next: response => {
          this.licenses.set(
            response.data ?? []
          );

          this.loading.set(false);
        },

        error: error => {
          this.licenses.set([]);
          this.loading.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible cargar tus licencias.'
          );
        }
      });
  }

  getStatusLabel(
    status: LicenseStatus
  ): string {
    const labels:
      Record<LicenseStatus, string> = {
        Available: 'Disponible',
        Active: 'Activa',
        Expired: 'Expirada',
        Revoked: 'Revocada'
      };

    return labels[status];
  }

  getStatusIcon(
    status: LicenseStatus
  ): string {
    const icons:
      Record<LicenseStatus, string> = {
        Available: '🟡',
        Active: '🟢',
        Expired: '⌛',
        Revoked: '🚫'
      };

    return icons[status];
  }

  getStatusClass(
    status: LicenseStatus
  ): string {
    return status.toLowerCase();
  }

  hasAssignment(
    license: License
  ): boolean {
    return Boolean(
      license.assignedToName ||
      license.assignedToEmail ||
      license.deviceSerialNumber
    );
  }

  isWarrantyExpired(
    license: License
  ): boolean {
    return (
      new Date(
        license.warrantyEndDate
      ).getTime() <
      new Date().setHours(
        0,
        0,
        0,
        0
      )
    );
  }
}
