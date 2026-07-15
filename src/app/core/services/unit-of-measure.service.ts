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
  UnitOfMeasure
} from '../models/unit-of-measure.model';

@Injectable({
  providedIn: 'root'
})
export class UnitOfMeasureService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/UnitsOfMeasure`;

  getAll():
    Observable<ApiResponse<UnitOfMeasure[]>> {
    return this.http.get<
      ApiResponse<UnitOfMeasure[]>
    >(
      this.apiUrl
    );
  }

  getActive():
    Observable<ApiResponse<UnitOfMeasure[]>> {
    return this.http.get<
      ApiResponse<UnitOfMeasure[]>
    >(
      `${this.apiUrl}/active`
    );
  }

  getById(
    id: string
  ): Observable<ApiResponse<UnitOfMeasure>> {
    return this.http.get<
      ApiResponse<UnitOfMeasure>
    >(
      `${this.apiUrl}/${id}`
    );
  }
}
