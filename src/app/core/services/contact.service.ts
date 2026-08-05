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
  ContactCreateRequest,
  ContactMessage,
  ContactMessageStatus,
  ContactStatusRequest
} from '../models/contact-message.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Contact`;

  // =========================================================
  // SITIO PÚBLICO
  // =========================================================
  send(
    request: ContactCreateRequest
  ): Observable<ApiResponse<ContactMessage>> {
    return this.http.post<
      ApiResponse<ContactMessage>
    >(
      this.apiUrl,
      request
    );
  }

  // =========================================================
  // BACKOFFICE
  // =========================================================
  getAll():
    Observable<ApiResponse<ContactMessage[]>> {
    return this.http.get<
      ApiResponse<ContactMessage[]>
    >(
      this.apiUrl
    );
  }

  getById(
    id: string
  ): Observable<ApiResponse<ContactMessage>> {
    return this.http.get<
      ApiResponse<ContactMessage>
    >(
      `${this.apiUrl}/${id}`
    );
  }

  updateStatus(
    id: string,
    status: ContactMessageStatus
  ): Observable<ApiResponse<ContactMessage>> {
    const request: ContactStatusRequest = {
      status
    };

    return this.http.put<
      ApiResponse<ContactMessage>
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



