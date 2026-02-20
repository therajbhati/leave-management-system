import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LeaveService, Leave } from '../../../core/services/leave';

@Component({
  selector: 'app-leave-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './leave-history.html',
})
export class LeaveHistoryComponent implements OnInit {
  leaves: Leave[] = [];
  isLoading = true;
  successMessage = '';
  errorMessage = '';

  constructor(
    private leaveService: LeaveService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadLeaves();
  }

  loadLeaves(): void {
    this.isLoading = true;
    this.leaveService.getMyLeaves().subscribe({
      next: (data) => {
        this.leaves = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  cancelLeave(id: string): void {
    if (!confirm('Are you sure you want to cancel this leave?')) return;

    this.leaveService.cancelLeave(id).subscribe({
      next: () => {
        this.successMessage = 'Leave cancelled successfully!';
        this.loadLeaves();
        this.cdr.detectChanges();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Failed to cancel leave.';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
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
