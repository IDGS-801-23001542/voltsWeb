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
  Notification,
  NotificationCreateRequest
} from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Notifications`;

  getMine():
    Observable<ApiResponse<Notification[]>> {
    return this.http.get<
      ApiResponse<Notification[]>
    >(
      `${this.apiUrl}/me`
    );
  }

  create(
    request: NotificationCreateRequest
  ): Observable<ApiResponse<Notification>> {
    return this.http.post<
      ApiResponse<Notification>
    >(
      this.apiUrl,
      request
    );
  }

  markAsRead(
    id: string
  ): Observable<ApiResponse<string>> {
    return this.http.put<
      ApiResponse<string>
    >(
      `${this.apiUrl}/${id}/read`,
      {}
    );
  }
}
