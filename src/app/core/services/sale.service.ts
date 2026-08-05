import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Sale } from '../models/sale.model';

@Injectable({ providedIn: 'root' })
export class SaleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl =
    `${environment.apiUrl}/Sales`;

  getMine(): Observable<ApiResponse<Sale[]>> {
    return this.http.get<ApiResponse<Sale[]>>(`${this.apiUrl}/my`);
  }

  getAll(): Observable<ApiResponse<Sale[]>> {
    return this.http.get<ApiResponse<Sale[]>>(
      this.apiUrl
    );
  }

  create(
    orderId: string
  ): Observable<ApiResponse<Sale>> {
    return this.http.post<ApiResponse<Sale>>(
      this.apiUrl,
      { orderId }
    );
  }
}
