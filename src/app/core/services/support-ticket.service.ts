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
  SupportTicket,
  SupportTicketCreateRequest,
  SupportTicketStatus,
  SupportTicketStatusRequest
} from '../models/support-ticket.model';

@Injectable({
  providedIn: 'root'
})
export class SupportTicketService {
  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/SupportTickets`;

  getAll():
    Observable<ApiResponse<SupportTicket[]>> {
    return this.http.get<
      ApiResponse<SupportTicket[]>
    >(
      this.apiUrl
    );
  }

  getMine(): Observable<ApiResponse<SupportTicket[]>> {
    return this.http.get<ApiResponse<SupportTicket[]>>(`${this.apiUrl}/my`);
  }

  getById(
    id: string
  ): Observable<ApiResponse<SupportTicket>> {
    return this.http.get<
      ApiResponse<SupportTicket>
    >(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    request: SupportTicketCreateRequest
  ): Observable<ApiResponse<SupportTicket>> {
    return this.http.post<
      ApiResponse<SupportTicket>
    >(
      this.apiUrl,
      request
    );
  }

  updateStatus(
    id: string,
    status: SupportTicketStatus
  ): Observable<ApiResponse<SupportTicket>> {
    const request:
      SupportTicketStatusRequest = {
        status
      };

    return this.http.put<
      ApiResponse<SupportTicket>
    >(
      `${this.apiUrl}/${id}/status`,
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


