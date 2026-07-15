import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { CommercialPlan, CommercialPlanCreateRequest, CommercialPlanUpdateRequest } from '../models/commercial-plan.model';

@Injectable({ providedIn: 'root' })
export class CommercialPlanService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/CommercialPlans`;

  getAll(): Observable<ApiResponse<CommercialPlan[]>> {
    return this.http.get<ApiResponse<CommercialPlan[]>>(this.apiUrl);
  }

  create(request: CommercialPlanCreateRequest): Observable<ApiResponse<CommercialPlan>> {
    return this.http.post<ApiResponse<CommercialPlan>>(this.apiUrl, request);
  }

  update(id: string, request: CommercialPlanUpdateRequest): Observable<ApiResponse<CommercialPlan>> {
    return this.http.put<ApiResponse<CommercialPlan>>(`${this.apiUrl}/${id}`, request);
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
