import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Donation, DonationStatus } from '../../../../core/models/donation.model';
import { AuthService } from '../../../../core/services/auth.service';
import { DonationService } from '../../../../core/services/donation.service';

@Component({
  selector: 'app-donations',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './donations.html',
  styleUrl: './donations.css'
})
export class Donations implements OnInit {
  private readonly service = inject(DonationService);
  readonly auth = inject(AuthService);

  readonly items = signal<Donation[]>([]);
  readonly loading = signal(true);
  readonly workingId = signal<string | null>(null);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly status = signal<DonationStatus | ''>('');

  readonly canManage = computed(() =>
    this.auth.hasRole('Admin') || this.auth.hasPermission('inventory.manage')
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.service.getAll(this.status()).subscribe({
      next: response => {
        this.items.set(response.data ?? []);
        this.loading.set(false);
      },
      error: error => {
        this.loading.set(false);
        this.errorMessage.set(
          error?.error?.message ?? 'No fue posible cargar las donaciones.'
        );
      }
    });
  }

  changeStatus(value: string): void {
    this.status.set(value as DonationStatus | '');
    this.load();
  }

  receive(item: Donation): void {
    if (!this.canManage() || this.workingId()) {
      return;
    }

    if (!confirm(`¿Confirmar que recibiste físicamente la donación ${item.folio}? Esto sumará el material al inventario.`)) {
      return;
    }

    this.workingId.set(item.id);
    this.errorMessage.set('');

    this.service.receive(item.id).subscribe({
      next: response => {
        this.workingId.set(null);
        this.successMessage.set(response.message);
        this.load();
      },
      error: error => {
        this.workingId.set(null);
        this.errorMessage.set(
          error?.error?.message ?? 'No fue posible recibir la donación.'
        );
      }
    });
  }

  reject(item: Donation): void {
    if (!this.canManage() || this.workingId()) {
      return;
    }

    const reason = prompt('Motivo por el que la donación no fue recibida:')?.trim();
    if (!reason) {
      return;
    }

    this.workingId.set(item.id);
    this.errorMessage.set('');

    this.service.reject(item.id, reason).subscribe({
      next: response => {
        this.workingId.set(null);
        this.successMessage.set(response.message);
        this.load();
      },
      error: error => {
        this.workingId.set(null);
        this.errorMessage.set(
          error?.error?.message ?? 'No fue posible actualizar la donación.'
        );
      }
    });
  }

  statusLabel(status: DonationStatus): string {
    if (status === 'Received') return 'Recibida';
    if (status === 'Rejected') return 'No recibida';
    return 'Pendiente';
  }
}
