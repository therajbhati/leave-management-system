import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.html',
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  tokenFromUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.resetForm = this.fb.group(
      {
        code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit(): void {
    // If user clicked the email link, token is in the query params
    this.tokenFromUrl = this.route.snapshot.queryParamMap.get('token');
  }

  passwordMatchValidator(form: FormGroup) {
    const pw = form.get('newPassword')?.value;
    const cpw = form.get('confirmPassword')?.value;
    return pw === cpw ? null : { passwordMismatch: true };
  }

  get code() {
    return this.resetForm.get('code');
  }
  get newPassword() {
    return this.resetForm.get('newPassword');
  }
  get confirmPassword() {
    return this.resetForm.get('confirmPassword');
  }
  get passwordMismatch() {
    return this.resetForm.hasError('passwordMismatch') && this.confirmPassword?.touched;
  }

  onSubmit(): void {
    if (this.resetForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { code, newPassword } = this.resetForm.value;

    // Use token from URL if available, otherwise use the typed code
    const payload = this.tokenFromUrl
      ? { token: this.tokenFromUrl, newPassword }
      : { code, newPassword };

    this.authService.resetPassword(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res.message;
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Reset failed. Code may be expired.';
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
