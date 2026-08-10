import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { InstitutionDashboard, InstitutionGroup, InstitutionMember, VoltsDevice } from '../models/institution-portal.model';
import { Order } from '../models/order.model';
import { License } from '../models/license.model';

@Injectable({ providedIn: 'root' })
export class InstitutionPortalService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/institution-portal`;

  dashboard() { return this.http.get<ApiResponse<InstitutionDashboard>>(`${this.apiUrl}/dashboard`); }
  orders() { return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/orders`); }
  licenses() { return this.http.get<ApiResponse<License[]>>(`${this.apiUrl}/licenses`); }
  devices() { return this.http.get<ApiResponse<VoltsDevice[]>>(`${this.apiUrl}/devices`); }
  groups() { return this.http.get<ApiResponse<InstitutionGroup[]>>(`${this.apiUrl}/groups`); }
  members() { return this.http.get<ApiResponse<InstitutionMember[]>>(`${this.apiUrl}/members`); }

  createGroup(request: { name: string; description?: string | null; teacherMemberId?: string | null }) {
    return this.http.post<ApiResponse<InstitutionGroup>>(`${this.apiUrl}/groups`, request);
  }
  updateGroup(id: string, request: { name: string; description?: string | null; teacherMemberId?: string | null; isActive: boolean }) {
    return this.http.put<ApiResponse<InstitutionGroup>>(`${this.apiUrl}/groups/${id}`, request);
  }
  setGroupStatus(id: string, isActive: boolean) {
    return this.http.patch<ApiResponse<InstitutionGroup>>(`${this.apiUrl}/groups/${id}/status`, { isActive });
  }

  createMember(request: { memberType: string; fullName: string; email: string; enrollmentOrEmployeeNumber?: string | null; groupId?: string | null }) {
    return this.http.post<ApiResponse<InstitutionMember>>(`${this.apiUrl}/members`, request);
  }
  updateMember(id: string, request: { memberType: string; fullName: string; email: string; enrollmentOrEmployeeNumber?: string | null; groupId?: string | null; isActive: boolean }) {
    return this.http.put<ApiResponse<InstitutionMember>>(`${this.apiUrl}/members/${id}`, request);
  }
  setMemberStatus(id: string, isActive: boolean) {
    return this.http.patch<ApiResponse<InstitutionMember>>(`${this.apiUrl}/members/${id}/status`, { isActive });
  }

  assignDevice(id: string, memberId: string) {
    return this.http.post<ApiResponse<VoltsDevice>>(`${this.apiUrl}/devices/${id}/assign`, { memberId });
  }
  unassignDevice(id: string) {
    return this.http.post<ApiResponse<VoltsDevice>>(`${this.apiUrl}/devices/${id}/unassign`, {});
  }
  assignLicense(id: string, memberId: string) {
    return this.http.post<ApiResponse<License>>(`${this.apiUrl}/licenses/${id}/assign`, { memberId });
  }
  unassignLicense(id: string) {
    return this.http.post<ApiResponse<License>>(`${this.apiUrl}/licenses/${id}/unassign`, {});
  }
}
