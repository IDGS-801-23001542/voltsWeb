import { AfterViewInit, Component, inject, signal } from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { LoginResponse } from '../../../core/models/auth.model';
import { ThemeService } from '../../../core/services/theme.service';
import { GoogleSignInService } from '../../../core/services/google-sign-in.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly google = inject(GoogleSignInService);

  readonly theme = inject(ThemeService);

  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly errorMessage = signal('');
  readonly twoFactorChallenge = signal<LoginResponse | null>(null);
  readonly recoveryCodes = signal<string[]>([]);
  readonly googleEnabled = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8)
      ]
    ]
  });

  readonly twoFactorForm = this.fb.nonNullable.group({
    code: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(?:\d{6}|[A-Fa-f0-9]{10})$/)
      ]
    ]
  });

  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  ngAfterViewInit(): void {
    const element = document.getElementById('google-sign-in');
    if (!element) return;
    this.google.render(element, credential => this.loginWithGoogle(credential))
      .then(enabled => this.googleEnabled.set(enabled))
      .catch(() => this.googleEnabled.set(false));
  }

  private loginWithGoogle(credential: string): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.errorMessage.set('');
    this.auth.googleLogin(credential).subscribe({
      next: response => {
        this.loading.set(false);
        this.finishNavigation(response.data);
      },
      error: error => {
        this.loading.set(false);
        this.errorMessage.set(error?.error?.message ?? 'No fue posible iniciar sesión con Google.');
      }
    });
  }

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.login(this.form.getRawValue()).subscribe({
      next: response => {
        this.loading.set(false);

        if (response.data.requiresTwoFactor) {
          this.twoFactorChallenge.set(response.data);
          this.twoFactorForm.reset();
          return;
        }

        this.finishNavigation(response.data);
      },
      error: error => {
        this.loading.set(false);

        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible iniciar sesión.'
        );
      }
    });
  }

  verifyTwoFactor(): void {
    const challenge = this.twoFactorChallenge();

    if (!challenge?.twoFactorChallengeId || this.twoFactorForm.invalid || this.loading()) {
      this.twoFactorForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.verifyTwoFactor({
      challengeId: challenge.twoFactorChallengeId,
      code: this.twoFactorForm.controls.code.value.trim()
    }).subscribe({
      next: response => {
        this.loading.set(false);
        const codes = response.data.recoveryCodes ?? [];

        if (codes.length > 0) {
          this.recoveryCodes.set(codes);
          this.twoFactorChallenge.set(response.data);
          return;
        }

        this.finishNavigation(response.data);
      },
      error: error => {
        this.loading.set(false);
        this.errorMessage.set(
          error?.error?.message ?? 'El código de autenticación no es válido.');
      }
    });
  }

  restartLogin(): void {
    this.twoFactorChallenge.set(null);
    this.recoveryCodes.set([]);
    this.twoFactorForm.reset();
    this.errorMessage.set('');
  }

  resendCode(): void {
    const challengeId = this.twoFactorChallenge()?.twoFactorChallengeId;
    if (!challengeId || this.loading()) return;
    this.loading.set(true);
    this.errorMessage.set('');
    this.auth.resendTwoFactor(challengeId).subscribe({
      next: response => {
        this.loading.set(false);
        this.twoFactorChallenge.set(response.data);
      },
      error: error => {
        this.loading.set(false);
        this.errorMessage.set(error?.error?.message ?? 'No fue posible reenviar el código.');
      }
    });
  }

  continueAfterRecovery(): void {
    const session = this.twoFactorChallenge();

    if (session) {
      this.finishNavigation(session);
    }
  }

  private finishNavigation(response: LoginResponse): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
      this.router.navigateByUrl(returnUrl);
      return;
    }

    this.auth.redirectByRole(response.roleName);
  }
}


