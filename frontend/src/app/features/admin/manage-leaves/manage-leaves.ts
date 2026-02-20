import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LeaveService, Leave } from '../../../core/services/leave';

@Component({
  selector: 'app-manage-leaves',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './manage-leaves.html',
})
export class ManageLeavesComponent implements OnInit {
  leaves: Leave[] = [];
  filteredLeaves: Leave[] = [];
  isLoading = true;
  successMessage = '';
  errorMessage = '';
  selectedFilter = 'All';
  adminRemarks = '';
  filters = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'];

  constructor(
    private leaveService: LeaveService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadLeaves();
  }

  loadLeaves(): void {
    this.isLoading = true;
    this.leaveService.getAllLeaves().subscribe({
      next: (data) => {
        this.leaves = data;
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilter(): void {
    this.filteredLeaves =
      this.selectedFilter === 'All'
        ? this.leaves
        : this.leaves.filter((l) => l.status === this.selectedFilter);
    this.cdr.detectChanges();
  }

  updateStatus(id: string, status: string, remarks: string): void {
    this.leaveService.updateLeaveStatus(id, status, remarks).subscribe({
      next: () => {
        this.successMessage = `Leave ${status} successfully!`;
        this.loadLeaves();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Failed to update leave status.';
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
