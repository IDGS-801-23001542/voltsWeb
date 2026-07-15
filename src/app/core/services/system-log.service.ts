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
  PaginatedResult
} from '../models/audit-log.model';

import {
  SystemLog,
  SystemLogQuery
} from '../models/system-log.model';

@Injectable({
  providedIn: 'root'
})
export class SystemLogService {
  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/SystemLogs`;

  getAll(
    query: SystemLogQuery
  ): Observable<
    ApiResponse<PaginatedResult<SystemLog>>
  > {
    let params = new HttpParams()
      .set('page', query.page)
      .set('pageSize', query.pageSize);

    if (query.search)
      params = params.set(
        'search',
        query.search
      );

    if (query.level)
      params = params.set(
        'level',
        query.level
      );

    if (query.statusCode)
      params = params.set(
        'statusCode',
        query.statusCode
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
      ApiResponse<PaginatedResult<SystemLog>>
    >(
      this.apiUrl,
      { params }
    );
  }

  deleteOld(
    olderThanDays: number
  ): Observable<ApiResponse<string>> {
    return this.http.delete<
      ApiResponse<string>
    >(
      `${this.apiUrl}/old`,
      {
        body: {
          olderThanDays
        }
      }
    );
  }
}
