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
  Waste,
  WasteCreateRequest,
  WasteDispositionRequest,
  WasteSummary
} from '../models/waste.model';

@Injectable({
  providedIn: 'root'
})
export class WasteService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Waste`;

  getAll(): Observable<ApiResponse<Waste[]>> {
    return this.http.get<ApiResponse<Waste[]>>(
      this.apiUrl
    );
  }

  getSummary():
    Observable<ApiResponse<WasteSummary>> {
    return this.http.get<ApiResponse<WasteSummary>>(
      `${this.apiUrl}/summary`
    );
  }

  create(
    request: WasteCreateRequest
  ): Observable<ApiResponse<Waste>> {
    return this.http.post<ApiResponse<Waste>>(
      this.apiUrl,
      request
    );
  }

  dispose(
    id: string,
    request: WasteDispositionRequest
  ): Observable<ApiResponse<Waste>> {
    return this.http.post<ApiResponse<Waste>>(
      `${this.apiUrl}/${id}/dispose`,
      request
    );
  }
}
