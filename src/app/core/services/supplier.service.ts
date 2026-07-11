import {
  HttpClient,
  HttpParams
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
  Supplier,
  SupplierRequest,
  SupplierUpdateRequest
} from '../models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Suppliers`;

  getAll(): Observable<ApiResponse<Supplier[]>> {
    return this.http.get<ApiResponse<Supplier[]>>(
      this.apiUrl
    );
  }

  getActive(): Observable<ApiResponse<Supplier[]>> {
    return this.http.get<ApiResponse<Supplier[]>>(
      `${this.apiUrl}/active`
    );
  }

  getById(
    id: string
  ): Observable<ApiResponse<Supplier>> {
    return this.http.get<ApiResponse<Supplier>>(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    request: SupplierRequest
  ): Observable<ApiResponse<Supplier>> {
    return this.http.post<ApiResponse<Supplier>>(
      this.apiUrl,
      request
    );
  }

  update(
    id: string,
    request: SupplierUpdateRequest
  ): Observable<ApiResponse<Supplier>> {
    return this.http.put<ApiResponse<Supplier>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  updateStatus(
    id: string,
    isActive: boolean
  ): Observable<ApiResponse<string>> {
    const params = new HttpParams()
      .set('isActive', isActive);

    return this.http.patch<ApiResponse<string>>(
      `${this.apiUrl}/${id}/status`,
      null,
      {
        params
      }
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
