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
  Comment,
  CommentApprovalRequest,
  CommentCreateRequest
} from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Comments`;

  // =========================================================
  // SITIO PÚBLICO
  // =========================================================
  getApproved():
    Observable<ApiResponse<Comment[]>> {
    return this.http.get<
      ApiResponse<Comment[]>
    >(
      `${this.apiUrl}/approved`
    );
  }

  create(
    request: CommentCreateRequest
  ): Observable<ApiResponse<Comment>> {
    return this.http.post<
      ApiResponse<Comment>
    >(
      this.apiUrl,
      request
    );
  }

  // =========================================================
  // BACKOFFICE
  // =========================================================
  getAll():
    Observable<ApiResponse<Comment[]>> {
    return this.http.get<
      ApiResponse<Comment[]>
    >(
      this.apiUrl
    );
  }

  getById(
    id: string
  ): Observable<ApiResponse<Comment>> {
    return this.http.get<
      ApiResponse<Comment>
    >(
      `${this.apiUrl}/${id}`
    );
  }

  updateApproval(
    id: string,
    isApproved: boolean
  ): Observable<ApiResponse<Comment>> {
    const request:
      CommentApprovalRequest = {
        isApproved
      };

    return this.http.put<
      ApiResponse<Comment>
    >(
      `${this.apiUrl}/${id}/approval`,
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
