import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { QuoteService } from '../../../core/services/quote.service';

interface VoltsPlan {
  name: string;
  price: number;
  colorClass: 'basic-plan' | 'educator-plan' | 'institution-plan';
  icon: string;
  description: string;
  badge?: string;
  features: string[];
}

@Component({
  selector: 'app-quote',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './quote.html',
  styleUrl: './quote.css'
})
export class Quote {
  private readonly fb = inject(FormBuilder);
  private readonly quoteService = inject(QuoteService);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly errorMessage = signal('');

  readonly selectedIndex = signal(1);
  readonly quantity = signal(1);

  readonly plans: VoltsPlan[] = [
    {
      name: 'Básico',
      price: 349,
      colorClass: 'basic-plan',
      icon: '🌱',
      description: 'Para comenzar la experiencia VOLTS en casa.',
      features: [
        'Cuenta personal',
        'Aplicación Android',
        'Manual digital',
        'Garantía',
        'Actualizaciones',
        'Acceso al portal'
      ]
    },
    {
      name: 'Educador',
      price: 549,
      colorClass: 'educator-plan',
      icon: '🎓',
      description: 'La experiencia completa para familias y docentes.',
      badge: '⭐ Más popular',
      features: [
        'Todo lo incluido en el plan Básico',
        'Recursos pedagógicos',
        'Material educativo',
        'Reportes básicos',
        'Certificados',
        'Historial educativo'
      ]
    },
    {
      name: 'Institucional',
      price: 1899,
      colorClass: 'institution-plan',
      icon: '🏫',
      description: 'Herramientas avanzadas para escuelas e instituciones.',
      badge: '🏫 Para instituciones',
      features: [
        'Todo lo incluido en planes anteriores',
        'Dashboard institucional',
        'Administración de grupos',
        'Administración de alumnos',
        'Reportes avanzados',
        'Capacitación'
      ]
    }
  ];

  readonly selectedPlan = computed(
    () => this.plans[this.selectedIndex()]
  );

  readonly shipping = computed(
    () => this.quantity() >= 3 ? 0 : 99
  );

  readonly subtotal = computed(
    () => this.selectedPlan().price * this.quantity()
  );

  readonly total = computed(
    () => this.subtotal() + this.shipping()
  );

  readonly form = this.fb.nonNullable.group({
    fullName: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(120)
      ]
    ],
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],
    phone: [
      '',
      [
        Validators.maxLength(25)
      ]
    ],
    institutionName: [
      '',
      [
        Validators.maxLength(150)
      ]
    ],
    notes: [
      '',
      [
        Validators.maxLength(2000)
      ]
    ]
  });

  selectPlan(index: number): void {
    this.selectedIndex.set(index);
  }

  handlePlanKeydown(
    event: KeyboardEvent,
    index: number
  ): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectPlan(index);
    }
  }

  decrease(): void {
    this.quantity.update(value =>
      Math.max(1, value - 1)
    );
  }

  increase(): void {
    this.quantity.update(value => value + 1);
  }

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const value = this.form.getRawValue();
    const plan = this.selectedPlan();

    this.quoteService.create({
      fullName: value.fullName.trim(),
      email: value.email.trim(),
      phone: value.phone.trim() || undefined,
      institutionName:
        value.institutionName.trim() || undefined,
      planName: plan.name,
      quantity: this.quantity(),
      unitPrice: plan.price,
      shipping: this.shipping(),
      notes: value.notes.trim() || undefined
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: error => {
        this.loading.set(false);

        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible enviar la cotización. Inténtalo nuevamente.'
        );
      }
    });
  }

  reset(): void {
    this.form.reset();
    this.quantity.set(1);
    this.selectedIndex.set(1);
    this.submitted.set(false);
    this.errorMessage.set('');
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(value);
  }
}
