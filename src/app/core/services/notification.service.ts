import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Notification, NotificationCreateRequest } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Notifications`;
  getMine(): Observable<ApiResponse<Notification[]>> { return this.http.get<ApiResponse<Notification[]>>(`${this.apiUrl}/me`); }
  getAll(): Observable<ApiResponse<Notification[]>> { return this.http.get<ApiResponse<Notification[]>>(this.apiUrl); }
  create(request: NotificationCreateRequest): Observable<ApiResponse<number>> { return this.http.post<ApiResponse<number>>(this.apiUrl, request); }
  markAsRead(id: string): Observable<ApiResponse<string>> { return this.http.put<ApiResponse<string>>(`${this.apiUrl}/${id}/read`, {}); }
  markAllAsRead(): Observable<ApiResponse<number>> { return this.http.put<ApiResponse<number>>(`${this.apiUrl}/read-all`, {}); }
  delete(id: string): Observable<ApiResponse<string>> { return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`); }
}
