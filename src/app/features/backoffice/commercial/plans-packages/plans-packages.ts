import {
  CurrencyPipe
} from '@angular/common';

import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  FormArray,
  FormControl,
  FormGroup,
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
  CommercialPlan,
  SupportLevel
} from '../../../../core/models/commercial-plan.model';

import {
  Product
} from '../../../../core/models/product.model';

import {
  AuthService
} from '../../../../core/services/auth.service';

import {
  CommercialPackageService
} from '../../../../core/services/commercial-package.service';

import {
  CommercialPlanService
} from '../../../../core/services/commercial-plan.service';

import {
  ProductService
} from '../../../../core/services/product.service';

type PackageItemForm = FormGroup<{
  productId: FormControl<string>;
  quantity: FormControl<number>;
}>;

interface PackageItemValue {
  productId: string;
  quantity: number;
}

@Component({
  selector: 'app-plans-packages',
  standalone: true,
  imports: [
    CurrencyPipe,
    ReactiveFormsModule
  ],
  templateUrl: './plans-packages.html',
  styleUrl: './plans-packages.css'
})
export class PlansPackages implements OnInit {
  private readonly fb =
    inject(FormBuilder);

  private readonly planService =
    inject(CommercialPlanService);

  private readonly packageService =
    inject(CommercialPackageService);

  private readonly productService =
    inject(ProductService);

  readonly auth =
    inject(AuthService);

  readonly plans =
    signal<CommercialPlan[]>([]);

  readonly packages =
    signal<CommercialPackage[]>([]);

  readonly products =
    signal<Product[]>([]);

  readonly loading =
    signal(true);

  readonly saving =
    signal(false);

  readonly errorMessage =
    signal('');

  readonly successMessage =
    signal('');

  readonly formErrorMessage =
    signal('');

  readonly activeTab =
    signal<'plans' | 'packages'>('plans');

  readonly planFormOpen =
    signal(false);

  readonly packageFormOpen =
    signal(false);

  readonly editingPlan =
    signal<CommercialPlan | null>(null);

  readonly editingPackage =
    signal<CommercialPackage | null>(null);

  readonly isAdmin = computed(() =>
    this.auth.hasRole('Admin')
  );

  readonly purchasableProducts = computed(() =>
    this.products().filter(product =>
      product.isActive &&
      product.canBePurchased &&
      product.commercialStatus ===
        'Available'
    )
  );

  readonly planForm =
    this.fb.nonNullable.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(120)
        ]
      ],

      code: [
        '',
        [
          Validators.required,
          Validators.maxLength(40)
        ]
      ],

      description: [
        '',
        [
          Validators.required,
          Validators.maxLength(800)
        ]
      ],

      audience: [
        '',
        [
          Validators.required,
          Validators.maxLength(180)
        ]
      ],

      warrantyMonths: [
        12,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(120)
        ]
      ],

      supportLevel: [
        'Standard' as SupportLevel,
        [
          Validators.required
        ]
      ],

      includesTraining: [
        false
      ],

      includesDocumentation: [
        true
      ],

      includesUpdates: [
        true
      ],

      displayOrder: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      isActive: [
        true
      ]
    });

  readonly packageForm =
    this.fb.nonNullable.group({
      commercialPlanId: [
        '',
        [
          Validators.required
        ]
      ],

      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(120)
        ]
      ],

      code: [
        '',
        [
          Validators.required,
          Validators.maxLength(40)
        ]
      ],

      description: [
        '',
        [
          Validators.required,
          Validators.maxLength(800)
        ]
      ],

      price: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      displayOrder: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      isActive: [
        true
      ],

      items:
        this.fb.array<PackageItemForm>([])
    });

  get packageItems():
    FormArray<PackageItemForm> {
    return this.packageForm.controls.items;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      plans:
        this.planService.getAll(),

      packages:
        this.packageService.getAll(),

      products:
        this.productService.getAll()
    }).subscribe({
      next: result => {
        this.plans.set(
          result.plans.data ?? []
        );

        this.packages.set(
          result.packages.data ?? []
        );

        this.products.set(
          result.products.data ?? []
        );

        this.loading.set(false);
      },

      error: error => {
        this.loading.set(false);

        this.errorMessage.set(
          this.extractError(
            error,
            'No fue posible cargar planes y paquetes.'
          )
        );
      }
    });
  }

  setTab(
    tab: 'plans' | 'packages'
  ): void {
    this.activeTab.set(tab);
  }

  openCreatePlan(): void {
    if (!this.isAdmin()) {
      return;
    }

    this.editingPlan.set(null);

    this.planForm.reset({
      name: '',
      code: '',
      description: '',
      audience: '',
      warrantyMonths: 12,
      supportLevel: 'Standard',
      includesTraining: false,
      includesDocumentation: true,
      includesUpdates: true,
      displayOrder: 0,
      isActive: true
    });

    this.formErrorMessage.set('');
    this.errorMessage.set('');
    this.successMessage.set('');

    this.planFormOpen.set(true);
  }

  openEditPlan(
    plan: CommercialPlan
  ): void {
    if (!this.isAdmin()) {
      return;
    }

    this.editingPlan.set(plan);

    this.planForm.reset({
      name:
        plan.name,

      code:
        plan.code,

      description:
        plan.description,

      audience:
        plan.audience,

      warrantyMonths:
        plan.warrantyMonths,

      supportLevel:
        plan.supportLevel,

      includesTraining:
        plan.includesTraining,

      includesDocumentation:
        plan.includesDocumentation,

      includesUpdates:
        plan.includesUpdates,

      displayOrder:
        plan.displayOrder,

      isActive:
        plan.isActive
    });

    this.formErrorMessage.set('');
    this.errorMessage.set('');
    this.successMessage.set('');

    this.planFormOpen.set(true);
  }

  closePlanForm(): void {
    if (this.saving()) {
      return;
    }

    this.planFormOpen.set(false);
    this.editingPlan.set(null);
    this.formErrorMessage.set('');
  }

  submitPlan(): void {
    if (
      this.saving() ||
      !this.isAdmin()
    ) {
      return;
    }

    this.formErrorMessage.set('');

    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();

      this.formErrorMessage.set(
        'Revisa los campos obligatorios del plan.'
      );

      return;
    }

    const values =
      this.planForm.getRawValue();

    const request = {
      name:
        values.name.trim(),

      code:
        values.code
          .trim()
          .toUpperCase(),

      description:
        values.description.trim(),

      audience:
        values.audience.trim(),

      warrantyMonths:
        values.warrantyMonths,

      supportLevel:
        values.supportLevel,

      includesTraining:
        values.includesTraining,

      includesDocumentation:
        values.includesDocumentation,

      includesUpdates:
        values.includesUpdates,

      displayOrder:
        values.displayOrder
    };

    const editing =
      this.editingPlan();

    const operation =
      editing
        ? this.planService.update(
            editing.id,
            {
              ...request,
              isActive:
                values.isActive
            }
          )
        : this.planService.create(
            request
          );

    this.saving.set(true);

    operation.subscribe({
      next: response => {
        this.saving.set(false);

        this.planFormOpen.set(false);
        this.editingPlan.set(null);

        this.successMessage.set(
          response.message
        );

        this.loadData();
        this.clearSuccessMessageLater();
      },

      error: error => {
        this.saving.set(false);

        this.formErrorMessage.set(
          this.extractError(
            error,
            'No fue posible guardar el plan.'
          )
        );
      }
    });
  }

  togglePlan(
    plan: CommercialPlan
  ): void {
    if (!this.isAdmin()) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.planService
      .updateStatus(
        plan.id,
        !plan.isActive
      )
      .subscribe({
        next: response => {
          this.successMessage.set(
            response.message
          );

          this.loadData();
          this.clearSuccessMessageLater();
        },

        error: error => {
          this.errorMessage.set(
            this.extractError(
              error,
              'No fue posible cambiar el estado del plan.'
            )
          );
        }
      });
  }

  deletePlan(
    plan: CommercialPlan
  ): void {
    if (
      !this.isAdmin() ||
      !window.confirm(
        `¿Eliminar el plan ${plan.name}?`
      )
    ) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.planService
      .delete(plan.id)
      .subscribe({
        next: response => {
          this.successMessage.set(
            response.message
          );

          this.loadData();
          this.clearSuccessMessageLater();
        },

        error: error => {
          this.errorMessage.set(
            this.extractError(
              error,
              'No fue posible eliminar el plan.'
            )
          );
        }
      });
  }

  openCreatePackage(): void {
    if (!this.isAdmin()) {
      return;
    }

    this.editingPackage.set(null);

    this.packageForm.reset({
      commercialPlanId: '',
      name: '',
      code: '',
      description: '',
      price: 0,
      displayOrder: 0,
      isActive: true
    });

    this.packageItems.clear();
    this.addPackageItem();

    this.formErrorMessage.set('');
    this.errorMessage.set('');
    this.successMessage.set('');

    this.packageFormOpen.set(true);
  }

  openEditPackage(
    commercialPackage: CommercialPackage
  ): void {
    if (!this.isAdmin()) {
      return;
    }

    this.editingPackage.set(
      commercialPackage
    );

    this.packageForm.reset({
      commercialPlanId:
        commercialPackage.commercialPlanId,

      name:
        commercialPackage.name,

      code:
        commercialPackage.code,

      description:
        commercialPackage.description,

      price:
        commercialPackage.price,

      displayOrder:
        commercialPackage.displayOrder,

      isActive:
        commercialPackage.isActive
    });

    this.packageItems.clear();

    commercialPackage.items.forEach(
      detail => {
        this.packageItems.push(
          this.createPackageItemForm(
            detail.productId,
            detail.quantity
          )
        );
      }
    );

    if (this.packageItems.length === 0) {
      this.addPackageItem();
    }

    this.formErrorMessage.set('');
    this.errorMessage.set('');
    this.successMessage.set('');

    this.packageFormOpen.set(true);
  }

  closePackageForm(): void {
    if (this.saving()) {
      return;
    }

    this.packageFormOpen.set(false);
    this.editingPackage.set(null);
    this.formErrorMessage.set('');
  }

  addPackageItem(): void {
    this.packageItems.push(
      this.createPackageItemForm()
    );
  }

  removePackageItem(
    index: number
  ): void {
    if (
      this.packageItems.length <= 1
    ) {
      return;
    }

    this.packageItems.removeAt(index);
  }

  submitPackage(): void {
    if (
      this.saving() ||
      !this.isAdmin()
    ) {
      return;
    }

    this.formErrorMessage.set('');

    if (this.packageForm.invalid) {
      this.packageForm.markAllAsTouched();

      this.formErrorMessage.set(
        'Revisa el plan, los datos del paquete y sus productos.'
      );

      return;
    }

    const values =
      this.packageForm.getRawValue();

    const items:
      PackageItemValue[] =
        values.items;

    if (items.length === 0) {
      this.formErrorMessage.set(
        'El paquete debe contener al menos un producto.'
      );

      return;
    }

    const hasIncompleteProduct =
      items.some(item =>
        !item.productId.trim()
      );

    if (hasIncompleteProduct) {
      this.formErrorMessage.set(
        'Selecciona un producto en cada elemento del paquete.'
      );

      return;
    }

    const hasInvalidQuantity =
      items.some(item =>
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      );

    if (hasInvalidQuantity) {
      this.formErrorMessage.set(
        'Todas las cantidades deben ser números enteros mayores a cero.'
      );

      return;
    }

    const productIds =
      items.map(item =>
        item.productId
      );

    if (
      new Set(productIds).size !==
      productIds.length
    ) {
      this.formErrorMessage.set(
        'No puedes repetir un producto dentro del paquete.'
      );

      return;
    }

    const request = {
      commercialPlanId:
        values.commercialPlanId,

      name:
        values.name.trim(),

      code:
        values.code
          .trim()
          .toUpperCase(),

      description:
        values.description.trim(),

      price:
        values.price,

      displayOrder:
        values.displayOrder,

      items:
        items.map(item => ({
          productId:
            item.productId,

          quantity:
            item.quantity
        }))
    };

    const editing =
      this.editingPackage();

    const operation =
      editing
        ? this.packageService.update(
            editing.id,
            {
              ...request,
              isActive:
                values.isActive
            }
          )
        : this.packageService.create(
            request
          );

    this.saving.set(true);

    operation.subscribe({
      next: response => {
        this.saving.set(false);

        this.packageFormOpen.set(false);
        this.editingPackage.set(null);

        this.successMessage.set(
          response.message
        );

        this.loadData();
        this.clearSuccessMessageLater();
      },

      error: error => {
        this.saving.set(false);

        this.formErrorMessage.set(
          this.extractError(
            error,
            'No fue posible guardar el paquete.'
          )
        );
      }
    });
  }

  togglePackage(
    commercialPackage: CommercialPackage
  ): void {
    if (!this.isAdmin()) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.packageService
      .updateStatus(
        commercialPackage.id,
        !commercialPackage.isActive
      )
      .subscribe({
        next: response => {
          this.successMessage.set(
            response.message
          );

          this.loadData();
          this.clearSuccessMessageLater();
        },

        error: error => {
          this.errorMessage.set(
            this.extractError(
              error,
              'No fue posible cambiar el estado del paquete.'
            )
          );
        }
      });
  }

  deletePackage(
    commercialPackage: CommercialPackage
  ): void {
    if (
      !this.isAdmin() ||
      !window.confirm(
        `¿Eliminar el paquete ${commercialPackage.name}?`
      )
    ) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.packageService
      .delete(commercialPackage.id)
      .subscribe({
        next: response => {
          this.successMessage.set(
            response.message
          );

          this.loadData();
          this.clearSuccessMessageLater();
        },

        error: error => {
          this.errorMessage.set(
            this.extractError(
              error,
              'No fue posible eliminar el paquete.'
            )
          );
        }
      });
  }

  productName(
    id: string
  ): string {
    return (
      this.products()
        .find(product =>
          product.id === id
        )
        ?.name ??
      'Producto'
    );
  }

  private createPackageItemForm(
    productId = '',
    quantity = 1
  ): PackageItemForm {
    return this.fb.nonNullable.group({
      productId: [
        productId,
        [
          Validators.required
        ]
      ],

      quantity: [
        quantity,
        [
          Validators.required,
          Validators.min(1)
        ]
      ]
    });
  }

  private extractError(
    error: any,
    fallback: string
  ): string {
    const errors =
      error?.error?.errors;

    if (
      Array.isArray(errors) &&
      errors.length > 0
    ) {
      return errors.join(' · ');
    }

    return (
      error?.error?.message ??
      fallback
    );
  }

  private clearSuccessMessageLater(): void {
    window.setTimeout(
      () => {
        this.successMessage.set('');
      },
      3500
    );
  }
}



