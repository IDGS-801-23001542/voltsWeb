import {
  DatePipe,
  DecimalPipe,
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
  Comment,
  CommentApprovalFilter,
  CommentRatingFilter
} from '../../../../core/models/comment.model';

import {
  AuthService
} from '../../../../core/services/auth.service';

import {
  CommentService
} from '../../../../core/services/comment.service';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule
  ],
  templateUrl: './comments.html',
  styleUrl: './comments.css'
})
export class Comments
  implements OnInit {

  private readonly commentService =
    inject(CommentService);

  readonly auth =
    inject(AuthService);

  readonly comments =
    signal<Comment[]>([]);

  readonly selectedComment =
    signal<Comment | null>(null);

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

  readonly approvalControl =
    new FormControl<CommentApprovalFilter>(
      'all',
      {
        nonNullable: true
      }
    );

  readonly ratingControl =
    new FormControl<CommentRatingFilter>(
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

  private readonly approvalFilter =
    toSignal(
      this.approvalControl
        .valueChanges
        .pipe(
          startWith(
            this.approvalControl.value
          )
        ),
      {
        initialValue: 'all'
      }
    );

  private readonly ratingFilter =
    toSignal(
      this.ratingControl
        .valueChanges
        .pipe(
          startWith(
            this.ratingControl.value
          )
        ),
      {
        initialValue: 'all'
      }
    );

  readonly filteredComments =
    computed(() => {
      const term =
        this.searchTerm()
          .trim()
          .toLowerCase();

      const approval =
        this.approvalFilter();

      const rating =
        this.ratingFilter();

      return this.comments().filter(
        comment => {
          const matchesSearch =
            !term ||
            comment.fullName
              .toLowerCase()
              .includes(term) ||
            comment.email
              .toLowerCase()
              .includes(term) ||
            comment.message
              .toLowerCase()
              .includes(term);

          const matchesApproval =
            approval === 'all' ||
            (
              approval === 'approved' &&
              comment.isApproved
            ) ||
            (
              approval === 'pending' &&
              !comment.isApproved
            );

          const matchesRating =
            rating === 'all' ||
            comment.rating === rating;

          return (
            matchesSearch &&
            matchesApproval &&
            matchesRating
          );
        }
      );
    });

  readonly summary =
    computed(() => {
      const comments =
        this.comments();

      const totalRating =
        comments.reduce(
          (
            accumulator,
            comment
          ) =>
            accumulator +
            comment.rating,
          0
        );

      return {
        total:
          comments.length,

        approved:
          comments.filter(
            comment =>
              comment.isApproved
          ).length,

        pending:
          comments.filter(
            comment =>
              !comment.isApproved
          ).length,

        averageRating:
          comments.length > 0
            ? totalRating /
              comments.length
            : 0
      };
    });

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.commentService
      .getAll()
      .subscribe({
        next: response => {
          this.comments.set(
            response.data ?? []
          );

          this.loading.set(false);
        },

        error: error => {
          this.loading.set(false);

          this.errorMessage.set(
            this.resolveError(
              error,
              'No fue posible cargar los comentarios.'
            )
          );
        }
      });
  }

  openDetails(
    comment: Comment
  ): void {
    this.selectedComment.set(
      comment
    );

    this.errorMessage.set('');
    this.successMessage.set('');

    document.body.classList.add(
      'modal-open'
    );
  }

  closeDetails(): void {
    this.selectedComment.set(null);

    document.body.classList.remove(
      'modal-open'
    );
  }

  updateApproval(
    isApproved: boolean
  ): void {
    const comment =
      this.selectedComment();

    if (
      !comment ||
      comment.isApproved ===
        isApproved ||
      this.saving()
    ) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.commentService
      .updateApproval(
        comment.id,
        isApproved
      )
      .subscribe({
        next: response => {
          const updated =
            response.data;

          if (updated) {
            this.replaceComment(
              updated
            );

            this.selectedComment.set(
              updated
            );
          } else {
            const fallback: Comment = {
              ...comment,
              isApproved,
              updatedAt:
                new Date().toISOString()
            };

            this.replaceComment(
              fallback
            );

            this.selectedComment.set(
              fallback
            );
          }

          this.successMessage.set(
            isApproved
              ? 'Comentario aprobado correctamente.'
              : 'Comentario ocultado correctamente.'
          );

          this.saving.set(false);
        },

        error: error => {
          this.saving.set(false);

          this.errorMessage.set(
            this.resolveError(
              error,
              'No fue posible actualizar el comentario.'
            )
          );
        }
      });
  }

  deleteComment(): void {
    const comment =
      this.selectedComment();

    if (
      !comment ||
      !this.auth.hasRole('Admin') ||
      this.saving()
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `¿Seguro que deseas eliminar el comentario de ${comment.fullName}?`
      );

    if (!confirmed) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.commentService
      .delete(comment.id)
      .subscribe({
        next: () => {
          this.comments.update(
            current =>
              current.filter(
                item =>
                  item.id !==
                  comment.id
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
              'No fue posible eliminar el comentario.'
            )
          );
        }
      });
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.approvalControl.setValue(
      'all'
    );
    this.ratingControl.setValue(
      'all'
    );
  }

  stars(
    rating: number
  ): string {
    const normalizedRating =
      Math.max(
        0,
        Math.min(5, rating)
      );

    return (
      '★'.repeat(
        normalizedRating
      ) +
      '☆'.repeat(
        5 - normalizedRating
      )
    );
  }

  private replaceComment(
    updatedComment: Comment
  ): void {
    this.comments.update(
      current =>
        current.map(
          comment =>
            comment.id ===
            updatedComment.id
              ? updatedComment
              : comment
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



