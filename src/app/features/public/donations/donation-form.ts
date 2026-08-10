import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  DonationMaterialOption
} from '../../../core/models/donation.model';

import {
  AuthService
} from '../../../core/services/auth.service';

import {
  CustomerService
} from '../../../core/services/customer.service';

import {
  DonationService
} from '../../../core/services/donation.service';


type DonationLineForm =
  FormGroup<{
    rawMaterialId:
      FormControl<string>;

    quantity:
      FormControl<number>;
  }>;


@Component({
  selector: 'app-donation-form',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './donation-form.html',
  styleUrl: './donation-form.css'
})
export class DonationForm
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly service =
    inject(DonationService);

  private readonly customers =
    inject(CustomerService);

  readonly auth =
    inject(AuthService);


  readonly materials =
    signal<DonationMaterialOption[]>([]);

  readonly loadingCatalog =
    signal(true);

  readonly saving =
    signal(false);

  readonly errorMessage =
    signal('');

  readonly successMessage =
    signal('');

  readonly createdFolio =
    signal('');


  readonly currentUser =
    this.auth.currentUser;

  readonly isAuthenticated =
    this.auth.isAuthenticated;


  readonly form =
    this.fb.nonNullable.group({

      donorName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(160)
        ]
      ],

      donorEmail: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(200)
        ]
      ],

      donorPhone: [
        '',
        [
          Validators.maxLength(40)
        ]
      ],

      notes: [
        '',
        [
          Validators.maxLength(1000)
        ]
      ],

      items:
        this.fb.array<DonationLineForm>(
          []
        )

    });


  get items():
    FormArray<DonationLineForm> {

    return this.form.controls.items;
  }


  ngOnInit(): void {
    this.prefillIdentity();
    this.loadMaterials();
  }


  canAddMore(): boolean {

    return this.items.length <
      Math.min(
        20,
        this.materials().length
      );
  }


  loadMaterials(): void {

    this.loadingCatalog.set(true);
    this.errorMessage.set('');

    this.service
      .getMaterialOptions()
      .subscribe({

        next: response => {

          this.materials.set(
            response.data ?? []
          );

          this.loadingCatalog.set(false);

          if (
            this.items.length === 0 &&
            this.materials().length > 0
          ) {
            this.addItem();
          }

        },

        error: error => {

          this.loadingCatalog.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible cargar las materias primas disponibles.'
          );

        }

      });
  }


  addItem(): void {

    if (
      !this.canAddMore() ||
      this.materials().length === 0
    ) {
      return;
    }

    this.items.push(
      this.fb.nonNullable.group({

        rawMaterialId: [
          this.firstUnusedMaterialId(),
          Validators.required
        ],

        quantity: [
          1,
          [
            Validators.required,
            Validators.min(0.0001)
          ]
        ]

      })
    );
  }


  removeItem(
    index: number
  ): void {

    if (this.items.length <= 1) {
      return;
    }

    this.items.removeAt(index);
  }


  materialFor(
    index: number
  ): DonationMaterialOption | null {

    const group =
      this.items.at(index);

    const id =
      group
        ?.get('rawMaterialId')
        ?.value;

    return (
      this.materials()
        .find(
          item =>
            item.id === id
        ) ??
      null
    );
  }


  quantityStep(
    index: number
  ): number {

    const material =
      this.materialFor(index);

    if (!material) {
      return 1;
    }

    if (
      !material.unitAllowsDecimals
    ) {
      return 1;
    }

    return (
      1 /
      Math.pow(
        10,
        Math.max(
          1,
          material.unitDecimalPlaces
        )
      )
    );
  }


  quantityPlaceholder(
    index: number
  ): string {

    const material =
      this.materialFor(index);

    return material
      ? `Cantidad en ${material.unitSymbol}`
      : 'Cantidad';
  }


  submit(): void {

    if (
      this.form.invalid ||
      this.saving()
    ) {

      this.form.markAllAsTouched();
      return;
    }

    if (
      this.items.length === 0
    ) {

      this.errorMessage.set(
        'Agrega por lo menos un material.'
      );

      return;
    }


    const raw =
      this.form.getRawValue();


    const ids =
      raw.items.map(
        item => item.rawMaterialId
      );


    if (
      new Set(ids).size !==
      ids.length
    ) {

      this.errorMessage.set(
        'No repitas una misma materia prima. Agrupa la cantidad en una sola fila.'
      );

      return;
    }


    this.saving.set(true);

    this.errorMessage.set('');
    this.successMessage.set('');
    this.createdFolio.set('');


    this.service
      .create({

        donorName:
          raw.donorName.trim(),

        donorEmail:
          raw.donorEmail.trim(),

        donorPhone:
          raw.donorPhone.trim() ||
          null,

        notes:
          raw.notes.trim() ||
          null,

        items:
          raw.items.map(
            item => ({

              rawMaterialId:
                item.rawMaterialId,

              quantity:
                Number(
                  item.quantity
                )

            })
          )

      })
      .subscribe({

        next: response => {

          this.saving.set(false);

          this.successMessage.set(
            response.message
          );

          this.createdFolio.set(
            response.data.folio
          );

          this.resetForm();

        },

        error: error => {

          this.saving.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No fue posible registrar la donación.'
          );

        }

      });
  }


  private resetForm(): void {

    const user =
      this.currentUser();


    this.form.patchValue({

      donorName:
        user?.fullName ?? '',

      donorEmail:
        user?.email ?? '',

      donorPhone:
        '',

      notes:
        ''

    });


    while (
      this.items.length > 0
    ) {

      this.items.removeAt(0);
    }


    if (
      this.materials().length > 0
    ) {

      this.addItem();
    }
  }


  private prefillIdentity():
    void {

    const user =
      this.currentUser();

    if (!user) {
      return;
    }


    this.form.patchValue({

      donorName:
        user.fullName,

      donorEmail:
        user.email

    });


    if (
      user.roleName === 'Client'
    ) {

      this.customers
        .getMyProfile()
        .subscribe({

          next: response => {

            this.form.patchValue({

              donorName:
                response.data.fullName,

              donorEmail:
                response.data.email,

              donorPhone:
                response.data.phone ??
                ''

            });

          },

          error: () => {}

        });
    }
  }


  private firstUnusedMaterialId():
    string {

    const selected =
      new Set(

        this.items.controls.map(
          control =>
            control
              .get('rawMaterialId')
              ?.value
        )

      );


    return (
      this.materials()
        .find(
          item =>
            !selected.has(
              item.id
            )
        )
        ?.id ??

      this.materials()[0]
        ?.id ??

      ''
    );
  }
}
