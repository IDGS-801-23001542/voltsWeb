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
  EntityStatusUpdateRequest
} from '../models/common.model';

import {
  Customer,
  CustomerCreateRequest,
  CustomerUpdateRequest,
  EntityWithPortalAccount
} from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl =
    `${environment.apiUrl}/Customers`;

  getAll():
    Observable<ApiResponse<Customer[]>> {
    return this.http.get<ApiResponse<Customer[]>>(
      this.apiUrl
    );
  }

  getById(
    id: string
  ): Observable<ApiResponse<Customer>> {
    return this.http.get<ApiResponse<Customer>>(
      `${this.apiUrl}/${id}`
    );
  }

  getMyProfile(): Observable<
  ApiResponse<Customer>
> {
  return this.http.get<
    ApiResponse<Customer>
  >(
    `${environment.apiUrl}/Customers/my`
  );
}

updateMyProfile(
  request: CustomerUpdateRequest
): Observable<
  ApiResponse<Customer>
> {
  return this.http.put<
    ApiResponse<Customer>
  >(
    `${environment.apiUrl}/Customers/my`,
    request
  );
}

  create(
    request: CustomerCreateRequest
  ): Observable<
    ApiResponse<EntityWithPortalAccount<Customer>>
  > {
    return this.http.post<
      ApiResponse<EntityWithPortalAccount<Customer>>
    >(
      this.apiUrl,
      request
    );
  }

  update(
    id: string,
    request: CustomerUpdateRequest
  ): Observable<ApiResponse<Customer>> {
    return this.http.put<ApiResponse<Customer>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  updateStatus(
    id: string,
    isActive: boolean
  ): Observable<ApiResponse<Customer>> {
    const request:
      EntityStatusUpdateRequest = {
        isActive
      };

    return this.http.patch<ApiResponse<Customer>>(
      `${this.apiUrl}/${id}/status`,
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
