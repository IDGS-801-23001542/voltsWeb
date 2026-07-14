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
  RawMaterial,
  RawMaterialMovement,
  RawMaterialRequest,
  RawMaterialStockAdjustment,
  RawMaterialSummary,
  RawMaterialUpdateRequest
} from '../models/raw-material.model';

@Injectable({
  providedIn: 'root'
})
export class RawMaterialService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/RawMaterials`;

  getAll():
    Observable<ApiResponse<RawMaterial[]>> {
    return this.http.get<
      ApiResponse<RawMaterial[]>
    >(
      this.apiUrl
    );
  }

  getSummary():
    Observable<ApiResponse<RawMaterialSummary>> {
    return this.http.get<
      ApiResponse<RawMaterialSummary>
    >(
      `${this.apiUrl}/summary`
    );
  }

  getLowStock():
    Observable<ApiResponse<RawMaterial[]>> {
    return this.http.get<
      ApiResponse<RawMaterial[]>
    >(
      `${this.apiUrl}/low-stock`
    );
  }

  getById(
    id: string
  ): Observable<ApiResponse<RawMaterial>> {
    return this.http.get<
      ApiResponse<RawMaterial>
    >(
      `${this.apiUrl}/${id}`
    );
  }

  getMovements(
    id: string
  ): Observable<
    ApiResponse<RawMaterialMovement[]>
  > {
    return this.http.get<
      ApiResponse<RawMaterialMovement[]>
    >(
      `${this.apiUrl}/${id}/movements`
    );
  }

  create(
    request: RawMaterialRequest
  ): Observable<ApiResponse<RawMaterial>> {
    return this.http.post<
      ApiResponse<RawMaterial>
    >(
      this.apiUrl,
      request
    );
  }

  update(
    id: string,
    request: RawMaterialUpdateRequest
  ): Observable<ApiResponse<RawMaterial>> {
    return this.http.put<
      ApiResponse<RawMaterial>
    >(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  adjustStock(
    id: string,
    request: RawMaterialStockAdjustment
  ): Observable<ApiResponse<RawMaterial>> {
    return this.http.post<
      ApiResponse<RawMaterial>
    >(
      `${this.apiUrl}/${id}/adjust-stock`,
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
