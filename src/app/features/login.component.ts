import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../core/auth.service";

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login card">

      <h1>BizFlow</h1>
      <p>Sign in to continue</p>

      <form (ngSubmit)="login()" #loginForm="ngForm">
        <input
          type="email"
          name="email"
          placeholder="Email"
          autocomplete="email"
          required
          maxlength="254"
          [(ngModel)]="email"
        />

        <div class="password-field">
          <input
            [type]="showPassword ? 'text' : 'password'"
            name="password"
            placeholder="Password"
            autocomplete="current-password"
            required
            [(ngModel)]="password"
          />
          <button
            type="button"
            class="visibility-toggle"
            [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
            [attr.aria-pressed]="showPassword"
            (click)="showPassword = !showPassword"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
              <circle cx="12" cy="12" r="2.5" />
              @if (showPassword) { <path d="m4 4 16 16" /> }
            </svg>
          </button>
        </div>

        
        <button type="submit">
          Login
        </button>

        <p class="error" role="alert">{{ error }}</p>
      </form>

      <p>
        Don't have an account?
      <button
        type="button"
        class="register-button"
        (click)="goToRegister()">
        Register
      </button>
      </p>

    </div>
  `,
})
export class LoginComponent {

  email = "";
  password = "";
  showPassword = false;
  error = "";

  constructor(
    private a: AuthService,
    private r: Router
  ) {}

  login() {
    this.error = "";

    if (!this.email.trim() || !this.password) {
      this.error = "Email and password are required.";
      return;
    }

    if (this.password.length < 8 || this.password.length > 16) {
      this.error = "Password must be between 8 and 16 characters.";
      return;
    }

    this.a.login(this.email, this.password)
      .subscribe({
        next: () => this.r.navigate(["/dashboard"]),
        error: (e) =>
          this.error =
            e.error?.message || "Login failed"
      });
  }

  goToRegister() {
    this.r.navigate(["/register"]);
  }
}
