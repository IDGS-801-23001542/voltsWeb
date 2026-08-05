import { Component, OnInit, inject, signal } from '@angular/core';
import { Documentation } from '../../../core/models/documentation.model';
import { DocumentationService } from '../../../core/services/documentation.service';

@Component({
  selector: 'app-institution-resources',
  standalone: true,
  templateUrl: './resources.html',
  styleUrl: './resources.css'
})
export class InstitutionResources implements OnInit {
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
          error?.error?.message ?? 'No fue posible cargar los recursos institucionales.');
      }
    });
  }

  icon(type: Documentation['documentType']): string {
    return ({
      Manual: '📘', QuickGuide: '🧭', Firmware: '🔧', Video: '🎬',
      AndroidApp: '📱', EducationalResource: '🎓', Warranty: '🛡️', Other: '📎'
    } as Record<Documentation['documentType'], string>)[type] ?? '📎';
  }
}



