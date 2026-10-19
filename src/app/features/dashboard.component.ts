import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { timeout } from 'rxjs';
import { API_URL } from '../core/api';

interface DashboardSummary {
  totalUsers: number;
  activeUsers: number;
  totalDepartments: number;
  totalWorkflows: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="dashboard">
      <header class="page-header">
        <div>
          <p class="eyebrow">BUSINESS OVERVIEW</p>
          <h1>Dashboard</h1>
          <p class="intro">A clear view of your people, processes, and work.</p>
        </div>
        <a class="quick-link" routerLink="/tasks">View tasks <span aria-hidden="true">→</span></a>
      </header>

      @if (loading) {
        <div class="status-panel" role="status">Loading your business overview…</div>
      } @else if (error) {
        <div class="status-panel error-panel" role="alert">
          <strong>Dashboard metrics are unavailable.</strong>
          <span>{{ error }}</span>
          <button type="button" (click)="loadDashboard()">Try again</button>
        </div>
      } @else if (summary) {
        <div class="stats">
          <article class="metric-card">
            <div class="metric-top"><span class="metric-icon users">♙</span><span class="metric-label">PEOPLE</span></div>
            <p>Total users</p><strong>{{ summary.totalUsers }}</strong>
            <small>{{ summary.activeUsers }} active</small>
          </article>
          <article class="metric-card">
            <div class="metric-top"><span class="metric-icon departments">▤</span><span class="metric-label">STRUCTURE</span></div>
            <p>Departments</p><strong>{{ summary.totalDepartments }}</strong>
            <small>Across your organization</small>
          </article>
          <article class="metric-card">
            <div class="metric-top"><span class="metric-icon workflows">↻</span><span class="metric-label">PROCESS</span></div>
            <p>Workflows</p><strong>{{ summary.totalWorkflows }}</strong>
            <small>Business processes tracked</small>
          </article>
          <article class="metric-card">
            <div class="metric-top"><span class="metric-icon tasks">✓</span><span class="metric-label">DELIVERY</span></div>
            <p>Total tasks</p><strong>{{ summary.totalTasks }}</strong>
            <small>{{ summary.pendingTasks }} still open</small>
          </article>
        </div>

        <section class="work-card" aria-labelledby="work-title">
          <div class="work-copy">
            <span class="work-icon">✓</span>
            <div>
              <h2 id="work-title">Task progress</h2>
              <p>Completed tasks across all workflows</p>
            </div>
          </div>
          <div class="progress-summary">
            <strong>{{ summary.completedTasks }} <span>of {{ summary.totalTasks }}</span></strong>
            <span class="progress-percent">{{ completionRate }}%</span>
          </div>
          <div class="progress-track" role="progressbar" [attr.aria-valuenow]="completionRate" aria-valuemin="0" aria-valuemax="100" aria-label="Task completion">
            <span [style.width.%]="completionRate"></span>
          </div>
          <div class="progress-footer"><span>{{ summary.completedTasks }} completed</span><span>{{ summary.pendingTasks }} pending</span></div>
          <a routerLink="/tasks">Open task manager <span aria-hidden="true">→</span></a>
        </section>
      }
    </section>
  `,
  styles: [`
    .dashboard { max-width: 1180px; margin: 0 auto; }
    .page-header { align-items: end; margin-bottom: 26px; }
    .eyebrow { margin: 0 0 8px !important; color: #315bd6 !important; font-size: 10px !important; font-weight: 800; letter-spacing: .13em; }
    .page-header h1 { font-size: 30px; }
    .intro { margin-top: 8px !important; color: #687789 !important; }
    .quick-link, .work-card > a { text-decoration: none; font-weight: 700; font-size: 13px; }
    .quick-link { padding: 10px 13px; background: white; border: 1px solid #e5eaf0; border-radius: 9px; }
    .quick-link span, .work-card > a span { margin-left: 5px; }
    .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
    .metric-card { min-width: 0; padding: 19px; background: white; border: 1px solid #e5eaf0; border-radius: 14px; box-shadow: 0 5px 20px #20314a08; }
    .metric-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 19px; }
    .metric-icon { display: grid; width: 38px; height: 38px; place-items: center; border-radius: 11px; font-size: 19px; font-weight: 700; }
    .users { color: #315bd6; background: #edf2ff; }
    .departments { color: #13815d; background: #eaf7f1; }
    .workflows { color: #b06d11; background: #fff5e6; }
    .tasks { color: #7951b8; background: #f4effb; }
    .metric-label { color: #8793a1; font-size: 9px; font-weight: 800; letter-spacing: .12em; }
    .metric-card p { margin: 0; color: #586779; font-size: 13px; }
    .metric-card > strong { display: block; margin: 3px 0 1px; color: #19283a; font: 800 29px 'Manrope', sans-serif; letter-spacing: -.7px; }
    .metric-card small { color: #8793a1; font-size: 12px; }
    .work-card { margin-top: 18px; padding: 24px; background: white; border: 1px solid #e5eaf0; border-radius: 14px; box-shadow: 0 5px 20px #20314a08; }
    .work-copy { display: flex; align-items: center; gap: 13px; }
    .work-icon { display: grid; width: 38px; height: 38px; place-items: center; border-radius: 11px; color: #187348; background: #e8f7ef; font-weight: 800; }
    .work-copy h2 { margin: 0; font: 700 16px 'Manrope', sans-serif; }
    .work-copy p { margin: 3px 0 0; color: #8793a1; font-size: 12px; }
    .progress-summary { display: flex; justify-content: space-between; align-items: baseline; margin: 24px 0 9px; }
    .progress-summary strong { font: 700 16px 'Manrope', sans-serif; }
    .progress-summary strong span { color: #8793a1; font: 500 12px 'DM Sans', sans-serif; }
    .progress-percent { color: #315bd6; font-size: 13px; font-weight: 800; }
    .progress-track { height: 9px; overflow: hidden; border-radius: 99px; background: #edf1f6; }
    .progress-track span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #315bd6, #7190f2); transition: width .3s ease; }
    .progress-footer { display: flex; justify-content: space-between; margin: 8px 0 19px; color: #8793a1; font-size: 11px; }
    .status-panel { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 22px; background: white; border: 1px solid #e5eaf0; border-radius: 14px; color: #687789; }
    .error-panel { border-color: #f1c8cd; background: #fffafb; }
    .error-panel strong { color: #922b3a; }
    .error-panel button { margin-top: 5px; }
    @media (max-width: 980px) { .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 560px) { .stats { grid-template-columns: 1fr; gap: 10px; } .metric-card { padding: 16px; } .metric-top { margin-bottom: 12px; } .work-card { padding: 18px; } .quick-link { align-self: stretch; text-align: center; } }
  `]
})
export class DashboardComponent implements OnInit {
  summary: DashboardSummary | null = null;
  loading = true;
  error = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  get completionRate(): number {
    if (!this.summary?.totalTasks) return 0;
    return Math.round((this.summary.completedTasks / this.summary.totalTasks) * 100);
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';
    this.http.get<DashboardSummary>(`${API_URL}/dashboard`).pipe(
      timeout(12000)
    ).subscribe({
      next: (summary) => {
        this.summary = summary;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (response) => {
        this.summary = null;
        this.loading = false;
        this.error = response.status === 403
          ? 'Your account does not have permission to view these metrics. Dashboard access is currently limited to admins and managers.'
          : response.status === 401
            ? 'Your session is no longer valid. Sign in again to load dashboard metrics.'
            : response.status === 0
              ? 'The dashboard API did not respond within 12 seconds. Check that the backend and its database are running, then try again.'
              : response.error?.message || 'We could not load the latest totals. Check your connection and try again.';
        this.cdr.markForCheck();
      }
    });
  }
}
