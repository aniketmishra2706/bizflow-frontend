import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { API_URL } from '../../core/api';


interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: string;

  departmentId: string;
  departmentName?: string;

  createdByName?: string;

  createdAt?: string;
}


interface Department {
  id: string;
  name: string;
  description?: string;
}


@Component({
  standalone: true,

  imports: [
    FormsModule,
    DatePipe
  ],

  template: `

    <!-- ========================= -->
    <!-- PAGE HEADER -->
    <!-- ========================= -->

    <div class="page-header">

      <div>
        <h1>Workflows</h1>
        <p>Manage business workflows</p>
      </div>

      <button
        type="button"
        (click)="openCreateForm()"
      >
        + Create Workflow
      </button>

    </div>


    <!-- ========================= -->
    <!-- FILTERS -->
    <!-- ========================= -->

    <div class="filters">

      <div>

        <label>Department</label>

        <select
          [(ngModel)]="selectedDepartmentId"
          (change)="filterByDepartment()"
        >

          <option value="">
            All Departments
          </option>

          @for (department of departments; track department.id) {

            <option [value]="department.id">
              {{ department.name }}
            </option>

          }

        </select>

      </div>


      <div>

        <label>Status</label>

        <select
          [(ngModel)]="selectedStatus"
          (change)="filterByStatus()"
        >

          <option value="">
            All Statuses
          </option>

          @for (status of workflowStatuses; track status) {

            <option [value]="status">
              {{ status }}
            </option>

          }

        </select>

      </div>


      <button
        type="button"
        (click)="clearFilters()"
      >
        Clear Filters
      </button>

    </div>


    <!-- ========================= -->
    <!-- CREATE / EDIT FORM -->
    <!-- ========================= -->

    @if (showForm) {

      <div class="form-card">

        <h2>
          {{
            editingWorkflow
              ? 'Edit Workflow'
              : 'Create Workflow'
          }}
        </h2>


        <!-- NAME -->

        <div class="form-group">

          <label>Workflow Name</label>

          <input
            type="text"
            [(ngModel)]="workflowName"
            placeholder="Enter workflow name"
          />

        </div>


        <!-- DESCRIPTION -->

        <div class="form-group">

          <label>Description</label>

          <textarea
            [(ngModel)]="workflowDescription"
            placeholder="Enter workflow description"
            rows="4"
          ></textarea>

        </div>


        <!-- DEPARTMENT -->

        <div class="form-group">

          <label>Department</label>

          <select
            [(ngModel)]="workflowDepartmentId"
          >

            <option value="">
              Select Department
            </option>

            @for (department of departments; track department.id) {

              <option [value]="department.id">
                {{ department.name }}
              </option>

            }

          </select>

        </div>


        <!-- STATUS -->

        <div class="form-group">

          <label>Status</label>

          <select
            [(ngModel)]="workflowStatus"
          >

            @for (
              status of workflowStatuses;
              track status
            ) {

              <option [value]="status">
                {{ status }}
              </option>

            }

          </select>

        </div>


        <!-- ERROR -->

        @if (formError) {

          <p class="error">
            {{ formError }}
          </p>

        }


        <!-- ACTIONS -->

        <div class="form-actions">

          <button
            type="button"
            (click)="saveWorkflow()"
            [disabled]="saving"
          >

            {{
              saving
                ? 'Saving...'
                : editingWorkflow
                  ? 'Update Workflow'
                  : 'Create Workflow'
            }}

          </button>


          <button
            type="button"
            (click)="cancelForm()"
            [disabled]="saving"
          >
            Cancel
          </button>

        </div>

      </div>

    }


    <!-- ========================= -->
    <!-- LOADING -->
    <!-- ========================= -->

    @if (loading) {

      <p class="loading">
        Loading workflows...
      </p>

    }


    <!-- ========================= -->
    <!-- ERROR -->
    <!-- ========================= -->

    @if (error) {

      <p class="error">
        {{ error }}
      </p>

    }


    <!-- ========================= -->
    <!-- EMPTY STATE -->
    <!-- ========================= -->

    @if (
      !loading &&
      !error &&
      workflows.length === 0
    ) {

      <div class="empty-state">

        <h3>No workflows found</h3>

        <p>
          Create your first workflow to get started.
        </p>

      </div>

    }


    <!-- ========================= -->
    <!-- WORKFLOWS TABLE -->
    <!-- ========================= -->

    @if (
      !loading &&
      workflows.length > 0
    ) {

      <div class="table-card">

        <table>

          <thead>

            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Department</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>

          </thead>


          <tbody>

            @for (
              workflow of workflows;
              track workflow.id
            ) {

              <tr>

                <td>
                  {{ workflow.name }}
                </td>


                <td>
                  {{
                    workflow.description ||
                    'No description'
                  }}
                </td>


                <td>
                  {{
                    workflow.departmentName ||
                    'Not Assigned'
                  }}
                </td>


                <!-- STATUS -->

                <td>

                  <select
                    [ngModel]="workflow.status"
                    (ngModelChange)="changeStatus(
                      workflow,
                      $event
                    )"
                  >

                    @for (
                      status of workflowStatuses;
                      track status
                    ) {

                      <option [value]="status">
                        {{ status }}
                      </option>

                    }

                  </select>

                </td>


                <td>
                  {{
                    workflow.createdByName ||
                    '-'
                  }}
                </td>


                <td>

                  @if (workflow.createdAt) {

                    {{
                      workflow.createdAt
                        | date:'dd MMM yyyy, hh:mm a'
                    }}

                  } @else {

                    -

                  }

                </td>


                <!-- ACTIONS -->

                <td class="actions">

                  <button
                    type="button"
                    (click)="editWorkflow(workflow)"
                  >
                    Edit
                  </button>


                  <button
                    type="button"
                    (click)="deleteWorkflow(workflow)"
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

  `
})
export class WorkflowsComponent implements OnInit {


  // =========================
  // DATA
  // =========================

  workflows: Workflow[] = [];

  departments: Department[] = [];


  // =========================
  // LOADING / ERROR
  // =========================

  loading = true;

  error = '';


  // =========================
  // FILTERS
  // =========================

  selectedDepartmentId = '';

  selectedStatus = '';


  // =========================
  // STATUS VALUES
  // =========================

  // IMPORTANT:
  // These must exactly match your
  // Java WorkflowStatus enum.

  workflowStatuses = [
  'DRAFT',
  'ACTIVE',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
];


  // =========================
  // FORM
  // =========================

  showForm = false;

  editingWorkflow: Workflow | null = null;

  workflowName = '';

  workflowDescription = '';

  workflowDepartmentId = '';

  workflowStatus = 'DRAFT';

  formError = '';

  saving = false;


  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}


  // =========================
  // INITIAL LOAD
  // =========================

  ngOnInit(): void {

    this.loadDepartments();

    this.loadWorkflows();

  }


  // =========================
  // LOAD WORKFLOWS
  // =========================

  loadWorkflows(): void {

    this.loading = true;

    this.error = '';


    this.http
      .get<Workflow[]>(
        `${API_URL}/workflows`
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Workflows API SUCCESS:',
            response
          );

          this.workflows = response || [];

          this.loading = false;

          // IMPORTANT:
          // Force Angular UI update.
          this.cdr.markForCheck();

        },


        error: (error) => {

          console.error(
            'Failed to load workflows:',
            error
          );

          this.workflows = [];

          this.error =
            error.error?.message ||
            'Failed to load workflows';

          this.loading = false;

          this.cdr.markForCheck();

        }

      });

  }


  // =========================
  // LOAD DEPARTMENTS
  // Needed for Create/Edit form
  // =========================

  loadDepartments(): void {

    this.http
      .get<Department[]>(
        `${API_URL}/departments`
      )
      .subscribe({

        next: (response) => {

          this.departments =
            response || [];

          this.cdr.markForCheck();

        },


        error: (error) => {

          console.error(
            'Failed to load departments:',
            error
          );

          this.departments = [];

          this.cdr.markForCheck();

        }

      });

  }


  // =========================
  // OPEN CREATE FORM
  // =========================

  openCreateForm(): void {

    this.editingWorkflow = null;

    this.workflowName = '';

    this.workflowDescription = '';

    this.workflowDepartmentId = '';

    this.workflowStatus = 'DRAFT';

    this.formError = '';

    this.showForm = true;

  }


  // =========================
  // EDIT WORKFLOW
  // =========================

  editWorkflow(
    workflow: Workflow
  ): void {

    this.editingWorkflow = workflow;

    this.workflowName =
      workflow.name;

    this.workflowDescription =
      workflow.description || '';

    this.workflowDepartmentId =
      workflow.departmentId || '';

    this.workflowStatus =
      workflow.status;

    this.formError = '';

    this.showForm = true;

  }


  // =========================
  // SAVE WORKFLOW
  // =========================

  saveWorkflow(): void {

    this.formError = '';


    if (!this.workflowName.trim()) {

      this.formError =
        'Workflow name is required.';

      this.cdr.markForCheck();

      return;

    }


    if (!this.workflowDepartmentId) {

      this.formError =
        'Please select a department.';

      this.cdr.markForCheck();

      return;

    }


    this.saving = true;


    const request = {

      name:
        this.workflowName.trim(),

      description:
        this.workflowDescription.trim(),

      departmentId:
        this.workflowDepartmentId,

      status:
        this.workflowStatus

    };


    // =========================
    // UPDATE
    // =========================

    if (this.editingWorkflow) {

      this.http
        .put<Workflow>(

          `${API_URL}/workflows/${this.editingWorkflow.id}`,

          request

        )
        .subscribe({

          next: () => {

            this.saving = false;

            this.cancelForm();

            this.loadWorkflows();

            this.cdr.markForCheck();

          },


          error: (error) => {

            console.error(
              'Failed to update workflow:',
              error
            );

            this.formError =
              error.error?.message ||
              'Failed to update workflow';

            this.saving = false;

            this.cdr.markForCheck();

          }

        });

      return;

    }


    // =========================
    // CREATE
    // =========================

    this.http
      .post<Workflow>(

        `${API_URL}/workflows`,

        request

      )
      .subscribe({

        next: () => {

          this.saving = false;

          this.cancelForm();

          this.loadWorkflows();

          this.cdr.markForCheck();

        },


        error: (error) => {

          console.error(
            'Failed to create workflow:',
            error
          );

          this.formError =
            error.error?.message ||
            'Failed to create workflow';

          this.saving = false;

          this.cdr.markForCheck();

        }

      });

  }


  // =========================
  // CHANGE STATUS
  // =========================

  changeStatus(
    workflow: Workflow,
    status: string
  ): void {

    if (
      !confirm(
        `Change workflow status to ${status}?`
      )
    ) {

      this.cdr.markForCheck();

      return;

    }


    this.http
      .patch<Workflow>(

        `${API_URL}/workflows/${workflow.id}/status`,

        null,

        {
          params: {
            status: status
          }
        }

      )
      .subscribe({

        next: () => {

          this.loadWorkflows();

          this.cdr.markForCheck();

        },


        error: (error) => {

          console.error(
            'Failed to update workflow status:',
            error
          );

          this.error =
            error.error?.message ||
            'Failed to update workflow status';

          this.loadWorkflows();

          this.cdr.markForCheck();

        }

      });

  }


  // =========================
  // DELETE WORKFLOW
  // =========================

  deleteWorkflow(
    workflow: Workflow
  ): void {

    if (
      !confirm(
        `Delete workflow "${workflow.name}"?`
      )
    ) {
      return;
    }


    this.http
      .delete(

        `${API_URL}/workflows/${workflow.id}`

      )
      .subscribe({

        next: () => {

          this.loadWorkflows();

        },


        error: (error) => {

          console.error(
            'Failed to delete workflow:',
            error
          );

          this.error =
            error.error?.message ||
            'Failed to delete workflow';

          this.cdr.markForCheck();

        }

      });

  }


  // =========================
  // FILTER BY DEPARTMENT
  // =========================

  filterByDepartment(): void {

    // If no department selected,
    // apply the status filter or
    // load everything.

    if (!this.selectedDepartmentId) {

      this.filterByStatus();

      return;

    }


    this.loading = true;

    this.error = '';


    this.http
      .get<Workflow[]>(

        `${API_URL}/workflows/department/${this.selectedDepartmentId}`

      )
      .subscribe({

        next: (response) => {

          this.workflows =
            response || [];

          this.loading = false;

          this.cdr.markForCheck();

        },


        error: (error) => {

          this.workflows = [];

          this.error =
            error.error?.message ||
            'Failed to filter workflows';

          this.loading = false;

          this.cdr.markForCheck();

        }

      });

  }


  // =========================
  // FILTER BY STATUS
  // =========================

  filterByStatus(): void {

    if (!this.selectedStatus) {

      // If department is selected,
      // reload that department.

      if (this.selectedDepartmentId) {

        this.filterByDepartment();

      } else {

        this.loadWorkflows();

      }

      return;

    }


    this.loading = true;

    this.error = '';


    this.http
      .get<Workflow[]>(

        `${API_URL}/workflows/status/${this.selectedStatus}`

      )
      .subscribe({

        next: (response) => {

          this.workflows =
            response || [];

          this.loading = false;

          this.cdr.markForCheck();

        },


        error: (error) => {

          this.workflows = [];

          this.error =
            error.error?.message ||
            'Failed to filter workflows';

          this.loading = false;

          this.cdr.markForCheck();

        }

      });

  }

  // =========================
// CANCEL / CLOSE FORM
// =========================

cancelForm(): void {

  this.showForm = false;

  this.editingWorkflow = null;

  this.workflowName = '';

  this.workflowDescription = '';

  this.workflowDepartmentId = '';

  this.workflowStatus = 'DRAFT';

  this.formError = '';

  this.saving = false;

  this.cdr.markForCheck();
}


  // =========================
  // CLEAR FILTERS
  // =========================

  clearFilters(): void {

    this.selectedDepartmentId = '';

    this.selectedStatus = '';

    this.loadWorkflows();

    this.cdr.markForCheck();

  }

}
