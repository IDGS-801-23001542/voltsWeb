import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly http = inject(HttpClient);

  uploadImage(file: File, area: 'products' | 'profiles' | 'institutions' | 'general'): Observable<ApiResponse<UploadedImage>> {
    const form = new FormData();
    form.append('file', file, file.name);
    form.append('area', area);
    return this.http.post<ApiResponse<UploadedImage>>(`${environment.apiUrl}/Media/images`, form);
  }
}
