import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { JsonPipe } from "@angular/common";
import { API_URL } from "../core/api";
@Component({
  standalone: true,
  imports: [FormsModule, JsonPipe],
  template: `<div class="page">
    <h1>{{ title }}</h1>
    <div class="card">
      <h3>Create / Update request</h3>
      <textarea
        rows="10"
        [(ngModel)]="body"
        placeholder="Enter JSON request body"
      ></textarea
      ><button (click)="create()">Create</button
      ><span class="error">{{ error }}</span>
    </div>
    <div class="card">
      <button (click)="load()">Refresh</button>
      <pre>{{ items | json }}</pre>
    </div>
  </div>`,
})
export class CrudPageComponent implements OnInit {
  route = inject(ActivatedRoute);
  http = inject(HttpClient);
  title = "";
  endpoint = "";
  items: any = [];
  body = "{}";
  error = "";
  ngOnInit() {
    this.title = this.route.snapshot.data["title"];
    this.endpoint = this.route.snapshot.data["endpoint"];
    this.load();
  }
  load() {
    this.http
      .get<any>(API_URL + "/" + this.endpoint)
      .subscribe({
        next: (r) => (this.items = r),
        error: (e) => (this.error = e.error?.message || "Failed"),
      });
  }
  create() {
    let b: any;
    try {
      b = JSON.parse(this.body);
    } catch {
      this.error = "Invalid JSON";
      return;
    }
    this.http.post(API_URL + "/" + this.endpoint, b).subscribe({
      next: () => {
        this.body = "{}";
        this.error = "";
        this.load();
      },
      error: (e) => (this.error = e.error?.message || "Failed"),
    });
  }
}
