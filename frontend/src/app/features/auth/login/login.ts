import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    if (this.authService.isLoggedIn) this.redirectUser();

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get email() {
    return this.loginForm.get('email');
  }
  get password() {
    return this.loginForm.get('password');
  }

  redirectUser(): void {
    if (this.authService.isAdmin) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/employee/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (user) => {
        this.isLoading = false;

        setTimeout(() => this.redirectUser(), 100);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please try again.';
      },
    });
  }
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
