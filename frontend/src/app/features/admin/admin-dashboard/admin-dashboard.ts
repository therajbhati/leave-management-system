import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LeaveService, DashboardStats } from '../../../core/services/leave'; // Check this path!

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private leaveService: LeaveService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    console.log('🚀 Dashboard: Initialization started...');

    this.leaveService.getDashboardStats().subscribe({
      next: (data) => {
        console.log(' Dashboard Stats Loaded:', data);
        this.stats = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(' Dashboard Error:', err);

        if (err.status === 401) {
          this.errorMessage = 'Session expired. Please Logout and Login again.';
        } else {
          this.errorMessage = 'Failed to load dashboard data.';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getStatusClass(status: string): string {
    const classes: any = {
      Pending: 'bg-yellow-100 text-yellow-700',
      Approved: 'bg-green-100 text-green-700',
      Rejected: 'bg-red-100 text-red-700',
      Cancelled: 'bg-gray-100 text-gray-600',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
}
