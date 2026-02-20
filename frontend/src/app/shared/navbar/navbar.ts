import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    private router: Router,
  ) {}

  logout(): void {
    this.authService.logout();
  }

  goToDashboard(): void {
    if (this.authService.isAdmin) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/employee/dashboard']);
    }
  }
}
