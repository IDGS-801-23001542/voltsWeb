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
  UpdateNews,
  UpdateNewsCreateRequest,
  UpdateNewsUpdateRequest
} from '../models/update-news.model';

@Injectable({
  providedIn: 'root'
})
export class UpdateNewsService {
  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/UpdateNews`;

  getPublished():
    Observable<ApiResponse<UpdateNews[]>> {
    return this.http.get<
      ApiResponse<UpdateNews[]>
    >(
      `${this.apiUrl}/published`
    );
  }

  getAll():
    Observable<ApiResponse<UpdateNews[]>> {
    return this.http.get<
      ApiResponse<UpdateNews[]>
    >(
      this.apiUrl
    );
  }

  getById(
    id: string
  ): Observable<ApiResponse<UpdateNews>> {
    return this.http.get<
      ApiResponse<UpdateNews>
    >(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    request: UpdateNewsCreateRequest
  ): Observable<ApiResponse<UpdateNews>> {
    return this.http.post<
      ApiResponse<UpdateNews>
    >(
      this.apiUrl,
      request
    );
  }

  update(
    id: string,
    request: UpdateNewsUpdateRequest
  ): Observable<ApiResponse<UpdateNews>> {
    return this.http.put<
      ApiResponse<UpdateNews>
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
