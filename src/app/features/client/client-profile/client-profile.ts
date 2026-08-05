import {
  CommonModule
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
import { RouterLink } from '@angular/router';

import {
  Customer,
  CustomerUpdateRequest
} from '../../../core/models/customer.model';

import {
  CustomerService
} from '../../../core/services/customer.service';
import { MediaService } from '../../../core/services/media.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './client-profile.html',
  styleUrl: './client-profile.css'
})
export class ClientProfile
  implements OnInit {

  private readonly customerService =
    inject(CustomerService);

  private readonly formBuilder =
    inject(FormBuilder);
  private readonly mediaService = inject(MediaService);
  private readonly authService = inject(AuthService);

  readonly customer =
    signal<Customer | null>(null);

  readonly loading =
    signal(true);

  readonly saving =
    signal(false);
  readonly uploadingImage = signal(false);
  readonly changingPassword = signal(false);

  readonly editing =
    signal(false);

  readonly errorMessage =
    signal('');

  readonly successMessage =
    signal('');

  readonly initials =
    computed(() => {
      const customer =
        this.customer();

      if (!customer) {
        return 'CL';
      }

      const firstName =
        customer.name.firstNames
          ?.trim()
          .charAt(0) ?? '';

      const paternalLastName =
        customer.name.paternalLastName
          ?.trim()
          .charAt(0) ?? '';

      return (
        firstName +
        paternalLastName
      ).toUpperCase();
    });

  readonly profileForm =
    this.formBuilder.nonNullable.group({
      firstNames: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],

      paternalLastName: [
        '',
        [
          Validators.required,
          Validators.maxLength(60)
        ]
      ],

      maternalLastName: [
        '',
        [
          Validators.maxLength(60)
        ]
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(150)
        ]
      ],

      phone: [
        '',
        [
          Validators.pattern(/^\d{10}$/)
        ]
      ],

      street: [''],
      exteriorNumber: [''],
      interiorNumber: [''],
      neighborhood: [''],

      postalCode: [
        '',
        [
          Validators.pattern(/^\d{5}$/)
        ]
      ],

      city: [''],
      state: [''],
      country: ['México'],
      references: ['']
      ,profileImageUrl: ['']
    });

  readonly passwordForm = this.formBuilder.nonNullable.group({
    currentPassword: ['', [Validators.required, Validators.minLength(8)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmNewPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.customerService
      .getMyProfile()
      .subscribe({
        next: response => {
          if (
            response.success &&
            response.data
          ) {
            this.customer.set(
              response.data
            );

            this.fillForm(
              response.data
            );
          } else {
            this.errorMessage.set(
              response.message ??
              'No fue posible obtener el perfil.'
            );
          }

          this.loading.set(false);
        },

        error: error => {
          this.errorMessage.set(
            error.error?.message ??
            'Ocurrió un error al cargar el perfil.'
          );

          this.loading.set(false);
        }
      });
  }

  startEditing(): void {
    const customer =
      this.customer();

    if (!customer) {
      return;
    }

    this.fillForm(customer);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.editing.set(true);
  }

  cancelEditing(): void {
    const customer =
      this.customer();

    if (customer) {
      this.fillForm(customer);
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.editing.set(false);
  }

  saveProfile(): void {
    if (
      this.profileForm.invalid ||
      this.saving()
    ) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const customer =
      this.customer();

    if (!customer) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formValue =
      this.profileForm.getRawValue();

    const hasAddress =
      this.hasAddressData(formValue);

    const request:
      CustomerUpdateRequest = {
        name: {
          firstNames:
            formValue.firstNames.trim(),

          paternalLastName:
            formValue
              .paternalLastName
              .trim(),

          maternalLastName:
            this.normalizeOptional(
              formValue.maternalLastName
            ),

          fullName: ''
        },

        email:
          formValue.email
            .trim()
            .toLowerCase(),

        phone:
          this.normalizeOptional(
            formValue.phone
          ),

        profileImageUrl: this.normalizeOptional(formValue.profileImageUrl),

        address: hasAddress
          ? {
              street:
                formValue.street.trim(),

              exteriorNumber:
                formValue
                  .exteriorNumber
                  .trim(),

              interiorNumber:
                this.normalizeOptional(
                  formValue.interiorNumber
                ),

              neighborhood:
                formValue
                  .neighborhood
                  .trim(),

              postalCode:
                formValue
                  .postalCode
                  .trim(),

              city:
                formValue.city.trim(),

              state:
                formValue.state.trim(),

              country:
                formValue.country.trim() ||
                'México',

              references:
                this.normalizeOptional(
                  formValue.references
                )
            }
          : null,

        isActive:
          customer.isActive
      };

    this.customerService
      .updateMyProfile(request)
      .subscribe({
        next: response => {
          if (
            response.success &&
            response.data
          ) {
            this.customer.set(
              response.data
            );

            this.fillForm(
              response.data
            );

            this.editing.set(false);

            this.successMessage.set(
              response.message ??
              'Perfil actualizado correctamente.'
            );
          } else {
            this.errorMessage.set(
              response.message ??
              'No fue posible actualizar el perfil.'
            );
          }

          this.saving.set(false);
        },

        error: error => {
          const errors =
            error.error?.errors;

          if (
            Array.isArray(errors) &&
            errors.length > 0
          ) {
            this.errorMessage.set(
              errors.join(' ')
            );
          } else {
            this.errorMessage.set(
              error.error?.message ??
              'Ocurrió un error al actualizar el perfil.'
            );
          }

          this.saving.set(false);
        }
      });
  }

  uploadProfileImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || this.uploadingImage()) return;
    this.uploadingImage.set(true);
    this.errorMessage.set('');
    this.mediaService.uploadImage(file, 'profiles').subscribe({
      next: response => {
        this.uploadingImage.set(false);
        this.profileForm.controls.profileImageUrl.setValue(response.data.url);
      },
      error: error => {
        this.uploadingImage.set(false);
        this.errorMessage.set(error?.error?.message ?? 'No fue posible subir la foto.');
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || this.changingPassword()) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const value = this.passwordForm.getRawValue();
    if (value.newPassword !== value.confirmNewPassword) {
      this.errorMessage.set('La confirmación de la nueva contraseña no coincide.');
      return;
    }
    this.changingPassword.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.authService.changePassword(value).subscribe({
      next: response => {
        this.changingPassword.set(false);
        this.passwordForm.reset();
        this.successMessage.set(response.message ?? 'Contraseña actualizada correctamente.');
      },
      error: error => {
        this.changingPassword.set(false);
        this.errorMessage.set(error?.error?.message ?? 'No fue posible cambiar la contraseña.');
      }
    });
  }

  hasError(
    controlName: string
  ): boolean {
    const control =
      this.profileForm.get(
        controlName
      );

    return Boolean(
      control &&
      control.invalid &&
      (
        control.dirty ||
        control.touched
      )
    );
  }

  private fillForm(
    customer: Customer
  ): void {
    this.profileForm.patchValue({
      firstNames:
        customer.name.firstNames ?? '',

      paternalLastName:
        customer.name
          .paternalLastName ?? '',

      maternalLastName:
        customer.name
          .maternalLastName ?? '',

      email:
        customer.email ?? '',

      phone:
        customer.phone ?? '',

      street:
        customer.address
          ?.street ?? '',

      exteriorNumber:
        customer.address
          ?.exteriorNumber ?? '',

      interiorNumber:
        customer.address
          ?.interiorNumber ?? '',

      neighborhood:
        customer.address
          ?.neighborhood ?? '',

      postalCode:
        customer.address
          ?.postalCode ?? '',

      city:
        customer.address
          ?.city ?? '',

      state:
        customer.address
          ?.state ?? '',

      country:
        customer.address
          ?.country ?? 'México',

      references:
        customer.address
          ?.references ?? '',

      profileImageUrl: customer.profileImageUrl ?? ''
    });
  }

  private normalizeOptional(
    value?: string | null
  ): string | null {
    const normalized =
      value?.trim();

    return normalized
      ? normalized
      : null;
  }

  private hasAddressData(
    value:
      typeof this.profileForm.value
  ): boolean {
    return Boolean(
      value.street?.trim() ||
      value.exteriorNumber?.trim() ||
      value.interiorNumber?.trim() ||
      value.neighborhood?.trim() ||
      value.postalCode?.trim() ||
      value.city?.trim() ||
      value.state?.trim() ||
      value.references?.trim()
    );
  }
}


