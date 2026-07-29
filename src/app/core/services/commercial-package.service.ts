import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { CommercialPackage, CommercialPackageCreateRequest, CommercialPackageUpdateRequest } from '../models/commercial-package.model';

@Injectable({ providedIn: 'root' })
export class CommercialPackageService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/CommercialPackages`;

  getAll(): Observable<ApiResponse<CommercialPackage[]>> {
    return this.http.get<ApiResponse<CommercialPackage[]>>(this.apiUrl);
  }

  getActive(): Observable<ApiResponse<CommercialPackage[]>> {
  return this.http.get<ApiResponse<CommercialPackage[]>>(
    `${this.apiUrl}/active`
  );
}

  create(request: CommercialPackageCreateRequest): Observable<ApiResponse<CommercialPackage>> {
    return this.http.post<ApiResponse<CommercialPackage>>(this.apiUrl, request);
  }

  update(id: string, request: CommercialPackageUpdateRequest): Observable<ApiResponse<CommercialPackage>> {
    return this.http.put<ApiResponse<CommercialPackage>>(`${this.apiUrl}/${id}`, request);
  }

  updateStatus(id: string, isActive: boolean): Observable<ApiResponse<string>> {
    return this.http.patch<ApiResponse<string>>(`${this.apiUrl}/${id}/status`, null, {
      params: new HttpParams().set('isActive', isActive)
    });
  }

  delete(id: string): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`);
  }
}
