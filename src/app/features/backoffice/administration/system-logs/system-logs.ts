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
  FormsModule
} from '@angular/forms';

import {
  SystemLog
} from '../../../../core/models/system-log.model';

import {
  SystemLogService
} from '../../../../core/services/system-log.service';

@Component({
  selector: 'app-system-logs',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule
  ],
  templateUrl: './system-logs.html',
  styleUrl: './system-logs.css'
})
export class SystemLogs implements OnInit {
  private readonly service =
    inject(SystemLogService);

  readonly items = signal<SystemLog[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly selected =
    signal<SystemLog | null>(null);

  search = '';
  level = '';
  statusCode: number | null = null;
  from = '';
  to = '';

  readonly page = signal(1);
  readonly total = signal(0);
  readonly totalPages = signal(0);

  ngOnInit(): void {
    this.load();
  }

  searchLogs(): void {
    this.page.set(1);
    this.load();
  }

  clearFilters(): void {
    this.search = '';
    this.level = '';
    this.statusCode = null;
    this.from = '';
    this.to = '';
    this.page.set(1);
    this.load();
  }

  previous(): void {
    if (this.page() <= 1) return;
    this.page.update(value => value - 1);
    this.load();
  }

  next(): void {
    if (this.page() >= this.totalPages())
      return;

    this.page.update(value => value + 1);
    this.load();
  }

  openDetail(item: SystemLog): void {
    this.selected.set(item);
  }

  closeDetail(): void {
    this.selected.set(null);
  }

  deleteOld(): void {
    const value = window.prompt(
      'Eliminar logs con más de cuántos días:',
      '90'
    );

    const days = Number(value);

    if (!Number.isInteger(days) || days < 30)
      return;

    this.service.deleteOld(days).subscribe({
      next: response => {
        this.successMessage.set(
          response.message
        );
        this.load();
      },
      error: error => {
        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible eliminar logs.'
        );
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.service.getAll({
      search:
        this.search.trim() || undefined,
      level:
        this.level || undefined,
      statusCode:
        this.statusCode || undefined,
      from:
        this.from || undefined,
      to:
        this.to || undefined,
      page: this.page(),
      pageSize: 25
    }).subscribe({
      next: response => {
        this.items.set(
          response.data?.items ?? []
        );
        this.total.set(
          response.data?.total ?? 0
        );
        this.totalPages.set(
          response.data?.totalPages ?? 0
        );
        this.loading.set(false);
      },
      error: error => {
        this.loading.set(false);
        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible cargar los logs.'
        );
      }
    });
  }
}



