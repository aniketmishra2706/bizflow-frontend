import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../core/auth.service";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login card">

      <h1>BizFlow</h1>
      <p>Create your account</p>

      <form (ngSubmit)="register()" #registerForm="ngForm">
        <input
          name="firstName"
          placeholder="First Name"
          autocomplete="given-name"
          required
          maxlength="100"
          [(ngModel)]="firstName"
        />

        <input
          name="lastName"
          placeholder="Last Name"
          autocomplete="family-name"
          required
          maxlength="100"
          [(ngModel)]="lastName"
        />

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
            autocomplete="new-password"
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
          Register
        </button>

        <p class="error" role="alert">{{ error }}</p>
      </form>

      <p>
        Already have an account?
        <a (click)="goToLogin()">Login</a>
      </p>

    </div>
  `,
})
export class RegisterComponent {

  firstName = "";
  lastName = "";
  email = "";
  password = "";
  showPassword = false;
  error = "";

  constructor(
    private a: AuthService,
    private r: Router
  ) {}

  register() {

  console.log("Register button clicked");
  this.error = "";

  if (!this.firstName.trim() || !this.lastName.trim() || !this.email.trim() || !this.password) {
    console.log("Required fields are missing");

    this.error = "Please fill in all required fields.";
    return;
  }

  if (this.password.length < 8 || this.password.length > 16) {
    this.error = "Password must be between 8 and 16 characters.";
    return;
  }
   console.log("Calling registration API");

  this.a.register(
    this.firstName,
    this.lastName,
    this.email,
    this.password
  ).subscribe({
    next: () => {
       console.log("Registration successful");
      this.r.navigate(["/login"]);
    },
    error: (e: HttpErrorResponse) => {
      this.error =
        e.error?.message || "Registration failed";
    }
  });
}

  goToLogin() {
    
    this.r.navigate(["/login"]);
  }
}




