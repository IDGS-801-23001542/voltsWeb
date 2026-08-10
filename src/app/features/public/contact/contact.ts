import { Component, OnInit, inject, signal } from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ContactService } from '../../../core/services/contact.service';
import { AuthService } from '../../../core/services/auth.service';
import { CustomerService } from '../../../core/services/customer.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ContactService);
  private readonly auth = inject(AuthService);
  private readonly customers = inject(CustomerService);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly errorMessage = signal('');

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
    subject: [
      '',
      [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(150)
      ]
    ],
    message: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(2000)
      ]
    ]
  });

  ngOnInit(): void { this.prefillIdentity(); }

  private prefillIdentity(): void {
    const user = this.auth.currentUser();
    if (!user) return;
    this.form.patchValue({ fullName: user.fullName, email: user.email });
    if (user.roleName === 'Client') {
      this.customers.getMyProfile().subscribe({
        next: response => this.form.patchValue({
          fullName: response.data.fullName,
          email: response.data.email,
          phone: response.data.phone ?? ''
        }),
        error: () => {}
      });
    }
  }

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const value = this.form.getRawValue();

    this.contactService.send({
      fullName: value.fullName.trim(),
      email: value.email.trim(),
      phone: value.phone.trim() || undefined,
      subject: value.subject.trim(),
      message: value.message.trim()
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: error => {
        this.loading.set(false);

        this.errorMessage.set(
          error?.error?.message ??
          'No fue posible enviar el mensaje. Inténtalo nuevamente.'
        );
      }
    });
  }

  sendAnother(): void {
    this.form.reset({ fullName: '', email: '', phone: '', subject: '', message: '' });
    this.prefillIdentity();
    this.submitted.set(false);
    this.errorMessage.set('');
  }
}
