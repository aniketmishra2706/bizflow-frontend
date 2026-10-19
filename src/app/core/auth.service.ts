import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs";
import { API_URL } from "./api";

@Injectable({
  providedIn: "root"
})
export class AuthService {

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<any>(
      `${API_URL}/auth/login`,
      {
        email,
        password
      }
    ).pipe(
      tap((response) => {
        localStorage.setItem(
          "token",
          response.accessToken
        );

        localStorage.setItem(
          "roles",
          JSON.stringify(response.roles || [])
        );

        localStorage.setItem(
          "user",
          JSON.stringify({
            id: response.id,
            firstName: response.firstName,
            lastName: response.lastName,
            email: response.email
          })
        );
      })
    );
  }

  register(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) {
    return this.http.post<any>(
      `${API_URL}/auth/register`,
      {
        firstName,
        lastName,
        email,
        password
      }
    );
  }

  loggedIn(): boolean {
    return !!localStorage.getItem("token");
  }

  getRoles(): string[] {
    const roles = localStorage.getItem("roles");

    if (!roles) {
      return [];
    }

    try {
      return JSON.parse(roles);
    } catch {
      return [];
    }
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    localStorage.removeItem("user");
  }
}