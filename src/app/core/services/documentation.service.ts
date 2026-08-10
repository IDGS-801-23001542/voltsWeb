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
  Documentation,
  DocumentationCreateRequest,
  DocumentationUpdateRequest
} from '../models/documentation.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentationService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Documentation`;

  private readonly backendUrl =
    environment.apiUrl.replace(
      /\/api\/?$/i,
      ''
    );

  getPublic():
    Observable<ApiResponse<Documentation[]>> {

    return this.http.get<
      ApiResponse<Documentation[]>
    >(
      `${this.apiUrl}/public`
    );
  }

  getMyResources():
    Observable<ApiResponse<Documentation[]>> {

    return this.http.get<
      ApiResponse<Documentation[]>
    >(
      `${this.apiUrl}/my-resources`
    );
  }

  getAll():
    Observable<ApiResponse<Documentation[]>> {

    return this.http.get<
      ApiResponse<Documentation[]>
    >(
      this.apiUrl
    );
  }

  getById(
    id: string
  ): Observable<ApiResponse<Documentation>> {

    return this.http.get<
      ApiResponse<Documentation>
    >(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    request: DocumentationCreateRequest
  ): Observable<ApiResponse<Documentation>> {

    return this.http.post<
      ApiResponse<Documentation>
    >(
      this.apiUrl,
      request
    );
  }

  update(
    id: string,
    request: DocumentationUpdateRequest
  ): Observable<ApiResponse<Documentation>> {

    return this.http.put<
      ApiResponse<Documentation>
    >(
      `${this.apiUrl}/${id}`,
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

  resolveResourceUrl(
    fileUrl: string | null | undefined
  ): string {

    if (!fileUrl) {
      return '#';
    }

    const value =
      fileUrl.trim();

    /*
     * Blindaje para registros viejos.
     *
     * Si Mongo todavía tiene:
     *
     * https://example.com/manual-volts.pdf
     *
     * lo mandamos al PDF real del backend.
     */
    if (
      value.toLowerCase()
        .includes('example.com/manual-volts.pdf')
    ) {
      return `${this.backendUrl}/documents/manual-volts.pdf`;
    }

    /*
     * También soportamos el nombre viejo.
     */
    if (
      value.toLowerCase()
        .includes('manual-ensamble-volts-v1.pdf')
    ) {
      return `${this.backendUrl}/documents/manual-volts.pdf`;
    }

    if (
      value.startsWith('/documents/')
    ) {
      return `${this.backendUrl}${value}`;
    }

    if (
      value.startsWith('documents/')
    ) {
      return `${this.backendUrl}/${value}`;
    }

    if (
      value.startsWith('http://') ||
      value.startsWith('https://')
    ) {
      return value;
    }

    if (value.startsWith('/')) {
      return `${this.backendUrl}${value}`;
    }

    return `${this.backendUrl}/${value}`;
  }
}
