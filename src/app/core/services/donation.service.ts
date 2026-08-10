import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  Donation,
  DonationCreateRequest,
  DonationMaterialOption,
  DonationStatus
} from '../models/donation.model';

@Injectable({ providedIn: 'root' })
export class DonationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Donations`;

  getMaterialOptions(): Observable<ApiResponse<DonationMaterialOption[]>> {
    return this.http.get<ApiResponse<DonationMaterialOption[]>>(
      `${this.apiUrl}/materials`
    );
  }

  create(request: DonationCreateRequest): Observable<ApiResponse<Donation>> {
    return this.http.post<ApiResponse<Donation>>(this.apiUrl, request);
  }

  getAll(status?: DonationStatus | ''): Observable<ApiResponse<Donation[]>> {
    const params = status
      ? new HttpParams().set('status', status)
      : undefined;

    return this.http.get<ApiResponse<Donation[]>>(this.apiUrl, { params });
  }

  receive(id: string): Observable<ApiResponse<Donation>> {
    return this.http.post<ApiResponse<Donation>>(
      `${this.apiUrl}/${id}/receive`,
      {}
    );
  }

  reject(id: string, reason: string): Observable<ApiResponse<Donation>> {
    return this.http.post<ApiResponse<Donation>>(
      `${this.apiUrl}/${id}/reject`,
      { reason }
    );
  }
}
