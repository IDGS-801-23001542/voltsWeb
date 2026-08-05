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
  AuthService
} from '../../../../core/services/auth.service';

import {
  ContactService
} from '../../../../core/services/contact.service';

import {
  ContactMessage,
  ContactMessageStatus,
  ContactMessageStatusFilter
} from '../../../../core/models/contact-message.model';

@Component({
  selector: 'app-contact-messages',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule
  ],
  templateUrl: './contact-messages.html',
  styleUrl: './contact-messages.css'
})
export class ContactMessages
  implements OnInit {

  private readonly contactService =
    inject(ContactService);

  readonly auth =
    inject(AuthService);

  readonly messages =
    signal<ContactMessage[]>([]);

  readonly selectedMessage =
    signal<ContactMessage | null>(null);

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
    new FormControl<ContactMessageStatusFilter>(
      'all',
      {
        nonNullable: true
      }
    );

  private readonly searchTerm =
    toSignal(
      this.searchControl.valueChanges.pipe(
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
      this.statusControl.valueChanges.pipe(
        startWith(
          this.statusControl.value
        )
      ),
      {
        initialValue: 'all'
      }
    );

  readonly filteredMessages =
    computed(() => {
      const term =
        this.searchTerm()
          .trim()
          .toLowerCase();

      const status =
        this.statusFilter();

      return this.messages().filter(
        message => {
          const matchesSearch =
            !term ||
            message.fullName
              .toLowerCase()
              .includes(term) ||
            message.email
              .toLowerCase()
              .includes(term) ||
            message.subject
              .toLowerCase()
              .includes(term) ||
            message.message
              .toLowerCase()
              .includes(term);

          const matchesStatus =
            status === 'all' ||
            message.status === status;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    });

  readonly summary =
    computed(() => {
      const messages =
        this.messages();

      return {
        total:
          messages.length,

        new:
          messages.filter(
            message =>
              message.status === 'New'
          ).length,

        inProgress:
          messages.filter(
            message =>
              message.status ===
              'InProgress'
          ).length,

        responded:
          messages.filter(
            message =>
              message.status ===
              'Responded'
          ).length,

        closed:
          messages.filter(
            message =>
              message.status ===
              'Closed'
          ).length
      };
    });

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.contactService
      .getAll()
      .subscribe({
        next: response => {
          this.messages.set(
            response.data ?? []
          );

          this.loading.set(false);
        },

        error: error => {
          this.loading.set(false);

          this.errorMessage.set(
            this.resolveError(
              error,
              'No fue posible cargar los mensajes.'
            )
          );
        }
      });
  }

  openDetails(
    message: ContactMessage
  ): void {
    this.selectedMessage.set(
      message
    );

    this.successMessage.set('');
    this.errorMessage.set('');

    document.body.classList.add(
      'modal-open'
    );
  }

  closeDetails(): void {
    this.selectedMessage.set(null);

    document.body.classList.remove(
      'modal-open'
    );
  }

  updateStatus(
    status: ContactMessageStatus
  ): void {
    const message =
      this.selectedMessage();

    if (
      !message ||
      message.status === status ||
      this.saving()
    ) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.contactService
      .updateStatus(
        message.id,
        status
      )
      .subscribe({
        next: response => {
          const updatedMessage =
            response.data;

          if (updatedMessage) {
            this.replaceMessage(
              updatedMessage
            );

            this.selectedMessage.set(
              updatedMessage
            );
          } else {
            const fallback: ContactMessage = {
              ...message,
              status,
              updatedAt:
                new Date().toISOString()
            };

            this.replaceMessage(
              fallback
            );

            this.selectedMessage.set(
              fallback
            );
          }

          this.successMessage.set(
            'Estado actualizado correctamente.'
          );

          this.saving.set(false);
        },

        error: error => {
          this.saving.set(false);

          this.errorMessage.set(
            this.resolveError(
              error,
              'No fue posible actualizar el estado.'
            )
          );
        }
      });
  }

  deleteMessage(): void {
    const message =
      this.selectedMessage();

    if (
      !message ||
      !this.auth.hasRole('Admin') ||
      this.saving()
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `¿Seguro que deseas eliminar el mensaje de ${message.fullName}?`
      );

    if (!confirmed) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.contactService
      .delete(message.id)
      .subscribe({
        next: () => {
          this.messages.update(
            current =>
              current.filter(
                item =>
                  item.id !== message.id
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
              'No fue posible eliminar el mensaje.'
            )
          );
        }
      });
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.statusControl.setValue('all');
  }

  statusLabel(
    status: ContactMessageStatus
  ): string {
    const labels:
      Record<ContactMessageStatus, string> = {
        New: 'Nuevo',
        InProgress: 'En proceso',
        Responded: 'Respondido',
        Closed: 'Cerrado'
      };

    return labels[status];
  }

  private replaceMessage(
    updatedMessage: ContactMessage
  ): void {
    this.messages.update(
      current =>
        current.map(
          message =>
            message.id ===
            updatedMessage.id
              ? updatedMessage
              : message
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



