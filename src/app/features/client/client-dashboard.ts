import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="client-page">
      <section class="client-card">
        <img src="assets/images/logo_splash_volts.png" alt="VOLTS" />

        <h1>Mi portal VOLTS</h1>

        <p>Hola, {{ auth.currentUser()?.fullName }}.</p>

        <div class="client-options">
          <article>
            <span>🐕</span>
            <b>Mis VOLTS</b>
            <small>Consulta tus dispositivos.</small>
          </article>

          <article>
            <span>🔑</span>
            <b>Mis licencias</b>
            <small>Revisa licencias activas.</small>
          </article>

          <article>
            <span>📚</span>
            <b>Documentación</b>
            <small>Manuales y recursos.</small>
          </article>
        </div>

        <div class="client-actions">
          <a routerLink="/">Volver al sitio</a>
          <button (click)="auth.logout()">Cerrar sesión</button>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .client-page {
      min-height: 100vh;
      padding: 2rem;
      display: grid;
      place-items: center;
      background: linear-gradient(145deg,#dcfce7,#f5f3ff);
    }

    .client-card {
      width: min(100%,850px);
      padding: 2.5rem;
      text-align: center;
      border: 2px solid #86efac;
      border-radius: 2rem;
      background: white;
      box-shadow: 0 24px 70px rgba(26,46,26,.15);
    }

    img {
      width: 130px;
      height: 130px;
      object-fit: contain;
    }

    h1 {
      margin: .5rem 0;
      color: #16a34a;
      font: 900 2.8rem var(--font-title);
    }

    p {
      color: #64748b;
      font-weight: 800;
    }

    .client-options {
      margin: 2rem 0;
      display: grid;
      grid-template-columns: repeat(3,1fr);
      gap: 1rem;
    }

    article {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: .35rem;
      border: 2px solid #86efac;
      border-radius: 1.5rem;
      background: #f0fdf4;
    }

    article span { font-size: 2.4rem; }

    article b {
      color: #15803d;
      font-family: var(--font-title);
    }

    article small {
      color: #64748b;
      font-weight: 700;
    }

    .client-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }

    .client-actions a,
    .client-actions button {
      padding: .85rem 1.5rem;
      border-radius: 999px;
      font-weight: 900;
    }

    .client-actions a {
      color: #16a34a;
      border: 2px solid #16a34a;
    }

    .client-actions button {
      border: 0;
      color: white;
      background: #7c6bbd;
    }

    @media(max-width:650px) {
      .client-options {
        grid-template-columns:1fr;
      }
    }
  `]
})
export class ClientDashboard {
  constructor(public readonly auth: AuthService) {}
}
