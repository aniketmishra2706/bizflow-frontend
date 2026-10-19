import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  standalone: true,

  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],

  template: `
    <div class="app-layout">

      <!-- SIDEBAR -->
      <aside class="sidebar">

        <div class="logo">
          <div class="logo-icon">B</div>
          <span>BizFlow</span>
        </div>

        <nav class="nav-menu">

          <!-- ALL USERS -->
          <a
            routerLink="/dashboard"
            routerLinkActive="active"
            class="nav-item"
          >
            <span>▦</span>
            Dashboard
          </a>

          <!-- ADMIN ONLY -->
          @if (hasRole('ADMIN')) {
            <a
              routerLink="/users"
              routerLinkActive="active"
              class="nav-item"
            >
              <span>👥</span>
              Users
            </a>
          }

          <!-- ADMIN + MANAGER -->
          @if (hasAnyRole(['ADMIN', 'MANAGER'])) {
            <a
              routerLink="/departments"
              routerLinkActive="active"
              class="nav-item"
            >
              <span>▣</span>
              Departments
            </a>

            <a
              routerLink="/workflows"
              routerLinkActive="active"
              class="nav-item"
            >
              <span>↻</span>
              Workflows
            </a>
          }

          <!-- ALL USERS -->
          <a
            routerLink="/tasks"
            routerLinkActive="active"
            class="nav-item"
          >
            <span>✓</span>
            Tasks
          </a>

        </nav>

        <button
          class="logout-btn"
          (click)="logout()"
        >
          ↪ Logout
        </button>

      </aside>


      <!-- MAIN CONTENT -->
      <div class="main-area">

        <header class="top-header">
          <div>
            <h2>Business Workflow Management</h2>
            <p>Manage your organization efficiently</p>
          </div>

          <div class="user-info">
            {{ userName }}
          </div>
        </header>

        <main class="content">
          <router-outlet></router-outlet>
        </main>

      </div>

    </div>
  `,

  styles: [`
    .app-layout {
      min-height: 100vh;
      display: flex;
      background: #f5f7fa;
    }

    .sidebar {
      width: 252px;
      min-height: 100vh;
      background: #172335;
      display: flex;
      flex-direction: column;
      color: white;
      flex: 0 0 252px;
    }

    .logo {
      height: 76px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 22px;
      border-bottom: 1px solid rgba(255,255,255,0.12);
      font: 800 21px 'Manrope', sans-serif;
      font-weight: 700;
    }

    .logo-icon {
      width: 38px;
      height: 38px;
      border-radius: 11px;
      background: #315bd6;
      display: flex;
      align-items: center;
      justify-content: center;
      font: 800 21px 'Manrope', sans-serif;
    }

    .nav-menu {
      padding: 22px 12px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .nav-item {
      text-decoration: none;
      color: #cbd5e1;
      padding: 12px 14px;
      border-radius: 9px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 13px;
      transition: background .16s ease, color .16s ease;
      cursor: pointer;
    }

    .nav-item:hover {
      background: rgba(255,255,255,0.08);
    }

    .nav-item.active {
      background: #315bd6;
      color: white;
      font-weight: 600;
    }

    .logout-btn {
      margin-top: auto;
      margin: auto 12px 18px;
      background: transparent;
      border: 1px solid transparent;
      color: #fca5a5;
      font-size: 14px;
      cursor: pointer;
      text-align: left;
      padding: 12px 14px;
    }

    .logout-btn:hover {
      background: rgba(255,255,255,.07);
      box-shadow: none;
    }

    .main-area {
      flex: 1;
      min-width: 0;
    }

    .top-header {
      min-height: 76px;
      background: white;
      border-bottom: 1px solid #e5eaf0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 32px;
    }

    .top-header h2 {
      margin: 0;
      font: 700 17px 'Manrope', sans-serif;
    }

    .top-header p {
      margin: 3px 0 0;
      color: #687789;
      font-size: 13px;
    }

    .user-info {
      font-weight: 700;
      color: #344255;
      background: #f3f6fb;
      border: 1px solid #e5eaf0;
      border-radius: 999px;
      padding: 8px 13px;
      font-size: 13px;
    }

    .content {
      width: min(100%, 1600px);
      margin: 0 auto;
      padding: 30px 32px;
    }

    @media (max-width: 760px) {
      .sidebar {
        width: 68px;
        flex-basis: 68px;
      }

      .logo {
        justify-content: center;
        padding: 0;
      }

      .logo span {
        display: none;
      }

      .nav-item {
        justify-content: center;
        padding: 12px 6px;
        font-size: 0;
        gap: 0;
      }

      .nav-item span {
        font-size: 18px;
      }

      .logout-btn {
        margin-left: 7px;
        margin-right: 7px;
        padding: 10px 5px;
        text-align: center;
        font-size: 0;
      }

      .logout-btn::first-letter {
        font-size: 18px;
      }

      .top-header {
        padding: 10px 16px;
      }

      .top-header h2 {
        font-size: 14px;
      }

      .top-header p {
        font-size: 11px;
      }

      .user-info {
        max-width: 108px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 6px 9px;
        font-size: 11px;
      }

      .content {
        padding: 22px 16px;
      }
    }
  `]
})
export class LayoutComponent {

  userName = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.loadUser();
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return this.authService.hasAnyRole(roles);
  }

  loadUser(): void {
    const user = localStorage.getItem('user');

    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        this.userName =
          `${parsedUser.firstName || ''} ${parsedUser.lastName || ''}`.trim();
      } catch {
        this.userName = '';
      }
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
