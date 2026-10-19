import { Routes } from '@angular/router';

import { LoginComponent } from './features/login.component';
import { RegisterComponent } from './features/register.component';
import { LayoutComponent } from './layout.component';

import { DashboardComponent } from './features/dashboard.component';
import { UsersComponent } from './features/users/users.component';
import { DepartmentsComponent } from './features/departments/departments.component';
import { WorkflowsComponent } from './features/workflows/workflows.component';
import { TasksComponent } from './features/tasks/tasks.component';

import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';

export const routes: Routes = [

  // =========================
  // PUBLIC ROUTES
  // =========================

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'register',
    component: RegisterComponent
  },


  // =========================
  // PROTECTED ROUTES
  // =========================

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],

    children: [

      // ALL LOGGED-IN USERS
      {
        path: 'dashboard',
        component: DashboardComponent
      },

      // ADMIN ONLY
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [roleGuard],
        data: {
          roles: ['ADMIN']
        }
      },

      // ADMIN + MANAGER
      {
        path: 'departments',
        component: DepartmentsComponent,
        canActivate: [roleGuard],
        data: {
          roles: ['ADMIN', 'MANAGER']
        }
      },

      // ADMIN + MANAGER
      {
        path: 'workflows',
        component: WorkflowsComponent,
        canActivate: [roleGuard],
        data: {
          roles: ['ADMIN', 'MANAGER']
        }
      },

      // ALL LOGGED-IN USERS
      {
        path: 'tasks',
        component: TasksComponent
      },

      // DEFAULT FOR LOGGED-IN USERS
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      }
    ]
  },

  // UNKNOWN URL
  {
    path: '**',
    redirectTo: 'login'
  }
];