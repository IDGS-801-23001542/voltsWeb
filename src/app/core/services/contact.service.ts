import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ContactRequest } from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  constructor(private readonly http: HttpClient) {}

  send(
    request: ContactRequest
  ): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${environment.apiUrl}/Contact`,
      request
    );
  }
}
