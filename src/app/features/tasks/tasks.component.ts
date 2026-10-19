import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { API_URL } from '../../core/api';


interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;

  workflowId: string;
  workflowName?: string;

  assignedToUserId?: string;
  assignedToName?: string;

  createdByUserId: string;
  createdByName?: string;

  dueDate?: string;
  createdAt?: string;
}


interface Workflow {
  id: string;
  name: string;
}


interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
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
        <h1>Tasks</h1>
        <p>Manage tasks across your workflows</p>
      </div>

      <button
        type="button"
        (click)="openCreateForm()"
      >
        + Create Task
      </button>

    </div>


    <!-- ========================= -->
    <!-- FILTERS -->
    <!-- ========================= -->

    <div class="filters">

      <div>

        <label>Status</label>

        <select
          [(ngModel)]="selectedStatus"
          (change)="applyFilters()"
        >

          <option value="">All Statuses</option>

          @for (status of taskStatuses; track status) {

            <option [value]="status">
              {{ status }}
            </option>

          }

        </select>

      </div>


      <div>

        <label>Priority</label>

        <select
          [(ngModel)]="selectedPriority"
          (change)="applyFilters()"
        >

          <option value="">All Priorities</option>

          @for (priority of taskPriorities; track priority) {

            <option [value]="priority">
              {{ priority }}
            </option>

          }

        </select>

      </div>


      <div>

        <label>Workflow</label>

        <select
          [(ngModel)]="selectedWorkflowId"
          (change)="applyFilters()"
        >

          <option value="">All Workflows</option>

          @for (workflow of workflows; track workflow.id) {

            <option [value]="workflow.id">
              {{ workflow.name }}
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
            editingTask
              ? 'Edit Task'
              : 'Create Task'
          }}
        </h2>


        <!-- TITLE -->

        <div class="form-group">

          <label>Task Title</label>

          <input
            type="text"
            [(ngModel)]="taskTitle"
            placeholder="Enter task title"
          />

        </div>


        <!-- DESCRIPTION -->

        <div class="form-group">

          <label>Description</label>

          <textarea
            [(ngModel)]="taskDescription"
            placeholder="Enter task description"
            rows="4"
          ></textarea>

        </div>


        <!-- PRIORITY -->

        <div class="form-group">

          <label>Priority</label>

          <select [(ngModel)]="taskPriority">

            @for (
              priority of taskPriorities;
              track priority
            ) {

              <option [value]="priority">
                {{ priority }}
              </option>

            }

          </select>

        </div>


        <!-- WORKFLOW -->
        <!-- Workflow cannot be changed during update because -->
        <!-- UpdateTaskRequest does not contain workflowId -->

        @if (!editingTask) {

          <div class="form-group">

            <label>Workflow</label>

            <select [(ngModel)]="taskWorkflowId">

              <option value="">
                Select Workflow
              </option>

              @for (
                workflow of workflows;
                track workflow.id
              ) {

                <option [value]="workflow.id">
                  {{ workflow.name }}
                </option>

              }

            </select>

          </div>

        }


        <!-- ASSIGN USER -->
        <!-- Only needed when creating because UpdateTaskRequest -->
        <!-- does not contain assignedToUserId -->

        @if (!editingTask) {

          <div class="form-group">

            <label>Assign To</label>

            <select [(ngModel)]="taskAssignedToUserId">

              <option value="">
                Unassigned
              </option>

              @for (
                user of users;
                track user.id
              ) {

                <option [value]="user.id">
                  {{ user.firstName }} {{ user.lastName }}
                </option>

              }

            </select>

          </div>

        }


        <!-- DUE DATE -->

        <div class="form-group">

          <label>Due Date</label>

          <input
            type="datetime-local"
            [(ngModel)]="taskDueDate"
          />

        </div>


        <!-- ERROR -->

        @if (formError) {

          <p class="error">
            {{ formError }}
          </p>

        }


        <!-- FORM ACTIONS -->

        <div class="form-actions">

          <button
            type="button"
            (click)="saveTask()"
            [disabled]="saving"
          >

            {{
              saving
                ? 'Saving...'
                : editingTask
                  ? 'Update Task'
                  : 'Create Task'
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
        Loading tasks...
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
      tasks.length === 0
    ) {

      <div class="empty-state">

        <h3>No tasks found</h3>

        <p>
          Create your first task to get started.
        </p>

      </div>

    }


    <!-- ========================= -->
    <!-- TASKS TABLE -->
    <!-- ========================= -->

    @if (
      !loading &&
      tasks.length > 0
    ) {

      <div class="table-card">

        <table>

          <thead>

            <tr>
              <th>Title</th>
              <th>Workflow</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Due Date</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>

          </thead>


          <tbody>

            @for (task of tasks; track task.id) {

              <tr>

                <td>
                  {{ task.title }}
                </td>


                <td>
                  {{ task.workflowName || '-' }}
                </td>


                <td>
                  {{ task.priority }}
                </td>


                <!-- STATUS -->

                <td>

                  <select
                    [ngModel]="task.status"
                    (ngModelChange)="changeStatus(task, $event)"
                  >

                    @for (
                      status of taskStatuses;
                      track status
                    ) {

                      <option [value]="status">
                        {{ status }}
                      </option>

                    }

                  </select>

                </td>


                <!-- ASSIGN USER -->

                <td>

                  <select
                    [ngModel]="task.assignedToUserId || ''"
                    (ngModelChange)="assignTask(task, $event)"
                  >

                    <option value="">
                      Unassigned
                    </option>

                    @for (
                      user of users;
                      track user.id
                    ) {

                      <option [value]="user.id">
                        {{ user.firstName }} {{ user.lastName }}
                      </option>

                    }

                  </select>

                </td>


                <!-- DUE DATE -->

                <td>

                  @if (task.dueDate) {

                    {{
                      task.dueDate
                        | date:'dd MMM yyyy, hh:mm a'
                    }}

                  } @else {

                    -

                  }

                </td>


                <td>
                  {{ task.createdByName || '-' }}
                </td>


                <!-- ACTIONS -->

                <td class="actions">

                  <button
                    type="button"
                    (click)="editTask(task)"
                  >
                    Edit
                  </button>


                  <button
                    type="button"
                    (click)="deleteTask(task)"
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
export class TasksComponent implements OnInit {


  // =========================
  // DATA
  // =========================

  tasks: Task[] = [];

  workflows: Workflow[] = [];

  users: User[] = [];


  // =========================
  // UI STATE
  // =========================

  loading = true;

  error = '';


  // =========================
  // FILTERS
  // =========================

  selectedStatus = '';

  selectedPriority = '';

  selectedWorkflowId = '';


  // =========================
  // BACKEND ENUM VALUES
  // Exact match required
  // =========================

  taskStatuses = [
    'TODO',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
  ];

  taskPriorities = [
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
  ];


  // =========================
  // FORM
  // =========================

  showForm = false;

  editingTask: Task | null = null;

  taskTitle = '';

  taskDescription = '';

  taskPriority = 'MEDIUM';

  taskWorkflowId = '';

  taskAssignedToUserId = '';

  taskDueDate = '';

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

    this.loadTasks();

    this.loadWorkflows();

    this.loadUsers();

  }


  // =========================
  // LOAD ALL TASKS
  // =========================

  loadTasks(): void {

    this.loading = true;
    this.error = '';


    this.http
      .get<Task[]>(
        `${API_URL}/tasks`
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Tasks API SUCCESS:',
            response
          );

          this.tasks = response || [];

          this.loading = false;

          // IMPORTANT:
          // Explicitly trigger Angular re-render.
          this.cdr.markForCheck();

        },


        error: (error) => {

          console.error(
            'Failed to load tasks:',
            error
          );

          this.tasks = [];

          this.error =
            error.error?.message ||
            'Failed to load tasks';

          this.loading = false;

          this.cdr.markForCheck();

        }

      });

  }


  // =========================
  // LOAD WORKFLOWS
  // =========================

  loadWorkflows(): void {

    this.http
      .get<Workflow[]>(
        `${API_URL}/workflows`
      )
      .subscribe({

        next: (response) => {

          this.workflows = response || [];

          this.cdr.markForCheck();

        },

        error: (error) => {

          console.error(
            'Failed to load workflows:',
            error
          );

          this.workflows = [];

          this.cdr.markForCheck();

        }

      });

  }


  // =========================
  // LOAD USERS
  // Backend returns PageResponse
  // =========================

  loadUsers(): void {

    this.http
      .get<any>(
        `${API_URL}/users?size=100`
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Users API SUCCESS:',
            response
          );

          this.users =
            response.content || [];

          this.cdr.markForCheck();

        },

        error: (error) => {

          console.error(
            'Failed to load users:',
            error
          );

          this.users = [];

          this.cdr.markForCheck();

        }

      });

  }


  // =========================
  // OPEN CREATE FORM
  // =========================

  openCreateForm(): void {

    this.editingTask = null;

    this.taskTitle = '';

    this.taskDescription = '';

    this.taskPriority = 'MEDIUM';

    this.taskWorkflowId = '';

    this.taskAssignedToUserId = '';

    this.taskDueDate = '';

    this.formError = '';

    this.showForm = true;

    this.cdr.markForCheck();

  }


  // =========================
  // EDIT TASK
  // =========================

  editTask(task: Task): void {

    this.editingTask = task;

    this.taskTitle =
      task.title;

    this.taskDescription =
      task.description || '';

    this.taskPriority =
      task.priority;

    this.taskDueDate =
      this.toDateTimeLocal(task.dueDate);

    this.formError = '';

    this.showForm = true;

    this.cdr.markForCheck();

  }


  // =========================
  // SAVE TASK
  // =========================

  saveTask(): void {

    this.formError = '';


    if (!this.taskTitle.trim()) {

      this.formError =
        'Task title is required.';

      this.cdr.markForCheck();

      return;

    }


    this.saving = true;


    // =========================
    // UPDATE TASK
    // =========================

    if (this.editingTask) {

      const updateRequest = {

        title:
          this.taskTitle.trim(),

        description:
          this.taskDescription.trim(),

        priority:
          this.taskPriority,

        dueDate:
          this.taskDueDate || null

      };


      this.http
        .put<Task>(
          `${API_URL}/tasks/${this.editingTask.id}`,
          updateRequest
        )
        .subscribe({

          next: () => {

            this.saving = false;

            this.cancelForm();

            this.loadTasks();

            this.cdr.markForCheck();

          },

          error: (error) => {

            console.error(
              'Failed to update task:',
              error
            );

            this.formError =
              error.error?.message ||
              'Failed to update task';

            this.saving = false;

            this.cdr.markForCheck();

          }

        });

      return;

    }


    // =========================
    // CREATE TASK
    // =========================

    if (!this.taskWorkflowId) {

      this.formError =
        'Please select a workflow.';

      this.saving = false;

      this.cdr.markForCheck();

      return;

    }


    const createRequest = {

      title:
        this.taskTitle.trim(),

      description:
        this.taskDescription.trim(),

      priority:
        this.taskPriority,

      workflowId:
        this.taskWorkflowId,

      assignedToUserId:
        this.taskAssignedToUserId || null,

      dueDate:
        this.taskDueDate || null

    };


    this.http
      .post<Task>(
        `${API_URL}/tasks`,
        createRequest
      )
      .subscribe({

        next: () => {

          this.saving = false;

          this.cancelForm();

          this.loadTasks();

          this.cdr.markForCheck();

        },

        error: (error) => {

          console.error(
            'Failed to create task:',
            error
          );

          this.formError =
            error.error?.message ||
            'Failed to create task';

          this.saving = false;

          this.cdr.markForCheck();

        }

      });

  }


  // =========================
  // CHANGE STATUS
  // =========================

  changeStatus(
    task: Task,
    status: string
  ): void {

    if (status === task.status) {
      return;
    }


    const confirmed = confirm(
      `Change status of "${task.title}" to ${status}?`
    );


    if (!confirmed) {

      this.loadTasks();

      return;

    }


    this.http
      .patch<Task>(
        `${API_URL}/tasks/${task.id}/status`,
        null,
        {
          params: {
            status: status
          }
        }
      )
      .subscribe({

        next: () => {

          this.loadTasks();

          this.cdr.markForCheck();

        },

        error: (error) => {

          console.error(
            'Failed to update task status:',
            error
          );

          this.error =
            error.error?.message ||
            'Failed to update task status';

          this.loadTasks();

          this.cdr.markForCheck();

        }

      });

  }


  // =========================
  // ASSIGN TASK
  // =========================

  assignTask(
    task: Task,
    userId: string
  ): void {

    if (userId === task.assignedToUserId) {
      return;
    }


    // Your backend only has an API to assign
    // a task to a user. It does not have an
    // "unassign task" endpoint.
    if (!userId) {

      this.error =
        'This task cannot be unassigned because the backend does not currently provide an unassign API.';

      this.loadTasks();

      this.cdr.markForCheck();

      return;

    }


    this.http
      .patch<Task>(
        `${API_URL}/tasks/${task.id}/assign/${userId}`,
        null
      )
      .subscribe({

        next: () => {

          this.loadTasks();

          this.cdr.markForCheck();

        },

        error: (error) => {

          console.error(
            'Failed to assign task:',
            error
          );

          this.error =
            error.error?.message ||
            'Failed to assign task';

          this.loadTasks();

          this.cdr.markForCheck();

        }

      });

  }


  // =========================
  // DELETE TASK
  // =========================

  deleteTask(task: Task): void {

    if (
      !confirm(
        `Delete task "${task.title}"?`
      )
    ) {
      return;
    }


    this.http
      .delete(
        `${API_URL}/tasks/${task.id}`
      )
      .subscribe({

        next: () => {

          this.loadTasks();

          this.cdr.markForCheck();

        },

        error: (error) => {

          console.error(
            'Failed to delete task:',
            error
          );

          this.error =
            error.error?.message ||
            'Failed to delete task';

          this.cdr.markForCheck();

        }

      });

  }


  // =========================
  // APPLY FILTERS
  // =========================

  applyFilters(): void {

    /*
      Your backend provides separate APIs:

      GET /status/{status}
      GET /priority/{priority}
      GET /workflow/{workflowId}

      It does NOT provide one API for
      combining all three filters.

      Therefore:
      1. Load all tasks.
      2. Apply all selected filters locally.

      This gives correct combined filtering.
    */

    this.loading = true;


    this.http
      .get<Task[]>(
        `${API_URL}/tasks`
      )
      .subscribe({

        next: (response) => {

          let filteredTasks =
            response || [];


          if (this.selectedStatus) {

            filteredTasks =
              filteredTasks.filter(
                task =>
                  task.status ===
                  this.selectedStatus
              );

          }


          if (this.selectedPriority) {

            filteredTasks =
              filteredTasks.filter(
                task =>
                  task.priority ===
                  this.selectedPriority
              );

          }


          if (this.selectedWorkflowId) {

            filteredTasks =
              filteredTasks.filter(
                task =>
                  task.workflowId ===
                  this.selectedWorkflowId
              );

          }


          this.tasks =
            filteredTasks;

          this.loading = false;

          this.cdr.markForCheck();

        },

        error: (error) => {

          this.tasks = [];

          this.error =
            error.error?.message ||
            'Failed to filter tasks';

          this.loading = false;

          this.cdr.markForCheck();

        }

      });

  }


  // =========================
  // CLEAR FILTERS
  // =========================

  clearFilters(): void {

    this.selectedStatus = '';

    this.selectedPriority = '';

    this.selectedWorkflowId = '';

    this.loadTasks();

    this.cdr.markForCheck();

  }


  // =========================
  // CANCEL FORM
  // =========================

  cancelForm(): void {

    this.showForm = false;

    this.editingTask = null;

    this.taskTitle = '';

    this.taskDescription = '';

    this.taskPriority = 'MEDIUM';

    this.taskWorkflowId = '';

    this.taskAssignedToUserId = '';

    this.taskDueDate = '';

    this.formError = '';

    this.saving = false;

    this.cdr.markForCheck();

  }


  // =========================
  // DATETIME FORMAT
  // =========================

  private toDateTimeLocal(
    dateValue?: string
  ): string {

    if (!dateValue) {
      return '';
    }

    const date =
      new Date(dateValue);

    if (isNaN(date.getTime())) {
      return '';
    }

    const pad =
      (value: number) =>
        String(value).padStart(2, '0');

    return (
      `${date.getFullYear()}-` +
      `${pad(date.getMonth() + 1)}-` +
      `${pad(date.getDate())}T` +
      `${pad(date.getHours())}:` +
      `${pad(date.getMinutes())}`
    );

  }

}
