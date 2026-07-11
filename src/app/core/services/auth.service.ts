import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  RegisterClientRequest,
  UserRole
} from '../models/auth.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'volts_token';
  private readonly userKey = 'volts_user';

  readonly currentUser = signal<LoginResponse | null>(
    this.readStoredUser()
  );

  readonly isAuthenticated = computed(
    () => Boolean(this.currentUser() && this.getToken())
  );

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  login(
    request: LoginRequest
  ): Observable<ApiResponse<LoginResponse>> {
    return this.http
      .post<ApiResponse<LoginResponse>>(
        `${environment.apiUrl}/Auth/login`,
        request
      )
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.saveSession(response.data);
          }
        })
      );
  }

  registerClient(
    request: RegisterClientRequest
  ): Observable<ApiResponse<LoginResponse>> {
    return this.http
      .post<ApiResponse<LoginResponse>>(
        `${environment.apiUrl}/Auth/register-client`,
        request
      )
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.saveSession(response.data);
          }
        })
      );
  }

  redirectByRole(role?: UserRole): void {
    const resolvedRole =
      role ?? this.currentUser()?.roleName;

    switch (resolvedRole) {
      case 'Admin':
      case 'Employee':
        this.router.navigate(['/backoffice']);
        break;

      case 'Client':
        this.router.navigate(['/cliente']);
        break;

      default:
        this.router.navigate(['/']);
        break;
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  hasRole(...roles: UserRole[]): boolean {
    const role = this.currentUser()?.roleName;
    return role ? roles.includes(role) : false;
  }

  private saveSession(user: LoginResponse): void {
    localStorage.setItem(this.tokenKey, user.token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private readStoredUser(): LoginResponse | null {
    const value = localStorage.getItem(this.userKey);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as LoginResponse;
    } catch {
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.tokenKey);
      return null;
    }
  }
}
