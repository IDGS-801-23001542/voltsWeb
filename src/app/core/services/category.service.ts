import {
  HttpClient,
  HttpParams
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
  Category,
  CategoryCreateRequest,
  CategoryUpdateRequest
} from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Categories`;

  getAll(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(
      `${this.apiUrl}/backoffice`
    );
  }

  getById(
    id: string
  ): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    request: CategoryCreateRequest
  ): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(
      this.apiUrl,
      request
    );
  }

  update(
    id: string,
    request: CategoryUpdateRequest
  ): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  updateStatus(
    id: string,
    isActive: boolean
  ): Observable<ApiResponse<string>> {
    const params = new HttpParams()
      .set('isActive', isActive);

    return this.http.patch<ApiResponse<string>>(
      `${this.apiUrl}/${id}/status`,
      null,
      {
        params
      }
    );
  }

  delete(
    id: string
  ): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(
      `${this.apiUrl}/${id}`
    );
  }
}
