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
  ProductionCancelRequest,
  ProductionCompleteRequest,
  ProductionCreateRequest,
  ProductionOrder
} from '../models/production.model';

@Injectable({
  providedIn: 'root'
})
export class ProductionService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Production`;

  getAll():
    Observable<ApiResponse<ProductionOrder[]>> {
    return this.http.get<
      ApiResponse<ProductionOrder[]>
    >(
      this.apiUrl
    );
  }

  getById(
    id: string
  ): Observable<ApiResponse<ProductionOrder>> {
    return this.http.get<
      ApiResponse<ProductionOrder>
    >(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    request: ProductionCreateRequest
  ): Observable<ApiResponse<ProductionOrder>> {
    return this.http.post<
      ApiResponse<ProductionOrder>
    >(
      this.apiUrl,
      request
    );
  }

  start(
    id: string
  ): Observable<ApiResponse<ProductionOrder>> {
    return this.http.post<
      ApiResponse<ProductionOrder>
    >(
      `${this.apiUrl}/${id}/start`,
      {}
    );
  }

  complete(
    id: string,
    request: ProductionCompleteRequest
  ): Observable<ApiResponse<ProductionOrder>> {
    return this.http.post<
      ApiResponse<ProductionOrder>
    >(
      `${this.apiUrl}/${id}/complete`,
      request
    );
  }

  cancel(
    id: string,
    request: ProductionCancelRequest
  ): Observable<ApiResponse<ProductionOrder>> {
    return this.http.post<
      ApiResponse<ProductionOrder>
    >(
      `${this.apiUrl}/${id}/cancel`,
      request
    );
  }
}
