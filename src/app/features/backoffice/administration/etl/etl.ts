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
  EtlLog
} from '../../../../core/models/etl-log.model';

import {
  EtlLogService
} from '../../../../core/services/etl-log.service';

@Component({
  selector: 'app-etl',
  standalone: true,
  imports: [
    DatePipe
  ],
  templateUrl: './etl.html',
  styleUrl: './etl.css'
})
export class Etl implements OnInit {
  private readonly service =
    inject(EtlLogService);

  readonly logs = signal<EtlLog[]>([]);
  readonly loading = signal(true);
  readonly running = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly selected =
    signal<EtlLog | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.service.getAll().subscribe({
      next: response => {
        this.logs.set(response.data ?? []);
        this.loading.set(false);
      },
      error: error => {
        this.loading.set(false);
        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible cargar los procesos ETL.'
        );
      }
    });
  }

  run(): void {
    if (this.running())
      return;

    this.running.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.service
      .runBusinessSnapshot()
      .subscribe({
        next: response => {
          this.running.set(false);
          this.successMessage.set(
            response.message
          );
          this.load();
        },
        error: error => {
          this.running.set(false);
          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible ejecutar el proceso ETL.'
          );
        }
      });
  }

  open(log: EtlLog): void {
    this.selected.set(log);
  }

  close(): void {
    this.selected.set(null);
  }
}
