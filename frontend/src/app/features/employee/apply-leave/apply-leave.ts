import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LeaveService } from '../../../core/services/leave';

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

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.leaveForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
    });
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
