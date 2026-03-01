import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LeaveService } from '../../../core/services/leave';

function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;
  return control.value <= todayStr ? { pastDate: true } : null;
}

function endAfterStartValidator(form: AbstractControl): ValidationErrors | null {
  const start = form.get('startDate')?.value;
  const end = form.get('endDate')?.value;
  if (!start || !end) return null;
  return new Date(end) <= new Date(start) ? { endNotAfterStart: true } : null;
}

@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './apply-leave.html',
})
export class ApplyLeaveComponent {
  leaveForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  get minDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.leaveForm = this.fb.group(
      {
        startDate: ['', [Validators.required, futureDateValidator]],
        endDate: ['', [Validators.required, futureDateValidator]],
        reason: ['', [Validators.required, Validators.minLength(10)]],
      },
      { validators: endAfterStartValidator },
    );
  }

  get startDate() {
    return this.leaveForm.get('startDate');
  }
  get endDate() {
    return this.leaveForm.get('endDate');
  }
  get reason() {
    return this.leaveForm.get('reason');
  }
  get endNotAfterStart() {
    return this.leaveForm.hasError('endNotAfterStart') && this.endDate?.touched;
  }

  onSubmit(): void {
    if (this.leaveForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.leaveService.applyLeave(this.leaveForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Leave applied successfully!';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/employee/history']), 1500);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Something went wrong. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }
}
