import {
  CurrencyPipe,
  DatePipe
} from '@angular/common';

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
  forkJoin
} from 'rxjs';

import {
  CommercialPackage
} from '../../../../core/models/commercial-package.model';

import {
  Customer
} from '../../../../core/models/customer.model';

import {
  Institution
} from '../../../../core/models/institution.model';

import {
  AssemblyMode,
  Quote,
  QuoteRecipientType,
  QuoteStatus
} from '../../../../core/models/quote.model';

import {
  CommercialPackageService
} from '../../../../core/services/commercial-package.service';

import {
  CustomerService
} from '../../../../core/services/customer.service';

import {
  InstitutionService
} from '../../../../core/services/institution.service';

import {
  QuoteService
} from '../../../../core/services/quote.service';

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule
  ],
  templateUrl: './quotes.html',
  styleUrl: './quotes.css'
})
export class Quotes implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly quoteService =
    inject(QuoteService);

  private readonly customerService =
    inject(CustomerService);

  private readonly institutionService =
    inject(InstitutionService);

  private readonly packageService =
    inject(CommercialPackageService);

  readonly quotes = signal<Quote[]>([]);
  readonly customers = signal<Customer[]>([]);
  readonly institutions = signal<Institution[]>([]);
  readonly packages = signal<CommercialPackage[]>([]);

  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly actionId =
    signal<string | null>(null);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly formErrorMessage = signal('');

  readonly formOpen = signal(false);

  readonly pricingQuote =
    signal<Quote | null>(null);

  readonly statusFilter =
    signal<'all' | QuoteStatus>('all');

  readonly filteredQuotes = computed(() => {
    const status = this.statusFilter();

    return this.quotes().filter(
      quote =>
        status === 'all' ||
        quote.status === status
    );
  });

  readonly form = this.fb.nonNullable.group({
    recipientType: [
      'Customer' as QuoteRecipientType,
      Validators.required
    ],

    customerId: [''],

    institutionId: [''],

    commercialPackageId: [
      '',
      Validators.required
    ],

    assemblyMode: [
      'ReadyToUse' as AssemblyMode,
      Validators.required
    ],

    packageQuantity: [
      1,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    discount: [
      0,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],

    shipping: [
      0,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],

    validityDays: [
      15,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(90)
      ]
    ],

    notes: [
      '',
      Validators.maxLength(1000)
    ],

    conditions: [
      '',
      Validators.maxLength(1000)
    ]
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    forkJoin({
      quotes: this.quoteService.getAll(),
      customers: this.customerService.getAll(),
      institutions: this.institutionService.getAll(),
      packages: this.packageService.getAll()
    }).subscribe({
      next: result => {
        this.quotes.set(
          result.quotes.data ?? []
        );

        this.customers.set(
          (result.customers.data ?? [])
            .filter(item => item.isActive)
        );

        this.institutions.set(
          (result.institutions.data ?? [])
            .filter(item => item.isActive)
        );

        this.packages.set(
          (result.packages.data ?? [])
            .filter(item => item.isActive)
        );

        this.loading.set(false);
      },

      error: error => {
        this.loading.set(false);

        this.errorMessage.set(
          this.extractError(
            error,
            'No fue posible cargar cotizaciones.'
          )
        );
      }
    });
  }

  openCreate(): void {
    this.pricingQuote.set(null);

    this.form.reset({
      recipientType: 'Customer',
      customerId: '',
      institutionId: '',
      commercialPackageId: '',
      assemblyMode: 'ReadyToUse',
      packageQuantity: 1,
      discount: 0,
      shipping: 0,
      validityDays: 15,
      notes: '',
      conditions: ''
    });

    this.form.enable();

    this.formErrorMessage.set('');
    this.formOpen.set(true);
  }

  openPricing(quote: Quote): void {
    this.pricingQuote.set(quote);

    this.form.patchValue({
      recipientType: quote.recipientType,
      customerId: quote.customerId ?? '',
      institutionId:
        quote.institutionId ?? '',
      commercialPackageId:
        quote.commercialPackageId,
      assemblyMode:
        quote.assemblyMode ??
        'ReadyToUse',
      packageQuantity:
        quote.packageQuantity,
      discount:
        quote.discount,
      shipping:
        quote.shipping,
      validityDays:
        this.calculateValidityDays(
          quote.validUntil
        ),
      notes:
        quote.notes ?? '',
      conditions:
        quote.conditions ?? ''
    });

    this.formErrorMessage.set('');
    this.formOpen.set(true);
  }

  closeForm(): void {
    if (this.saving()) {
      return;
    }

    this.formOpen.set(false);
    this.pricingQuote.set(null);
    this.formErrorMessage.set('');
  }

  submit(): void {
    if (this.saving()) {
      return;
    }

    this.formErrorMessage.set('');

    const pricing =
      this.pricingQuote();

    if (pricing) {
      this.updatePricing(pricing);
      return;
    }

    this.createQuote();
  }

  private createQuote(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      this.formErrorMessage.set(
        'Revisa el destinatario, paquete, modalidad, cantidad e importes.'
      );

      return;
    }

    const values =
      this.form.getRawValue();

    if (
      values.recipientType === 'Customer' &&
      !values.customerId
    ) {
      this.formErrorMessage.set(
        'Selecciona un cliente.'
      );

      return;
    }

    if (
      values.recipientType === 'Institution' &&
      !values.institutionId
    ) {
      this.formErrorMessage.set(
        'Selecciona una institución.'
      );

      return;
    }

    const customer =
      this.customers().find(
        item =>
          item.id === values.customerId
      );

    const institution =
      this.institutions().find(
        item =>
          item.id === values.institutionId
      );

    if (
      values.recipientType === 'Customer' &&
      !customer
    ) {
      this.formErrorMessage.set(
        'El cliente seleccionado no existe o ya no está activo.'
      );

      return;
    }

    if (
      values.recipientType === 'Institution' &&
      !institution
    ) {
      this.formErrorMessage.set(
        'La institución seleccionada no existe o ya no está activa.'
      );

      return;
    }

    const contactName =
      values.recipientType === 'Customer'
        ? customer?.fullName ?? ''
        : institution?.responsible.name
            .fullName ?? '';

    const email =
      values.recipientType === 'Customer'
        ? customer?.email ?? ''
        : institution?.responsible.email ?? '';

    const phone =
      values.recipientType === 'Customer'
        ? customer?.phone ?? null
        : institution?.responsible.phone ?? null;

    this.saving.set(true);

    this.quoteService
      .createBackoffice({
        recipientType:
          values.recipientType,

        customerId:
          values.recipientType === 'Customer'
            ? values.customerId
            : null,

        institutionId:
          values.recipientType === 'Institution'
            ? values.institutionId
            : null,

        contactName,
        email,
        phone,

        commercialPackageId:
          values.commercialPackageId,

        assemblyMode:
          values.assemblyMode,

        packageQuantity:
          values.packageQuantity,

        discount:
          values.discount,

        shipping:
          values.shipping,

        validityDays:
          values.validityDays,

        notes:
          values.notes.trim() || null,

        conditions:
          values.conditions.trim() || null
      })
      .subscribe({
        next: response => {
          this.saving.set(false);
          this.closeForm();

          this.successMessage.set(
            response.message
          );

          this.loadData();
        },

        error: error => {
          this.saving.set(false);

          this.formErrorMessage.set(
            this.extractError(
              error,
              'No fue posible crear la cotización.'
            )
          );
        }
      });
  }

  private updatePricing(
    quote: Quote
  ): void {
    const values =
      this.form.getRawValue();

    if (
      values.discount < 0 ||
      values.shipping < 0 ||
      values.validityDays < 1 ||
      values.validityDays > 90
    ) {
      this.form.markAllAsTouched();

      this.formErrorMessage.set(
        'Revisa el descuento, envío y vigencia.'
      );

      return;
    }

    this.saving.set(true);

    this.quoteService
      .updatePricing(
        quote.id,
        {
          discount:
            values.discount,

          shipping:
            values.shipping,

          validityDays:
            values.validityDays,

          conditions:
            values.conditions.trim() || null
        }
      )
      .subscribe({
        next: response => {
          this.saving.set(false);
          this.closeForm();

          this.successMessage.set(
            response.message
          );

          this.loadData();
        },

        error: error => {
          this.saving.set(false);

          this.formErrorMessage.set(
            this.extractError(
              error,
              'No fue posible actualizar los importes.'
            )
          );
        }
      });
  }

  updateStatus(
    quote: Quote,
    status: QuoteStatus
  ): void {
    this.actionId.set(quote.id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.quoteService
      .updateStatus(
        quote.id,
        status
      )
      .subscribe({
        next: response => {
          this.actionId.set(null);

          this.successMessage.set(
            response.message
          );

          this.loadData();
        },

        error: error => {
          this.actionId.set(null);

          this.errorMessage.set(
            this.extractError(
              error,
              'No fue posible cambiar el estado.'
            )
          );
        }
      });
  }

  convert(
    quote: Quote
  ): void {
    this.actionId.set(quote.id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.quoteService
      .convertToOrder(quote.id)
      .subscribe({
        next: response => {
          this.actionId.set(null);

          this.successMessage.set(
            response.message
          );

          this.loadData();
        },

        error: error => {
          this.actionId.set(null);

          this.errorMessage.set(
            this.extractError(
              error,
              'No fue posible convertir la cotización.'
            )
          );
        }
      });
  }

  updateFilter(
    event: Event
  ): void {
    const select =
      event.target as HTMLSelectElement;

    this.statusFilter.set(
      select.value as
        | 'all'
        | QuoteStatus
    );
  }

  statusLabel(
    status: QuoteStatus
  ): string {
    const labels:
      Record<QuoteStatus, string> = {
        Pending: 'Pendiente',
        Approved: 'Aprobada',
        Rejected: 'Rechazada',
        Cancelled: 'Cancelada',
        Converted: 'Convertida'
      };

    return labels[status];
  }

  assemblyModeLabel(
    assemblyMode: AssemblyMode
  ): string {
    if (assemblyMode === 'DiyKit') return 'Kit DIY para ensamblar';
    if (assemblyMode === 'WorkshopAssist') return 'Tráelo y lo armamos contigo';
    return 'Armado y listo para usar';
  }

  private calculateValidityDays(
    validUntil: string
  ): number {
    const expirationDate =
      new Date(validUntil);

    if (
      Number.isNaN(
        expirationDate.getTime()
      )
    ) {
      return 15;
    }

    const difference =
      expirationDate.getTime() -
      Date.now();

    return Math.max(
      1,
      Math.ceil(
        difference / 86400000
      )
    );
  }

  private extractError(
    error: any,
    fallback: string
  ): string {
    const errors =
      error?.error?.errors;

    if (
      Array.isArray(errors) &&
      errors.length
    ) {
      return errors.join(' · ');
    }

    return (
      error?.error?.message ??
      fallback
    );
  }
}
