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
  Product,
  ProductCreateRequest,
  ProductStockAdjustmentRequest,
  ProductUpdateRequest
} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Products`;

  getAll(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(
      `${this.apiUrl}/backoffice`
    );
  }

  getPublic(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(this.apiUrl);
  }

  getById(
    id: string
  ): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    request: ProductCreateRequest
  ): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(
      this.apiUrl,
      request
    );
  }

  update(
    id: string,
    request: ProductUpdateRequest
  ): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(
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

  adjustFinishedStock(
    id: string,
    request: ProductStockAdjustmentRequest
  ): Observable<ApiResponse<Product>> {
    return this.http.patch<ApiResponse<Product>>(
      `${this.apiUrl}/${id}/finished-stock`,
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


