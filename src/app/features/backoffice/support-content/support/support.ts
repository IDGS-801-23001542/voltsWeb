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
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';

import {
  toSignal
} from '@angular/core/rxjs-interop';

import {
  startWith
} from 'rxjs';

import {
  SupportTicket,
  SupportTicketPriority,
  SupportTicketPriorityFilter,
  SupportTicketStatus,
  SupportTicketStatusFilter
} from '../../../../core/models/support-ticket.model';

import {
  AuthService
} from '../../../../core/services/auth.service';

import {
  SupportTicketService
} from '../../../../core/services/support-ticket.service';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule
  ],
  templateUrl: './support.html',
  styleUrl: './support.css'
})
export class Support
  implements OnInit {

  private readonly supportService =
    inject(SupportTicketService);

  readonly auth =
    inject(AuthService);

  readonly tickets =
    signal<SupportTicket[]>([]);

  readonly selectedTicket =
    signal<SupportTicket | null>(null);

  readonly loading =
    signal(true);

  readonly saving =
    signal(false);

  readonly errorMessage =
    signal('');

  readonly successMessage =
    signal('');

  readonly searchControl =
    new FormControl(
      '',
      {
        nonNullable: true
      }
    );

  readonly statusControl =
    new FormControl<SupportTicketStatusFilter>(
      'all',
      {
        nonNullable: true
      }
    );

  readonly priorityControl =
    new FormControl<SupportTicketPriorityFilter>(
      'all',
      {
        nonNullable: true
      }
    );

  private readonly searchTerm =
    toSignal(
      this.searchControl
        .valueChanges
        .pipe(
          startWith(
            this.searchControl.value
          )
        ),
      {
        initialValue: ''
      }
    );

  private readonly statusFilter =
    toSignal(
      this.statusControl
        .valueChanges
        .pipe(
          startWith(
            this.statusControl.value
          )
        ),
      {
        initialValue: 'all'
      }
    );

  private readonly priorityFilter =
    toSignal(
      this.priorityControl
        .valueChanges
        .pipe(
          startWith(
            this.priorityControl.value
          )
        ),
      {
        initialValue: 'all'
      }
    );

  readonly filteredTickets =
    computed(() => {
      const term =
        this.searchTerm()
          .trim()
          .toLowerCase();

      const status =
        this.statusFilter();

      const priority =
        this.priorityFilter();

      return this.tickets().filter(
        ticket => {
          const matchesSearch =
            !term ||
            ticket.customerName
              .toLowerCase()
              .includes(term) ||
            ticket.email
              .toLowerCase()
              .includes(term) ||
            ticket.subject
              .toLowerCase()
              .includes(term) ||
            ticket.description
              .toLowerCase()
              .includes(term);

          const matchesStatus =
            status === 'all' ||
            ticket.status === status;

          const matchesPriority =
            priority === 'all' ||
            ticket.priority === priority;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority
          );
        }
      );
    });

  readonly summary =
    computed(() => {
      const tickets =
        this.tickets();

      return {
        total:
          tickets.length,

        open:
          tickets.filter(
            ticket =>
              ticket.status === 'Open'
          ).length,

        inProgress:
          tickets.filter(
            ticket =>
              ticket.status ===
              'InProgress'
          ).length,

        resolved:
          tickets.filter(
            ticket =>
              ticket.status ===
              'Resolved'
          ).length,

        urgent:
          tickets.filter(
            ticket =>
              ticket.priority === 'Urgent' &&
              ticket.status !== 'Closed'
          ).length
      };
    });

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.supportService
      .getAll()
      .subscribe({
        next: response => {
          this.tickets.set(
            response.data ?? []
          );

          this.loading.set(false);
        },

        error: error => {
          this.loading.set(false);

          this.errorMessage.set(
            this.resolveError(
              error,
              'No fue posible cargar los tickets.'
            )
          );
        }
      });
  }

  openDetails(
    ticket: SupportTicket
  ): void {
    this.selectedTicket.set(
      ticket
    );

    this.errorMessage.set('');
    this.successMessage.set('');

    document.body.classList.add(
      'modal-open'
    );
  }

  closeDetails(): void {
    this.selectedTicket.set(null);

    document.body.classList.remove(
      'modal-open'
    );
  }

  updateStatus(
    status: SupportTicketStatus
  ): void {
    const ticket =
      this.selectedTicket();

    if (
      !ticket ||
      ticket.status === status ||
      this.saving()
    ) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.supportService
      .updateStatus(
        ticket.id,
        status
      )
      .subscribe({
        next: response => {
          const updatedTicket =
            response.data;

          if (updatedTicket) {
            this.replaceTicket(
              updatedTicket
            );

            this.selectedTicket.set(
              updatedTicket
            );
          } else {
            const fallback:
              SupportTicket = {
                ...ticket,
                status,
                updatedAt:
                  new Date().toISOString()
              };

            this.replaceTicket(
              fallback
            );

            this.selectedTicket.set(
              fallback
            );
          }

          this.successMessage.set(
            'Estado del ticket actualizado correctamente.'
          );

          this.saving.set(false);
        },

        error: error => {
          this.saving.set(false);

          this.errorMessage.set(
            this.resolveError(
              error,
              'No fue posible actualizar el ticket.'
            )
          );
        }
      });
  }

  deleteTicket(): void {
    const ticket =
      this.selectedTicket();

    if (
      !ticket ||
      !this.auth.hasRole('Admin') ||
      this.saving()
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `¿Seguro que deseas eliminar el ticket "${ticket.subject}"?`
      );

    if (!confirmed) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.supportService
      .delete(ticket.id)
      .subscribe({
        next: () => {
          this.tickets.update(
            current =>
              current.filter(
                item =>
                  item.id !== ticket.id
              )
          );

          this.saving.set(false);
          this.closeDetails();
        },

        error: error => {
          this.saving.set(false);

          this.errorMessage.set(
            this.resolveError(
              error,
              'No fue posible eliminar el ticket.'
            )
          );
        }
      });
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.statusControl.setValue('all');
    this.priorityControl.setValue('all');
  }

  statusLabel(
    status: SupportTicketStatus
  ): string {
    const labels:
      Record<SupportTicketStatus, string> = {
        Open: 'Abierto',
        InProgress: 'En proceso',
        Resolved: 'Resuelto',
        Closed: 'Cerrado'
      };

    return labels[status];
  }

  priorityLabel(
    priority: SupportTicketPriority
  ): string {
    const labels:
      Record<SupportTicketPriority, string> = {
        Low: 'Baja',
        Medium: 'Media',
        High: 'Alta',
        Urgent: 'Urgente'
      };

    return labels[priority];
  }

  private replaceTicket(
    updatedTicket: SupportTicket
  ): void {
    this.tickets.update(
      current =>
        current.map(
          ticket =>
            ticket.id ===
            updatedTicket.id
              ? updatedTicket
              : ticket
        )
    );
  }

  private resolveError(
    error: any,
    fallback: string
  ): string {
    if (
      Array.isArray(
        error?.error?.errors
      ) &&
      error.error.errors.length > 0
    ) {
      return error.error.errors.join(
        ' '
      );
    }

    return (
      error?.error?.message ??
      fallback
    );
  }
}
