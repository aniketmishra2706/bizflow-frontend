import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { API_URL } from '../../core/api';

interface Department {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  roles?: string[];
}

@Component({
  standalone: true,
  imports: [
    FormsModule,
    DatePipe
  ],

  template: `

    <!-- PAGE HEADER -->
    <div class="page-header">

      <div>
        <h1>Departments</h1>
        <p>Manage departments in your organization</p>
      </div>

      <button
        type="button"
        (click)="openCreateForm()"
      >
        + Create Department
      </button>

    </div>


    <!-- CREATE / EDIT FORM -->
    @if (showForm) {

      <div class="form-card">

        <h2>
          {{ editingDepartment ? 'Edit Department' : 'Create Department' }}
        </h2>

        <div class="form-group">

          <label>Department Name</label>

          <input
            type="text"
            [(ngModel)]="departmentName"
            placeholder="Enter department name"
          />

        </div>


        <div class="form-group">

          <label>Description</label>

          <textarea
            [(ngModel)]="description"
            placeholder="Enter department description"
            rows="4"
          ></textarea>

        </div>


        @if (formError) {

          <p class="error">
            {{ formError }}
          </p>

        }


        <div class="form-actions">

          <button
            type="button"
            (click)="saveDepartment()"
            [disabled]="saving"
          >
            {{
              saving
                ? 'Saving...'
                : editingDepartment
                  ? 'Update Department'
                  : 'Create Department'
            }}
          </button>


          <button
            type="button"
            (click)="cancelForm()"
          >
            Cancel
          </button>

        </div>

      </div>

    }


    <!-- LOADING -->
    @if (loading) {

      <p>Loading departments...</p>

    }


    <!-- ERROR -->
    @if (error) {

      <p class="error">
        {{ error }}
      </p>

    }


    <!-- EMPTY STATE -->
    @if (!loading && departments.length === 0) {

      <p>No departments found.</p>

    }


    <!-- DEPARTMENTS TABLE -->
    @if (!loading && departments.length > 0) {

      <div class="table-card">

        <table>

          <thead>

            <tr>
              <th>Department</th>
              <th>Description</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>

          </thead>


          <tbody>

            @for (department of departments; track department.id) {

              <tr>

                <td>
                  {{ department.name }}
                </td>


                <td>
                  {{ department.description || 'No description' }}
                </td>


                <td>

                  @if (department.createdAt) {

                    {{
                      department.createdAt
                        | date:'dd MMM yyyy, hh:mm a'
                    }}

                  } @else {

                    -

                  }

                </td>


                <td>

                  <button
                    type="button"
                    (click)="viewUsers(department)"
                  >
                    Users
                  </button>


                  <button
                    type="button"
                    (click)="editDepartment(department)"
                  >
                    Edit
                  </button>


                  <button
                    type="button"
                    (click)="deleteDepartment(department)"
                  >
                    Delete
                  </button>

                </td>

              </tr>

            }

          </tbody>

        </table>

      </div>

    }


    <!-- DEPARTMENT USERS -->
    @if (selectedDepartment) {

      <div class="users-card">

        <h2>
          Users in {{ selectedDepartment.name }}
        </h2>


        <button
          type="button"
          (click)="closeUsers()"
        >
          Close
        </button>


        @if (loadingUsers) {

          <p>Loading department users...</p>

        }


        @if (
          !loadingUsers &&
          departmentUsers.length === 0
        ) {

          <p>No users assigned to this department.</p>

        }


        @if (
          !loadingUsers &&
          departmentUsers.length > 0
        ) {

          <table>

            <thead>

              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
              </tr>

            </thead>


            <tbody>

              @for (user of departmentUsers; track user.id) {

                <tr>

                  <td>
                    {{ user.firstName }} {{ user.lastName }}
                  </td>

                  <td>
                    {{ user.email }}
                  </td>

                  <td>
                    {{ user.roles?.join(', ') || '-' }}
                  </td>

                  <td>
                    {{ user.active ? 'Active' : 'Inactive' }}
                  </td>

                </tr>

              }

            </tbody>

          </table>

        }

      </div>

    }

  `
})
export class DepartmentsComponent implements OnInit {

  // =========================
  // DEPARTMENTS
  // =========================

  departments: Department[] = [];

  loading = true;

  error = '';


  // =========================
  // FORM
  // =========================

  showForm = false;

  editingDepartment: Department | null = null;

  departmentName = '';

  description = '';

  formError = '';

  saving = false;


  // =========================
  // DEPARTMENT USERS
  // =========================

  selectedDepartment: Department | null = null;

  departmentUsers: User[] = [];

  loadingUsers = false;


  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    console.log('Departments component started');

    this.loadDepartments();

  }


  // =========================
  // LOAD DEPARTMENTS
  // =========================

  loadDepartments(): void {
    this.loading = true;

    console.log('Calling departments API:', `${API_URL}/departments`);

    this.http.get<Department[]>(`${API_URL}/departments`)
      .subscribe({
        next: (response) => {
          console.log('Departments API SUCCESS:', response);

          this.departments = response;
          this.loading = false;

          console.log('Departments assigned:', this.departments);

          // Force a re-render. Without this, if the app uses zoneless
          // change detection (or the callback otherwise runs outside
          // Angular's zone), the template will not update even though
          // these fields are set correctly.
          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error('Failed to load departments:', error);

          this.departments = [];
          this.loading = false;
          this.error = error.error?.message || 'Failed to load departments';

          this.cdr.markForCheck();
        }
      });
  }


  // =========================
  // OPEN CREATE FORM
  // =========================

  openCreateForm(): void {

    this.editingDepartment = null;

    this.departmentName = '';

    this.description = '';

    this.formError = '';

    this.showForm = true;

  }


  // =========================
  // EDIT DEPARTMENT
  // =========================

  editDepartment(
    department: Department
  ): void {

    this.editingDepartment = department;

    this.departmentName = department.name;

    this.description =
      department.description || '';

    this.formError = '';

    this.showForm = true;

  }


  // =========================
  // SAVE DEPARTMENT
  // =========================

  saveDepartment(): void {

    this.formError = '';


    if (!this.departmentName.trim()) {

      this.formError =
        'Department name is required.';

      return;

    }


    this.saving = true;


    const request = {

      name: this.departmentName.trim(),

      description: this.description.trim()

    };


    // UPDATE

    if (this.editingDepartment) {

      this.http
        .put<Department>(
          `${API_URL}/departments/${this.editingDepartment.id}`,
          request
        )
        .subscribe({

          next: () => {

            this.saving = false;

            this.cancelForm();

            this.loadDepartments();

          },


          error: (error) => {

            this.formError =
              error.error?.message ||
              'Failed to update department';

            this.saving = false;

            this.cdr.markForCheck();

          }

        });

      return;

    }


    // CREATE

    this.http
      .post<Department>(
        `${API_URL}/departments`,
        request
      )
      .subscribe({

        next: () => {

          this.saving = false;

          this.cancelForm();

          this.loadDepartments();

        },


        error: (error) => {

          this.formError =
            error.error?.message ||
            'Failed to create department';

          this.saving = false;

          this.cdr.markForCheck();

        }

      });

  }


  // =========================
  // DELETE DEPARTMENT
  // =========================

  deleteDepartment(
    department: Department
  ): void {

    if (
      !confirm(
        `Delete department "${department.name}"?`
      )
    ) {

      return;

    }


    this.http
      .delete(
        `${API_URL}/departments/${department.id}`
      )
      .subscribe({

        next: () => {

          this.loadDepartments();

        },


        error: (error) => {

          this.error =
            error.error?.message ||
            'Failed to delete department';

          this.cdr.markForCheck();

        }

      });

  }


  // =========================
  // VIEW USERS
  // =========================

  viewUsers(
    department: Department
  ): void {

    this.selectedDepartment = department;

    this.departmentUsers = [];

    this.loadingUsers = true;


    this.http
      .get<User[]>(
        `${API_URL}/departments/${department.id}/users`
      )
      .subscribe({

        next: (response) => {

          this.departmentUsers = response;

          this.loadingUsers = false;

          this.cdr.markForCheck();

        },


        error: (error) => {

          this.loadingUsers = false;

          this.error =
            error.error?.message ||
            'Failed to load department users';

          this.cdr.markForCheck();

        }

      });

  }


  // =========================
  // CLOSE USERS
  // =========================

  closeUsers(): void {

    this.selectedDepartment = null;

    this.departmentUsers = [];

    this.loadingUsers = false;

  }


  // =========================
  // CANCEL FORM
  // =========================

  cancelForm(): void {

    this.showForm = false;

    this.formError = '';

    this.departmentName = '';

    this.description = '';

    this.editingDepartment = null;

  }

}