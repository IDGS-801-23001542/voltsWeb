import {
  HttpClient,
  HttpParams
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
  Recipe,
  RecipeRequest
} from '../models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Recipes`;

  getAll(): Observable<ApiResponse<Recipe[]>> {
    return this.http.get<ApiResponse<Recipe[]>>(
      this.apiUrl
    );
  }

  getById(
    id: string
  ): Observable<ApiResponse<Recipe>> {
    return this.http.get<ApiResponse<Recipe>>(
      `${this.apiUrl}/${id}`
    );
  }

  getByProduct(
    productId: string
  ): Observable<ApiResponse<Recipe>> {
    return this.http.get<ApiResponse<Recipe>>(
      `${this.apiUrl}/product/${productId}`
    );
  }

  create(
    request: RecipeRequest
  ): Observable<ApiResponse<Recipe>> {
    return this.http.post<ApiResponse<Recipe>>(
      this.apiUrl,
      request
    );
  }

  update(
    id: string,
    request: RecipeRequest
  ): Observable<ApiResponse<Recipe>> {
    return this.http.put<ApiResponse<Recipe>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  updateStatus(
    id: string,
    isActive: boolean
  ): Observable<ApiResponse<string>> {
    const params = new HttpParams()
      .set('isActive', isActive);

    return this.http.patch<ApiResponse<string>>(
      `${this.apiUrl}/${id}/status`,
      null,
      {
        params
      }
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
