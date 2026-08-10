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

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Address } from '../../../core/models/common.model';
import { CommercialPackage } from '../../../core/models/commercial-package.model';
import { Product } from '../../../core/models/product.model';
import { Quote as QuoteModel } from '../../../core/models/quote.model';

import { AuthService } from '../../../core/services/auth.service';
import { CommercialPackageService } from '../../../core/services/commercial-package.service';
import { CustomerService } from '../../../core/services/customer.service';
import { QuoteService } from '../../../core/services/quote.service';

type AssemblyMode =
  | 'ReadyToUse'
  | 'DiyKit'
  | 'WorkshopAssist';

interface PendingQuoteState {
  productId: string;
  commercialPackageId: string;
  quantity: number;
  assemblyMode: AssemblyMode;
  notes: string;
}

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

  private readonly pendingQuoteKey =
    'volts_pending_quote';

  private readonly fb =
    inject(FormBuilder);

  private readonly http =
    inject(HttpClient);

  private readonly router =
    inject(Router);

  private readonly authService =
    inject(AuthService);

  private readonly customerService =
    inject(CustomerService);

  private readonly quoteService =
    inject(QuoteService);

  private readonly commercialPackageService =
    inject(CommercialPackageService);

  readonly loadingCatalog =
    signal(true);

  readonly loadingProfile =
    signal(false);

  readonly loading =
    signal(false);

  readonly submitted =
    signal(false);

  readonly errorMessage =
    signal('');

  readonly catalogErrorMessage =
    signal('');

  readonly products =
    signal<Product[]>([]);

  readonly packages =
    signal<CommercialPackage[]>([]);

  readonly selectedCategory =
    signal('Todos');

  readonly categories =
    computed(() => [
      'Todos',
      ...Array.from(
        new Set<string>(
          this.products()
            .map(item =>
              (item.categoryName || item.category || 'Otros').trim()
            )
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b, 'es'))
    ]);

  readonly filteredProducts =
    computed(() => {
      const category = this.selectedCategory();

      if (category === 'Todos') {
        return this.products();
      }

      return this.products().filter(
        item =>
          (item.categoryName || item.category || 'Otros').trim() ===
          category
      );
    });

  selectCategory(category: string): void {
    this.selectedCategory.set(category);

    const current = this.selectedProduct();
    if (
      current &&
      category !== 'Todos' &&
      (current.categoryName || current.category || 'Otros').trim() !== category
    ) {
      this.selectedProductId.set('');
      this.selectedPackageId.set('');
    }
  }

  readonly selectedProductId =
    signal('');

  readonly selectedPackageId =
    signal('');

  readonly quantity =
    signal(1);

  readonly assemblyMode =
    signal<AssemblyMode>(
      'ReadyToUse'
    );

  readonly createdQuote =
    signal<QuoteModel | null>(
      null
    );

  readonly customerAddress =
    signal<Address | null>(
      null
    );

  readonly addressLoaded =
    signal(false);

  readonly currentUser =
    this.authService.currentUser;

  readonly isAuthenticated =
    this.authService.isAuthenticated;

  readonly selectedProduct =
    computed<Product | null>(
      () =>
        this.products()
          .find(
            item =>
              item.id ===
              this.selectedProductId()
          ) ??
        null
    );

  readonly availablePackages =
    computed(() => {

      const productId =
        this.selectedProductId();

      if (!productId) {
        return [];
      }

      return this.packages()
        .filter(
          item =>
            item.items.some(
              detail =>
                detail.productId ===
                productId
            )
        );
    });

  readonly selectedPackage =
    computed<CommercialPackage | null>(
      () =>
        this.availablePackages()
          .find(
            item =>
              item.id ===
              this.selectedPackageId()
          ) ??
        null
    );

  readonly selectedPackageIndex =
    computed(() =>
      Math.max(
        0,
        this.availablePackages()
          .findIndex(
            item =>
              item.id ===
              this.selectedPackageId()
          )
      )
    );

  readonly subtotal =
    computed(() =>
      (
        this.selectedPackage()
          ?.price ??
        0
      ) *
      this.quantity()
    );

  readonly totalRequestedUnits =
    computed(() =>
      (
        this.selectedPackage()
          ?.items ??
        []
      ).reduce(
        (
          total,
          item
        ) =>
          total +
          item.quantity *
          this.quantity(),
        0
      )
    );

  readonly selectedProductRequestedUnits =
    computed(() => {

      const productId =
        this.selectedProductId();

      const item =
        this.selectedPackage()
          ?.items
          .find(
            detail =>
              detail.productId ===
              productId
          );

      return (
        item?.quantity ??
        0
      ) *
      this.quantity();
    });

  readonly hasImmediateStockPreview =
    computed(() => {

      if (
        this.assemblyMode() ===
        'WorkshopAssist'
      ) {
        return true;
      }

      if (
        this.assemblyMode() ===
        'DiyKit'
      ) {
        return false;
      }

      const selectedPackage =
        this.selectedPackage();

      if (!selectedPackage) {
        return false;
      }

      return selectedPackage.items
        .every(
          item => {

            const product =
              this.products()
                .find(
                  candidate =>
                    candidate.id ===
                    item.productId
                );

            return Boolean(
              product &&
              product.availableStock >=
                item.quantity *
                this.quantity()
            );
          }
        );
    });

  readonly assemblyDiscountPreview =
    computed(() =>
      this.assemblyMode() ===
      'WorkshopAssist'
        ? this.subtotal() *
          0.15
        : 0
    );

  readonly taxablePreview =
    computed(() =>
      Math.max(
        0,
        this.subtotal() -
        this.assemblyDiscountPreview()
      )
    );

  readonly taxPreview =
    computed(() =>
      this.taxablePreview() *
      0.16
    );

  readonly shippingPreview =
    computed<number | null>(
      () => {

        if (
          this.assemblyMode() ===
            'WorkshopAssist' ||
          this.quantity() >=
            3
        ) {
          return 0;
        }

        const address =
          this.customerAddress();

        if (!address) {
          return null;
        }

        const city =
          this.normalize(
            address.city
          );

        const state =
          this.normalize(
            address.state
          );

        const isLeon =
          (
            city === 'leon' ||
            city ===
              'leon de los aldama'
          ) &&
          (
            state ===
              'guanajuato' ||
            state ===
              'gto'
          );

        if (isLeon) {
          return 89;
        }

        return (
          189 +
          Math.max(
            0,
            this.totalRequestedUnits() -
            1
          ) *
          35
        );
      }
    );

  readonly totalPreview =
    computed(() =>
      this.taxablePreview() +
      this.taxPreview() +
      (
        this.shippingPreview() ??
        0
      )
    );

  readonly hasCompleteAddress =
    computed(() =>
      this.isCompleteAddress(
        this.customerAddress()
      )
    );

  readonly form =
    this.fb.nonNullable.group({
      notes: [
        '',
        [
          Validators.maxLength(
            1000
          )
        ]
      ]
    });

  ngOnInit(): void {
    this.loadCatalog();
    this.loadAuthenticatedProfile();
  }

  loadCatalog(): void {

    this.loadingCatalog.set(
      true
    );

    this.catalogErrorMessage.set(
      ''
    );

    forkJoin({
      products:
        this.http.get<
          ApiResponse<Product[]>
        >(
          `${environment.apiUrl}/Products`
        ),

      packages:
        this.commercialPackageService
          .getActive()

    }).subscribe({

      next: response => {

        const products =
          (
            response.products
              .data ??
            []
          )
            .filter(
              item =>
                item.isActive &&
                !item.isDeleted
            )
            .sort(
              (
                first,
                second
              ) =>
                first.name
                  .localeCompare(
                    second.name
                  )
            );

        const packages =
          (
            response.packages
              .data ??
            []
          )
            .filter(
              item =>
                item.isActive &&
                !item.isDeleted
            )
            .sort(
              (
                first,
                second
              ) =>
                first.displayOrder -
                second.displayOrder
            );

        this.products.set(
          products
        );

        this.packages.set(
          packages
        );

        this.restorePendingQuote();

        this.ensureValidSelection();

        this.loadingCatalog.set(
          false
        );
      },

      error: error => {

        this.loadingCatalog.set(
          false
        );

        this.catalogErrorMessage.set(
          error?.error
            ?.message ??
          'No fue posible cargar los VOLTS disponibles. Inténtalo nuevamente.'
        );
      }
    });
  }

  selectProduct(
    product: Product
  ): void {

    if (
      product.commercialStatus !==
        'Available' ||
      !product.canBePurchased
    ) {
      return;
    }

    this.selectedProductId.set(
      product.id
    );

    const firstPackage =
      this.packages()
        .find(
          item =>
            item.items.some(
              detail =>
                detail.productId ===
                product.id
            )
        );

    this.selectedPackageId.set(
      firstPackage?.id ??
      ''
    );

    this.errorMessage.set(
      ''
    );
  }

  handleProductKeydown(
    event: KeyboardEvent,
    product: Product
  ): void {

    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {

      event.preventDefault();

      this.selectProduct(
        product
      );
    }
  }

  selectPackage(
    commercialPackage:
      CommercialPackage
  ): void {

    this.selectedPackageId.set(
      commercialPackage.id
    );

    this.errorMessage.set(
      ''
    );
  }

  handlePackageKeydown(
    event: KeyboardEvent,
    commercialPackage:
      CommercialPackage
  ): void {

    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {

      event.preventDefault();

      this.selectPackage(
        commercialPackage
      );
    }
  }

  decrease(): void {

    this.quantity.update(
      value =>
        Math.max(
          1,
          value - 1
        )
    );
  }

  increase(): void {

    this.quantity.update(
      value =>
        value + 1
    );
  }

  setAssemblyMode(
    mode: AssemblyMode
  ): void {

    this.assemblyMode.set(
      mode
    );

    this.errorMessage.set(
      ''
    );
  }

  submit(): void {

    if (
      this.form.invalid ||
      this.loading()
    ) {

      this.form
        .markAllAsTouched();

      return;
    }

    if (
      !this.isAuthenticated()
    ) {

      this.savePendingQuote();

      this.goToLogin();

      return;
    }

    const user =
      this.currentUser();

    if (
      !user ||
      ![
        'Client',
        'Institution'
      ].includes(
        user.roleName
      )
    ) {

      this.errorMessage.set(
        'La cotización debe solicitarse desde una cuenta de cliente o institución.'
      );

      return;
    }

    if (!user.profileId) {

      this.errorMessage.set(
        'Tu cuenta no tiene un perfil comercial asociado.'
      );

      return;
    }

    if (
      user.roleName ===
        'Client' &&
      this.addressLoaded() &&
      !this.hasCompleteAddress()
    ) {

      this.errorMessage.set(
        'Antes de cotizar debes completar tu dirección en Mi perfil.'
      );

      return;
    }

    const product =
      this.selectedProduct();

    const selectedPackage =
      this.selectedPackage();

    if (!product) {

      this.errorMessage.set(
        'Selecciona el VOLTS que quieres cotizar.'
      );

      return;
    }

    if (!selectedPackage) {

      this.errorMessage.set(
        'Selecciona un paquete antes de continuar.'
      );

      return;
    }

    this.loading.set(
      true
    );

    this.errorMessage.set(
      ''
    );

    this.quoteService
      .createPublic({

        recipientType:
          user.roleName ===
          'Institution'
            ? 'Institution'
            : 'Customer',

        customerId:
          user.roleName ===
          'Client'
            ? user.profileId
            : null,

        institutionId:
          user.roleName ===
          'Institution'
            ? user.profileId
            : null,

        contactName:
          user.fullName,

        email:
          user.email,

        phone:
          null,

        commercialPackageId:
          selectedPackage.id,

        assemblyMode:
          this.assemblyMode(),

        packageQuantity:
          this.quantity(),

        notes:
          this.form.controls
            .notes.value
            .trim() ||
          null

      })
      .subscribe({

        next: response => {

          this.loading.set(
            false
          );

          this.createdQuote.set(
            response.data
          );

          this.submitted.set(
            true
          );

          sessionStorage.removeItem(
            this.pendingQuoteKey
          );

          setTimeout(() => {
            document
              .getElementById('quote-success')
              ?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });
          });
        },

        error: error => {

          this.loading.set(
            false
          );

          this.errorMessage.set(
            error?.error
              ?.message ??
            'No fue posible enviar la cotización. Inténtalo nuevamente.'
          );
        }
      });
  }

  goToLogin(): void {

    this.savePendingQuote();

    this.router.navigate(
      ['/login'],
      {
        queryParams: {
          returnUrl:
            '/cotizacion'
        }
      }
    );
  }

  goToRegister(): void {

    this.savePendingQuote();

    this.router.navigate(
      ['/crear-cuenta'],
      {
        queryParams: {
          returnUrl:
            '/cotizacion'
        }
      }
    );
  }

  goToProfile(): void {

    this.savePendingQuote();

    this.router.navigate(
      ['/cliente/perfil']
    );
  }

  reset(): void {

    this.form.reset({
      notes: ''
    });

    this.quantity.set(
      1
    );

    this.assemblyMode.set(
      'ReadyToUse'
    );

    this.createdQuote.set(
      null
    );

    this.submitted.set(
      false
    );

    this.errorMessage.set(
      ''
    );

    sessionStorage.removeItem(
      this.pendingQuoteKey
    );

    this.ensureValidSelection();
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

    return icons[
      index %
      icons.length
    ];
  }

  getPackageClass(
    index: number
  ): string {

    const classes = [
      'basic-plan',
      'educator-plan',
      'institution-plan'
    ];

    return classes[
      index %
      classes.length
    ];
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

  getAssemblyLabel(): string {

    switch (
      this.assemblyMode()
    ) {

      case 'DiyKit':
        return 'Kit DIY para armar';

      case 'WorkshopAssist':
        return 'Lo armamos contigo en UTL/CVD';

      default:
        return 'Armado y listo para usar';
    }
  }

  stockPreviewText(): string {

    if (
      this.assemblyMode() ===
      'WorkshopAssist'
    ) {

      return 'Tú llevas los materiales: VOLTS no reserva producto terminado ni descuenta materia prima para esta modalidad.';
    }

    if (
      this.assemblyMode() ===
      'DiyKit'
    ) {

      return 'El kit DIY se prepara bajo pedido y requiere preparación antes de la entrega.';
    }

    return this
      .hasImmediateStockPreview()
        ? 'Hay stock disponible para cubrir esta solicitud.'
        : 'No hay stock suficiente para entrega inmediata. El faltante pasará a producción después del pago.';
  }

  addressLabel(): string {

    const address =
      this.customerAddress();

    if (!address) {

      return 'Sin dirección completa registrada.';
    }

    const interior =
      address.interiorNumber
        ? ` Int. ${address.interiorNumber}`
        : '';

    return (
      `${address.street} ` +
      `${address.exteriorNumber}` +
      `${interior}, ` +
      `${address.neighborhood}, ` +
      `C.P. ${address.postalCode}, ` +
      `${address.city}, ` +
      `${address.state}, ` +
      `${address.country}`
    );
  }

  shippingLabel(): string {

    const shipping =
      this.shippingPreview();

    if (
      shipping === null
    ) {

      return 'Se calcula con tu dirección';
    }

    if (
      shipping === 0
    ) {

      return 'GRATIS';
    }

    return this.formatCurrency(
      shipping
    );
  }

  formatCurrency(
    value: number
  ): string {

    return new Intl.NumberFormat(
      'es-MX',
      {
        style:
          'currency',

        currency:
          'MXN',

        minimumFractionDigits:
          0,

        maximumFractionDigits:
          2
      }
    ).format(
      value
    );
  }

  private loadAuthenticatedProfile(): void {

    const user =
      this.currentUser();

    if (
      !user ||
      user.roleName !==
        'Client'
    ) {

      this.addressLoaded.set(
        true
      );

      return;
    }

    this.loadingProfile.set(
      true
    );

    this.customerService
      .getMyProfile()
      .subscribe({

        next: response => {

          this.customerAddress.set(
            response.data.address ??
            null
          );

          this.addressLoaded.set(
            true
          );

          this.loadingProfile.set(
            false
          );
        },

        error: () => {

          this.customerAddress.set(
            null
          );

          this.addressLoaded.set(
            true
          );

          this.loadingProfile.set(
            false
          );
        }
      });
  }

  private ensureValidSelection(): void {

    const currentProductExists =
      this.products()
        .some(
          item =>
            item.id ===
              this.selectedProductId() &&
            item.commercialStatus ===
              'Available' &&
            item.canBePurchased
        );

    if (!currentProductExists) {

      const firstAvailableProduct =
        this.products()
          .find(
            item =>
              item.commercialStatus ===
                'Available' &&
              item.canBePurchased
          );

      this.selectedProductId.set(
        firstAvailableProduct
          ?.id ??
        ''
      );
    }

    const packageExists =
      this.availablePackages()
        .some(
          item =>
            item.id ===
            this.selectedPackageId()
        );

    if (!packageExists) {

      this.selectedPackageId.set(
        this.availablePackages()[
          0
        ]?.id ??
        ''
      );
    }
  }

  private savePendingQuote(): void {

    const product =
      this.selectedProduct();

    const selectedPackage =
      this.selectedPackage();

    if (
      !product ||
      !selectedPackage
    ) {

      return;
    }

    const state:
      PendingQuoteState = {

        productId:
          product.id,

        commercialPackageId:
          selectedPackage.id,

        quantity:
          this.quantity(),

        assemblyMode:
          this.assemblyMode(),

        notes:
          this.form.controls
            .notes.value
      };

    sessionStorage.setItem(
      this.pendingQuoteKey,
      JSON.stringify(
        state
      )
    );
  }

  private restorePendingQuote(): void {

    const stored =
      sessionStorage.getItem(
        this.pendingQuoteKey
      );

    if (!stored) {
      return;
    }

    try {

      const state =
        JSON.parse(
          stored
        ) as PendingQuoteState;

      this.selectedProductId.set(
        state.productId ??
        ''
      );

      this.selectedPackageId.set(
        state.commercialPackageId ??
        ''
      );

      this.quantity.set(
        Math.max(
          1,
          state.quantity ||
          1
        )
      );

      this.assemblyMode.set(
        state.assemblyMode ===
          'DiyKit' ||
        state.assemblyMode ===
          'WorkshopAssist'
          ? state.assemblyMode
          : 'ReadyToUse'
      );

      this.form.patchValue({
        notes:
          state.notes ??
          ''
      });

    } catch {

      sessionStorage.removeItem(
        this.pendingQuoteKey
      );
    }
  }

  private isCompleteAddress(
    address: Address | null
  ): boolean {

    return Boolean(
      address?.street?.trim() &&
      address?.exteriorNumber?.trim() &&
      address?.neighborhood?.trim() &&
      /^\d{5}$/.test(
        address?.postalCode
          ?.trim() ??
        ''
      ) &&
      address?.city?.trim() &&
      address?.state?.trim() &&
      address?.country?.trim()
    );
  }

  private normalize(
    value: string
  ): string {

    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      );
  }
}


