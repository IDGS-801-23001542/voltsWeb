import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import {
  RouterLink
} from '@angular/router';

import {
  AuthService
} from '../../../core/services/auth.service';

import {
  ThemeService
} from '../../../core/services/theme.service';

function passwordsMatch(
  control: AbstractControl
): ValidationErrors | null {
  const password =
    control.get('password')?.value;

  const confirmation =
    control.get(
      'confirmPassword'
    )?.value;

  return password === confirmation
    ? null
    : {
        passwordsMismatch: true
      };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private readonly fb =
    inject(FormBuilder);

  private readonly auth =
    inject(AuthService);

  readonly theme =
    inject(ThemeService);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);
  readonly showConfirmPassword =
    signal(false);

  readonly form =
    this.fb.nonNullable.group(
      {
        firstNames: [
          '',
          [
            Validators.required,
            Validators.minLength(2)
          ]
        ],
        paternalLastName: [
          '',
          [
            Validators.required,
            Validators.minLength(2)
          ]
        ],
        maternalLastName: [''],
        email: [
          '',
          [
            Validators.required,
            Validators.email
          ]
        ],
        phone: [
          '',
          [
            Validators.pattern(
              /^\d{10}$/
            )
          ]
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8)
          ]
        ],
        confirmPassword: [
          '',
          Validators.required
        ]
      },
      {
        validators:
          passwordsMatch
      }
    );

  togglePassword(): void {
    this.showPassword.update(
      value => !value
    );
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(
      value => !value
    );
  }

  submit(): void {
    if (
      this.form.invalid ||
      this.loading()
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const values =
      this.form.getRawValue();

    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.registerClient({
      firstNames:
        values.firstNames.trim(),
      paternalLastName:
        values.paternalLastName.trim(),
      maternalLastName:
        values.maternalLastName
          .trim() || null,
      email:
        values.email
          .trim()
          .toLowerCase(),
      phone:
        values.phone.trim() || null,
      password:
        values.password,
      confirmPassword:
        values.confirmPassword
    }).subscribe({
      next: response => {
        this.loading.set(false);
        this.auth.redirectByRole(
          response.data.roleName
        );
      },
      error: error => {
        this.loading.set(false);
        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible crear la cuenta.'
        );
      }
    });
  }
}
