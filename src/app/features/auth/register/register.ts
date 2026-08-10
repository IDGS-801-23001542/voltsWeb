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
  LoginResponse
} from '../../../core/models/auth.model';

import {
  INSTITUTION_TYPE_OPTIONS,
  InstitutionType
} from '../../../core/models/institution.model';

import {
  ThemeService
} from '../../../core/services/theme.service';

type RegistrationType = 'client' | 'institution';

function passwordsMatch(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmation = control.get('confirmPassword')?.value;

  return password === confirmation
    ? null
    : { passwordsMismatch: true };
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
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly theme = inject(ThemeService);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly registrationType = signal<RegistrationType>('client');
  readonly verificationChallenge = signal<LoginResponse | null>(null);
  readonly institutionTypes = INSTITUTION_TYPE_OPTIONS;

  readonly verificationForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  readonly clientForm = this.fb.nonNullable.group(
    {
      firstNames: ['', [Validators.required, Validators.minLength(2)]],
      paternalLastName: ['', [Validators.required, Validators.minLength(2)]],
      maternalLastName: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\d{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    },
    { validators: passwordsMatch }
  );

  readonly institutionForm = this.fb.nonNullable.group(
    {
      institutionName: ['', [Validators.required, Validators.minLength(3)]],
      institutionType: ['Other' as InstitutionType, Validators.required],
      firstNames: ['', [Validators.required, Validators.minLength(2)]],
      paternalLastName: ['', [Validators.required, Validators.minLength(2)]],
      maternalLastName: [''],
      position: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\d{10}$/)]],
      estimatedStudents: [null as number | null, [Validators.min(0)]],
      street: [''],
      exteriorNumber: [''],
      interiorNumber: [''],
      neighborhood: [''],
      postalCode: ['', [Validators.pattern(/^\d{5}$/)]],
      city: [''],
      state: [''],
      references: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    },
    { validators: passwordsMatch }
  );

  setRegistrationType(type: RegistrationType): void {
    if (this.loading()) return;
    this.registrationType.set(type);
    this.errorMessage.set('');
  }

  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(value => !value);
  }

  submitClient(): void {
    if (this.clientForm.invalid || this.loading()) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const values = this.clientForm.getRawValue();
    this.startRequest();

    this.auth.registerClient({
      firstNames: values.firstNames.trim(),
      paternalLastName: values.paternalLastName.trim(),
      maternalLastName: values.maternalLastName.trim() || null,
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim() || null,
      password: values.password,
      confirmPassword: values.confirmPassword
    }).subscribe(this.registrationObserver());
  }

  submitInstitution(): void {
    if (this.institutionForm.invalid || this.loading()) {
      this.institutionForm.markAllAsTouched();
      return;
    }

    const values = this.institutionForm.getRawValue();
    const addressFields = [
      values.street,
      values.exteriorNumber,
      values.neighborhood,
      values.postalCode,
      values.city,
      values.state
    ].map(value => value.trim());

    const hasAnyAddress = addressFields.some(Boolean) ||
      Boolean(values.interiorNumber.trim()) ||
      Boolean(values.references.trim());

    const hasCompleteAddress = addressFields.every(Boolean);

    if (hasAnyAddress && !hasCompleteAddress) {
      this.errorMessage.set(
        'Si capturas una dirección, completa calle, número exterior, colonia, código postal, ciudad y estado.'
      );
      return;
    }

    this.startRequest();

    this.auth.registerInstitution({
      institutionName: values.institutionName.trim(),
      institutionType: values.institutionType,
      firstNames: values.firstNames.trim(),
      paternalLastName: values.paternalLastName.trim(),
      maternalLastName: values.maternalLastName.trim() || null,
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim() || null,
      position: values.position.trim() || null,
      estimatedStudents: values.estimatedStudents,
      address: hasCompleteAddress
        ? {
            street: values.street.trim(),
            exteriorNumber: values.exteriorNumber.trim(),
            interiorNumber: values.interiorNumber.trim() || null,
            neighborhood: values.neighborhood.trim(),
            postalCode: values.postalCode.trim(),
            city: values.city.trim(),
            state: values.state.trim(),
            country: 'México',
            references: values.references.trim() || null
          }
        : null,
      password: values.password,
      confirmPassword: values.confirmPassword
    }).subscribe(this.registrationObserver());
  }

  verifyEmail(): void {
    const challenge = this.verificationChallenge();

    if (
      !challenge?.twoFactorChallengeId ||
      this.verificationForm.invalid ||
      this.loading()
    ) {
      this.verificationForm.markAllAsTouched();
      return;
    }

    this.startRequest();

    this.auth.verifyTwoFactor({
      challengeId: challenge.twoFactorChallengeId,
      code: this.verificationForm.controls.code.value.trim()
    }).subscribe({
      next: response => {
        this.loading.set(false);
        this.auth.redirectByRole(response.data.roleName);
      },
      error: error => {
        this.loading.set(false);
        this.errorMessage.set(
          error?.error?.message ?? 'El código no es válido.'
        );
      }
    });
  }

  resendEmailCode(): void {
    const id = this.verificationChallenge()?.twoFactorChallengeId;
    if (!id || this.loading()) return;

    this.startRequest();

    this.auth.resendTwoFactor(id).subscribe({
      next: response => {
        this.loading.set(false);
        this.verificationChallenge.set(response.data);
      },
      error: error => {
        this.loading.set(false);
        this.errorMessage.set(
          error?.error?.message ?? 'No fue posible reenviar el código.'
        );
      }
    });
  }

  private startRequest(): void {
    this.loading.set(true);
    this.errorMessage.set('');
  }

  private registrationObserver() {
    return {
      next: (response: { data: LoginResponse }) => {
        this.loading.set(false);

        if (response.data.requiresTwoFactor) {
          this.verificationChallenge.set(response.data);
          return;
        }

        this.auth.redirectByRole(response.data.roleName);
      },
      error: (error: any) => {
        this.loading.set(false);
        this.errorMessage.set(
          error?.error?.message ?? 'No fue posible crear la cuenta.'
        );
      }
    };
  }
}

