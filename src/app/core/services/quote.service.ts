import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { QuoteRequest } from '../models/quote.model';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  constructor(private readonly http: HttpClient) {}

  create(
    request: QuoteRequest
  ): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${environment.apiUrl}/Quotes`,
      request
    );
  }
}
