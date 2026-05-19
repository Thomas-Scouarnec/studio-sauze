import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  host: {
    id: 'contact',
    role: 'region',
    'aria-labelledby': 'contact-heading'
  }
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    arrivalDate: [''],
    departureDate: [''],
    numberOfPeople: ['2'],
    message: ['']
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.set(true);
  }
}
