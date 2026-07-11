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
  Purchase,
  PurchaseCreateRequest,
  PurchaseSummary
} from '../models/purchase.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Purchases`;

  getAll(): Observable<ApiResponse<Purchase[]>> {
    return this.http.get<ApiResponse<Purchase[]>>(
      this.apiUrl
    );
  }

  getSummary():
    Observable<ApiResponse<PurchaseSummary>> {
    return this.http.get<
      ApiResponse<PurchaseSummary>
    >(
      `${this.apiUrl}/summary`
    );
  }

  getById(
    id: string
  ): Observable<ApiResponse<Purchase>> {
    return this.http.get<ApiResponse<Purchase>>(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    request: PurchaseCreateRequest
  ): Observable<ApiResponse<Purchase>> {
    return this.http.post<ApiResponse<Purchase>>(
      this.apiUrl,
      request
    );
  }
}
