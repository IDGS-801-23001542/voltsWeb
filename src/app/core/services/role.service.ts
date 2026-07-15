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
  PermissionDefinition,
  Role
} from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Roles`;

  getAll():
    Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(
      this.apiUrl
    );
  }

  getPermissions():
    Observable<
      ApiResponse<PermissionDefinition[]>
    > {
    return this.http.get<
      ApiResponse<PermissionDefinition[]>
    >(
      `${environment.apiUrl}/Permissions`
    );
  }

  create(request: {
    name: string;
    description: string;
    permissions: string[];
  }): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(
      this.apiUrl,
      request
    );
  }

  update(
    id: string,
    request: {
      name: string;
      description: string;
      permissions: string[];
      isActive: boolean;
    }
  ): Observable<ApiResponse<Role>> {
    return this.http.put<ApiResponse<Role>>(
      `${this.apiUrl}/${id}`,
      request
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
