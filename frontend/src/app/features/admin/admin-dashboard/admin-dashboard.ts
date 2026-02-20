import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LeaveService, DashboardStats } from '../../../core/services/leave';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  isLoading = true;

  constructor(
    private leaveService: LeaveService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.leaveService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
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
    return classes[status] || '';
  }
}
