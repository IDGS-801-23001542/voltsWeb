import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

type GoogleCredentialResponse = { credential: string };

@Injectable({ providedIn: 'root' })
export class GoogleSignInService {
  private readonly http = inject(HttpClient);

  async render(element: HTMLElement, onCredential: (credential: string) => void): Promise<boolean> {
    const config = await firstValueFrom(
      this.http.get<{ googleClientId: string }>(`${environment.apiUrl}/Auth/public-config`)
    );
    if (!config.googleClientId) return false;
    await this.loadScript();

    const google = (window as any).google;
    if (!google?.accounts?.id) return false;
    google.accounts.id.initialize({
      client_id: config.googleClientId,
      callback: (response: GoogleCredentialResponse) => onCredential(response.credential)
    });
    google.accounts.id.renderButton(element, {
      type: 'standard', theme: 'outline', size: 'large', shape: 'pill',
      text: 'continue_with', width: Math.min(360, element.clientWidth || 320)
    });
    return true;
  }

  private loadScript(): Promise<void> {
    if ((window as any).google?.accounts?.id) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.getElementById('google-identity-services') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Google Identity Services no cargó.')), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-identity-services';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Google Identity Services no cargó.'));
      document.head.appendChild(script);
    });
  }
}
