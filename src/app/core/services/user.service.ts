import {
  HttpClient
} from '@angular/common/http';

import {
  Injectable,
  inject
} from '@angular/core';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

import {
  ApiResponse
} from '../models/api-response.model';

import {
  User
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Users`;

  getAll():
    Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(
      this.apiUrl
    );
  }

  create(request: {
    firstNames: string;
    paternalLastName: string;
    maternalLastName?: string | null;
    email: string;
    password: string;
    roleName: string;
  }): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(
      `${environment.apiUrl}/Auth/users`,
      request
    );
  }

  update(
    id: string,
    request: {
      firstNames: string;
      paternalLastName: string;
      maternalLastName?: string | null;
      roleName: string;
      isActive: boolean;
    }
  ): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  updateStatus(
    id: string,
    isActive: boolean
  ): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(
      `${this.apiUrl}/${id}/status`,
      { isActive }
    );
  }

  unlock(
    id: string
  ): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(
      `${this.apiUrl}/${id}/unlock`,
      {}
    );
  }

  delete(
    id: string
  ): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(
      `${this.apiUrl}/${id}`
    );
  }
}
