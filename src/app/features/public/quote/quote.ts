import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  CommercialPackage
} from '../../../core/models/commercial-package.model';

import {
  CommercialPackageService
} from '../../../core/services/commercial-package.service';

import {
  QuoteService
} from '../../../core/services/quote.service';

import {
  AuthService
} from '../../../core/services/auth.service';

@Component({
  selector: 'app-quote',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './quote.html',
  styleUrl: './quote.css'
})
export class Quote implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly quoteService =
    inject(QuoteService);

  private readonly commercialPackageService =
    inject(CommercialPackageService);
  private readonly authService =
    inject(AuthService);
  readonly loadingPackages = signal(true);
  readonly loading = signal(false);
  readonly submitted = signal(false);

  readonly errorMessage = signal('');
  readonly packagesErrorMessage = signal('');

  readonly packages =
    signal<CommercialPackage[]>([]);

  readonly selectedIndex = signal(0);
  readonly quantity = signal(1);

  readonly selectedPackage =
    computed<CommercialPackage | null>(() => {
      const availablePackages = this.packages();
      const index = this.selectedIndex();

      return availablePackages[index] ?? null;
    });

  readonly subtotal = computed(() => {
    const selectedPackage =
      this.selectedPackage();

    if (!selectedPackage) {
      return 0;
    }

    return (
      selectedPackage.price *
      this.quantity()
    );
  });

  /*
   * El backend debe calcular los importes finales.
   * Este envío solamente se muestra como estimación visual.
   */
  readonly shipping = computed(() =>
    this.quantity() >= 3 ? 0 : 99
  );

  readonly total = computed(() =>
    this.subtotal() + this.shipping()
  );

  readonly form =
    this.fb.nonNullable.group({
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

  ngOnInit(): void {
    this.loadPackages();
  }

  loadPackages(): void {
    this.loadingPackages.set(true);
    this.packagesErrorMessage.set('');

    this.commercialPackageService
      .getActive()
      .subscribe({
        next: response => {
          const packages =
            (response.data ?? [])
              .filter(item =>
                item.isActive &&
                !item.isDeleted
              )
              .sort(
                (first, second) =>
                  first.displayOrder -
                  second.displayOrder
              );

          this.packages.set(packages);
          this.selectedIndex.set(0);
          this.loadingPackages.set(false);
        },

        error: error => {
          this.loadingPackages.set(false);

          this.packagesErrorMessage.set(
            error?.error?.message ??
            'No fue posible cargar los paquetes comerciales.'
          );
        }
      });
  }

  selectPackage(index: number): void {
    if (
      index < 0 ||
      index >= this.packages().length
    ) {
      return;
    }

    this.selectedIndex.set(index);
  }

  handlePackageKeydown(
    event: KeyboardEvent,
    index: number
  ): void {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      this.selectPackage(index);
    }
  }

  decrease(): void {
    this.quantity.update(value =>
      Math.max(1, value - 1)
    );
  }

  increase(): void {
    this.quantity.update(
      value => value + 1
    );
  }

  submit(): void {
  if (
    this.form.invalid ||
    this.loading()
  ) {
    this.form.markAllAsTouched();
    return;
  }

  const selectedPackage =
    this.selectedPackage();

  if (!selectedPackage) {
    this.errorMessage.set(
      'Selecciona un paquete comercial antes de continuar.'
    );

    return;
  }

  const currentUser =
    this.authService.currentUser();

  const customerId =
    currentUser?.roleName === 'Client'
      ? currentUser.profileId ?? null
      : null;

  if (
    currentUser?.roleName === 'Client' &&
    !customerId
  ) {
    this.errorMessage.set(
      'Tu cuenta no tiene un perfil de cliente asociado.'
    );

    return;
  }

  this.loading.set(true);
  this.errorMessage.set('');

  const value =
    this.form.getRawValue();

  const institutionName =
    value.institutionName.trim();

  const originalNotes =
    value.notes.trim();

  const notes = [
    institutionName
      ? `Institución o escuela: ${institutionName}`
      : '',
    originalNotes
  ]
    .filter(Boolean)
    .join('\n');

  this.quoteService
    .createPublic({
      recipientType: 'Customer',
      customerId,
      institutionId: null,

      contactName:
        value.fullName.trim(),

      email:
        value.email
          .trim()
          .toLowerCase(),

      phone:
        value.phone.trim() || null,

      commercialPackageId:
        selectedPackage.id,

      packageQuantity:
        this.quantity(),

      notes:
        notes || null
    })
    .subscribe({
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
    this.selectedIndex.set(0);
    this.submitted.set(false);
    this.errorMessage.set('');
  }

  getPackageIcon(
    index: number
  ): string {
    const icons = [
      '🌱',
      '🎓',
      '🏫',
      '⚡',
      '📦'
    ];

    return icons[index % icons.length];
  }

  getPackageClass(
    index: number
  ): string {
    const classes = [
      'basic-plan',
      'educator-plan',
      'institution-plan'
    ];

    return classes[index % classes.length];
  }

  getPackageBadge(
    index: number
  ): string | null {
    if (index === 1) {
      return '⭐ Más popular';
    }

    if (index === 2) {
      return '🏫 Para instituciones';
    }

    return null;
  }

  formatCurrency(
    value: number
  ): string {
    return new Intl.NumberFormat(
      'es-MX',
      {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 0
      }
    ).format(value);
  }
}
