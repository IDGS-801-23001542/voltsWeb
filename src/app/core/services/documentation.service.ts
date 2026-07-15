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
  Documentation,
  DocumentationCreateRequest,
  DocumentationUpdateRequest
} from '../models/documentation.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentationService {
  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Documentation`;

  getPublic():
    Observable<ApiResponse<Documentation[]>> {
    return this.http.get<
      ApiResponse<Documentation[]>
    >(
      `${this.apiUrl}/public`
    );
  }

  getAll():
    Observable<ApiResponse<Documentation[]>> {
    return this.http.get<
      ApiResponse<Documentation[]>
    >(
      this.apiUrl
    );
  }

  getById(
    id: string
  ): Observable<ApiResponse<Documentation>> {
    return this.http.get<
      ApiResponse<Documentation>
    >(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    request: DocumentationCreateRequest
  ): Observable<ApiResponse<Documentation>> {
    return this.http.post<
      ApiResponse<Documentation>
    >(
      this.apiUrl,
      request
    );
  }

  update(
    id: string,
    request: DocumentationUpdateRequest
  ): Observable<ApiResponse<Documentation>> {
    return this.http.put<
      ApiResponse<Documentation>
    >(
      `${this.apiUrl}/${id}`,
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
