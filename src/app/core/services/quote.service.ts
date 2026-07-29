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
  Quote,
  QuoteBackofficeCreateRequest,
  QuoteCreateRequest,
  QuotePricingUpdateRequest,
  QuoteStatus
} from '../models/quote.model';

import {
  Order
} from '../models/order.model';

/*
 * Contrato temporal de compatibilidad con el formulario
 * público anterior.
 *
 * Se conserva únicamente para que el frontend actual compile
 * mientras migramos la página pública al nuevo flujo basado
 * en paquetes comerciales.
 */
export interface LegacyPublicQuoteRequest {
  fullName: string;
  email: string;
  phone?: string | null;
  institutionName?: string | null;
  planName: string;
  quantity: number;
  unitPrice: number;
  shipping: number;
  notes?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Quotes`;

  /*
   * Compatibilidad temporal con:
   *
   * features/public/quote/quote.ts
   *
   * La pantalla pública antigua todavía invoca:
   *
   * quoteService.create(...)
   *
   * Este método evita romper la compilación.
   *
   * IMPORTANTE:
   * El backend comercial nuevo ya no confía en PlanName,
   * UnitPrice ni Shipping enviados por el navegador.
   * Por eso el formulario público será migrado después para
   * seleccionar un CommercialPackageId real.
   */
  create(
    request: LegacyPublicQuoteRequest
  ): Observable<ApiResponse<Quote>> {
    return this.http.post<ApiResponse<Quote>>(
      this.apiUrl,
      request
    );
  }

  /*
   * Formulario público nuevo.
   */
  createPublic(
    request: QuoteCreateRequest
  ): Observable<ApiResponse<Quote>> {
    return this.http.post<ApiResponse<Quote>>(
      this.apiUrl,
      request
    );
  }

  /*
   * Creación desde backoffice.
   */
  createBackoffice(
    request: QuoteBackofficeCreateRequest
  ): Observable<ApiResponse<Quote>> {
    return this.http.post<ApiResponse<Quote>>(
      `${this.apiUrl}/backoffice`,
      request
    );
  }

  getAll():
    Observable<ApiResponse<Quote[]>> {
    return this.http.get<ApiResponse<Quote[]>>(
      this.apiUrl
    );
  }

  getMyQuotes():
  Observable<ApiResponse<Quote[]>> {
  return this.http.get<ApiResponse<Quote[]>>(
    `${this.apiUrl}/my`
  );
}

  getById(
    id: string
  ): Observable<ApiResponse<Quote>> {
    return this.http.get<ApiResponse<Quote>>(
      `${this.apiUrl}/${id}`
    );
  }

  updateStatus(
    id: string,
    status: QuoteStatus
  ): Observable<ApiResponse<Quote>> {
    return this.http.put<ApiResponse<Quote>>(
      `${this.apiUrl}/${id}/status`,
      {
        status
      }
    );
  }

  updatePricing(
    id: string,
    request: QuotePricingUpdateRequest
  ): Observable<ApiResponse<Quote>> {
    return this.http.put<ApiResponse<Quote>>(
      `${this.apiUrl}/${id}/pricing`,
      request
    );
  }

  convertToOrder(
    id: string
  ): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(
      `${this.apiUrl}/${id}/convert-to-order`,
      {}
    );
  }
}
