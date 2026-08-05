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
  Order
} from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Orders`;

  getAll():
    Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(
      this.apiUrl
    );
  }

  getMyOrders():
  Observable<ApiResponse<Order[]>> {

  return this.http.get<ApiResponse<Order[]>>(
    `${this.apiUrl}/my`
  );
}

  confirm(
    id: string
  ): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(
      `${this.apiUrl}/${id}/confirm`,
      {}
    );
  }

  pay(id: string): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.apiUrl}/my/${id}/pay`, {});
  }

  synchronizeStock(
    id: string
  ): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(
      `${this.apiUrl}/${id}/synchronize-stock`,
      {}
    );
  }

  cancel(
    id: string,
    reason: string
  ): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(
      `${this.apiUrl}/${id}/cancel`,
      {
        reason
      }
    );
  }
}


