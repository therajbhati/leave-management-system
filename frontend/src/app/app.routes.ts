import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register').then((m) => m.RegisterComponent),
  },
  {
    path: 'employee/dashboard',
    loadComponent: () =>
      import('./features/employee/employee-dashboard/employee-dashboard').then(
        (m) => m.EmployeeDashboardComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'employee/apply',
    loadComponent: () =>
      import('./features/employee/apply-leave/apply-leave').then((m) => m.ApplyLeaveComponent),
    canActivate: [authGuard],
  },
  {
    path: 'employee/history',
    loadComponent: () =>
      import('./features/employee/leave-history/leave-history').then(
        (m) => m.LeaveHistoryComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'admin/dashboard',
    loadComponent: () =>
      import('./features/admin/admin-dashboard/admin-dashboard').then(
        (m) => m.AdminDashboardComponent,
      ),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin/leaves',
    loadComponent: () =>
      import('./features/admin/manage-leaves/manage-leaves').then((m) => m.ManageLeavesComponent),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFoundComponent),
  },
];
