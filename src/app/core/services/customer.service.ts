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
  Customer,
  CustomerCreateRequest,
  CustomerUpdateRequest
} from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Customers`;

  getAll():
    Observable<ApiResponse<Customer[]>> {
    return this.http.get<
      ApiResponse<Customer[]>
    >(
      this.apiUrl
    );
  }

  getById(
    id: string
  ): Observable<ApiResponse<Customer>> {
    return this.http.get<
      ApiResponse<Customer>
    >(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    request: CustomerCreateRequest
  ): Observable<ApiResponse<Customer>> {
    return this.http.post<
      ApiResponse<Customer>
    >(
      this.apiUrl,
      request
    );
  }

  update(
    id: string,
    request: CustomerUpdateRequest
  ): Observable<ApiResponse<Customer>> {
    return this.http.put<
      ApiResponse<Customer>
    >(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  updateStatus(
    customer: Customer,
    isActive: boolean
  ): Observable<ApiResponse<Customer>> {
    const request: CustomerUpdateRequest = {
      customerType:
        customer.customerType,

      fullName:
        customer.fullName,

      institutionName:
        customer.institutionName ?? null,

      email:
        customer.email,

      phone:
        customer.phone ?? null,

      address:
        customer.address ?? null,

      isActive
    };

    return this.update(
      customer.id,
      request
    );
  }

  delete(
    id: string
  ): Observable<ApiResponse<string>> {
    return this.http.delete<
      ApiResponse<string>
    >(
      `${this.apiUrl}/${id}`
    );
  }
}
