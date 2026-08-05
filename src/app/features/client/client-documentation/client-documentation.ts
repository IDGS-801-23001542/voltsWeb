import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Documentation } from '../../../core/models/documentation.model';
import { DocumentationService } from '../../../core/services/documentation.service';

@Component({
  selector: 'app-client-documentation',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './client-documentation.html',
  styleUrl: './client-documentation.css'
})
export class ClientDocumentation implements OnInit {
  private readonly documentationService = inject(DocumentationService);

  readonly documents = signal<Documentation[]>([]);
  readonly loading = signal(true);
  readonly message = signal('');
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.documentationService.getMyResources().subscribe({
      next: response => {
        this.documents.set(response.data ?? []);
        this.message.set(response.message ?? '');
        this.loading.set(false);
      },
      error: error => {
        this.loading.set(false);
        this.errorMessage.set(
          error?.error?.message ?? 'No fue posible cargar tus recursos VOLTS.');
      }
    });
  }

  icon(type: Documentation['documentType']): string {
    const icons: Record<Documentation['documentType'], string> = {
      Manual: '📘',
      QuickGuide: '🧭',
      Firmware: '🔧',
      Video: '🎬',
      AndroidApp: '📱',
      EducationalResource: '🎓',
      Warranty: '🛡️',
      Other: '📎'
    };

    return icons[type] ?? '📎';
  }

  actionLabel(type: Documentation['documentType']): string {
    return type === 'AndroidApp' || type === 'Firmware'
      ? 'Descargar'
      : 'Abrir recurso';
  }
}



