import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  departmentName: string | null;
  roles: string[];
}

interface Department {
  id: string;
  name: string;
}

@Component({
  standalone: true,

  template: `
    <div class="page-header">
      <div>
        <h1>Users</h1>
        <p>Manage users in your organization</p>
      </div>
    </div>


    <!-- LOADING -->

    @if (loading) {
      <p>Loading users...</p>
    }


    <!-- ERROR -->

    @if (error) {
      <p class="error">{{ error }}</p>
    }

    @if (success) {
      <p class="assignment-success" role="status">{{ success }}</p>
    }


    <!-- NO USERS -->

    @if (!loading && !error && users.length === 0) {
      <p>No users found.</p>
    }


    <!-- USERS TABLE -->

    @if (!loading && users.length > 0) {

      <div class="table-card">

        <table>

          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Assign Department</th>
              <th>Roles</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            @for (user of users; track user.id) {

              <tr>

                <td>
                  {{ user.firstName }} {{ user.lastName }}
                </td>

                <td>
                  {{ user.email }}
                </td>

                <td>
                  {{ user.departmentName || 'Not Assigned' }}
                </td>

                <td class="department-assignment">
                  <select
                    [value]="selectedDepartments[user.id] || ''"
                    (change)="selectDepartment(user.id, $any($event.target).value)"
                    aria-label="Choose a department for {{ user.firstName }} {{ user.lastName }}"
                  >
                    <option value="">Choose department</option>
                    @for (department of departments; track department.id) {
                      <option [value]="department.id">{{ department.name }}</option>
                    }
                  </select>
                  <button
                    type="button"
                    [disabled]="!selectedDepartments[user.id] || savingDepartmentFor === user.id"
                    (click)="assignDepartment(user)"
                  >
                    {{ savingDepartmentFor === user.id ? 'Saving…' : 'Assign' }}
                  </button>
                  @if (user.departmentName) {
                    <button
                      type="button"
                      class="status-btn"
                      [disabled]="savingDepartmentFor === user.id"
                      (click)="removeDepartment(user)"
                    >
                      Remove
                    </button>
                  }
                </td>

                <td>
                  {{ user.roles?.join(', ') }}
                </td>

                <td>

                  <span
                    [class.active-status]="user.active"
                    [class.inactive-status]="!user.active"
                  >
                    {{ user.active ? 'Active' : 'Inactive' }}
                  </span>

                </td>

                <td class="actions">

                  <button
                    class="status-btn"
                    (click)="toggleUserStatus(user)"
                  >
                    {{ user.active ? 'Deactivate' : 'Activate' }}
                  </button>

                </td>

              </tr>

            }

          </tbody>

        </table>

      </div>

    }
  `,
  styles: [`
    .department-assignment { min-width: 300px; }
    .department-assignment select { display: inline-block; width: 170px; min-height: 38px; margin: 0 5px 0 0; padding: 7px 9px; font-size: 13px; }
    .department-assignment button { padding: 8px 11px; margin: 3px 4px 3px 0; font-size: 12px; }
    .assignment-success { padding: 10px 13px; border: 1px solid #b8e4cb; border-radius: 8px; color: #187348; background: #eefaf3; }
  `]
})
export class UsersComponent implements OnInit {

  users: User[] = [];
  departments: Department[] = [];
  selectedDepartments: Record<string, string> = {};
  savingDepartmentFor = '';
  success = '';

  loading = true;
  error = '';


  constructor(
  private http: HttpClient,
  private cdr: ChangeDetectorRef
) {}


  ngOnInit(): void {
    this.loadUsers();
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.http.get<Department[]>(`${API_URL}/departments`).subscribe({
      next: (departments) => {
        this.departments = departments;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Could not load departments. Check your access and try again.';
        this.cdr.markForCheck();
      }
    });
  }

  selectDepartment(userId: string, departmentId: string): void {
    this.selectedDepartments[userId] = departmentId;
  }

  assignDepartment(user: User): void {
    const departmentId = this.selectedDepartments[user.id];
    if (!departmentId) return;

    this.savingDepartmentFor = user.id;
    this.error = '';
    this.success = '';
    this.http.put<User>(`${API_URL}/users/${user.id}/department`, { departmentId }).subscribe({
      next: () => {
        this.savingDepartmentFor = '';
        this.success = `${user.firstName} ${user.lastName} was assigned to the department.`;
        delete this.selectedDepartments[user.id];
        this.loadUsers();
        this.cdr.markForCheck();
      },
      error: (response) => {
        this.savingDepartmentFor = '';
        this.error = response.error?.message || 'Failed to assign department.';
        this.cdr.markForCheck();
      }
    });
  }

  removeDepartment(user: User): void {
    this.savingDepartmentFor = user.id;
    this.error = '';
    this.success = '';
    this.http.delete<User>(`${API_URL}/users/${user.id}/department`).subscribe({
      next: () => {
        this.savingDepartmentFor = '';
        this.success = `${user.firstName} ${user.lastName} was removed from the department.`;
        this.loadUsers();
        this.cdr.markForCheck();
      },
      error: (response) => {
        this.savingDepartmentFor = '';
        this.error = response.error?.message || 'Failed to remove department assignment.';
        this.cdr.markForCheck();
      }
    });
  }


  // =========================
  // LOAD USERS
  // =========================

  loadUsers(): void {

  this.loading = true;
  this.error = '';

  const url = `${API_URL}/users`;

  console.log('Calling URL:', url);

  this.http.get<any>(url).subscribe({

    next: (response) => {

      console.log('SUCCESS - Users response:', response);

      this.users = response.content ?? [];

      console.log('Users:', this.users);

      this.loading = false;

      // Force Angular to refresh the UI
      this.cdr.detectChanges();
    },

    error: (error) => {

      console.error('ERROR - Failed to load users:', error);

      this.error =
        error.error?.message ||
        error.message ||
        'Failed to load users';

      this.loading = false;

      // Force Angular to refresh the UI
      this.cdr.detectChanges();
    },

    complete: () => {
      console.log('Users request completed');
    }
  });
}


  // =========================
  // ACTIVATE / DEACTIVATE USER
  // =========================

  toggleUserStatus(user: User): void {

    const newStatus = !user.active;

    const action = newStatus
      ? 'activate'
      : 'deactivate';


    const confirmed = confirm(
      `Are you sure you want to ${action} ${user.firstName} ${user.lastName || ''}?`
    );


    if (!confirmed) {
      return;
    }


    this.http
      .put<User>(
        `${API_URL}/users/${user.id}/status`,
        {
          active: newStatus
        }
      )
      .subscribe({

        next: () => {

          // Reload users after status update
          this.loadUsers();
        },


        error: (error) => {

          console.error(
            'Failed to update user status:',
            error
          );

          this.error =
            error.error?.message ||
            'Failed to update user status';
        }

      });
  }
}
