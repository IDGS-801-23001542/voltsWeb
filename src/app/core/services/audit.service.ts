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
  AuditLog,
  AuditLogQuery,
  PaginatedResult
} from '../models/audit-log.model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Audit`;

  getAll(
    query: AuditLogQuery
  ): Observable<
    ApiResponse<PaginatedResult<AuditLog>>
  > {
    let params = new HttpParams()
      .set('page', query.page)
      .set('pageSize', query.pageSize);

    if (query.search)
      params = params.set(
        'search',
        query.search
      );

    if (query.module)
      params = params.set(
        'module',
        query.module
      );

    if (query.action)
      params = params.set(
        'action',
        query.action
      );

    if (query.from)
      params = params.set(
        'from',
        query.from
      );

    if (query.to)
      params = params.set(
        'to',
        query.to
      );

    return this.http.get<
      ApiResponse<PaginatedResult<AuditLog>>
    >(
      this.apiUrl,
      { params }
    );
  }

  getModules():
    Observable<ApiResponse<string[]>> {
    return this.http.get<
      ApiResponse<string[]>
    >(
      `${this.apiUrl}/modules`
    );
  }
}
