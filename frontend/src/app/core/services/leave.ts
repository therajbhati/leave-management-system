import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Leave {
  _id: string;
  employee: any;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  adminRemarks: string;
  createdAt: string;
}

export interface DashboardStats {
  totalEmployees: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  recentLeaves: Leave[];
}

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private apiUrl = `${environment.apiUrl}/leaves`;

  constructor(private http: HttpClient) {}

  applyLeave(data: { startDate: string; endDate: string; reason: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/apply`, data);
  }

  getMyLeaves(): Observable<Leave[]> {
    return this.http.get<Leave[]>(`${this.apiUrl}/history`, {
      headers: { 'Cache-Control': 'no-cache' },
    });
  }

  cancelLeave(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/cancel`, {});
  }

  getAllLeaves(): Observable<Leave[]> {
    return this.http.get<Leave[]>(`${this.apiUrl}/admin/all`);
  }

  updateLeaveStatus(id: string, status: string, adminRemarks: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/${id}/status`, { status, adminRemarks });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/admin/dashboard`);
  }
}
