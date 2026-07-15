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
  EtlLog
} from '../models/etl-log.model';

@Injectable({
  providedIn: 'root'
})
export class EtlLogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl =
    `${environment.apiUrl}/EtlLogs`;

  getAll():
    Observable<ApiResponse<EtlLog[]>> {
    return this.http.get<
      ApiResponse<EtlLog[]>
    >(
      this.apiUrl
    );
  }

  runBusinessSnapshot():
    Observable<ApiResponse<EtlLog>> {
    return this.http.post<
      ApiResponse<EtlLog>
    >(
      `${this.apiUrl}/run-business-snapshot`,
      {}
    );
  }
}
