import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LeaveService, Leave } from '../../../core/services/leave';
import { AuthService } from '../../../core/services/auth';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-dashboard.html',
})
export class EmployeeDashboardComponent implements OnInit {
  leaves: Leave[] = [];
  isLoading = true;

  get pendingCount() {
    return this.leaves.filter((l) => l.status === 'Pending').length;
  }
  get approvedCount() {
    return this.leaves.filter((l) => l.status === 'Approved').length;
  }
  get rejectedCount() {
    return this.leaves.filter((l) => l.status === 'Rejected').length;
  }

  constructor(
    public authService: AuthService,
    private leaveService: LeaveService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.leaveService.getMyLeaves().subscribe({
        next: (data) => {
          this.leaves = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log('Error:', err);
          this.isLoading = false;
        },
      });
    }); //
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
