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
  forkJoin
} from 'rxjs';

import {
  AuditLog
} from '../../../../core/models/audit-log.model';

import {
  AuditService
} from '../../../../core/services/audit.service';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule
  ],
  templateUrl: './audit.html',
  styleUrl: './audit.css'
})
export class Audit implements OnInit {
  private readonly service =
    inject(AuditService);

  readonly items = signal<AuditLog[]>([]);
  readonly modules = signal<string[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly selected =
    signal<AuditLog | null>(null);

  search = '';
  module = '';
  action = '';
  from = '';
  to = '';

  readonly page = signal(1);
  readonly pageSize = signal(25);
  readonly total = signal(0);
  readonly totalPages = signal(0);

  ngOnInit(): void {
    forkJoin({
      modules:
        this.service.getModules(),
      logs:
        this.service.getAll(
          this.buildQuery()
        )
    }).subscribe({
      next: result => {
        this.modules.set(
          result.modules.data ?? []
        );
        this.applyResult(
          result.logs.data
        );
      },
      error: error => {
        this.loading.set(false);
        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible cargar la auditoría.'
        );
      }
    });
  }

  searchLogs(): void {
    this.page.set(1);
    this.load();
  }

  clearFilters(): void {
    this.search = '';
    this.module = '';
    this.action = '';
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

  openDetail(item: AuditLog): void {
    this.selected.set(item);
  }

  closeDetail(): void {
    this.selected.set(null);
  }

  prettyJson(value?: string | null): string {
    if (!value) return 'Sin datos';

    try {
      return JSON.stringify(
        JSON.parse(value),
        null,
        2
      );
    } catch {
      return value;
    }
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.service
      .getAll(this.buildQuery())
      .subscribe({
        next: response =>
          this.applyResult(
            response.data
          ),
        error: error => {
          this.loading.set(false);
          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible cargar la auditoría.'
          );
        }
      });
  }

  private buildQuery() {
    return {
      search:
        this.search.trim() || undefined,
      module:
        this.module || undefined,
      action:
        this.action || undefined,
      from:
        this.from || undefined,
      to:
        this.to || undefined,
      page: this.page(),
      pageSize: this.pageSize()
    };
  }

  private applyResult(result: any): void {
    this.items.set(result?.items ?? []);
    this.total.set(result?.total ?? 0);
    this.totalPages.set(
      result?.totalPages ?? 0
    );
    this.loading.set(false);
  }
}
