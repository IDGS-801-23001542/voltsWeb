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
  AnalyticsOverview
} from '../models/analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly http = inject(HttpClient);

  getOverview():
    Observable<ApiResponse<AnalyticsOverview>> {
    return this.http.get<
      ApiResponse<AnalyticsOverview>
    >(
      `${environment.apiUrl}/Analytics/overview`
    );
  }
}
