import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  License,
  LicenseStatus
} from '../models/license.model';

@Injectable({ providedIn: 'root' })
export class LicenseService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl =
    `${environment.apiUrl}/Licenses`;

  getAll(): Observable<ApiResponse<License[]>> {
    return this.http.get<ApiResponse<License[]>>(
      this.apiUrl
    );
  }

  getMyLicenses():
  Observable<ApiResponse<License[]>> {

    return this.http.get<ApiResponse<License[]>>(
      `${this.apiUrl}/my`
    );
  }

  assign(
    id: string,
    request: {
      assignedToName: string;
      assignedToEmail?: string | null;
    }
  ): Observable<ApiResponse<License>> {
    return this.http.put<ApiResponse<License>>(
      `${this.apiUrl}/${id}/assign`,
      request
    );
  }

  updateStatus(
    id: string,
    status: LicenseStatus
  ): Observable<ApiResponse<License>> {
    return this.http.put<ApiResponse<License>>(
      `${this.apiUrl}/${id}/status`,
      { status }
    );
  }
}


