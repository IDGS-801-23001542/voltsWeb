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
  Institution,
  InstitutionCreateRequest,
  InstitutionUpdateRequest
} from '../models/institution.model';

@Injectable({
  providedIn: 'root'
})
export class InstitutionService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Institutions`;

  getAll(): Observable<ApiResponse<Institution[]>> {
    return this.http.get<ApiResponse<Institution[]>>(
      this.apiUrl
    );
  }

  getById(
    id: string
  ): Observable<ApiResponse<Institution>> {
    return this.http.get<ApiResponse<Institution>>(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    request: InstitutionCreateRequest
  ): Observable<ApiResponse<Institution>> {
    return this.http.post<ApiResponse<Institution>>(
      this.apiUrl,
      request
    );
  }

  update(
    id: string,
    request: InstitutionUpdateRequest
  ): Observable<ApiResponse<Institution>> {
    return this.http.put<ApiResponse<Institution>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  updateStatus(
    institution: Institution,
    isActive: boolean
  ): Observable<ApiResponse<Institution>> {
    const request: InstitutionUpdateRequest = {
      name: institution.name,
      contactName: institution.contactName,
      email: institution.email,
      phone: institution.phone ?? null,
      address: institution.address ?? null,
      institutionType:
        institution.institutionType,
      isActive
    };

    return this.update(
      institution.id,
      request
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
