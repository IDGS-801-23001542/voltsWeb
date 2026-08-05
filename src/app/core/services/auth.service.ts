import {
  HttpClient
} from '@angular/common/http';

import {
  Injectable,
  computed,
  signal
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  Observable,
  tap
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

import {
  LoginRequest,
  LoginResponse,
  RegisterClientRequest,
  TwoFactorVerifyRequest,
  ChangePasswordRequest,
  UserRole
} from '../models/auth.model';

import {
  ApiResponse
} from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey =
    'volts_token';

  private readonly userKey =
    'volts_user';

  readonly currentUser =
    signal<LoginResponse | null>(
      this.readStoredUser()
    );

  readonly isAuthenticated =
    computed(() =>
      Boolean(
        this.currentUser() &&
        this.getToken()
      )
    );

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  login(
    request: LoginRequest
  ): Observable<
    ApiResponse<LoginResponse>
  > {
    return this.http
      .post<ApiResponse<LoginResponse>>(
        `${environment.apiUrl}/Auth/login`,
        request
      )
      .pipe(
        tap(response => {
          if (
            response.success &&
            response.data.token &&
            !response.data.requiresTwoFactor
          ) {
            this.saveSession(
              response.data
            );
          }
        })
      );
  }

  verifyTwoFactor(
    request: TwoFactorVerifyRequest
  ): Observable<ApiResponse<LoginResponse>> {
    return this.http
      .post<ApiResponse<LoginResponse>>(
        `${environment.apiUrl}/Auth/verify-two-factor`,
        request
      )
      .pipe(
        tap(response => {
          if (response.success && response.data?.token) {
            this.saveSession(response.data);
          }
        })
      );
  }

  registerClient(
    request: RegisterClientRequest
  ): Observable<
    ApiResponse<LoginResponse>
  > {
    return this.http
      .post<ApiResponse<LoginResponse>>(
        `${environment.apiUrl}/Auth/register-client`,
        request
      )
      .pipe(
        tap(response => {
          if (
            response.success &&
            response.data.token &&
            !response.data.requiresTwoFactor
          ) {
            this.saveSession(
              response.data
            );
          }
        })
      );
  }

  resendTwoFactor(challengeId: string): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${environment.apiUrl}/Auth/resend-two-factor`,
      { challengeId }
    );
  }

  googleLogin(credential: string): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${environment.apiUrl}/Auth/google`,
      { credential }
    ).pipe(tap(response => {
      if (response.success && response.data?.token) this.saveSession(response.data);
    }));
  }

  changePassword(request: ChangePasswordRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${environment.apiUrl}/Auth/change-password`, request
    );
  }

  redirectByRole(
    role?: UserRole
  ): void {
    const resolved =
      role ??
      this.currentUser()?.roleName;

    if (this.isInternalAccount()) {
      const destination = this.hasPermission('analytics.read')
        ? '/backoffice'
        : this.hasPermission('production.read')
          ? '/backoffice/produccion'
          : this.hasPermission('inventory.read')
            ? '/backoffice/productos'
            : this.hasPermission('commercial.orders.manage')
              ? '/backoffice/pedidos'
              : this.hasPermission('commercial.quotes.manage')
                ? '/backoffice/cotizaciones'
                : this.hasPermission('support.read')
                  ? '/backoffice/soporte'
                  : '/backoffice';

      this.router.navigate([destination]);
      return;
    }

    switch (resolved) {
      case 'Admin':
      case 'Employee':
        this.router.navigate([
          '/backoffice'
        ]);
        break;

      case 'Client':
        this.router.navigate([
          '/cliente'
        ]);
        break;

      case 'Institution':
        this.router.navigate([
          '/institucion'
        ]);
        break;

      default:
        this.router.navigate(['/']);
        break;
    }
  }

  logout(): void {
    this.http.post(
      `${environment.apiUrl}/Auth/logout`,
      {}
    ).subscribe({ error: () => {} });

    localStorage.removeItem(
      this.tokenKey
    );

    localStorage.removeItem(
      this.userKey
    );

    this.currentUser.set(null);

    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(
      this.tokenKey
    );
  }

  hasRole(
    ...roles: UserRole[]
  ): boolean {
    const role =
      this.currentUser()?.roleName;

    return role
      ? roles.includes(role)
      : false;
  }

  hasPermission(
    permission: string
  ): boolean {
    const permissions =
      this.currentUser()?.permissions ??
      [];

    return (
      permissions.includes('*') ||
      permissions.includes(permission)
    );
  }

  isInternalAccount(): boolean {
    const type = this.currentUser()?.userType;
    return type === 1 || type === 'Employee';
  }

  private saveSession(
    user: LoginResponse
  ): void {
    localStorage.setItem(
      this.tokenKey,
      user.token
    );

    localStorage.setItem(
      this.userKey,
      JSON.stringify(user)
    );

    this.currentUser.set(user);
  }

  private readStoredUser():
    LoginResponse | null {
    const value =
      localStorage.getItem(
        this.userKey
      );

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(
        value
      ) as LoginResponse;
    } catch {
      localStorage.removeItem(
        this.userKey
      );

      localStorage.removeItem(
        this.tokenKey
      );

      return null;
    }
  }
}


